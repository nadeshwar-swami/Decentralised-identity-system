/**
 * DID Document Builder
 * W3C DID Core v1.0 compliant
 * Feature 4: DID Creation
 */

import { generateUUID } from '../utils/crypto.js'

/**
 * Build W3C DID Document
 * @param {string} walletAddress - Algorand wallet address
 * @param {string} displayName - Human-readable display name
 * @returns {Object} W3C compliant DID document
 */
export const buildDIDDocument = (walletAddress, displayName) => {
  const did = `did:algo:testnet:${walletAddress}`
  const now = new Date().toISOString()

  return {
    // W3C DID Core specification
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/ed25519-2020/v1',
    ],

    // Subject identifier
    id: did,

    // Human-readable name
    name: displayName,

    // Document metadata
    created: now,
    updated: now,

    // Verification methods (public keys for signing)
    verificationMethod: [
      {
        id: `${did}#key-1`,
        type: 'Ed25519VerificationKey2020',
        controller: did,
        publicKeyMultibase: `z${Buffer.from(
          'algorithm:ed25519:' + walletAddress
        ).toString('base64')}`,
      },
    ],

    // Authentication - which methods can authenticate
    authentication: [`${did}#key-1`],

    // Assertion - which methods can verify credentials
    assertionMethod: [`${did}#key-1`],

    // Capability invocation
    capabilityInvocation: [`${did}#key-1`],

    // Capability delegation
    capabilityDelegation: [`${did}#key-1`],

    // Key agreement for encryption
    keyAgreement: [`${did}#key-1`],

    // Service endpoints
    service: [
      {
        id: `${did}#credentials`,
        type: 'VerifiableCredentialService',
        serviceEndpoint: 'https://campus-did.example.com/credentials',
      },
      {
        id: `${did}#profile`,
        type: 'Profile',
        serviceEndpoint: `https://gateway.pinata.cloud/ipfs/`,
      },
    ],

    // Proof of ownership
    proof: {
      type: 'Ed25519Signature2020',
      created: now,
      proofPurpose: 'assertionMethod',
      verificationMethod: `${did}#key-1`,
      signatureValue: 'placeholder_signature',
    },
  }
}

/**
 * Validate DID document structure
 * @param {Object} document - DID document to validate
 * @returns {boolean} True if valid
 */
export const validateDIDDocument = (document) => {
  if (!document.id || !document.id.startsWith('did:algo:')) {
    throw new Error('Invalid DID format')
  }

  if (!document['@context']) {
    throw new Error('Missing @context')
  }

  if (!document.verificationMethod || document.verificationMethod.length === 0) {
    throw new Error('Missing verificationMethod')
  }

  if (!document.authentication || document.authentication.length === 0) {
    throw new Error('Missing authentication')
  }

  return true
}

/**
 * Resolve DID to document
 * @param {string} did - DID identifier
 * @returns {Object} Partial DID document metadata
 */
export const resolveDID = (did) => {
  if (!did.startsWith('did:algo:testnet:')) {
    throw new Error('Invalid Algorand DID format')
  }

  const walletAddress = did.replace('did:algo:testnet:', '')

  return {
    id: did,
    walletAddress,
    network: 'testnet',
    method: 'algo',
  }
}
