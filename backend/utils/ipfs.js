/**
 * IPFS utility functions
 * Pinata integration for DID documents and credentials
 * Feature 4+ implementation
 */

/**
 * Upload data to Pinata IPFS
 * @param {Object} data - Data to upload (JSON object)
 * @param {string} filename - Filename for metadata
 * @returns {Promise<string>} IPFS hash
 */
export const uploadToIPFS = async (data, filename) => {
  try {
    const pinataApiKey = process.env.PINATA_API_KEY
    const pinataSecretKey = process.env.PINATA_SECRET_KEY

    if (!pinataApiKey || !pinataSecretKey) {
      throw new Error('Pinata API keys not configured')
    }

    const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS'

    const body = {
      pinataContent: data,
      pinataMetadata: {
        name: filename,
        keyvalues: {
          timestamp: new Date().toISOString(),
        },
      },
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Pinata error: ${error.error || response.statusText}`)
    }

    const result = await response.json()
    return result.IpfsHash
  } catch (err) {
    console.error('Error uploading to IPFS:', err.message)
    throw err
  }
}

/**
 * Fetch data from IPFS
 * @param {string} ipfsHash - IPFS hash
 * @returns {Promise<Object>} Data from IPFS
 */
export const fetchFromIPFS = async (ipfsHash) => {
  try {
    const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
    const response = await fetch(url)
    return await response.json()
  } catch (err) {
    console.error('Error fetching from IPFS:', err)
    throw err
  }
}
