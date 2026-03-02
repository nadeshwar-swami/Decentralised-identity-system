/**
 * Verification Builder
 * Creates and manages service verification of student credentials
 * Feature 8 implementation
 */

import { generateUUID } from './crypto.js'

/**
 * Build a verification record
 * @param {Object} params - Verification parameters
 * @param {string} params.serviceId - Service ID
 * @param {string} params.serviceName - Service name
 * @param {string} params.presentationId - Presentation ID being verified
 * @param {string} params.studentDID - Student DID
 * @param {Array} params.credentialIds - IDs of credentials in presentation
 * @param {string} params.verificationPurpose - Why verification is needed
 * @param {Object} params.verificationResult - Verification result
 * @returns {Object} Verification record
 */
export const buildVerificationRecord = (params) => {
  const {
    serviceId,
    serviceName,
    presentationId,
    studentDID,
    credentialIds = [],
    verificationPurpose = 'employment',
    verificationResult = {},
  } = params

  const verificationId = `ver_${generateUUID()}`
  const verificationDate = new Date()

  const isValid = verificationResult.structureValid && 
                  verificationResult.signatureValid &&
                  verificationResult.notExpired &&
                  verificationResult.notRevoked &&
                  verificationResult.credentialsValid

  return {
    '@context': 'https://www.w3.org/ns/credentials/v2',
    id: verificationId,
    type: 'VerificationRecord',
    service: {
      id: serviceId,
      name: serviceName,
    },
    presentation: {
      id: presentationId,
      credentialCount: credentialIds.length,
    },
    student: {
      did: studentDID,
    },
    verification: {
      purpose: verificationPurpose,
      performedAt: verificationDate.toISOString(),
      isValid,
      details: verificationResult,
    },
    trustScore: calculateTrustScore(verificationResult),
    metadata: {
      createdAt: verificationDate.toISOString(),
      expiresAt: new Date(verificationDate.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    },
  }
}

/**
 * Calculate trust score based on verification result
 * @param {Object} verificationResult - Verification result from presentation check
 * @returns {number} Trust score 0-100
 */
export const calculateTrustScore = (verificationResult) => {
  let score = 0

  if (verificationResult.structureValid) score += 20
  if (verificationResult.signatureValid) score += 20
  if (verificationResult.notExpired) score += 20
  if (verificationResult.notRevoked) score += 20
  if (verificationResult.credentialsValid) score += 20

  return score
}

/**
 * Build a service profile
 * @param {Object} params - Service parameters
 * @param {string} params.serviceName - Service/organization name
 * @param {string} params.serviceType - Type: employer, library, hostel, events
 * @param {string} params.contactEmail - Contact email
 * @param {string} params.verificationPublicKey - Public key for verification
 * @returns {Object} Service profile
 */
export const buildServiceProfile = (params) => {
  const {
    serviceName,
    serviceType = 'employer',
    contactEmail,
    verificationPublicKey,
  } = params

  const serviceId = `service_${generateUUID()}`
  const createdDate = new Date()

  return {
    '@context': 'https://www.w3.org/ns/credentials/v2',
    id: serviceId,
    type: 'ServiceProvider',
    name: serviceName,
    serviceType,
    contactEmail,
    verificationPublicKey,
    profile: {
      createdAt: createdDate.toISOString(),
      verified: false,
      verificationCount: 0,
      averageTrustScore: 0,
    },
    metadata: {
      registered: true,
      active: true,
    },
  }
}

/**
 * Validate a verification record
 * @param {Object} record - Verification record
 * @throws {Error} If record is invalid
 */
export const validateVerificationRecord = (record) => {
  if (!record) {
    throw new Error('Verification record is required')
  }

  if (!record.id) {
    throw new Error('Verification record must have an id')
  }

  if (!record.service || !record.service.id) {
    throw new Error('Verification record must have service.id')
  }

  if (!record.presentation || !record.presentation.id) {
    throw new Error('Verification record must have presentation.id')
  }

  if (!record.student || !record.student.did) {
    throw new Error('Verification record must have student.did')
  }

  if (!record.verification || typeof record.verification.isValid !== 'boolean') {
    throw new Error('Verification record must have verification.isValid')
  }
}

/**
 * Check if a verification record is expired
 * @param {Object} record - Verification record
 * @returns {Object} {isExpired: boolean, expiresAt: Date}
 */
export const checkVerificationExpiration = (record) => {
  if (!record.metadata || !record.metadata.expiresAt) {
    return { isExpired: false, expiresAt: null }
  }

  const expiresAt = new Date(record.metadata.expiresAt)
  const now = new Date()
  const isExpired = expiresAt < now

  return { isExpired, expiresAt }
}

/**
 * Generate verification report
 * @param {Array} verifications - Array of verification records
 * @returns {Object} Verification summary report
 */
export const generateVerificationReport = (verifications = []) => {
  const totalVerifications = verifications.length
  const validVerifications = verifications.filter((v) => v.verification.isValid).length
  const failedVerifications = totalVerifications - validVerifications
  const averageTrustScore =
    totalVerifications > 0
      ? Math.round(
          verifications.reduce((sum, v) => sum + v.trustScore, 0) / totalVerifications
        )
      : 0

  const credentialStats = {}
  verifications.forEach((v) => {
    if (v.presentation.credentialCount) {
      credentialStats[v.presentation.credentialCount] =
        (credentialStats[v.presentation.credentialCount] || 0) + 1
    }
  })

  return {
    total: totalVerifications,
    valid: validVerifications,
    failed: failedVerifications,
    successRate: totalVerifications > 0 ? Math.round((validVerifications / totalVerifications) * 100) : 0,
    averageTrustScore,
    credentialStatistics: credentialStats,
  }
}

/**
 * Format verification for audit log
 * @param {Object} record - Verification record
 * @returns {Object} Formatted verification summary
 */
export const formatVerificationAudit = (record) => {
  return {
    verificationId: record.id,
    service: record.service.name,
    student: record.student.did,
    presentation: record.presentation.id,
    isValid: record.verification.isValid,
    trustScore: record.trustScore,
    performedAt: record.verification.performedAt,
    purpose: record.verification.purpose,
  }
}
