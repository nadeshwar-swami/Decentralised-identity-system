import algosdk from 'algosdk'

/**
 * Create unsigned transaction to register DID
 * Calls smart contract register_did method
 * Feature 4 implementation
 * @param {string} walletAddress - Student wallet address
 * @param {string} ipfsHash - IPFS hash of DID document
 * @returns {Promise<Object>} { unsignedTxn, txnBytes }
 */
export const createDID = async (walletAddress, ipfsHash) => {
  try {
    const algodUrl = process.env.ALGORAND_ALGOD_SERVER || 'https://testnet-api.algonode.cloud'
    const appId = parseInt(process.env.ALGORAND_APP_ID || '756415000')

    if (!appId) {
      throw new Error('ALGORAND_APP_ID not configured')
    }

    const algodClient = new algosdk.Algodv2(
      process.env.ALGORAND_ALGOD_TOKEN || '',
      algodUrl,
      process.env.ALGORAND_ALGOD_PORT || '443'
    )

    // Get suggested parameters
    const params = await algodClient.getTransactionParams().do()
    
    // Clear empty note field
    if (params.note && params.note.length === 0) {
      params.note = undefined
    }

    // Build application call transaction
    // Call register_did(ipfsHash) method
    const txn = algosdk.makeApplicationCallTxnFromObject({
      from: walletAddress,
      appIndex: appId,
      appOnComplete: 0, // NoOp = 0
      appArgs: [
        new Uint8Array(Buffer.from('register_did')),
        new Uint8Array(Buffer.from(ipfsHash, 'utf-8')),
      ],
      suggestedParams: params,
    })

    // Return unsigned transaction
    return {
      unsignedTxn: txn,
      txnBytes: algosdk.encodeObj(txn),
    }
  } catch (err) {
    console.error('Error creating DID transaction:', err.message)
    throw err
  }
}
