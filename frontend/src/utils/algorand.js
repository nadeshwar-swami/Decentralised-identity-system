import algosdk from 'algosdk'

const algodToken = ''
const algodServer = import.meta.env.VITE_ALGOD_URL || 'https://testnet-api.algonode.cloud'
const algodPort = 443
const indexerToken = ''
const indexerServer = import.meta.env.VITE_INDEXER_URL || 'https://testnet-idx.algonode.cloud'
const indexerPort = 443

/**
 * Get Algod client instance
 * @returns {algosdk.Algodv2} Algod client
 */
export const getAlgodClient = () => {
  return new algosdk.Algodv2(algodToken, algodServer, algodPort)
}

/**
 * Get Indexer client instance
 * @returns {algosdk.Indexer} Indexer client
 */
export const getIndexerClient = () => {
  return new algosdk.Indexer(indexerToken, indexerServer, indexerPort)
}

/**
 * Get account info from Algorand
 * @param {string} address - Wallet address
 * @returns {Promise<Object>} Account info
 */
export const getAccountInfo = async (address) => {
  const client = getAlgodClient()
  try {
    const info = await client.accountInformation(address).do()
    return info
  } catch (err) {
    console.error('Error fetching account info:', err)
    throw err
  }
}

/**
 * Get suggested transaction parameters
 * @returns {Promise<algosdk.SuggestedParams>} Transaction params
 */
export const getSuggestedParams = async () => {
  const client = getAlgodClient()
  try {
    const params = await client.getTransactionParams().do()
    return params
  } catch (err) {
    console.error('Error fetching suggested params:', err)
    throw err
  }
}

/**
 * Submit signed transaction to blockchain
 * @param {Uint8Array} signedTxn - Signed transaction
 * @returns {Promise<string>} Transaction ID
 */
export const submitTransaction = async (signedTxn) => {
  const client = getAlgodClient()
  try {
    const txId = await client.sendRawTransaction(signedTxn).do()
    // Wait for confirmation
    await algosdk.waitForConfirmation(client, txId.txId, 4)
    return txId.txId
  } catch (err) {
    console.error('Error submitting transaction:', err)
    throw err
  }
}

/**
 * Get asset information from indexer
 * @param {number} assetId - Asset ID
 * @returns {Promise<Object>} Asset info
 */
export const getAssetInfo = async (assetId) => {
  const indexer = getIndexerClient()
  try {
    const info = await indexer.searchForAssets().index(assetId).do()
    return info.assets[0] || null
  } catch (err) {
    console.error('Error fetching asset info:', err)
    throw err
  }
}

/**
 * Get all assets held by an account
 * @param {string} address - Wallet address
 * @returns {Promise<Array>} List of assets
 */
export const getAccountAssets = async (address) => {
  const indexer = getIndexerClient()
  try {
    const accountInfo = await indexer.searchForAssets().creator(address).do()
    return accountInfo.assets || []
  } catch (err) {
    console.error('Error fetching account assets:', err)
    throw err
  }
}

/**
 * Get transaction info
 * @param {string} txId - Transaction ID
 * @returns {Promise<Object>} Transaction info
 */
export const getTransactionInfo = async (txId) => {
  const indexer = getIndexerClient()
  try {
    const info = await indexer.searchForTransactions().txid(txId).do()
    return info.transactions[0] || null
  } catch (err) {
    console.error('Error fetching transaction info:', err)
    throw err
  }
}

/**
 * Create payment transaction
 * @param {string} from - From address
 * @param {string} to - To address
 * @param {number} amount - Amount in microAlgo
 * @returns {Promise<algosdk.Transaction>} Unsigned transaction
 */
export const createPaymentTxn = async (from, to, amount) => {
  const params = await getSuggestedParams()
  const txn = algosdk.makePaymentTxnWithSuggestedParams(from, to, amount, undefined, params)
  return txn
}

/**
 * Get explorer URL for transaction
 * @param {string} txId - Transaction ID
 * @returns {string} Explorer URL
 */
export const getExplorerUrl = (txId) => {
  return `https://testnet.explorer.perawallet.app/tx/${txId}`
}
