# Campus DID - Feature Testing Checklist

Complete guide to test all 10 features + deployments.

---

## Prerequisites

Before testing, ensure:

- [OK] Backend running: `npm run dev` (port 3001)
- [OK] Frontend running: `npm run dev` (port 5173)  
- [OK] Wallet installed: Pera Wallet or Web Wallet
- [OK] Algorand TestNet selected in wallet
- [OK] Have test ALGO: https://dispenser.testnet.aws.algodev.network/
- [OK] `.env` files properly configured in `backend/` and `frontend/`

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

## Test 2: DID Creation & Management [COMPLETED]

### 2.1 Create DID (Student Role)
**Expected**: Student can generate new DID Document
**Status**: [OK] PASSED

- [x] Go to **Student Dashboard**
- [x] In "My DIDs" section, click **Create DID**
- [x] Enter Display Name (e.g., "John Smith")
- [x] Click **Create**
- [x] Notice displays: DID string, Public Key, Creation date
- [x] DID format: `did:algo:testnet:ADDRESS`

### 2.2 Register DID (Save to Chain)
**Expected**: DID persists on Algorand blockchain
**Status**: [OK] PASSED

- [x] After DID created, click **Register to Chain**
- [x] Approve transaction in wallet
- [x] Wait 5-10 seconds
- [x] Message: "DID registered successfully"
- [x] Refresh page → DID still shows

---

## Test 3: Credential Issuance

### 3.1 Admin Issuing Credential (Step-by-Step)
**Expected**: Admin can issue credentials to students based on their profile data

**Prerequisites**:
- [OK] Student has completed their profile (Test with Profile Lock)
- [OK] Student has created and registered their DID on-chain
- [OK] Both servers running: backend (3001) + frontend (5173)

**Setup Instructions**:

**Step 1: Connect as Student & Complete Profile**
- Go to http://localhost:5173/
- Click **"Connect Wallet"** → Select wallet → Approve connection
- Wait for wallet to connect
- You should see **"Complete Your Profile First"** card in Student Dashboard
- Fill in profile form:
  - Full Name: Your Name
  - Student ID: STU-2024-001
  - Email: your.email@university.edu
  - Date of Birth: Select a date
  - Admission Number: ADM-2024-001
  - Mobile: +91-9999999999
  - Department: Computer Science
  - Year: 2nd Year
- Click **"Save Profile & Continue"** button
- Profile should save and show as completed
- Click **"Create DID"** button
- Approve wallet transaction
- Wait for transaction confirmation (5-10 seconds)
- Confirm: DID shows as registered with transaction link

**Step 2: Switch to Admin Role & Issue Credential**
- In same browser, go to http://localhost:5173/
- Click on **"Admin"** in top navbar
- You should see **"Issue Credentials"** page
- Form shows:
  - Student Wallet Address field
  - Credential Type dropdown (Student Enrolled, Library Access, Hostel Resident, Event Pass)
  - Submit button

**Step 3: Issue Credential to Student**
- Copy your wallet address from sidebar (Admin Wallet section)
- Paste into **"Student Wallet Address"** field
- Select Credential Type: **"📚 Student Enrolled"**
- Click **"Issue Credential NFT"** button
- Wait for processing (5-10 seconds)
- Should see success message with:
  - Asset ID
  - Transaction ID (clickable link to Algorand Explorer)
  - IPFS Hash

**Success Indicators** [OK]:
- [ ] Form accepted your wallet address
- [ ] No error messages
- [ ] Success card appeared with credential details
- [ ] Asset ID generated
- [ ] Transaction ID provided
- [ ] Can click link to view on Algorand Explorer

**Test Steps**:
- [x] Admin Dashboard loads
- [x] Form shows "Student Wallet Address" field
- [x] Can paste wallet address (58 characters)
- [x] Credential Type dropdown shows options
- [x] Click **Issue Credential NFT**
- [x] Wait 5-10 seconds for processing
- [x] Success message appears with details
- [x] Credential data stored on IPFS (mock)

**Troubleshooting**:
- **"Invalid address" error** → Address must be exactly 58 characters, Algorand format
- **"Request failed" error** → Check backend is running on port 3001
- **Timeout (>15s)** → Backend may be processing IPFS upload, check backend logs in terminal
- **No response** → Refresh page and try again

### 3.2 Verify Credential and Check Student Profile Data
**Expected**: Issued credential contains student's profile information and can be retrieved

**Backend Verification**:
- [ ] Open PowerShell terminal
- [ ] Run API test to check stored credential:
```powershell
# Get credential details (use credentialId from success message)
$credentialId = "CREDENTIAL_ID_FROM_SUCCESS_MESSAGE"
curl "http://localhost:3001/api/credentials/details/$credentialId" | ConvertFrom-Json | ConvertTo-Json -Depth 10
```
- [ ] Should return JSON with:
  - `studentDID`: Full DID of student
  - `studentProfile`: Student's full profile (name, email, department, etc.)
  - `ipfsHash`: IPFS location of credential
  - `issuer`: Admin wallet address
  - `status`: "issued"

**Student Dashboard Verification**:
- [ ] Switch back to **Student** role (click Student in navbar)
- [ ] Go to **Student Dashboard**
- [ ] Look for **"My Credentials"** section
- [ ] Should see the credential you just issued:
  - Credential type shown
  - Issue date visible
  - Issuer (your admin address)
  - Status (should be "Active" or "issued")
- [ ] Click **View Details** on credential
- [ ] Verify you can see full credential data

**Success Indicators** [OK]:
- [ ] API returns full credential JSON
- [ ] Credential includes student's profile data
- [ ] Student Dashboard shows issued credential
- [ ] Credential displays correctly in UI
- [ ] All profile fields (name, email, dept) visible when viewing details

---

## Test 4: Student Views Credentials

### 4.1 Receive & View Credentials
**Expected**: Student sees issued credentials in dashboard

**Setup**:
- Switch to **Student** role
- Use same wallet address admin issued credential to

**Test Steps**:
- [x] Go to **Student Dashboard**
- [x] "My Credentials" section shows issued credential
- [x] Credential displays:
  - Type (e.g., "Student Enrolled")
  - Issue date
  - Issuer (Admin address)
  - Status (e.g., "Active")
- [x] Click **View Details** on credential
- [x] Full metadata visible (including student profile data)
- [x] Profile is now **LOCKED** - Edit Profile button shows [LOCK] (due to Test 2 implementation)

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
  - [OK] "Verification Successful" OR
  - [ERROR] "Invalid Presentation"
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
