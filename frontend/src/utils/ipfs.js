/**
 * IPFS utility functions (placeholder for Feature 4+)
 */

/**
 * Upload data to IPFS via Pinata
 * @param {Object} data - Data to upload
 * @param {string} filename - Filename for the upload
 * @returns {Promise<string>} IPFS hash
 */
export const uploadToIPFS = async (data, filename) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ipfs/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data, filename }),
    })
    const result = await response.json()
    if (!result.success) throw new Error(result.error)
    return result.data.ipfsHash
  } catch (err) {
    console.error('Error uploading to IPFS:', err)
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
    if (!response.ok) throw new Error('Failed to fetch from IPFS')
    return await response.json()
  } catch (err) {
    console.error('Error fetching from IPFS:', err)
    throw err
  }
}

/**
 * Get IPFS gateway URL
 * @param {string} ipfsHash - IPFS hash
 * @returns {string} Full IPFS gateway URL
 */
export const getIPFSUrl = (ipfsHash) => {
  return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
}
