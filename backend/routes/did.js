import express from 'express'
import algosdk from 'algosdk'
import { createDID } from '../algorand/createDID.js'
import { buildDIDDocument, validateDIDDocument, resolveDID } from '../utils/didBuilder.js'
import { uploadToIPFS, fetchFromIPFS } from '../utils/ipfs.js'
import { sha256, generateUUID } from '../utils/crypto.js'

const router = express.Router()

const getAlgodClient = () => {
  const algodToken = process.env.ALGORAND_ALGOD_TOKEN || ''
  const algodServer = process.env.ALGORAND_ALGOD_SERVER || 'https://testnet-api.algonode.cloud'
  const algodPort = process.env.ALGORAND_ALGOD_PORT || '443'
  return new algosdk.Algodv2(algodToken, algodServer, algodPort)
}

const getOnChainIpfsHash = async (walletAddress) => {
  try {
    const appId = Number(process.env.ALGORAND_APP_ID || '756415000')
    const keyBytes = algosdk.decodeAddress(walletAddress).publicKey
    const keyBase64 = Buffer.from(keyBytes).toString('base64')

    const appInfo = await getAlgodClient().getApplicationByID(appId).do()
    const globalState = appInfo?.params?.['global-state'] || []
    const stateEntry = globalState.find((entry) => entry.key === keyBase64)

    if (!stateEntry || stateEntry.value.type !== 1 || !stateEntry.value.bytes) {
      return null
    }

    return Buffer.from(stateEntry.value.bytes, 'base64').toString('utf-8')
  } catch (error) {
    console.warn('⚠️ Failed to fetch on-chain DID hash:', error.message)
    return null
  }
}

/**
 * In-memory DID storage for MVP
 * Maps walletAddress -> { did, ipfsHash, didDocument, transactionId, registeredAt }
 */
const registeredDIDs = new Map()

/**
 * POST /api/did/create
 * Create a new DID for a student
 * Feature 4 implementation
 */
router.post('/create', async (req, res) => {
  try {
    const { walletAddress, displayName } = req.body

    // Validate input
    if (!walletAddress || !displayName) {
      return res.status(400).json({
        success: false,
        error: 'walletAddress and displayName are required',
      })
    }

    // Validate wallet address format (Algorand)
    if (walletAddress.length !== 58) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Algorand wallet address',
      })
    }

    console.log(`\n📝 Creating DID for ${walletAddress}...`)

    // Step 1: Build W3C DID Document
    console.log('  ✓ Building DID document...')
    const didDocument = buildDIDDocument(walletAddress, displayName)
    validateDIDDocument(didDocument)

    // Step 2: Upload to IPFS
    console.log('  ✓ Uploading to IPFS...')
    const ipfsHash = await uploadToIPFS(
      didDocument,
      `did-${walletAddress}.json`
    )
    console.log(`  ✓ IPFS Hash: ${ipfsHash}`)

    // Step 3: Create unsigned blockchain transaction
    console.log('  ✓ Creating transaction...')
    const txnData = await createDID(walletAddress, ipfsHash)

    // Step 4: Return response
    const network = process.env.ALGORAND_NETWORK || 'testnet'
    res.json({
      success: true,
      data: {
        did: didDocument.id,
        network,
        displayName,
        ipfsHash,
        didDocument,
        transaction: {
          // Encode transaction for frontend
          txnBytes: Buffer.from(
            txnData.txnBytes || JSON.stringify(txnData.unsignedTxn)
          ).toString('base64'),
          note: 'Sign with wallet and send to /api/did/register endpoint',
        },
        status: 'ready_for_signing',
      },
    })

    console.log(`[OK] DID creation prepared for ${walletAddress}\n`)
  } catch (err) {
    console.error('[ERROR] Error creating DID:', err.message)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to create DID',
    })
  }
})

/**
 * POST /api/did/register
 * Register signed DID transaction on blockchain
 * Feature 4B: Submit signed transaction to blockchain
 */
