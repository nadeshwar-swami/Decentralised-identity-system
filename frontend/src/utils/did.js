/**
 * DID utility functions - ARC-52 compliant
 */

/**
 * Generate DID from wallet address
 * @param {string} walletAddress - Algorand wallet address
 * @returns {string} DID string
 */
export const generateDID = (walletAddress) => {
  return `did:algo:testnet:${walletAddress}`
}

/**
 * Extract address from DID
 * @param {string} did - DID string
 * @returns {string} Wallet address
 */
export const extractAddressFromDID = (did) => {
  const parts = did.split(':')
  if (parts.length !== 4 || parts[0] !== 'did' || parts[1] !== 'algo') {
    throw new Error('Invalid DID format')
  }
  return parts[3]
}

/**
 * Build W3C DID Document
 * @param {string} walletAddress - Algorand wallet address
 * @param {string} displayName - User's display name
 * @param {string} publicKey - Public key in base58 format
 * @returns {Object} DID Document
 */
export const buildDIDDocument = (walletAddress, displayName, publicKey) => {
  const did = generateDID(walletAddress)
  
  return {
    '@context': 'https://www.w3.org/ns/did/v1',
    id: did,
    alsoKnownAs: [displayName],
    verificationMethod: [
      {
        id: `${did}#key-1`,
        type: 'Ed25519VerificationKey2020',
        controller: did,
        publicKeyBase58: publicKey,
      },
    ],
    authentication: [`${did}#key-1`],
    assertionMethod: [`${did}#key-1`],
    service: [
      {
        id: `${did}#campus`,
        type: 'CampusIdentity',
        serviceEndpoint: 'https://campus.edu/identity',
      },
    ],
  }
}

/**
 * Validate DID Document structure
 * @param {Object} doc - DID Document
 * @returns {boolean} True if valid
 */
export const validateDIDDocument = (doc) => {
  if (!doc.id || !doc['@context']) return false
  if (!Array.isArray(doc.verificationMethod) || doc.verificationMethod.length === 0) return false
  if (!Array.isArray(doc.authentication) || doc.authentication.length === 0) return false
  return true
}
