import crypto from 'crypto'

/**
 * SHA-256 hash
 * @param {string|Buffer} data - Data to hash
 * @returns {string} Hex-encoded hash
 */
export const sha256 = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex')
}

/**
 * Generate UUID v4
 * @returns {string} UUID
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Base64URL encode (for DID operations)
 * @param {Buffer|string} data - Data to encode
 * @returns {string} Base64URL encoded string
 */
export const base64urlEncode = (data) => {
  if (typeof data === 'string') {
    data = Buffer.from(data, 'utf-8')
  }
  return data
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Base64URL decode
 * @param {string} data - Base64URL encoded string
 * @returns {string} Decoded string
 */
export const base64urlDecode = (data) => {
  data += '='.repeat((4 - (data.length % 4)) % 4)
  return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
}
