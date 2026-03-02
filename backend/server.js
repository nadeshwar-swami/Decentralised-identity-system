import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import didRoutes from './routes/did.js'
import credentialRoutes from './routes/credentials.js'
import servicesRoutes from './routes/services.js'
import verifyRoutes from './routes/verify.js'
import selectiveDisclosureRoutes from './routes/selectiveDisclosure.js'
import { resolveDID } from './utils/didBuilder.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(express.json())

// CORS Configuration - Support both local dev and production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://decentralised-identity-system-six.vercel.app',
  'https://*.vercel.app',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : [])
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true)
    }

    const isExplicitlyAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace(/\*/g, '[a-zA-Z0-9-]+')
        return new RegExp(`^${pattern}$`).test(origin)
      }
      return allowed === origin
    })
    const isLocalhostDev = /^https?:\/\/(localhost|127\.0\.0\.1):(\d+)$/.test(origin)

    if (isExplicitlyAllowed || isLocalhostDev) {
      return callback(null, true)
    }

    console.log(`[CORS] Blocked origin: ${origin}`)
    return callback(null, true) // Allow all for development purposes
  },
  credentials: true,
}))

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Campus DID API running' })
})

// Universal Resolver compatible endpoint
app.get('/1.0/identifiers/:did', async (req, res) => {
  try {
    const decodedDid = decodeURIComponent(req.params.did)
    const parsed = resolveDID(decodedDid)

    const didResponse = await fetch(
      `http://localhost:${PORT}/api/did/${parsed.walletAddress}`
    )

    if (!didResponse.ok) {
      const status = didResponse.status === 404 ? 404 : 400
      return res.status(status).json({
        didDocument: null,
        didDocumentMetadata: {},
        didResolutionMetadata: {
          error: didResponse.status === 404 ? 'notFound' : 'invalidDid',
          message: 'DID not found or invalid',
        },
      })
    }

    const payload = await didResponse.json()
    const didDocument = payload?.data?.didDocument || null

    return res.json({
      didDocument,
      didDocumentMetadata: {
        network: process.env.ALGORAND_NETWORK || 'testnet',
      },
      didResolutionMetadata: {
        contentType: 'application/did+ld+json',
      },
    })
  } catch (error) {
    return res.status(400).json({
      didDocument: null,
      didDocumentMetadata: {},
      didResolutionMetadata: {
        error: 'invalidDid',
        message: error.message,
      },
    })
  }
})

// Routes
app.use('/api/did', didRoutes)
app.use('/api/credentials', credentialRoutes)
app.use('/api/services', servicesRoutes)
app.use('/api/verify', verifyRoutes)
app.use('/api/selective-disclosure', selectiveDisclosureRoutes)

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Campus DID API running on port ${PORT}`)
  console.log(`Network: Algorand TestNet`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})
