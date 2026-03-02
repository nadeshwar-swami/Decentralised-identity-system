# Campus DID - Vercel + Render Deployment Guide

Deploy your Campus DID application **for free** using:
- **Frontend**: Vercel (auto-deploys from GitHub)
- **Backend**: Render (free web service tier)

---

## Prerequisites

1. ✅ GitHub repository pushed: `nadeshwar-swami/Decentralised-identity-system`
2. ✅ Render account: https://render.com (sign up with GitHub)
3. ✅ Vercel account: https://vercel.com (sign up with GitHub)
4. ✅ Pinata account: https://pinata.cloud (for IPFS)
5. ✅ Algorand TestNet credentials

---

## STEP 1: Deploy Backend to Render

### 1.1 Create Render Web Service

1. Go to https://render.com and sign in with GitHub
2. Click **New +** → **Web Service**
3. Select **Connect a repository**
4. Find and select: `nadeshwar-swami/Decentralised-identity-system`
5. Authorize Render to access your GitHub

### 1.2 Configure Build & Deploy Settings

Fill in the form:

| Field | Value |
|-------|-------|
| **Name** | `campus-did-api` |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free ($0/month) |

### 1.3 Add Environment Variables

Click **Environment** and add each variable:

```
NODE_ENV=production
PORT=3001
BACKEND_URL=<YOUR_RENDER_URL> (e.g., https://campus-did-api.onrender.com)
ALGORAND_NETWORK=testnet
ALGORAND_ALGOD_SERVER=https://testnet-api.algonode.cloud
ALGORAND_ALGOD_PORT=443
ALGORAND_ALGOD_TOKEN=
ALGORAND_INDEXER_SERVER=https://testnet-idx.algonode.cloud
ALGORAND_INDEXER_PORT=443
ALGORAND_INDEXER_TOKEN=
ALGORAND_APP_ID=756415000
UNIVERSITY_MNEMONIC=<YOUR_25_WORD_MNEMONIC>
PINATA_API_KEY=<YOUR_PINATA_API_KEY>
PINATA_SECRET_KEY=<YOUR_PINATA_SECRET_KEY>
PINATA_GATEWAY=https://gateway.pinata.cloud
CORS_ORIGIN=https://<YOUR_VERCEL_DOMAIN>.vercel.app
LOG_LEVEL=info
```

**⚠️ IMPORTANT:**
- Get `UNIVERSITY_MNEMONIC` from Algorand TestNet dispenser: https://dispenser.testnet.aws.algodev.network/
- Get Pinata keys from: https://pinata.cloud → API Keys → Copy your JWT
- Wait for Render to generate your URL before setting `CORS_ORIGIN`

### 1.4 Deploy

Click **Create Web Service**

Render will:
1. Build your backend
2. Deploy automatically
3. Assign URL: `https://campus-did-api.onrender.com` (your-service-name)

**Wait for green "Live" indicator** (2-3 minutes)

### 1.5 Test Backend

```bash
curl https://campus-did-api.onrender.com/health
# Response: {"success":true,"message":"Campus DID API running"}
```

---

## STEP 2: Deploy Frontend to Vercel

### 2.1 Go to Vercel

1. Visit https://vercel.com
2. Click **Add New** → **Project**
3. Select GitHub repository: `Decentralised-identity-system`
4. Click **Import**

### 2.2 Configure Vercel Project

Fill in the form:

| Field | Value |
|-------|-------|
| **Project Name** | `campus-did` |
| **Framework** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### 2.3 Add Environment Variables

Go to **Settings** → **Environment Variables** and add:

```
VITE_BACKEND_URL=https://campus-did-api.onrender.com
VITE_ALGORAND_NETWORK=testnet
VITE_ALGOD_URL=https://testnet-api.algonode.cloud
VITE_ALGOD_PORT=443
VITE_INDEXER_URL=https://testnet-idx.algonode.cloud
VITE_INDEXER_PORT=443
VITE_APP_ID=756415000
```

**Note:** `VITE_BACKEND_URL` must match your Render URL from Step 1.5

### 2.4 Deploy

Click **Deploy**

Vercel will:
1. Install dependencies
2. Build React app
3. Deploy to CDN
4. Assign URL: `https://campus-did.vercel.app` (your-project-name)

**Search for "Domains" in Vercel settings to see your final URL**

---

## STEP 3: Update CORS in Render

Once Vercel deploys, update Render backend:

1. Go to Render → Campus DID API → **Environment**
2. Update `CORS_ORIGIN`:
   ```
   https://campus-did.vercel.app
   ```
3. Click **Save** (auto-redeploys)

---

## STEP 4: Test Full Application

### 4.1 Test Frontend

