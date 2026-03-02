/**
 * Services API Routes
 * Service registration, credential verification, and trust management
 * Feature 8 implementation
 */

import express from 'express'
import {
  buildVerificationRecord,
  buildServiceProfile,
  validateVerificationRecord,
  checkVerificationExpiration,
  calculateTrustScore,
  generateVerificationReport,
  formatVerificationAudit,
} from '../utils/verificationBuilder.js'

const router = express.Router()

/**
 * Storage for registered services (in-memory for MVP)
 * In production, use a database
 */
const registeredServices = new Map()

/**
 * Storage for verification records (in-memory for MVP)
 * In production, use a database with audit trail
 */
const verificationRecords = new Map()

/**
 * POST /api/services/register
 * Register a new service/employer for credential verification
 * Feature 8 implementation
 */
router.post('/register', async (req, res) => {
  try {
    const {
      serviceName,
      serviceType = 'employer',
      contactEmail,
      verificationPublicKey,
    } = req.body

    // Validate input
    if (!serviceName || !contactEmail) {
      return res.status(400).json({
        success: false,
        error: 'Required fields: serviceName, contactEmail',
      })
    }

    console.log(`\n🏢 Registering service: ${serviceName}...`)

    // Build service profile
    const serviceProfile = buildServiceProfile({
      serviceName,
      serviceType,
      contactEmail,
      verificationPublicKey: verificationPublicKey || `key_${Math.random().toString(36).substring(7)}`,
    })

    // Store service
    registeredServices.set(serviceProfile.id, {
      ...serviceProfile,
      registeredAt: new Date().toISOString(),
      verificationCount: 0,
      trustedVerifications: 0,
    })

    console.log(`  ✓ Service registered: ${serviceProfile.id}`)
    console.log(`  ✓ Type: ${serviceType}`)
    console.log(`  ✓ Contact: ${contactEmail}`)

    res.json({
      success: true,
      data: {
        serviceId: serviceProfile.id,
        serviceName,
        serviceType,
        contactEmail,
        verificationPublicKey: serviceProfile.verificationPublicKey,
        registeredAt: serviceProfile.profile.createdAt,
      },
    })

    console.log(`✅ Service registered successfully\n`)
  } catch (err) {
    console.error('❌ Error registering service:', err.message)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to register service',
    })
  }
})

/**
 * GET /api/services/:serviceId
 * Get a service's profile and verification statistics
 * Feature 8 implementation
 */
router.get('/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params

    console.log(`\n📊 Fetching service profile: ${serviceId}`)

    const service = registeredServices.get(serviceId)

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
      })
    }

    // Get verification history for this service
    const serviceVerifications = Array.from(verificationRecords.values()).filter(
      (v) => v.service.id === serviceId
    )

    const report = generateVerificationReport(serviceVerifications)

    res.json({
      success: true,
      data: {
        serviceId: service.id,
        serviceName: service.name,
        serviceType: service.serviceType,
        contactEmail: service.contactEmail,
        registeredAt: service.registeredAt,
        verificationStatistics: report,
        recentVerifications: serviceVerifications
          .slice(-5)
          .reverse()
          .map((v) => ({
            verificationId: v.id,
            studentDID: v.student.did,
            isValid: v.verification.isValid,
            trustScore: v.trustScore,
            performedAt: v.verification.performedAt,
          })),
      },
    })

    console.log(`✅ Service profile retrieved\n`)
  } catch (err) {
    console.error('❌ Error fetching service:', err.message)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch service',
    })
  }
})

/**
 * POST /api/services/:serviceId/verify
 * Verify a student's presentation (credential verification for services)
 * Feature 8 implementation
 */
router.post('/:serviceId/verify', async (req, res) => {
  try {
    const { serviceId } = req.params
    const {
      presentationId,
      studentDID,
      credentialIds = [],
      verificationPurpose = 'employment',
      verificationDetails = {},
    } = req.body

    // Validate input
    if (!presentationId || !studentDID) {
      return res.status(400).json({
        success: false,
        error: 'Required fields: presentationId, studentDID',
      })
    }

    console.log(`\n✔️ Service verifying presentation: ${presentationId}`)

    const service = registeredServices.get(serviceId)

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
      })
    }

    // Create verification result
    const verificationResult = {
      structureValid: true,
      signatureValid: true, // In production, verify actual signature
      notExpired: true, // In production, check presentation expiration
      notRevoked: !verificationDetails.isRevoked || false,
      credentialsValid: credentialIds.length > 0,
    }

    // Build verification record
    const verificationRecord = buildVerificationRecord({
      serviceId: service.id,
      serviceName: service.name,
      presentationId,
      studentDID,
      credentialIds,
      verificationPurpose,
      verificationResult,
    })

    // Validate verification record
    validateVerificationRecord(verificationRecord)

    // Store verification record
    verificationRecords.set(verificationRecord.id, verificationRecord)

    // Update service statistics
    service.verificationCount += 1
    if (verificationRecord.verification.isValid) {
      service.trustedVerifications += 1
    }

    const trustScore = calculateTrustScore(verificationResult)

    console.log(`  ✓ Verification ID: ${verificationRecord.id}`)
    console.log(`  ✓ Student DID: ${studentDID}`)
    console.log(`  ✓ Valid: ${verificationRecord.verification.isValid}`)
    console.log(`  ✓ Trust Score: ${trustScore}/100`)

    res.json({
      success: true,
      data: {
        verificationId: verificationRecord.id,
        serviceId: service.id,
        serviceName: service.name,
        studentDID,
        presentationId,
        isValid: verificationRecord.verification.isValid,
        trustScore,
        verificationDetails: {
          structure: verificationResult.structureValid,
          signature: verificationResult.signatureValid,
          notExpired: verificationResult.notExpired,
          notRevoked: verificationResult.notRevoked,
          credentials: verificationResult.credentialsValid,
        },
        verificationRecord,
      },
    })

    console.log(`✅ Verification completed\n`)
  } catch (err) {
    console.error('❌ Error verifying credentials:', err.message)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to verify credentials',
    })
  }
})

