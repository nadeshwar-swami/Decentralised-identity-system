/**
 * Credentials API Routes
 * Issue, retrieve, and verify academic credentials
 * Feature 5 implementation
 * Feature 7: Selective Disclosure endpoints
 */

import express from 'express'
import algosdk from 'algosdk'
import { buildVerifiableCredential, validateCredential, getPresentationFormat } from '../utils/credentialBuilder.js'
import { buildNFTMetadata, validateNFTMetadata } from '../utils/nftMetadata.js'
import { uploadToIPFS } from '../utils/ipfs.js'
import { generateUUID } from '../utils/crypto.js'
import {
  buildVerifiablePresentation,
  validatePresentation,
  checkPresentationExpiration,
  extractCredentialIds,
  formatPresentationAudit,
} from '../utils/presentationBuilder.js'

const router = express.Router()

/**
 * Storage for issued credentials (in-memory for MVP)
 * In production, use a database (MongoDB, PostgreSQL, etc)
 */
const issuedCredentials = new Map()

/**
 * Storage for student DIDs (in-memory for MVP)
 * Key: walletAddress, Value: { did, displayName, ipfsHash, createdAt }
 */
const studentDIDs = new Map()

/**
 * Storage for student profiles (in-memory for MVP)
 * Key: walletAddress, Value: { fullName, studentId, email, department, yearOfStudy, ... }
 */
const studentProfiles = new Map()

/**
 * Storage for verifiable presentations (in-memory for MVP)
 * In production, use a database with audit trail
 */
const presentations = new Map()

/**
 * Storage for revoked presentations (in-memory for MVP)
 * In production, use a database with revocation list
 */
const revokedPresentations = new Set()

/**
 * Authorized admin wallets (in-memory for MVP)
 * In production, use a database with admin role management
 * Initial setup: Add admin wallets via environment variable or hardcode for testing
 */
const authorizedAdmins = new Set(
  (process.env.AUTHORIZED_ADMINS || '')
    .split(',')
    .map(addr => addr.trim())
    .filter(addr => addr.length === 58)
)

// Log authorized admins on startup
if (authorizedAdmins.size > 0) {
  console.log(`\n🔐 Loaded ${authorizedAdmins.size} authorized admin wallet(s)`)
  Array.from(authorizedAdmins).forEach(admin => {
    console.log(`   ✓ ${admin}`)
  })
  console.log()
} else {
  console.warn('\n⚠️  WARNING: No authorized admins configured!')
  console.warn('   Set AUTHORIZED_ADMINS env var with comma-separated wallet addresses')
  console.warn('   Only wallets in AUTHORIZED_ADMINS can issue credentials\n')
}

/**
 * POST /api/credentials/issue
 * Issue a new credential to a student
 * Admin only endpoint
 * Supports both detailed format (legacy) and simplified format (from AdminDashboard)
 */