Visit your Vercel URL:
```
https://campus-did.vercel.app
```

Verify:
- ✅ Page loads without 404
- ✅ Navbar shows role options (Student, Admin, Service)
- ✅ Landing page displays

### 4.2 Test Wallet Integration

1. Click **Connect Wallet** (Student role)
2. Select **Pera Wallet** or **Web Wallet**
3. Approve connection
4. Should show wallet address

### 4.3 Test API Endpoints

From frontend, try creating a DID:
1. Go to Student Dashboard
2. Click **Create DID**
3. Check network tab: API calls should go to `https://campus-did-api.onrender.com/api/...`

### 4.4 Test CORS

```bash
# Should work (no CORS error)
curl -H "Origin: https://campus-did.vercel.app" \
  https://campus-did-api.onrender.com/health
```

---

## STEP 5: Auto-Deployment Setup

Both Render and Vercel auto-deploy on GitHub push:

### Every time you `git push`:
1. GitHub triggers webhook
2. Vercel rebuilds frontend
3. Render rebuilds backend
4. Changes live in 2-5 minutes

**No manual redeploy needed!**

---

## Monitoring & Logs

### Render Backend Logs
Render → Campus DID API → **Logs** tab

Common issues:
```
[Error] Cannot find Pinata keys
→ Check PINATA_API_KEY in Environment

[Error] CORS blocked
→ Update CORS_ORIGIN to match Vercel domain

[Error] Failed to initialize Alarand
→ Check UNIVERSITY_MNEMONIC format (25 words)
```

### Vercel Frontend Logs
Vercel → Campus DID → **Deployments** tab → Click log

---

## Scaling (If Needed)

### Upgrade from Free to Paid (Optional)
- **Render**: Free tier has 50-hour/month limit. Upgrade to $7/month for unlimited.
- **Vercel**: Free tier bandwidth limits. Upgrade to Pro ($20/month) for higher limits.

Only upgrade if you exceed free tier limits.

---

## Troubleshooting

### "Cannot GET /" on Vercel
**Problem**: Frontend not building
**Solution**:
1. Vercel → Deployments → Click failed build
2. Check build logs
3. Ensure `VITE_` env vars are set in Vercel settings
4. Push new commit to re-trigger build

### "Backend not responding" in frontend
**Problem**: CORS or API unreachable
**Solution**:
1. Test backend: `curl https://campus-did-api.onrender.com/health`
2. Check Render logs for errors
3. Verify `CORS_ORIGIN` in Render env matches Vercel domain
4. Verify `VITE_BACKEND_URL` in Vercel matches Render URL
5. Wait 1-2 minutes after Render redeploy for changes to take effect

### "Algorand connection failed"
**Problem**: Invalid network URL or mnemonic
**Solution**:
1. Verify `ALGORAND_ALGOD_SERVER=https://testnet-api.algonode.cloud`
2. Verify `UNIVERSITY_MNEMONIC` is exactly 25 words
3. Verify account has TestNet ALGO: https://dispenser.testnet.aws.algodev.network/
4. Restart backend: Render → Service → **Manual Deploy**

### Cold starts (Render takes 30-60s to respond)
**Why**: Render free tier sleeps inactive services
**Normal**: First request takes 30-60s, then fast
**Solution**: Upgrade to paid tier for always-on ($0.50/month minimum)

---

## Production Checklist

Before going live on MainNet:

- [ ] Rotate all secrets (UNIVERSITY_MNEMONIC, Pinata keys)
- [ ] Update `ALGORAND_NETWORK=mainnet` (Render env)
- [ ] Deploy smart contract to MainNet and update `ALGORAND_APP_ID`
- [ ] Update `VITE_ALGORAND_NETWORK=mainnet` (Vercel env)
- [ ] Create MainNet Pinata account
- [ ] Set up error tracking (Sentry)
- [ ] Enable rate limiting in backend
- [ ] Test all features on MainNet
- [ ] Update README with production URLs
- [ ] Set up monitoring/alerts

---

## Quick Reference

| Service | URL | Status |
|---------|-----|--------|
| Frontend | https://campus-did.vercel.app | Check Vercel |
| Backend | https://campus-did-api.onrender.com | Check Render |
| GitHub | https://github.com/nadeshwar-swami/Decentralised-identity-system | Private/Public |
| Algorand | TestNet | Configuration |

---

## Support

If deployment fails:
1. Check logs (Vercel/Render dashboards)
2. Verify all env variables match exactly
3. Test locally: `npm run dev` (frontend) + `npm start` (backend)
4. Check GitHub issues for similar problems
5. Ask in Render/Vercel support

---

Last updated: 2026-03-02
Campus DID v1.0 - All features complete and ready for production!