router.post('/register', async (req, res) => {
  try {
    const { walletAddress, signedTxn, ipfsHash, didDocument } = req.body

    // Validate input
    if (!walletAddress || !signedTxn) {
      return res.status(400).json({
        success: false,
        error: 'walletAddress and signedTxn are required',
      })
    }

    if (walletAddress.length !== 58) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Algorand wallet address',
      })
    }

    console.log(`\n🔗 Registering DID transaction for ${walletAddress}...`)

    // Step 1: Decode signed transaction from base64
    console.log('  ✓ Decoding transaction...')
    let txnBytes
    try {
      // Handle both base64 string and already-decoded bytes
      if (typeof signedTxn === 'string') {
        txnBytes = Buffer.from(signedTxn, 'base64')
      } else {
        txnBytes = signedTxn
      }
    } catch (decodeErr) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction format - must be base64 encoded',
      })
    }

    // Step 2: Initialize Algod client
    const algodClient = getAlgodClient()

    // Step 3: Submit transaction to blockchain
    console.log('  ✓ Submitting to TestNet...')
    let txId
    try {
      const submitResult = await algodClient.sendRawTransaction(txnBytes).do()
      txId = submitResult.txId
      console.log(`  ✓ Bitcoin ID: ${txId}`)
    } catch (submitErr) {
      console.error('Submit error:', submitErr.message)
      return res.status(500).json({
        success: false,
        error: `Failed to submit transaction: ${submitErr.message}`,
      })
    }

    // Step 4: Wait for confirmation (optional - can return immediately in production)
    console.log('  ✓ Waiting for confirmation...')
    let confirmedRound = 0
    let attempts = 0
    const maxAttempts = 20 // ~20 seconds

    try {
      while (confirmedRound === 0 && attempts < maxAttempts) {
        const txnStatus = await algodClient
          .pendingTransactionInformation(txId)
          .do()
        confirmedRound = txnStatus['confirmed-round']

        if (confirmedRound > 0) {
          console.log(`  ✓ Confirmed in round ${confirmedRound}`)
          break
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000))
        attempts++
      }

      if (confirmedRound === 0) {
        console.warn('  ⚠️ Transaction not yet confirmed, proceeding with txId')
      }
    } catch (confirmErr) {
      console.warn('Confirmation check error:', confirmErr.message)
      // Still return success as transaction was submitted
    }

    // Step 5: Store DID registration in memory for resolution
    const appId = process.env.ALGORAND_APP_ID || '756415000'
    const did = `did:algo:app:${appId}:${walletAddress}`
    registeredDIDs.set(walletAddress, {
      did,
      ipfsHash: ipfsHash || null,
      didDocument: didDocument || null,
      transactionId: txId,
      registeredAt: new Date().toISOString(),
    })

    // Step 6: Return response with explorer link
    const explorerUrl = `https://lora.algokit.io/testnet/transaction/${txId}`

    res.json({
      success: true,
      data: {
        did,
        walletAddress,
        transactionId: txId,
        confirmedRound: confirmedRound > 0 ? confirmedRound : null,
        status: confirmedRound > 0 ? 'confirmed' : 'submitted',
        explorerUrl,
        message: 'DID successfully registered on Algorand TestNet',
      },
    })

    console.log(`[OK] DID registered for ${walletAddress}`)
    console.log(`   TX ID: ${txId}`)
    console.log(`   Explorer: ${explorerUrl}\n`)
  } catch (err) {
    console.error('❌ Error registering DID:', err.message)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to register DID',
    })
  }
})

/**
 * GET /api/did/:walletAddress
 * Resolve a DID document
 * Feature 4C: Fetch and serve DID documents
 */
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params
    const appId = process.env.ALGORAND_APP_ID || '756415000'
    const did = `did:algo:app:${appId}:${walletAddress}`

    // Validate wallet address format
    if (walletAddress.length !== 58) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Algorand wallet address',
      })
    }

    console.log(`\n🔍 Resolving DID: ${did}`)

    // Check in-memory record first
    let didRecord = registeredDIDs.get(walletAddress)

    // Fallback to on-chain global state
    if (!didRecord) {
      const onChainIpfsHash = await getOnChainIpfsHash(walletAddress)

      if (onChainIpfsHash) {
        didRecord = {
          did,
          ipfsHash: onChainIpfsHash,
          didDocument: null,
          transactionId: null,
          registeredAt: null,
        }
      }
    }

    if (!didRecord) {
      return res.status(404).json({
        success: false,
        error: 'DID not registered',
        message: 'This wallet address has not registered a DID yet',
      })
    }

    // Fetch DID document from IPFS if we have the hash
    let didDocument = didRecord.didDocument
    
    if (!didDocument && didRecord.ipfsHash) {
      try {
        console.log(`  ✓ Fetching from IPFS: ${didRecord.ipfsHash}`)
        didDocument = await fetchFromIPFS(didRecord.ipfsHash)
      } catch (ipfsErr) {
        console.warn('  ⚠️ IPFS fetch failed, using cached document')
      }
    }

    const response = {
      success: true,
      data: {
        did: didRecord.did,
        didDocument: didDocument || null,
        ipfsHash: didRecord.ipfsHash,
        transactionId: didRecord.transactionId,
        explorerUrl: `https://testnet.algoexplorer.io/tx/${didRecord.transactionId}`,
        registeredAt: didRecord.registeredAt,
        status: 'registered',
      },
    }

    res.json(response)
    console.log(`[OK] DID resolved for ${walletAddress}\n`)
  } catch (err) {
    console.error('❌ Error resolving DID:', err.message)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to resolve DID',
    })
  }
})

export default router