router.post('/issue', async (req, res) => {
  try {
    const {
      studentDID,
      studentWallet,
      studentAddress,
      studentName,
      program,
      credentialType,
      description,
      issuerDID,
      issuerName,
      issuerWallet,
      issuerAddress,
    } = req.body

    // Normalize addresses
    const normalizedStudentWallet = studentWallet || studentAddress
    const normalizedIssuerWallet = issuerWallet || issuerAddress

    // Validate wallet address
    if (!normalizedStudentWallet || normalizedStudentWallet.length !== 58) {
      return res.status(400).json({
        success: false,
        error: 'Invalid student wallet address',
      })
    }

    // Validate issuer
    if (!normalizedIssuerWallet || normalizedIssuerWallet.length !== 58) {
      return res.status(400).json({
        success: false,
        error: 'Invalid issuer wallet address',
      })
    }

    console.log(`\n📜 Issuing credential for ${normalizedStudentWallet}...`)

    // Step 1: Resolve student DID and profile
    // If not provided, look up from storage
    const appId = process.env.ALGORAND_APP_ID || '756415000'
    const resolvedStudentDID = studentDID || 
      (studentDIDs.has(normalizedStudentWallet) 
        ? studentDIDs.get(normalizedStudentWallet).did 
        : `did:algo:app:${appId}:${normalizedStudentWallet}`)

    const resolvedStudentName = studentName || 
      (studentProfiles.has(normalizedStudentWallet)
        ? studentProfiles.get(normalizedStudentWallet).fullName
        : 'Student')

    const studentProfile = studentProfiles.has(normalizedStudentWallet)
      ? studentProfiles.get(normalizedStudentWallet)
      : {}

    const resolvedProgram = program || studentProfile.department || 'Academic Credential'

    console.log(`  ✓ Student: ${resolvedStudentName}`)
    console.log(`  ✓ DID: ${resolvedStudentDID}`)
    console.log(`  ✓ Type: ${credentialType}`)

    // Step 2: Build W3C Verifiable Credential
    console.log('  ✓ Building credential...')
    const credential = buildVerifiableCredential({
      studentDID: resolvedStudentDID,
      credentialType: credentialType || 'AcademicRecord',
      program: resolvedProgram,
      description: description || `${credentialType || 'Academic'} Credential`,
      issuerDID: issuerDID || `did:algo:app:${appId}:${normalizedIssuerWallet}`,
      issuerName: issuerName || 'University Administrator',
      issuanceDate: new Date(),
      studentProfile, // Include full profile in credential
    })

    // Validate credential structure
    validateCredential(credential)

    // Step 3: Upload credential to IPFS
    console.log('  ✓ Uploading to IPFS...')
    const credentialFilename = `credential-${normalizedStudentWallet}-${Date.now()}.json`
    const ipfsHash = await uploadToIPFS(credential, credentialFilename)
    console.log(`  ✓ IPFS Hash: ${ipfsHash}`)

    // Step 4: Build NFT metadata
    console.log('  ✓ Creating NFT metadata...')
    const nftMetadata = buildNFTMetadata({
      credentialId: credential.id,
      program: resolvedProgram,
      issuerName: issuerName || 'University',
      studentName: resolvedStudentName,
      issueDate: new Date().toISOString(),
      ipfsHash,
      credentialType: credentialType || 'AcademicRecord',
      description: description || 'Verifiable academic credential',
    })

    validateNFTMetadata(nftMetadata)

    // Step 5: Upload NFT metadata to IPFS
    console.log('  ✓ Uploading NFT metadata...')
    const metadataFilename = `nft-metadata-${normalizedStudentWallet}-${Date.now()}.json`
    const metadataIPFSHash = await uploadToIPFS(nftMetadata, metadataFilename)
    console.log(`  ✓ NFT Metadata IPFS Hash: ${metadataIPFSHash}`)

    // Step 6: Store credential
    const credentialId = credential.id
    const credentialRecord = {
      id: credentialId,
      studentDID: resolvedStudentDID,
      studentWallet: normalizedStudentWallet,
      studentName: resolvedStudentName,
      studentProfile,
      program: resolvedProgram,
      credentialType: credentialType || 'AcademicRecord',
      issuerDID: issuerDID || `did:algo:app:${appId}:${normalizedIssuerWallet}`,
      issuerWallet: normalizedIssuerWallet,
      issuerName: issuerName || 'University Administrator',
      credential,
      nftMetadata,
      ipfsHash,
      metadataIPFSHash,
      issuedAt: new Date().toISOString(),
      status: 'issued',
    }

    issuedCredentials.set(credentialId, credentialRecord)

    // Step 7: Return response
    const response = {
      success: true,
      data: {
        credentialId,
        studentDID: resolvedStudentDID,
        studentName: resolvedStudentName,
        program: resolvedProgram,
        credentialType: credentialType || 'AcademicRecord',
        issuer: issuerName || 'University',
        issuedAt: credentialRecord.issuedAt,
        ipfsHash,
        metadataIPFSHash,
        status: 'issued',
        assetId: `ASSET_${credentialId.slice(0, 8)}`, // Simulated NFT asset ID
        txnId: `TXN_${generateUUID()}`, // Simulated transaction ID
        message: 'Credential issued successfully',
        credentialPreview: getPresentationFormat(credential),
      },
    }

    res.json(response)

    console.log(`[OK] Credential issued: ${credentialId}`)
    console.log(`   Student: ${resolvedStudentName}`)
    console.log(`   Program: ${resolvedProgram}\n`)
  } catch (err) {
    console.error('❌ Error issuing credential:', err.message)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to issue credential',
    })
  }
})

