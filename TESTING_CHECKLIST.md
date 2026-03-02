# Campus DID - Feature Testing Checklist

Complete guide to test all 10 features + deployments.

---

## Prerequisites

Before testing, ensure:

- ✅ Backend running: `npm run dev` (port 3001)
- ✅ Frontend running: `npm run dev` (port 5173)  
- ✅ Wallet installed: Pera Wallet or Web Wallet
- ✅ Algorand TestNet selected in wallet
- ✅ Have test ALGO: https://dispenser.testnet.aws.algodev.network/
- ✅ `.env` files properly configured in `backend/` and `frontend/`

---

## Test 1: Wallet Connection

### 1.1 Pera Wallet Connection
**Expected**: User can connect wallet via Pera app

- [ ] Click **"Connect Wallet"** button
- [ ] Select **Pera Wallet**
- [ ] Approve in Pera app on phone/extension
- [ ] UI shows connected wallet address
- [ ] Button changes to **"Disconnect"**

**Troubleshooting**:
- If Pera doesn't connect: Check Algorand network is TestNet
- If address not showing: Check browser console for errors
- If stuck on loading: Refresh page

### 1.2 Web Wallet Connection
**Expected**: User can connect via web wallet fallback

- [ ] Click **"Connect Wallet"**
- [ ] Select **Web Wallet**  
- [ ] Enter your TestNet mnemonic (25 words)
- [ ] Click **Connect**
- [ ] Wallet address displays
- [ ] Click **Disconnect** to remove

**Troubleshooting**:
- If mnemonic rejected: Ensure it's exactly 25 words, TestNet account
- If paste not working: Try typing manually
- If address shows but errors after: Check account has TestNet ALGO

---

## Test 2: DID Creation & Management

### 2.1 Create DID (Student Role)
**Expected**: Student can generate new DID Document

- [ ] Go to **Student Dashboard**
- [ ] In "My DIDs" section, click **Create DID**
- [ ] Enter Display Name (e.g., "John Smith")
- [ ] Click **Create**
- [ ] Notice displays: DID string, Public Key, Creation date
- [ ] DID format: `did:algo:testnet:ADDRESS`

**Troubleshooting**:
- If "Failed to create DID" error:
  - Check backend `/api/did/create` logs
  - Verify wallet connected
  - Ensure wallet has → 0.1 ALGO (transaction fee)

### 2.2 Register DID (Save to Chain)
**Expected**: DID persists on Algorand blockchain

- [ ] After DID created, click **Register to Chain**
- [ ] Approve transaction in wallet
- [ ] Wait 5-10 seconds
- [ ] Message: "DID registered successfully"
- [ ] Refresh page → DID still shows

**Troubleshooting**:
- If transaction fails: Wallet may not have enough ALGO
- If "DID already registered": Previous transaction succeeded, safe to ignore
- If backend timeout: Algorand network may be slow (try again in 1 min)

---

## Test 3: Credential Issuance

### 3.1 Admin Issuing Credential
**Expected**: Admin can issue credentials to students

**Setup**:
- Switch to **Admin** role
- Go to **Admin Dashboard**

