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
    const algodClient = new algosdk.Algodv2(
      '',
      process.env.VITE_ALGOD_URL,
      ''
    )

    // Get suggested parameters
    const params = await algodClient.getTransactionParams().do()

    // App ID from deployment
    const appId = parseInt(process.env.VITE_APP_ID)
    if (!appId) {
      throw new Error('VITE_APP_ID not configured')
    }

    // Build application call transaction
    // Call register_did(ipfsHash) method
    const txn = algosdk.makeApplicationCallTxnFromObject({
      from: walletAddress,
      appIndex: appId,
      onComplete: algosdk.OnComplete.NoOpOC,
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