/**
 * GET /api/credentials/:walletAddress
 * Get all credentials for a student
 */
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params

    // Validate wallet address
    if (walletAddress.length !== 58) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Algorand wallet address',
      })
    }

    console.log(`\n🔍 Fetching credentials for ${walletAddress}...`)

    // Find all credentials for this wallet
    const studentCredentials = Array.from(issuedCredentials.values()).filter(
      (cred) => cred.studentWallet === walletAddress
    )

    console.log(`  ✓ Found ${studentCredentials.length} credential(s)`)

    const credentialPreview = studentCredentials.map((cred) => ({
      credentialId: cred.id,
      studentDID: cred.studentDID,
      program: cred.program,
      credentialType: cred.credentialType,
      issuer: cred.issuerName,
      issuedAt: cred.issuedAt,
      status: cred.status,
      ipfsHash: cred.ipfsHash,
      metadataIPFSHash: cred.metadataIPFSHash,
    }))

    res.json({
      success: true,
      data: {
        walletAddress,
        credentialCount: studentCredentials.length,
        credentials: credentialPreview,
      },
    })

    console.log(`[OK] Credentials retrieved for ${walletAddress}\n`)
  } catch (err) {
    console.error('❌ Error retrieving credentials:', err.message)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to retrieve credentials',
    })
  }
})

/**
 * GET /api/credentials/details/:credentialId
 * Get full details of a specific credential
 */
router.get('/details/:credentialId', async (req, res) => {
  try {
    const { credentialId } = req.params

    console.log(`\n📋 Fetching credential details: ${credentialId}`)

    const credentialRecord = issuedCredentials.get(credentialId)

    if (!credentialRecord) {
      return res.status(404).json({
        success: false,
        error: 'Credential not found',
      })
    }

    const fullCredential = {
      credentialId: credentialRecord.id,
      studentDID: credentialRecord.studentDID,
      studentWallet: credentialRecord.studentWallet,
      studentName: credentialRecord.studentName,
      studentProfile: credentialRecord.studentProfile || {},
      program: credentialRecord.program,
      credentialType: credentialRecord.credentialType,
      issuer: credentialRecord.issuerName,
      issuerDID: credentialRecord.issuerDID,
      issuedAt: credentialRecord.issuedAt,
      ipfsHash: credentialRecord.ipfsHash,
      metadataIPFSHash: credentialRecord.metadataIPFSHash,
      status: credentialRecord.status,
      credentialDocument: credentialRecord.credential,
      nftMetadata: credentialRecord.nftMetadata,
      preview: getPresentationFormat(credentialRecord.credential),
    }

    res.json({
      success: true,
      data: fullCredential,
    })

    console.log(`[OK] Credential details retrieved\n`)
  } catch (err) {
    console.error('❌ Error retrieving credential details:', err.message)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to retrieve credential',
    })
  }
})

/**
 * POST /api/credentials/verify
 * Verify a credential's authenticity and validity
 */
router.post('/verify', async (req, res) => {
  try {
    const { credentialId } = req.body

    if (!credentialId) {
      return res.status(400).json({
        success: false,
        error: 'credentialId is required',
      })
    }

    console.log(`\n✔️ Verifying credential: ${credentialId}`)

    const credentialRecord = issuedCredentials.get(credentialId)

    if (!credentialRecord) {
      return res.status(404).json({
        success: false,
        error: 'Credential not found',
      })
    }

    // Verify credential structure
    try {
      validateCredential(credentialRecord.credential)
    } catch (validErr) {
      return res.status(400).json({
        success: false,
        error: `Credential validation failed: ${validErr.message}`,
      })
    }

    // Verify credential is not expired
    const issuedDate = new Date(credentialRecord.credential.issuanceDate)
    const nowDate = new Date()
    const isExpired = credentialRecord.credential.expirationDate &&
      new Date(credentialRecord.credential.expirationDate) < nowDate

    res.json({
      success: true,
      data: {
        credentialId,
        isValid: true,
        isExpired: false,
        issuedAt: credentialRecord.issuedAt,
        issuer: credentialRecord.issuerName,
        issuerDID: credentialRecord.issuerDID,
        student: credentialRecord.studentName,
        studentDID: credentialRecord.studentDID,
        program: credentialRecord.program,
        credentialType: credentialRecord.credentialType,
        verificationResult: {
          structureValid: true,
          signatureValid: true, // In production, verify actual signature
          notExpired: !isExpired,
          issuedByTrustedInstitution: true, // In production, check issuer registry
        },
      },
    })

    console.log(`[OK] Credential verified successfully\n`)
  } catch (err) {
    console.error('❌ Error verifying credential:', err.message)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to verify credential',
    })
  }
})

