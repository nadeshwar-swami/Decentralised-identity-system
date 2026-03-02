import algosdk from 'algosdk'

const isEmptyOrZeroByteArray = (value) => {
  if (!(value instanceof Uint8Array)) {
    return false
  }

  return value.length === 0 || value.every((byte) => byte === 0)
}

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

    // Some algod providers can return optional fields in empty form.
    // The SDK encoder rejects zero/empty values for optional fields like lease.
    if (isEmptyOrZeroByteArray(params.lease)) {
      delete params.lease
    }

    // Transaction with appOnComplete, NOT onComplete
    const txn = algosdk.makeApplicationCallTxnFromObject({
      from: walletAddress,
      appIndex: appId,
      appOnComplete: 0, // NoOp
      appArgs: [
        new Uint8Array(Buffer.from('register_did')),
        new Uint8Array(Buffer.from(ipfsHash, 'utf-8')),
      ],
      note: new Uint8Array(Buffer.from(ipfsHash, 'utf-8')),
      suggestedParams: params,
    })
    return {
      unsignedTxn: txn,
      txnBytes: algosdk.encodeUnsignedTransaction(txn),
    }
  } catch (err) {
    console.error('Error creating DID transaction:', err.message)
    throw err
  }
}