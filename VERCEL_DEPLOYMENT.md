# Deploying Campus DID on Vercel

Complete guide for deploying the Campus DID project on Vercel.

---

## Table of Contents
1. [Overview](#overview)
2. [Architecture Options](#architecture-options)
3. [Option 1: Full Vercel Deployment](#option-1-full-vercel-deployment-recommended)
4. [Option 2: Hybrid Deployment](#option-2-hybrid-deployment)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment](#post-deployment)

---

## Overview

Campus DID consists of two components:
- **Frontend**: React + Vite application
- **Backend**: Express.js API server

Vercel natively supports frontend deployments and serverless functions. This guide covers two deployment strategies.

---

## Architecture Options

### Option 1: Full Vercel Deployment (Recommended)
- Frontend: Vercel hosting
- Backend: Vercel Serverless Functions
- **Pros**: Single platform, automatic scaling, easy to manage
- **Cons**: Requires restructuring backend to serverless functions

### Option 2: Hybrid Deployment
- Frontend: Vercel hosting
- Backend: External hosting (Railway, Render, DigitalOcean, etc.)
- **Pros**: No backend changes needed
- **Cons**: Two platforms to manage

---

## Option 1: Full Vercel Deployment (Recommended)

### Step 1: Prepare Your Project

#### 1.1 Create Vercel Configuration

Create `vercel.json` in the project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "backend/api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 1.2 Restructure Backend for Serverless

Vercel serverless functions need to be in an `api/` directory. Create a new structure:

**Create:** `backend/api/did.js`
```javascript
// Serverless function for DID operations
import algosdk from 'algosdk';
import { createDIDDocument, resolveDID } from '../utils/didBuilder.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST' && req.url === '/api/did/create') {
      const { walletAddress } = req.body;
      
      // DID creation logic
      const didDocument = await createDIDDocument(walletAddress);
      
      return res.status(201).json({
        success: true,
        did: didDocument
      });
    }

    if (req.method === 'GET') {
      const didId = req.query.did;
      const didDocument = await resolveDID(didId);
      
      return res.status(200).json({
        success: true,
        did: didDocument
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('DID API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
```

**Similar structure for other endpoints:**
- `backend/api/credentials.js`
- `backend/api/verify.js`
- `backend/api/services.js`

#### 1.3 Update Frontend Build Configuration

Update `frontend/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "vercel-build": "npm run build"
  }
}
```

Update `frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          algorand: ['algosdk', '@perawallet/connect']
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
```

### Step 2: Deploy Frontend to Vercel

#### 2.1 Via Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to project root
cd "c:\Users\akura\Desktop\did system\campus-did"

# Login to Vercel
vercel login

# Deploy
vercel
```

Follow the prompts:
- **Set up and deploy**: Yes
- **Which scope**: Select your account
- **Link to existing project**: No
- **Project name**: campus-did
- **Directory**: `./` (root)
- **Override settings**: No

#### 2.2 Via Vercel Dashboard (Alternative)

1. Go to https://vercel.com/new
2. Import your GitHub repository: `nadeshwar-swami/Decentralised-identity-system`
3. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click "Deploy"

### Step 3: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

#### Frontend Variables
```
VITE_BACKEND_API_URL=https://your-project.vercel.app/api
VITE_ALGORAND_NETWORK=testnet
VITE_ALGORAND_NODE_URL=https://testnet-api.algonode.cloud
VITE_ALGORAND_INDEXER_URL=https://testnet-idx.algonode.cloud
VITE_ALGORAND_APP_ID=756415000
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
VITE_ENABLE_DEBUG=false
VITE_WALLET_NETWORK=testnet
```

#### Backend Variables (if using Vercel Functions)
```
NODE_ENV=production
PORT=3001
ALGORAND_SERVER=https://testnet-api.algonode.cloud
ALGORAND_TOKEN=
ALGORAND_PORT=443
ALGORAND_INDEXER_SERVER=https://testnet-idx.algonode.cloud
ALGORAND_INDEXER_TOKEN=
ALGORAND_INDEXER_PORT=443
ALGORAND_APP_ID=756415000
ALGORAND_MNEMONIC=your secure mnemonic here
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
PINATA_JWT=your_pinata_jwt
IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
ALLOWED_ORIGINS=https://your-frontend.vercel.app
CORS_CREDENTIALS=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 4: Update API Calls in Frontend

Update `frontend/src/utils/algorand.js` to use environment variables:

```javascript
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || '/api';

export const createDID = async (walletAddress) => {
  const response = await fetch(`${API_BASE_URL}/did/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress })
  });
  return response.json();
};
```

### Step 5: Commit and Push Changes

```bash
cd "c:\Users\akura\Desktop\did system\campus-did"