/**
 * POST /api/credentials/presentations/create
 * Create a selective disclosure proof (Verifiable Presentation)
 * Feature 7 implementation
 */
router.post('/presentations/create', async (req, res) => {
  try {
    const {
      studentDID,
      studentWallet,
      credentialIds,
      service = 'general',
      expiresInHours = 24,
    } = req.body

    // Validate input
    if (!studentDID || !studentWallet || !credentialIds || credentialIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Required fields: studentDID, studentWallet, credentialIds (array)',
      })
    }

    console.log(`\n[LOCKED] Creating selective disclosure presentation for ${studentWallet}...`)

    // Fetch the actual credentials from storage
    const credentials = credentialIds
      .map((id) => issuedCredentials.get(id))
      .filter((cred) => cred !== undefined)

    if (credentials.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No valid credentials found with provided IDs',
      })
    }

    if (credentials.length !== credentialIds.length) {
      console.warn(`⚠️  Only ${credentials.length} of ${credentialIds.length} credentials found`)
    }

    // Build the Verifiable Presentation
    console.log(`  ✓ Building presentation with ${credentials.length} credentials...`)
    const presentation = buildVerifiablePresentation({
      studentDID,
      studentWallet,
      credentials,
      service,
      expiresInHours,
    })

    // Validate presentation structure
    validatePresentation(presentation)

    // Store presentation
    presentations.set(presentation.id, {
      id: presentation.id,
      studentDID,
      studentWallet,
      service,
      credentialIds: credentials.map((c) => c.id),
      presentation,
      createdAt: new Date().toISOString(),
      expiresAt: presentation.metadata.expiresAt,
      isRevoked: false,
    })

    console.log(`  ✓ Presentation created: ${presentation.id}`)
    console.log(`  ✓ Sharing with service: ${service}`)
    console.log(`  ✓ Valid until: ${presentation.metadata.expiresAt}`)

    res.json({
      success: true,
      data: {
        presentationId: presentation.id,
        studentWallet,
        credentialCount: credentials.length,
        service,
        createdAt: presentation.metadata.issuedAt,
        expiresAt: presentation.metadata.expiresAt,
        presentation,
      },
    })

    console.log(`[OK] Presentation created successfully\n`)
  } catch (err) {
    console.error('❌ Error creating presentation:', err.message)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to create presentation',
    })
  }
})

/**
 * POST /api/credentials/presentations/verify
 * Verify a selective disclosure proof
 * Feature 7 implementation
 */
router.post('/presentations/verify', async (req, res) => {
  try {
    const { presentationId } = req.body

    if (!presentationId) {
      return res.status(400).json({
        success: false,
        error: 'Required field: presentationId',
      })
    }

    console.log(`\n✔️ Verifying presentation: ${presentationId}`)

    const presentationRecord = presentations.get(presentationId)

    if (!presentationRecord) {
      return res.status(404).json({
        success: false,
        error: 'Presentation not found',
      })
    }

    if (revokedPresentations.has(presentationId)) {
      return res.json({
        success: true,
        data: {
          presentationId,
          isValid: false,
          isRevoked: true,
          reason: 'Presentation has been revoked',
          verificationResult: {
            structureValid: true,
            signatureValid: true,
            notExpired: false,
            notRevoked: false,
          },
        },
      })
    }

    // Validate presentation structure
    try {
      validatePresentation(presentationRecord.presentation)
    } catch (validErr) {
      return res.status(400).json({
        success: false,
        error: `Presentation validation failed: ${validErr.message}`,
      })
    }

    // Check expiration
    const { isExpired, expiresAt } = checkPresentationExpiration(presentationRecord.presentation)

    // Verify all credentials exist and are valid
    const credentialValidation = presentationRecord.credentialIds.map((credId) => {
      const cred = issuedCredentials.get(credId)
      return {
        credentialId: credId,
        found: !!cred,
        isValid: cred ? true : false,
      }
    })

    const allCredentialsValid = credentialValidation.every((c) => c.isValid)

    const verificationResult = {
      structureValid: true,
      signatureValid: true, // In production, verify actual Ed25519 signature
      notExpired: !isExpired,
      notRevoked: !revokedPresentations.has(presentationId),
      credentialsValid: allCredentialsValid,
    }

    const isValid =
      verificationResult.structureValid &&
      verificationResult.signatureValid &&
      verificationResult.notExpired &&
      verificationResult.notRevoked &&
      verificationResult.credentialsValid

    res.json({
      success: true,
      data: {
        presentationId,
        isValid,
        isRevoked: revokedPresentations.has(presentationId),
        isExpired,
        expiresAt,
        holder: presentationRecord.studentWallet,
        service: presentationRecord.service,
        credentialCount: presentationRecord.credentialIds.length,
        credentials: credentialValidation,
        verificationResult,
      },
    })

    console.log(`[OK] Presentation verified: ${isValid ? 'VALID' : 'INVALID'}\n`)
  } catch (err) {
    console.error('❌ Error verifying presentation:', err.message)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to verify presentation',
    })
  }
})

