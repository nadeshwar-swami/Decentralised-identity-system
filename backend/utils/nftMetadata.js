/**
 * NFT/ASA Metadata Builder
 * Creates ARC-69 compliant metadata for credential NFTs
 * Feature 5 implementation
 */

import { generateUUID, sha256 } from './crypto.js'

/**
 * Build ARC-69 metadata for credential NFT
 * @param {Object} params - Metadata parameters
 * @param {string} params.credentialId - Unique credential ID
 * @param {string} params.program - Program/credential name
 * @param {string} params.issuerName - Institution name
 * @param {string} params.studentName - Student display name
 * @param {string} params.issueDate - Issuance date
 * @param {string} params.ipfsHash - IPFS hash of credential document
 * @param {string} params.credentialType - Type (Certificate, Degree, etc)
 * @returns {Object} ARC-69 metadata object
 */
export const buildNFTMetadata = (params) => {
  const {
    credentialId,
    program,
    issuerName,
    studentName,
    issueDate,
    ipfsHash,
    credentialType = 'Certificate',
    description = '',
  } = params

  return {
    // ARC-69 Standard Fields
    standard: 'arc69',
    description: `${credentialType}: ${program} - Issued to ${studentName}`,
    external_url: `https://algorand.campus-did.edu/credentials/${credentialId}`,
    mime_type: 'application/json',

    // Custom Metadata (stored as properties in ARC-69)
    properties: {
      program: program,
      issuer: issuerName,
      recipient: studentName,
      credentialType: credentialType,
      issueDate: issueDate,
      credentialVersion: '1.0',
    },

    // IPFS Reference
    image: ipfsHash ? `ipfs://${ipfsHash}` : undefined,
    ipfs_cid: ipfsHash,

    // Credential Integrity
    attributes: [
      {
        trait_type: 'Credential Type',
        value: credentialType,
      },
      {
        trait_type: 'Program',
        value: program,
      },
      {
        trait_type: 'Issuer',
        value: issuerName,
      },
      {
        trait_type: 'Issued',
        value: issueDate,
      },
      {
        trait_type: 'Recipient',
        value: studentName,
      },
      {
        trait_type: 'Status',
        value: 'Active',
      },
    ],
  }
}

/**
 * Build ASA creation parameters for credential NFT
 * @param {Object} params - ASA creation parameters
 * @param {string} params.creatorAddress - Creator/Manager address
 * @param {string} params.program - Program name
 * @param {string} params.issuerName - Institution name
 * @returns {Object} ASA creation parameters for algosdk
 */
export const buildASACreationParams = (params) => {
  const { creatorAddress, program, issuerName } = params

  return {
    assetName: `${issuerName} - ${program}`,
    unitName: 'CRED',
    total: 1, // NFT (not divisible)
    decimals: 0, // NFT
    defaultFrozen: false,
    manager: creatorAddress,
    reserve: creatorAddress,
    freeze: creatorAddress,
    clawback: creatorAddress,
    // URL can be updated to point to IPFS gateway
    url: 'https://gateway.pinata.cloud/ipfs/credential-metadata',
    metadataHash: Buffer.from('credential-metadata-hash').subarray(0, 32), // Must be 32 bytes
  }
}

/**
 * Validate NFT metadata
 * @param {Object} metadata - Metadata to validate
 * @returns {boolean} Whether metadata is valid
 */
export const validateNFTMetadata = (metadata) => {
  if (!metadata || typeof metadata !== 'object') {
    throw new Error('Invalid metadata: must be an object')
  }

  const required = ['standard', 'description', 'properties']
  for (const field of required) {
    if (!metadata[field]) {
      throw new Error(`Invalid metadata: missing required field '${field}'`)
    }
  }

  // Validate ARC-69 standard
  if (metadata.standard !== 'arc69') {
    throw new Error('Invalid metadata: must follow ARC-69 standard')
  }

  // Validate properties
  if (typeof metadata.properties !== 'object') {
    throw new Error('Invalid metadata: properties must be an object')
  }

  const requiredProps = ['program', 'issuer', 'credentialType']
  for (const prop of requiredProps) {
    if (!metadata.properties[prop]) {
      throw new Error(`Invalid metadata: missing required property '${prop}'`)
    }
  }

  return true
}

/**
 * Create NFT name with constraints
 * Algorand limits asset names to 32 characters
 * @param {string} program - Program name
 * @param {string} issuer - Issuer name
 * @returns {string} Truncated NFT name
 */
export const createNFTName = (program, issuer) => {
  const baseProgram = program.substring(0, 15)
  const baseIssuer = issuer.substring(0, 12)
  const name = `${baseIssuer}-${baseProgram}`

  // Algorand limit is 32 chars
  if (name.length > 32) {
    return name.substring(0, 32)
  }
  return name
}

/**
 * Create NFT unit name (must be under 8 characters)
 * @returns {string} Unit name
 */
export const createNFTUnitName = () => {
  return 'CRED'
}

/**
 * Format metadata for IPFS storage
 * @param {Object} metadata - The metadata
 * @returns {string} JSON string for IPFS
 */
export const formatMetadataForIPFS = (metadata) => {
  return JSON.stringify(metadata, null, 2)
}

/**
 * Calculate metadata hash for ASA
 * @param {Object} metadata - The metadata
 * @returns {Buffer} 32-byte hash for ASA metadata field
 */
export const calculateMetadataHash = (metadata) => {
  const jsonStr = JSON.stringify(metadata)
  const hash = sha256(jsonStr)
  // Return first 32 bytes
  return Buffer.from(hash.substring(0, 64), 'hex')
}
