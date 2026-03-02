import express from 'express'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// In-memory storage for selective disclosure requests
const requests = new Map()
const sharedData = new Map()

/**
 * POST /api/selective-disclosure/request
 * Create a new selective disclosure request from a service
 */
router.post('/request', (req, res) => {
  try {
    const { studentDid, studentWallet, serviceId, serviceName, requestedData } = req.body

    if (!studentDid || !serviceId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: studentDid, serviceId',
      })
    }

    const requestId = uuidv4()
    const request = {
      id: requestId,
      studentDid,
      studentWallet,
      serviceId,
      serviceName,
      requestedData: requestedData || ['did', 'credentials'],
      createdAt: new Date().toISOString(),
      status: 'pending',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    }

    requests.set(requestId, request)
    console.log(`[OK] Created selective disclosure request: ${requestId}`)

    res.json({
      success: true,
      data: {
        requestId,
        expiresAt: request.expiresAt,
        shareUrl: `/share?requestId=${requestId}&serviceId=${serviceId}`,
      },
    })
  } catch (err) {
    console.error('[ERROR] Error creating disclosure request:', err.message)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to create disclosure request',
    })
  }
})

/**
 * GET /api/selective-disclosure/request/:requestId
 * Retrieve a selective disclosure request
 */
router.get('/request/:requestId', (req, res) => {
  try {
    const { requestId } = req.params
    const request = requests.get(requestId)

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found',
      })
    }

    // Check if expired
    if (new Date(request.expiresAt) < new Date()) {
      requests.delete(requestId)
      return res.status(410).json({
        success: false,
        error: 'Request has expired',
      })
    }

    res.json({
      success: true,
      data: request,
    })
  } catch (err) {
    console.error('[ERROR] Error fetching request:', err.message)
    res.status(500).json({
      success: false,
      error: err.message,
    })
  }
})

/**
 * POST /api/selective-disclosure/share
 * Student shares selected credentials with a service
 */
router.post('/share', (req, res) => {
  try {
    const { studentWallet, studentDid, credentialIds, requestId, serviceId } = req.body

    if (!studentWallet || !studentDid || !serviceId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      })
    }

    const verificationId = uuidv4()
    const shareRecord = {
      id: verificationId,
      studentWallet,
      studentDid,
      serviceId,
      sharedCredentialIds: credentialIds || [],
      sharedAt: new Date().toISOString(),
      status: 'active',
      revokedAt: null,
    }

    sharedData.set(verificationId, shareRecord)
    
    // Mark request as fulfilled
    if (requestId && requests.has(requestId)) {
      const request = requests.get(requestId)
      request.status = 'fulfilled'
      request.fulfilledAt = new Date().toISOString()
      requests.set(requestId, request)
    }

    console.log(`[OK] Data shared successfully: ${verificationId}`)

    res.json({
      success: true,
      data: {
        verificationId,
        message: 'Data shared successfully with service',
      },
    })
  } catch (err) {
    console.error('[ERROR] Error sharing data:', err.message)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to share data',
    })
  }
})

/**
 * GET /api/selective-disclosure/shared/:verificationId
 * Service retrieves shared data from a verification ID
 */
router.get('/shared/:verificationId', (req, res) => {
  try {
    const { verificationId } = req.params
    const shareRecord = sharedData.get(verificationId)

    if (!shareRecord) {
      return res.status(404).json({
        success: false,
        error: 'Shared data not found',
      })
    }

    if (shareRecord.status !== 'active' || shareRecord.revokedAt) {
      return res.status(410).json({
        success: false,
        error: 'Shared data has been revoked',
      })
    }

    res.json({
      success: true,
      data: shareRecord,
    })
  } catch (err) {
    console.error('[ERROR] Error fetching shared data:', err.message)
    res.status(500).json({
      success: false,
      error: err.message,
    })
  }
})

/**
 * POST /api/selective-disclosure/revoke/:verificationId
 * Student revokes shared data with a service
 */
router.post('/revoke/:verificationId', (req, res) => {
  try {
    const { verificationId } = req.params
    const shareRecord = sharedData.get(verificationId)

    if (!shareRecord) {
      return res.status(404).json({
        success: false,
        error: 'Shared data not found',
      })
    }

    shareRecord.status = 'revoked'
    shareRecord.revokedAt = new Date().toISOString()
    sharedData.set(verificationId, shareRecord)

    console.log(`[OK] Data sharing revoked: ${verificationId}`)

    res.json({
      success: true,
      data: {
        message: 'Data sharing has been revoked',
      },
    })
  } catch (err) {
    console.error('[ERROR] Error revoking data:', err.message)
    res.status(500).json({
      success: false,
      error: err.message,
    })
  }
})

/**
 * GET /api/selective-disclosure/student/:walletAddress
 * Get all sharing records for a student
 */
router.get('/student/:walletAddress', (req, res) => {
  try {
    const { walletAddress } = req.params
    const studentShares = Array.from(sharedData.values()).filter(
      share => share.studentWallet === walletAddress
    )

    res.json({
      success: true,
      data: {
        shares: studentShares,
        total: studentShares.length,
      },
    })
  } catch (err) {
    console.error('[ERROR] Error fetching student shares:', err.message)
    res.status(500).json({
      success: false,
      error: err.message,
    })
  }
})

export default router
