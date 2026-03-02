/**
 * Cryptographic utility functions
 */

/**
 * Generate SHA-256 hash of data
 * @param {string|Uint8Array} data - Data to hash
 * @returns {Promise<string>} Hex-encoded hash
 */
export const sha256 = async (data) => {
  try {
    const encoder = new TextEncoder()
    const dataBuffer = typeof data === 'string' ? encoder.encode(data) : data
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  } catch (err) {
    console.error('Error hashing data:', err)
    throw err
  }
}

/**
 * Generate UUID v4
 * @returns {string} UUID string
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Encode string to base64
 * @param {string} str - String to encode
 * @returns {string} Base64 encoded string
 */
export const toBase64 = (str) => {
  try {
    return btoa(unescape(encodeURIComponent(str)))
  } catch (err) {
    console.error('Error encoding to base64:', err)
    throw err
  }
}

/**
 * Decode base64 string
 * @param {string} str - Base64 string to decode
 * @returns {string} Decoded string
 */
export const fromBase64 = (str) => {
  try {
    return decodeURIComponent(escape(atob(str)))
  } catch (err) {
    console.error('Error decoding from base64:', err)
    throw err
  }
}

/**
 * Get public key from signed bytes
 * @param {Uint8Array} signedMessage - Signed message
 * @param {Uint8Array} signature - Signature bytes
 * @returns {string} Public key in base58
 */
export const extractPublicKey = (message, signature) => {
  // This is handled by the wallet during signing
  // We receive the public key from the wallet directly
  return null
}