/**
 * GET /api/services/:serviceId/verifications
 * Get verification history for a service
 * Feature 8 implementation
 */
router.get('/:serviceId/verifications', async (req, res) => {
  try {
    const { serviceId } = req.params
    const { limit = 50, offset = 0 } = req.query

    console.log(`\n📋 Fetching verifications for service: ${serviceId}`)

    const service = registeredServices.get(serviceId)

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
      })
    }

    // Get all verifications for this service
    const serviceVerifications = Array.from(verificationRecords.values())
      .filter((v) => v.service.id === serviceId)
      .sort((a, b) => new Date(b.metadata.createdAt) - new Date(a.metadata.createdAt))
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit))

    const report = generateVerificationReport(
      Array.from(verificationRecords.values()).filter((v) => v.service.id === serviceId)
    )

    const verificationSummary = serviceVerifications.map((v) => {
      const { isExpired } = checkVerificationExpiration(v)
      return {
        verificationId: v.id,
        studentDID: v.student.did,
        presentationId: v.presentation.id,
        credentialCount: v.presentation.credentialCount,
        isValid: v.verification.isValid,
        trustScore: v.trustScore,
        purpose: v.verification.purpose,
        performedAt: v.verification.performedAt,
        isExpired,
      }
    })

    res.json({
      success: true,
      data: {
        serviceId,
        serviceName: service.name,
        totalVerifications: Array.from(verificationRecords.values()).filter((v) => v.service.id === serviceId)
          .length,
        verifications: verificationSummary,
        statistics: report,
      },
    })

    console.log(`✅ Retrieved ${verificationSummary.length} verifications\n`)
  } catch (err) {
    console.error('❌ Error fetching verifications:', err.message)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch verifications',
    })
  }
})

/**
 * GET /api/services/:serviceId/verify/:verificationId
 * Get details of a specific verification
 * Feature 8 implementation
 */
router.get('/:serviceId/verify/:verificationId', async (req, res) => {
  try {
    const { serviceId, verificationId } = req.params

    console.log(`\n📄 Fetching verification: ${verificationId}`)

    const service = registeredServices.get(serviceId)

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
      })
    }

    const verification = verificationRecords.get(verificationId)

    if (!verification || verification.service.id !== serviceId) {
      return res.status(404).json({
        success: false,
        error: 'Verification not found',
      })
    }

    const { isExpired, expiresAt } = checkVerificationExpiration(verification)

    res.json({
      success: true,
      data: {
        verificationId: verification.id,
        serviceId: service.id,
        serviceName: service.name,
        studentDID: verification.student.did,
        presentationId: verification.presentation.id,
        credentialCount: verification.presentation.credentialCount,
        isValid: verification.verification.isValid,
        isExpired,
        trustScore: verification.trustScore,
        purpose: verification.verification.purpose,
        performedAt: verification.verification.performedAt,
        expiresAt,
        details: verification.verification.details,
        record: verification,
      },
    })

    console.log(`✅ Verification retrieved\n`)
  } catch (err) {
    console.error('❌ Error fetching verification:', err.message)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch verification',
    })
  }
})

/**
 * GET /api/services/student/:studentDID
 * Get verification history for a specific student
 * Feature 8 implementation
 */
router.get('/student/:studentDID', async (req, res) => {
  try {
    const { studentDID } = req.params

    console.log(`\n👤 Fetching verifications for student: ${studentDID}`)

    // Get all verifications for this student
    const studentVerifications = Array.from(verificationRecords.values())
      .filter((v) => v.student.did === studentDID)
      .sort((a, b) => new Date(b.metadata.createdAt) - new Date(a.metadata.createdAt))

    const verificationSummary = studentVerifications.map((v) => {
      const { isExpired } = checkVerificationExpiration(v)
      return {
        verificationId: v.id,
        service: v.service.name,
        serviceName: v.service.name,
        presentationId: v.presentation.id,
        isValid: v.verification.isValid,
        trustScore: v.trustScore,
        purpose: v.verification.purpose,
        performedAt: v.verification.performedAt,
        isExpired,
      }
    })

    const trustScores = studentVerifications.map((v) => v.trustScore)
    const averageTrustScore = trustScores.length > 0 ? Math.round(trustScores.reduce((a, b) => a + b) / trustScores.length) : 0

    res.json({
      success: true,
      data: {
        studentDID,
        totalVerifications: studentVerifications.length,
        validVerifications: studentVerifications.filter((v) => v.verification.isValid).length,
        averageTrustScore,
        verifications: verificationSummary,
      },
    })

    console.log(`✅ Retrieved ${studentVerifications.length} verifications for student\n`)
  } catch (err) {
    console.error('❌ Error fetching student verifications:', err.message)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch student verifications',
    })
  }
})

export default router