**Test Steps**:
- [ ] List shows "Issued Credentials" section (initially empty)
- [ ] Click **Issue New Credential**
- [ ] Fill form:
  - Student Address: (paste a student's wallet address)
  - Credential Type: "AcademicRecord"
  - Metadata: `{"grade": "A", "course": "DID101"}`
- [ ] Click **Issue**
- [ ] Wait for confirmation
- [ ] Credential appears in "Issued Credentials" list

**Troubleshooting**:
- If "Invalid address" error: Copy exact address from student dashboard
- If issuing timeout: Check backend logs, may need to wait for blockchain
- If metadata rejected: Ensure valid JSON format

### 3.2 Verify Credential on-chain
**Expected**: Issued credential is stored in Pinata/IPFS

- [ ] In "Issued Credentials" list, click **View Details** on credential
- [ ] Check metadata displays correctly
- [ ] Copy credential ID
- [ ] Test via API:
```bash
curl http://localhost:3001/api/credentials/details/CREDENTIAL_ID
```
- [ ] Should return full credential JSON

---

## Test 4: Student Views Credentials

### 4.1 Receive & View Credentials
**Expected**: Student sees issued credentials in dashboard

**Setup**:
- Switch to **Student** role
- Use same wallet address admin issued credential to

**Test Steps**:
- [ ] Go to **Student Dashboard**
- [ ] "My Credentials" section shows issued credential
- [ ] Credential displays:
  - Type (e.g., "AcademicRecord")
  - Issue date
  - Issuer (Admin address)
  - Status (e.g., "Active")
- [ ] Click **View Details** on credential
- [ ] Full metadata visible
- [ ] Click **Delete** to remove (optional test)

**Troubleshooting**:
- If credential not showing: 
  - Refresh page
  - Check using correct student wallet address
  - Verify admin issued to this address
  - Check backend logs at `/api/credentials/WALLET_ADDRESS`

---

## Test 5: Selective Disclosure

### 5.1 Create Presentation
**Expected**: Student can selectively disclose credential fields

**Setup**: Have at least 1 credential in Student Dashboard

**Test Steps**:
- [ ] Click **Create Presentation** on a credential
- [ ] Dialog shows all credential fields with checkboxes
- [ ] Deselect sensitive fields (e.g., uncheck "grade")
- [ ] Keep only necessary fields checked
- [ ] Click **Generate**
- [ ] Wait for processing
- [ ] Presentation ID displays
- [ ] Copy ID

**Troubleshooting**:
- If "No credentials to present": Create credential first (Test 3)
- If empty field list: Check credential has metadata in Test 3
- If generate times out: Backend may be slow, try again

### 5.2 View & Share Presentations
**Expected**: Student can track presentation disclosures

- [ ] Go to **Presentations** tab
- [ ] List shows created presentations with:
  - Presentation ID
  - Created date
  - Selected fields
  - Status (e.g., "Valid", "Expired")
- [ ] Click **Share** to get shareable link
- [ ] Share ID can be sent to Service provider

**Troubleshooting**:
- If list empty: Create presentation first
- If share error: Check backend `/api/credentials/presentations` endpoint

---

## Test 6: Service Verification

### 6.1 Service Provider Registration
**Expected**: Service can register and verify presentations

**Setup**:
- Switch to **Service** role
- Go to **Service Dashboard**

**Test Steps**:
- [ ] Click **Register Service**
- [ ] Enter Service Name (e.g., "Job Portal Co")
- [ ] Enter Service Purpose (e.g., "Verify educational credentials")
- [ ] Click **Register**
- [ ] Service ID displays
- [ ] Copy Service ID

**Troubleshooting**:
- If duplicate error: Service already registered, safe to ignore
- If timeout: Blockchain is slow, try again

### 6.2 Verify Presentation
**Expected**: Service can verify student disclosure

**Setup**: Have a presentation ID from Test 5

**Test Steps**:
- [ ] Click **Verify Credential**
- [ ] Paste Presentation ID
- [ ] Click **Verify**
- [ ] Wait for validation
- [ ] Result shows:
  - ✅ "Verification Successful" OR
  - ❌ "Invalid Presentation"
- [ ] Shows verified fields

**Troubleshooting**:
- If "Invalid ID" error: Paste exact presentation ID
- If verification fails:
  - Check presentation not expired
  - Verify correct Student DID
  - Check backend logs

### 6.3 Trust Score
**Expected**: Service sees student trust score

- [ ] After verification, page shows **Trust Score**
- [ ] Score between 0-100 (100 = fully verified)
- [ ] Breakdown explains calculation:
  - Credential age: newer = higher
  - Issuer reputation: known issuer = higher
  - Field count: more disclosed = lower privacy risk
- [ ] Trust score influences verification decision

---

## Test 7: Role-Based Navigation

### 7.1 Navbar Role Indicator
**Expected**: Navbar shows current role + quick switch

- [ ] View Navbar (top of page)
- [ ] Current role highlighted (e.g., "Student" in blue)
- [ ] Other roles available (Admin, Service, Logout)
- [ ] Clicking role switches immediately
- [ ] Page content updates to match new role

### 7.2 Protected Routes
**Expected**: Can't access non-role pages

- [ ] Try accessing `/admin` while in Student role
- [ ] Should redirect to `/student`
- [ ] Try accessing `/service` while in Admin role
- [ ] Should redirect to `/admin`
- [ ] Try accessing any role while logged out
- [ ] Should redirect to `/` (Landing)

### 7.3 Landing Page
**Expected**: Landing page displays when no role selected

- [ ] Click **Logout** in navbar
- [ ] Redirects to landing page
- [ ] Shows role options (Student, Admin, Service)
- [ ] Clicking each role shows info
- [ ] Click "Continue as Student" → navigates to student dashboard

**Troubleshooting**:
- If not redirecting: Check browser console for routing errors
- If navbar not updating: Refresh page

---

## Test 8: Error Handling

### 8.1 Network Errors
**Expected**: App handles connection failures gracefully

**Test Steps**:
- [ ] Stop backend server (`Ctrl+C` in terminal)
- [ ] Try any action in frontend (e.g., "Create DID")
- [ ] Should show error: "Unable to reach backend"
- [ ] NOT a crash/white screen
- [ ] Restart backend
- [ ] Action works again

### 8.2 Invalid Input
**Expected**: Form validation prevents bad data

- [ ] Try creating DID with empty name → "Name required" error
- [ ] Try registering service with special chars → "Invalid format" error
- [ ] Try verifying with wrong presentation ID → "Not found" error
- [ ] Each error is clear & actionable

### 8.3 Wallet Errors
**Expected**: Wallet rejection handled

- [ ] Try creating DID with low balance (< 0.1 ALGO)
- [ ] Click confirm in wallet
- [ ] Wallet rejects → error shown: "Insufficient balance"
- [ ] Try rejecting transaction in wallet
- [ ] Frontend shows: "Transaction cancelled"

**Troubleshooting**:
- If crash instead of error: Check backend error routes
- If generic "error" message: Check `.env` LOG_LEVEL=debug

---

## Test 9: API Endpoints (Postman/curl)

### 9.1 Health Check
```bash
curl http://localhost:3001/health
# Expected: {"success":true,"message":"Campus DID API running"}
```

### 9.2 Create DID
```bash
curl -X POST http://localhost:3001/api/did/create \
  -H "Content-Type: application/json" \
  -d { \
    "walletAddress": "YOUR_WALLET_ADDRESS", \
    "displayName": "Test User", \
    "publicKey": "YOUR_PUBLIC_KEY" \
  }
# Expected: {"success":true,"did":"did:algo:testnet:..."}
```

### 9.3 Issue Credential
```bash
curl -X POST http://localhost:3001/api/credentials/issue \
  -H "Content-Type: application/json" \
  -d { \
    "studentAddress": "STUDENT_WALLET", \
    "credentialType": "AcademicRecord", \
    "metadata": {"grade": "A"} \
  }
# Expected: {"success":true,"credentialId":"..."}
```

### 9.4 Get Credentials
```bash
curl http://localhost:3001/api/credentials/WALLET_ADDRESS
# Expected: {"success":true,"credentials":[...]}
```

### 9.5 Verify Presentation
```bash
curl -X POST http://localhost:3001/api/verify/presentation \
  -H "Content-Type: application/json" \
  -d {"presentationId":"PRESENTATION_ID"}
# Expected: {"success":true,"verified":true,"trustScore":85}
```

**Troubleshooting**:
- If 404: Endpoint may not exist, check routes in `/backend/routes/`
- If error response: Check backend console for details
- If timeout: Backend may be hung, restart with `npm run dev`

---

## Test 10: Performance & Load Times

### 10.1 Load Times
**Expected**: Pages load in < 3 seconds

**Test Steps**:
- [ ] Time landing page load
- [ ] Time dashboard load after role select
- [ ] Time credential list display (if 10+ credentials)
- [ ] Each should be < 3 seconds

**Troubleshooting**:
- If slow: Check network tab in dev tools → backend timing
- If backend slow: May need to optimize DB queries (future improvement)

### 10.2 Form Responsiveness
**Expected**: Forms respond instantly to input

- [ ] Type in input fields → no lag
- [ ] Click buttons → immediate feedback (loading spinner)
- [ ] Dropdown options → smooth

### 10.3 Blockchain Transactions
**Expected**: Transaction times reasonable

- [ ] DID creation: Wait time displayed
- [ ] Credential issue: Wait time displayed
- [ ] Should take 5-15 seconds (Algorand network speed)

---

## Test 11: Production Deployment Testing

### Before Deploying to Vercel/Render:

- [ ] All tests 1-10 pass locally
- [ ] No console errors (`F12` → Console tab)
- [ ] No network errors in dev tools
- [ ] Backend logs show no errors
- [ ] `.env` files use example values (not real secrets)

### Deployment Steps:

1. **Deploy Backend to Render** (VERCEL_RENDER_DEPLOYMENT.md Step 1)
   - [ ] Render shows "Live" status
   - [ ] Test: `curl https://YOUR-RENDER-URL/health`
   - [ ] Expected: Success response

2. **Deploy Frontend to Vercel** (VERCEL_RENDER_DEPLOYMENT.md Step 2)
   - [ ] Vercel shows "Ready" status
   - [ ] Test: Visit `https://YOUR-VERCEL-URL` in browser
   - [ ] Expected: App loads

3. **Update CORS** (VERCEL_RENDER_DEPLOYMENT.md Step 3)
   - [ ] Render env var `CORS_ORIGIN` = Vercel URL
   - [ ] Render redeploys

4. **Post-Deployment Tests**:
   - [ ] Connect wallet in production
   - [ ] Create DID
   - [ ] Issue credential
   - [ ] Verify presentation
   - [ ] Test on mobile: Access Vercel URL on phone
   - [ ] Check response times (may be slower on free tier)

### Production Troubleshooting:

**"Cannot GET /" on Vercel**:
- Check Vercel build logs
- Verify `VITE_BACKEND_URL` env var set
- Trigger rebuild

**"Backend not responding"**:
- Check Render status (may be sleeping)
- Make request to wake it up: `curl RENDER_HEALTH_URL`
- Wait 30-60 seconds

**"CORS error"**:
- Verify CORS_ORIGIN matches Vercel domain exactly
- Check Render logs
- Clear browser cache (Shift+F5)

---

## Test Summary

| Test # | Feature | Status | Notes |
|--------|---------|--------|-------|
| 1 | Wallet Connection | ⬜ | Start here |
| 2 | DID Creation | ⬜ | Requires Test 1 |
| 3 | Credential Issuance | ⬜ | Requires Test 2 |
| 4 | View Credentials | ⬜ | Requires Test 3 |
| 5 | Selective Disclosure | ⬜ | Requires Test 4 |
| 6 | Verification | ⬜ | Requires Test 5 |
| 7 | Navigation | ⬜ | Independent |
| 8 | Error Handling | ⬜ | Independent |
| 9 | API Endpoints | ⬜ | Independent |
| 10 | Performance | ⬜ | Last |
| 11 | Deployment | ⬜ | After passing 1-10 |

---

## How to Use This Checklist

1. **Local Testing**:
   - [ ] Ensure backend + frontend running
   - [ ] Go through Tests 1-10 in order
   - [ ] Check off each step
   - [ ] Note any failures

2. **Report Issues**:
   - [ ] Screenshot error message
   - [ ] Copy console error (F12)
   - [ ] Provide steps to reproduce
   - [ ] Check backend logs

3. **Fix & Re-test**:
   - [ ] Fix code
   - [ ] Commit & push to GitHub
   - [ ] Re-run test (on local or deployed version)

4. **Deploy**:
   - [ ] All tests pass locally
   - [ ] Deploy to Vercel + Render
   - [ ] Run tests again on production
   - [ ] Celebrate! 🎉

---

## Quick Commands

```bash
# Start backend
cd backend
npm run dev

# Start frontend (in new terminal)
cd frontend
npm run dev

# Run API test
curl http://localhost:3001/health

# Check backend logs
# (watch terminal where backend running)

# Debug frontend
# Open DevTools: F12
# Console tab for errors
# Network tab for API calls
```

---

Last updated: 2026-03-02
Campus DID v1.0 - Full Feature Testing Guide
