import express from 'express'
import algosdk from 'algosdk'
import { createDID } from '../algorand/createDID.js'
import { buildDIDDocument, validateDIDDocument, resolveDID } from '../utils/didBuilder.js'
import { uploadToIPFS, fetchFromIPFS } from '../utils/ipfs.js'
import { sha256, generateUUID } from '../utils/crypto.js'

const router = express.Router()

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
    res.json({
      success: true,
      data: {
        did: `did:algo:testnet:${walletAddress}`,
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

    console.log(`✅ DID creation prepared for ${walletAddress}\n`)
  } catch (err) {
    console.error('❌ Error creating DID:', err.message)
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
    const { walletAddress, signedTxn } = req.body

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
    const algodToken = process.env.ALGORAND_ALGOD_TOKEN || ''
    const algodServer = process.env.ALGORAND_ALGOD_SERVER || 'https://testnet-api.algonode.cloud'
    const algodPort = process.env.ALGORAND_ALGOD_PORT || '443'
    const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort)

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

    // Step 5: Return response with explorer link
    const explorerUrl = `https://testnet.algoexplorer.io/tx/${txId}`

    res.json({
      success: true,
      data: {
        did: `did:algo:testnet:${walletAddress}`,
        walletAddress,
        transactionId: txId,
        confirmedRound: confirmedRound > 0 ? confirmedRound : null,
        status: confirmedRound > 0 ? 'confirmed' : 'submitted',
        explorerUrl,
        message: 'DID successfully registered on Algorand TestNet',
      },
    })

    console.log(`✅ DID registered for ${walletAddress}`)
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
 * Resolve a DID document from IPFS
 * Feature 4C: Fetch and serve DID documents
 */
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params
    const did = `did:algo:testnet:${walletAddress}`

    // Validate wallet address format
    if (walletAddress.length !== 58) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Algorand wallet address',
      })
    }

    console.log(`\n🔍 Resolving DID: ${did}`)

    // Step 1: Resolve DID structure
    console.log('  ✓ Parsing DID...')
    const resolved = resolveDID(did)

    if (!resolved || !resolved.address) {
      return res.status(400).json({
        success: false,
        error: 'Invalid DID format',
      })
    }

    // Step 2: Fetch stored DID hash from smart contract state (if applicable)
    // For now, we'll try to construct it from standard naming convention
    // In production, would query smart contract storage for registered DIDs
    console.log('  ✓ Looking up DID document...')

    // Try to fetch from a standard location or from contract state
    // This would normally come from querying the smart contract's state
    const didDocFileName = `did-${walletAddress}.json`

    // Step 3: Search for stored IPFS hash
    // In production, this would query the smart contract's global state
    // For now, return template with instructions
    const response = {
      success: true,
      data: {
        did,
        resolved,
        status: 'DID resolved',
        message: 'To fetch the DID document, the IPFS hash must be retrieved from the smart contract state',
        instructions: {
          step1: 'Query smart contract app state for registered DIDs',
          step2: 'Extract IPFS hash from contract storage',
          step3: 'Fetch document from IPFS using fetchFromIPFS(ipfsHash)',
        },
        expectedLocation: `/ipfs/${didDocFileName}`,
      },
    }

    // Step 4: If we had the IPFS hash, we could fetch it
    // Example (would need hash from contract state):
    // const ipfsHash = 'QmXxx...' // from contract storage
    // const document = await fetchFromIPFS(ipfsHash)

    res.json(response)
    console.log(`✅ DID resolved for ${walletAddress}\n`)
  } catch (err) {
    console.error('❌ Error resolving DID:', err.message)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to resolve DID',
    })
  }
})

export default router
