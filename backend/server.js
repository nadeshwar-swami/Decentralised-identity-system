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
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
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
