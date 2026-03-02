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
 * POST /api/credentials/issue
 * Issue a new credential to a student
 * Admin only endpoint
 */
router.post('/issue', async (req, res) => {
  try {
    const {
      studentDID,
      studentWallet,
      studentName,
      program,
      credentialType,
      description,
      issuerDID,
      issuerName,
      issuerWallet,
    } = req.body

    // Validate input
    if (!studentDID || !studentWallet || !program || !issuerDID || !issuerWallet) {
      return res.status(400).json({
        success: false,
        error: 'Required fields: studentDID, studentWallet, program, issuerDID, issuerWallet',
      })
    }

    // Validate wallet addresses
    if (studentWallet.length !== 58 || issuerWallet.length !== 58) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Algorand wallet address',
      })
    }

    console.log(`\n📜 Issuing credential for ${studentName}...`)

    // Step 1: Build W3C Verifiable Credential
    console.log('  ✓ Building credential...')
    const credential = buildVerifiableCredential({
      studentDID,
      credentialType: credentialType || 'Certificate',
      program,
      description: description || '',
      issuerDID,
      issuerName,
      issuanceDate: new Date(),
    })

    // Validate credential structure
    validateCredential(credential)

    // Step 2: Upload credential to IPFS
    console.log('  ✓ Uploading to IPFS...')
    const credentialFilename = `credential-${studentWallet}-${Date.now()}.json`
    const ipfsHash = await uploadToIPFS(credential, credentialFilename)
    console.log(`  ✓ IPFS Hash: ${ipfsHash}`)

    // Step 3: Build NFT metadata
    console.log('  ✓ Creating NFT metadata...')
    const nftMetadata = buildNFTMetadata({
      credentialId: credential.id,
      program,
      issuerName,
      studentName: studentName || 'Student',
      issueDate: new Date().toISOString(),
      ipfsHash,
      credentialType: credentialType || 'Certificate',
      description: description || '',
    })

    validateNFTMetadata(nftMetadata)

    // Step 4: Upload NFT metadata to IPFS
    console.log('  ✓ Uploading NFT metadata...')
    const metadataFilename = `nft-metadata-${studentWallet}-${Date.now()}.json`
    const metadataIPFSHash = await uploadToIPFS(nftMetadata, metadataFilename)
    console.log(`  ✓ NFT Metadata IPFS Hash: ${metadataIPFSHash}`)

    // Step 5: Create unsigned transaction for NFT creation
    // In production, you would create an ASA (Algorand Standard Asset) here
    // For MVP, we'll store the credential and return the transaction template
    console.log('  ✓ Preparing NFT creation transaction...')

    const credentialId = credential.id
    const credentialRecord = {
      id: credentialId,
      studentDID,
      studentWallet,
      studentName,
      program,
      credentialType,
      issuerDID,
      issuerWallet,
      issuerName,
      credential,
      nftMetadata,
      ipfsHash,
      metadataIPFSHash,
      issuedAt: new Date().toISOString(),
      status: 'pending_nft_creation',
    }

    // Store credential
    issuedCredentials.set(credentialId, credentialRecord)

    // Step 6: Return response
    const response = {
      success: true,
      data: {
        credentialId,
        studentDID,
        program,
        credentialType: credentialType || 'Certificate',
        issuer: issuerName,
        issuedAt: credentialRecord.issuedAt,
        ipfsHash,
        metadataIPFSHash,
        status: 'issued',
        message: 'Credential created. NFT creation transaction can be submitted separately.',
        credentialPreview: getPresentationFormat(credential),
      },
    }

    res.json(response)

    console.log(`✅ Credential issued: ${credentialId}`)
    console.log(`   Student: ${studentName}`)
    console.log(`   Program: ${program}\n`)
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
      credentialId: cred.credentialId,
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

    console.log(`✅ Credentials retrieved for ${walletAddress}\n`)
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

    console.log(`✅ Credential details retrieved\n`)
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

    console.log(`✅ Credential verified successfully\n`)
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

    console.log(`\n🔒 Creating selective disclosure presentation for ${studentWallet}...`)

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

    console.log(`✅ Presentation created successfully\n`)
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

    console.log(`✅ Presentation verified: ${isValid ? 'VALID' : 'INVALID'}\n`)
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

    console.log(`✅ Retrieved ${studentPresentations.length} presentations\n`)
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

    console.log(`✅ Presentation revoked successfully\n`)
  } catch (err) {
    console.error('❌ Error revoking presentation:', err.message)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to revoke presentation',
    })
  }
})

export default router
