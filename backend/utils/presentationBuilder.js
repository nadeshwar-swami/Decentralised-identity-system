/**
 * Verifiable Presentation Builder
 * Creates W3C Verifiable Presentations for selective credential disclosure
 * Feature 7 implementation
 */

import { generateUUID } from './crypto.js'

/**
 * Build a Verifiable Presentation (selective disclosure proof)
 * @param {Object} params - Presentation parameters
 * @param {string} params.studentDID - Student's DID
 * @param {string} params.studentWallet - Student's wallet address
 * @param {Array} params.credentials - Array of credentials to include in presentation
 * @param {string} params.service - Service receiving the presentation (e.g., "employer", "library")
 * @param {number} params.expiresInHours - How many hours until presentation expires (default: 24)
 * @returns {Object} W3C Verifiable Presentation
 */
export const buildVerifiablePresentation = (params) => {
  const {
    studentDID,
    studentWallet,
    credentials = [],
    service = 'general',
    expiresInHours = 24,
  } = params

  const presentationId = `urn:uuid:${generateUUID()}`
  const issuanceDate = new Date()
  const expirationDate = new Date(issuanceDate.getTime() + expiresInHours * 60 * 60 * 1000)

  // Include only essential credential information for privacy
  const presentedCredentials = credentials.map((cred) => ({
    '@context': 'https://www.w3.org/ns/credentials/v2',
    type: ['VerifiableCredential', 'AcademicCredential'],
    id: cred.credentialId,
    issuer: {
      id: cred.issuerDID,
      name: cred.issuerName,
    },
    credentialSubject: {
      id: studentDID,
      program: cred.program,
      credentialType: cred.credentialType,
    },
    issuanceDate: cred.issuedAt,
  }))

  return {
    '@context': 'https://www.w3.org/ns/credentials/v2',
    type: ['VerifiablePresentation'],
    id: presentationId,
    holder: {
      id: studentDID,
      walletAddress: studentWallet,
    },
    verifiableCredential: presentedCredentials,
    proof: {
      type: 'Ed25519Signature2020',
      created: issuanceDate.toISOString(),
      verificationMethod: `${studentDID}#key-1`,
      proofPurpose: 'authentication',
      // In production: sign presentation with student's private key
      signatureValue: `sig_${generateUUID()}`,
    },
    metadata: {
      service,
      purpose: `Disclosing credentials to ${service}`,
      issuedAt: issuanceDate.toISOString(),
      expiresAt: expirationDate.toISOString(),
      presentationCount: presentedCredentials.length,
    },
  }
}

/**
 * Validate a Verifiable Presentation structure
 * @param {Object} presentation - Presentation to validate
 * @throws {Error} If presentation is invalid
 */
export const validatePresentation = (presentation) => {
  if (!presentation) {
    throw new Error('Presentation is required')
  }

  if (!presentation['@context']) {
    throw new Error('Presentation missing @context')
  }

  if (!Array.isArray(presentation.type) || !presentation.type.includes('VerifiablePresentation')) {
    throw new Error('Presentation must have type VerifiablePresentation')
  }

  if (!presentation.id) {
    throw new Error('Presentation must have an id')
  }

  if (!presentation.holder || !presentation.holder.id) {
    throw new Error('Presentation must have holder.id')
  }

  if (!Array.isArray(presentation.verifiableCredential)) {
    throw new Error('Presentation must contain verifiableCredential array')
  }

  if (presentation.verifiableCredential.length === 0) {
    throw new Error('Presentation must contain at least one credential')
  }
}

/**
 * Verify presentation expiration
 * @param {Object} presentation - Presentation to check
 * @returns {Object} {isExpired: boolean, expiresAt: Date}
 */
export const checkPresentationExpiration = (presentation) => {
  if (!presentation.metadata || !presentation.metadata.expiresAt) {
    return { isExpired: false, expiresAt: null }
  }

  const expiresAt = new Date(presentation.metadata.expiresAt)
  const now = new Date()
  const isExpired = expiresAt < now

  return { isExpired, expiresAt }
}

/**
 * Extract credential IDs from a presentation
 * @param {Object} presentation - Presentation
 * @returns {Array} Array of credential IDs
 */
export const extractCredentialIds = (presentation) => {
  if (!presentation.verifiableCredential) {
    return []
  }

  return presentation.verifiableCredential.map((cred) => cred.id)
}

/**
 * Format presentation for audit log
 * @param {Object} presentation - Presentation
 * @returns {Object} Formatted presentation summary
 */
export const formatPresentationAudit = (presentation) => {
  return {
    presentationId: presentation.id,
    holder: presentation.holder.walletAddress,
    credentialCount: presentation.verifiableCredential?.length || 0,
    service: presentation.metadata?.service,
    issuedAt: presentation.metadata?.issuedAt,
    expiresAt: presentation.metadata?.expiresAt,
    credentials: extractCredentialIds(presentation),
  }
}