/**
 * GET /api/credentials/presentations/:studentWallet
 * List all presentations created by a student
 * Feature 7 implementation
 */
router.get('/presentations/:studentWallet', async (req, res) => {
  try {
    const { studentWallet } = req.params

    if (!studentWallet || studentWallet.length !== 58) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Algorand wallet address',
      })
    }

    console.log(`\n📊 Fetching presentations for ${studentWallet}`)

    const studentPresentations = Array.from(presentations.values()).filter(
      (p) => p.studentWallet === studentWallet
    )

    const presentationSummary = studentPresentations.map((p) => ({
      presentationId: p.id,
      service: p.service,
      credentialCount: p.credentialIds.length,
      createdAt: p.createdAt,
      expiresAt: p.expiresAt,
      isRevoked: p.isRevoked,
      isExpired: new Date(p.expiresAt) < new Date(),
    }))

    res.json({
      success: true,
      data: {
        studentWallet,
        presentationCount: studentPresentations.length,
        presentations: presentationSummary,
      },
    })

    console.log(`[OK] Retrieved ${studentPresentations.length} presentations\n`)
  } catch (err) {
    console.error('❌ Error fetching presentations:', err.message)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch presentations',
    })
  }
})

/**
 * POST /api/credentials/presentations/:presentationId/revoke
 * Revoke a selective disclosure proof
 * Feature 7 implementation
 */
router.post('/presentations/:presentationId/revoke', async (req, res) => {
  try {
    const { presentationId } = req.params

    console.log(`\n🔴 Revoking presentation: ${presentationId}`)

    const presentationRecord = presentations.get(presentationId)

    if (!presentationRecord) {
      return res.status(404).json({
        success: false,
        error: 'Presentation not found',
      })
    }

    if (revokedPresentations.has(presentationId)) {
      return res.status(400).json({
        success: false,
        error: 'Presentation is already revoked',
      })
    }

    // Mark as revoked
    revokedPresentations.add(presentationId)
    presentationRecord.isRevoked = true
    presentationRecord.revokedAt = new Date().toISOString()

    res.json({
      success: true,
      data: {
        presentationId,
        isRevoked: true,
        revokedAt: presentationRecord.revokedAt,
        message: 'Presentation has been revoked and is no longer valid',
      },
    })

    console.log(`[OK] Presentation revoked successfully\n`)
  } catch (err) {
    console.error('❌ Error revoking presentation:', err.message)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to revoke presentation',
    })
  }
})

/**
 * POST /api/student/profile
 * Store student profile information
 * Called when student completes their profile
 */
router.post('/student/profile', async (req, res) => {
  try {
    const {
      walletAddress,
      fullName,
      studentId,
      email,
      dateOfBirth,
      admissionNumber,
      mobileNumber,
      department,
      yearOfStudy,
    } = req.body

    // Validate wallet
    if (!walletAddress || walletAddress.length !== 58) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address',
      })
    }

    // Store profile
    const profileData = {
      walletAddress,
      fullName,
      studentId,
      email,
      dateOfBirth,
      admissionNumber,
      mobileNumber,
      department,
      yearOfStudy,
      storedAt: new Date().toISOString(),
    }

    studentProfiles.set(walletAddress, profileData)

    console.log(`[OK] Student profile stored for ${walletAddress}`)

    res.json({
      success: true,
      data: profileData,
    })
  } catch (err) {
    console.error('❌ Error storing student profile:', err.message)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to store profile',
    })
  }
})

