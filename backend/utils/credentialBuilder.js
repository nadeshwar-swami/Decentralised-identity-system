/**
 * Verifiable Credential Builder
 * Creates W3C Verifiable Credentials for academic achievements
 * Feature 5 implementation
 */

import { generateUUID } from './crypto.js'

/**
 * Build a W3C Verifiable Credential
 * @param {Object} params - Credential parameters
 * @param {string} params.studentDID - Student's DID
 * @param {string} params.credentialType - Type of credential (e.g., "Degree", "Certificate")
 * @param {string} params.program - Program name
 * @param {string} params.issuerDID - Institution's DID
 * @param {string} params.issuerName - Institution name
 * @param {Date} params.issuanceDate - When credential was issued
 * @returns {Object} W3C Verifiable Credential
 */
export const buildVerifiableCredential = (params) => {
  const {
    studentDID,
    credentialType = 'Certificate',
    program,
    description = '',
    issuerDID,
    issuerName,
    issuanceDate = new Date(),
    expirationDate = null,
  } = params

  const credentialId = `urn:uuid:${generateUUID()}`
  const issuanceISO = new Date(issuanceDate).toISOString()
  const expirationISO = expirationDate ? new Date(expirationDate).toISOString() : null

  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://www.w3.org/2018/credentials/examples/v1',
      'https://w3id.org/security/v3',
    ],
    type: ['VerifiableCredential', 'AcademicCredential'],
    id: credentialId,
    issuer: {
      id: issuerDID,
      name: issuerName,
    },
    credentialSubject: {
      id: studentDID,
      type: 'Person',
      awarding: {
        name: issuerName,
      },
      qualifiedBy: {
        type: credentialType,
        title: program,
        description: description,
      },
    },
    issuanceDate: issuanceISO,
    ...(expirationISO && { expirationDate: expirationISO }),
    credentialStatus: {
      id: `did:algo:app:${process.env.ALGORAND_APP_ID || '756415000'}:status#${generateUUID()}`,
      type: 'ARC52CredentialStatus',
    },
    proof: {
      type: 'Ed25519Signature2018',
      created: issuanceISO,
      verificationMethod: `${issuerDID}#keys-1`,
      signatureValue: 'placeholder_signature_value',
    },
  }
}

/**
 * Validate a Verifiable Credential structure
 * @param {Object} credential - Credential to validate
 * @returns {boolean} Whether credential is valid
 */
export const validateCredential = (credential) => {
  if (!credential ||typeof credential !== 'object') {
    throw new Error('Invalid credential: must be an object')
  }

  const required = ['@context', 'type', 'issuer', 'credentialSubject', 'issuanceDate']
  for (const field of required) {
    if (!credential[field]) {
      throw new Error(`Invalid credential: missing required field '${field}'`)
    }
  }

  // Validate context includes W3C credentials
  const contexts = Array.isArray(credential['@context'])
    ? credential['@context']
    : [credential['@context']]
  if (!contexts.includes('https://www.w3.org/2018/credentials/v1')) {
    throw new Error('Invalid credential: missing W3C credentials context')
  }

  // Validate type includes VerifiableCredential
  const types = Array.isArray(credential.type) ? credential.type : [credential.type]
  if (!types.includes('VerifiableCredential')) {
    throw new Error('Invalid credential: type must include VerifiableCredential')
  }

  // Validate issuer
  if (typeof credential.issuer === 'string') {
    if (!credential.issuer.startsWith('did:')) {
      throw new Error('Invalid credential: issuer must be a valid DID')
    }
  } else if (typeof credential.issuer === 'object') {
    if (!credential.issuer.id || !credential.issuer.id.startsWith('did:')) {
      throw new Error('Invalid credential: issuer must have valid DID')
    }
  }

  // Validate credential subject
  if (!credential.credentialSubject.id || !credential.credentialSubject.id.startsWith('did:')) {
    throw new Error('Invalid credential: credentialSubject must have valid DID')
  }

  return true
}

/**
 * Parse credential issuer
 * @param {Object} credential - The credential
 * @returns {Object} Issuer object with id and name
 */
export const getIssuer = (credential) => {
  if (typeof credential.issuer === 'string') {
    return { id: credential.issuer, name: 'Unknown Issuer' }
  }
  return credential.issuer
}

/**
 * Parse credential subject (student)
 * @param {Object} credential - The credential
 * @returns {Object} Subject object with id and details
 */
export const getSubject = (credential) => {
  return credential.credentialSubject
}

/**
 * Check if credential has expired
 * @param {Object} credential - The credential
 * @returns {boolean} Whether credential has expired
 */
export const hasExpired = (credential) => {
  if (!credential.expirationDate) {
    return false
  }
  return new Date(credential.expirationDate) < new Date()
}

/**
 * Get presentation format for credential
 * @param {Object} credential - The credential
 * @returns {Object} Simple presentation object
 */
export const getPresentationFormat = (credential) => {
  const issuer = getIssuer(credential)
  const subject = getSubject(credential)
  const qualified = subject.qualifiedBy || {}

  return {
    credentialId: credential.id,
    credentialType: credential.type,
    issued: credential.issuanceDate,
    expires: credential.expirationDate,
    issuer: issuer.name || issuer.id,
    program: qualified.title || 'Unknown Program',
    description: qualified.description || '',
    status: hasExpired(credential) ? 'expired' : 'valid',
    credentialSubjectId: subject.id,
  }
}
