import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import didRoutes from './routes/did.js'
import credentialRoutes from './routes/credentials.js'
import servicesRoutes from './routes/services.js'
import verifyRoutes from './routes/verify.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(express.json())

// CORS Configuration - Support both local dev and production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : [])
]

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}))

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Campus DID API running' })
})

// Routes
app.use('/api/did', didRoutes)
app.use('/api/credentials', credentialRoutes)
app.use('/api/services', servicesRoutes)
app.use('/api/verify', verifyRoutes)

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