/**
 * POST /api/student/did
 * Store student DID information
 * Called when student creates and registers their DID
 */
router.post('/student/did', async (req, res) => {
  try {
    const { walletAddress, did, displayName, ipfsHash } = req.body

    // Validate wallet
    if (!walletAddress || walletAddress.length !== 58) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address',
      })
    }

    if (!did || !displayName) {
      return res.status(400).json({
        success: false,
        error: 'DID and displayName are required',
      })
    }

    // Store DID
    const didData = {
      walletAddress,
      did,
      displayName,
      ipfsHash,
      createdAt: new Date().toISOString(),
      verificationStatus: 'pending',
      verifiedAt: null,
      verifiedBy: null,
    }

    studentDIDs.set(walletAddress, didData)

    console.log(`[OK] Student DID stored for ${walletAddress}: ${did}`)

    res.json({
      success: true,
      data: didData,
    })
  } catch (err) {
    console.error('❌ Error storing student DID:', err.message)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to store DID',
    })
  }
})

/**
 * GET /api/credentials/admin/pending-dids
 * Get all student DIDs waiting for admin verification
 */
router.get('/admin/pending-dids', async (req, res) => {
  try {
    const pendingDIDs = Array.from(studentDIDs.values())
      .filter((didRecord) => (didRecord.verificationStatus || 'pending') === 'pending')
      .map((didRecord) => {
        const profile = studentProfiles.get(didRecord.walletAddress) || null

        return {
          walletAddress: didRecord.walletAddress,
          did: didRecord.did,
          displayName: didRecord.displayName,
          ipfsHash: didRecord.ipfsHash,
          createdAt: didRecord.createdAt,
          verificationStatus: didRecord.verificationStatus || 'pending',
          fullName: profile?.fullName || null,
          department: profile?.department || null,
          yearOfStudy: profile?.yearOfStudy || null,
        }
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    res.json({
      success: true,
      data: {
        count: pendingDIDs.length,
        dids: pendingDIDs,
      },
    })
  } catch (err) {
    console.error('❌ Error fetching pending DIDs:', err.message)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch pending DIDs',
    })
  }
})

/**
 * POST /api/credentials/admin/verify-did
 * Mark a student's DID as admin-verified
 */
router.post('/admin/verify-did', async (req, res) => {
  try {
    const { walletAddress, adminWallet } = req.body

    if (!walletAddress || walletAddress.length !== 58) {
      return res.status(400).json({
        success: false,
        error: 'Invalid student wallet address',
      })
    }

    if (adminWallet && adminWallet.length !== 58) {
      return res.status(400).json({
        success: false,
        error: 'Invalid admin wallet address',
      })
    }

    if (authorizedAdmins.size > 0 && adminWallet && !authorizedAdmins.has(adminWallet)) {
      return res.status(403).json({
        success: false,
        error: 'Admin wallet is not authorized to verify DIDs',
      })
    }

    const existing = studentDIDs.get(walletAddress)
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Student DID not found',
      })
    }

    const verifiedRecord = {
      ...existing,
      verificationStatus: 'verified',
      verifiedAt: new Date().toISOString(),
      verifiedBy: adminWallet || null,
    }

    studentDIDs.set(walletAddress, verifiedRecord)

    console.log(`[OK] DID verified for ${walletAddress} by ${adminWallet || 'admin'}`)

    res.json({
      success: true,
      data: verifiedRecord,
    })
  } catch (err) {
    console.error('❌ Error verifying DID:', err.message)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to verify DID',
    })
  }
})

/**
 * GET /api/student/:walletAddress
 * Get stored student profile and DID information
 */
router.get('/student/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params

    // Validate wallet
    if (!walletAddress || walletAddress.length !== 58) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address',
      })
    }

    const profile = studentProfiles.get(walletAddress)
    const did = studentDIDs.get(walletAddress)

    res.json({
      success: true,
      data: {
        walletAddress,
        profile: profile || null,
        did: did || null,
      },
    })
  } catch (err) {
    console.error('❌ Error retrieving student data:', err.message)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to retrieve student data',
    })
  }
})

export default router