git add .
git commit -m "Configure project for Vercel deployment"
git push origin main
```

Vercel will automatically redeploy on push if you connected via GitHub.

---

## Option 2: Hybrid Deployment

Deploy frontend on Vercel, backend elsewhere.

### Step 1: Deploy Backend to Railway/Render

#### Using Railway:

1. Go to https://railway.app
2. Create new project from GitHub repo
3. Select `backend` directory as root
4. Add environment variables from `backend/.env.example`
5. Deploy

Your backend will be at: `https://your-app.up.railway.app`

#### Using Render:

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables
6. Deploy

### Step 2: Deploy Frontend to Vercel

1. Go to https://vercel.com/new
2. Import GitHub repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variable:
   ```
   VITE_BACKEND_API_URL=https://your-backend.railway.app
   ```
5. Deploy

### Step 3: Update CORS in Backend

Update `backend/server.js`:

```javascript
const allowedOrigins = [
  'https://your-frontend.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

---

## Environment Variables

### Critical Security Variables

⚠️ **NEVER commit these to GitHub:**

```env
ALGORAND_MNEMONIC=your 25 word mnemonic phrase here
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
PINATA_JWT=your_pinata_jwt_token
```

### How to Add in Vercel:

1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add each variable:
   - **Key**: Variable name
   - **Value**: Variable value
   - **Environments**: Select Production, Preview, Development
5. Save

### How to Get Variables:

**Algorand Mnemonic:**
```bash
# From your Algorand wallet backup phrase
# 25 words separated by spaces
```

**Pinata Keys:**
1. Go to https://pinata.cloud
2. Developers → API Keys
3. Create new key with admin access
4. Copy: API Key, API Secret, JWT

---

## Post-Deployment

### 1. Test Your Deployment

```bash
# Test API endpoints
curl https://your-app.vercel.app/api/health

# Test frontend
open https://your-app.vercel.app
```

### 2. Set Up Custom Domain

1. Vercel Dashboard → Project → Settings → Domains
2. Add your domain (e.g., `campus-did.com`)
3. Follow DNS configuration instructions
4. SSL is automatically provisioned

### 3. Enable Analytics

1. Vercel Dashboard → Project → Analytics
2. Enable Web Analytics (free)
3. Monitor performance and usage

### 4. Set Up Monitoring

Add error tracking:

```bash
# Install Sentry
cd frontend
npm install @sentry/react @sentry/tracing
```

Update `frontend/src/main.jsx`:

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
});
```

### 5. Configure Redirects

Create `frontend/vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## Troubleshooting

### Build Fails

**Error**: `Module not found`
**Solution**: 
```bash
# Ensure all dependencies are in package.json
cd frontend
npm install
cd ../backend
npm install
```

### API Endpoints Return 404

**Solution**: Check `vercel.json` routes configuration and ensure `/api` prefix is used consistently.

### CORS Errors

**Solution**: 
1. Check `ALLOWED_ORIGINS` environment variable
2. Verify backend CORS configuration
3. Ensure credentials are handled properly

### Environment Variables Not Working

**Solution**:
1. Verify variables are prefixed with `VITE_` for frontend
2. Redeploy after adding variables
3. Check Environment scope (Production/Preview/Development)

### Serverless Function Timeout

**Error**: `FUNCTION_INVOCATION_TIMEOUT`
**Solution**: 
- Vercel free tier: 10s timeout
- Pro tier: 60s timeout
- Optimize slow operations or upgrade plan

---

## Production Checklist

- [ ] All environment variables configured
- [ ] Backend CORS properly configured
- [ ] Frontend API URLs updated
- [ ] Smart contract deployed to MainNet (if applicable)
- [ ] Custom domain configured
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Analytics enabled
- [ ] Error tracking configured (Sentry)
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Test all user flows
- [ ] Performance testing completed
- [ ] Documentation updated

---

## Cost Considerations

### Vercel Pricing

**Free Tier (Hobby):**
- 100GB bandwidth/month
- Unlimited websites
- 100GB-hours serverless execution
- **Good for**: Development and testing

**Pro Tier ($20/month):**
- 1TB bandwidth
- Advanced analytics
- Preview deployments
- **Good for**: Production use

### Backend Hosting Alternatives

**Railway (Hobby):**
- $5/month
- 512MB RAM
- **Good for**: Small-scale production

**Render (Free):**
- Free tier available
- Spins down after inactivity
- **Good for**: Testing

**DigitalOcean (Droplet):**
- $4/month
- Full control
- **Good for**: Full-scale production

---

## Quick Start Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
cd "c:\Users\akura\Desktop\did system\campus-did"
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Remove deployment
vercel remove campus-did
```

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)
- [Algorand Developer Portal](https://developer.algorand.org/)

---

## Need Help?

- Vercel Support: https://vercel.com/support
- Campus DID Documentation: See `DEPLOYMENT.md` for traditional hosting
- GitHub Issues: https://github.com/nadeshwar-swami/Decentralised-identity-system/issues
