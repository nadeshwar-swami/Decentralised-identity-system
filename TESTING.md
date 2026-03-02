# Campus DID - Testing Guide

Comprehensive testing guide for the Campus DID system.

---

## Table of Contents
1. [Manual Testing](#manual-testing)
2. [API Testing](#api-testing)
3. [Integration Testing](#integration-testing)
4. [Security Testing](#security-testing)
5. [Performance Testing](#performance-testing)
6. [Test Scenarios](#test-scenarios)

---

## Manual Testing

### Prerequisites
- Both servers running (backend on 3001, frontend on 5173)
- Pera Wallet installed and configured
- Algorand TestNet account with test ALGO
- Test data prepared

### Starting Servers

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev
```

---

## Test Scenarios

### Scenario 1: Student Identity Registration

**Goal**: Create a new student identity from scratch

**Steps**:
1. Open http://localhost:5173
2. Click "Student" role card
3. Click "Connect Wallet" button
4. Approve connection in Pera Wallet
5. Click "Register Identity" button
6. Wait for blockchain confirmation

**Expected Results**:
- ✅ DID created: `did:algo:testnet:YOUR_WALLET`
- ✅ Success toast notification
- ✅ DID displayed in identity card
- ✅ Registration status shows "Registered"
- ✅ Transaction ID visible

**Failure Cases to Test**:
- ❌ No wallet connected → Should show "Connect Your Wallet" message
- ❌ Already registered → Should show "Already Registered"
- ❌ Insufficient ALGO → Should show error message

---

### Scenario 2: Credential Issuance (Admin)

**Goal**: Issue a credential to a student

**Steps**:
1. Switch to "Admin" role (RoleSwitcher)
2. Connect admin wallet
3. Paste student wallet address
4. Select credential type (e.g., "STUDENT_ENROLLED")
5. Click "Issue Credential"
6. Wait for confirmation

**Expected Results**:
- ✅ Success message with credential ID
- ✅ NFT minted on Algorand (check AlgoExplorer)
- ✅ IPFS hash displayed
- ✅ Transaction ID shown
- ✅ Credential stored in backend

**Test All Credential Types**:
- 📚 Student Enrolled
- 📖 Library Access
- 🏠 Hostel Resident
- 🎫 Event Pass

**Failure Cases**:
- ❌ Invalid wallet address → Should show validation error
- ❌ Missing fields → Should prevent submission
- ❌ Insufficient ALGO → Should show error

---

### Scenario 3: View Student Credentials

**Goal**: Student views their issued credentials

**Steps**:
1. Switch to "Student" role
2. Connect student wallet (the one that received credentials)
3. Wait for credentials to load
4. Click on a credential card

**Expected Results**:
- ✅ All credentials displayed as cards
- ✅ Each card shows: type, issuer, issue date, expiry
- ✅ Modal opens with full details
- ✅ IPFS metadata visible
- ✅ QR code generated
- ✅ "View on AlgoExplorer" link works

**Verify Credential Display**:
- Type badge with correct color
- Issuer DID truncated properly
- Dates formatted correctly
- Status (Valid/Expired) shown

---

### Scenario 4: Selective Disclosure

**Goal**: Create a presentation with selected credentials

**Steps**:
1. In Student Dashboard, scroll to "Selective Disclosure" section
2. Select 2-3 credentials using checkboxes
3. Enter purpose: "Employment Verification"
4. Enter recipient DID (can be any valid DID format)
5. Click "Create Presentation"
6. Copy the generated Presentation ID

**Expected Results**:
- ✅ Presentation ID generated (format: `pres_xxxxx`)
- ✅ Presentation appears in history table
- ✅ Status shows "Active"
- ✅ Credential count correct
- ✅ Purpose displayed
- ✅ Copy button works

**Test Presentation Management**:
- Create multiple presentations
- View presentation history
- Check timestamps are correct

---

### Scenario 5: Presentation Verification (Service)

**Goal**: Service verifies a student's presentation

**Steps**:
1. Switch to "Service" role
2. Connect service wallet
3. Register service:
   - Name: "Campus Library"
   - Type: "library"
   - Email: "library@test.edu"
4. Click "Register Service"
5. Switch to "Verify" tab
6. Paste presentation ID from student
7. Click "Verify Presentation"

**Expected Results**:
- ✅ Service registered with ID
- ✅ Verification successful
- ✅ Trust score displayed (0-100)
- ✅ Star rating shown (5 stars = 100)
- ✅ Credential count correct
- ✅ Validity badge shown (✓ Valid or ✗ Invalid)
- ✅ Detailed breakdown visible:
  - Structure Valid
  - Signature Valid
  - Not Expired
  - Not Revoked
  - Credentials Valid

**Test Trust Score Scenarios**:
- Valid presentation → Should get 100
- Expired credential → Should lose 20 points
- Revoked presentation → Should lose 20 points
- Invalid signature → Should lose 20 points

---

### Scenario 6: Presentation Revocation

**Goal**: Student revokes a shared presentation

**Steps**:
1. In Student Dashboard, Selective Disclosure section
2. Find an active presentation in history
3. Click "Revoke" button
4. Confirm revocation
5. Try to verify the same presentation as a service

**Expected Results**:
- ✅ Presentation status changes to "Revoked"
- ✅ Revoked badge displayed
- ✅ Success toast shown
- ✅ Service verification fails
- ✅ Trust score reduced by 20 points
- ✅ "Not Revoked" check fails

---

### Scenario 7: Service Dashboard Analytics

**Goal**: View verification statistics for a service

**Steps**:
1. Switch to "Service" role
2. Register service (if not done)
3. Perform multiple verifications (at least 5)
4. Switch between tabs: Verify, History, Stats

**Expected Results**:

**Verify Tab**:
- ✅ Shows current stats (total, success rate, avg trust score)
- ✅ Verification form functional
- ✅ Results display correctly

**History Tab**:
- ✅ All verifications listed
- ✅ Student DIDs shown
- ✅ Trust scores visible
- ✅ Timestamps correct
- ✅ Scrollable list

**Stats Tab**:
- ✅ Total verifications count
- ✅ Valid verifications count
- ✅ Success rate percentage
- ✅ Average trust score
- ✅ Recent verifications (last 5)

---

## API Testing

### Using cURL

#### 1. Create DID

```bash
curl -X POST http://localhost:3001/api/did/create \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "YOUR_WALLET_ADDRESS",
    "name": "Test Student",
    "publicKey": "YOUR_PUBLIC_KEY"
  }'
```

**Expected**: 200 OK with DID document

#### 2. Issue Credential

```bash
curl -X POST http://localhost:3001/api/credentials/issue \
  -H "Content-Type: application/json" \
  -d '{
    "studentAddress": "STUDENT_WALLET",
    "credentialType": "STUDENT_ENROLLED",
    "issuerAddress": "ISSUER_WALLET"
  }'
```

**Expected**: 200 OK with credential details and asset ID

#### 3. Get Student Credentials

```bash
curl http://localhost:3001/api/credentials/STUDENT_WALLET
```

**Expected**: 200 OK with array of credentials

#### 4. Create Presentation

```bash
curl -X POST http://localhost:3001/api/presentations/create \
  -H "Content-Type: application/json" \
  -d '{
    "holderDID": "did:algo:testnet:STUDENT_WALLET",
    "credentialIds": ["urn:uuid:credential-id-1"],
    "purpose": "Test Verification",
    "recipientDID": "did:algo:testnet:RECIPIENT"
  }'
```

**Expected**: 200 OK with presentation ID

#### 5. Verify Presentation

```bash
curl -X POST http://localhost:3001/api/presentations/verify \
  -H "Content-Type: application/json" \
  -d '{
    "presentationId": "pres_xxxxx"
  }'
```

**Expected**: 200 OK with validation result

#### 6. Register Service

```bash
curl -X POST http://localhost:3001/api/services/register \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "Test Library",
    "serviceType": "library",
    "contactEmail": "test@library.edu"
  }'
```

**Expected**: 200 OK with service ID

#### 7. Service Verification

```bash
curl -X POST http://localhost:3001/api/services/SERVICE_ID/verify \
  -H "Content-Type: application/json" \
  -d '{
    "presentationId": "pres_xxxxx",
    "studentDID": "did:algo:testnet:STUDENT",
    "credentialIds": ["urn:uuid:cred1"],
    "verificationPurpose": "Library Access",
    "verificationDetails": {
      "structureValid": true,
      "signatureValid": true,
      "notExpired": true,
      "notRevoked": true,
      "credentialsValid": true
    }
  }'
```

**Expected**: 200 OK with trust score and verification record

---

### Using Postman

Import collection: Create a Postman collection with all endpoints from [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

**Environment Variables**:
- `BASE_URL`: http://localhost:3001
- `STUDENT_WALLET`: Your test student wallet
- `ISSUER_WALLET`: Your test issuer wallet
- `SERVICE_ID`: Your registered service ID

---

## Integration Testing

### End-to-End Flow Test

**Complete workflow from identity creation to verification:**

```bash
# 1. Create student DID
STUDENT_WALLET="YOUR_WALLET"
curl -X POST http://localhost:3001/api/did/create \
  -H "Content-Type: application/json" \
  -d "{\"walletAddress\": \"$STUDENT_WALLET\", \"name\": \"Alice\", \"publicKey\": \"$STUDENT_WALLET\"}"

# 2. Issue credential
ISSUER_WALLET="ISSUER_WALLET"
CRED_RESPONSE=$(curl -X POST http://localhost:3001/api/credentials/issue \
  -H "Content-Type: application/json" \
  -d "{\"studentAddress\": \"$STUDENT_WALLET\", \"credentialType\": \"STUDENT_ENROLLED\", \"issuerAddress\": \"$ISSUER_WALLET\"}")
echo $CRED_RESPONSE | jq '.data.credentialId'

# 3. Get credentials
curl http://localhost:3001/api/credentials/$STUDENT_WALLET | jq '.'

# 4. Create presentation
CREDENTIAL_ID="urn:uuid:from-step-2"
PRES_RESPONSE=$(curl -X POST http://localhost:3001/api/presentations/create \
  -H "Content-Type: application/json" \
  -d "{\"holderDID\": \"did:algo:testnet:$STUDENT_WALLET\", \"credentialIds\": [\"$CREDENTIAL_ID\"], \"purpose\": \"Test\", \"recipientDID\": \"did:algo:testnet:recipient\"}")
PRES_ID=$(echo $PRES_RESPONSE | jq -r '.data.presentationId')
echo "Presentation ID: $PRES_ID"

# 5. Verify presentation
curl -X POST http://localhost:3001/api/presentations/verify \
  -H "Content-Type: application/json" \
  -d "{\"presentationId\": \"$PRES_ID\"}" | jq '.'

# 6. Register service
SERVICE_RESPONSE=$(curl -X POST http://localhost:3001/api/services/register \
  -H "Content-Type: application/json" \
  -d '{"serviceName": "Test Library", "serviceType": "library", "contactEmail": "test@lib.edu"}')
SERVICE_ID=$(echo $SERVICE_RESPONSE | jq -r '.data.serviceId')
echo "Service ID: $SERVICE_ID"

# 7. Service verification
curl -X POST http://localhost:3001/api/services/$SERVICE_ID/verify \
  -H "Content-Type: application/json" \
  -d "{\"presentationId\": \"$PRES_ID\", \"studentDID\": \"did:algo:testnet:$STUDENT_WALLET\", \"credentialIds\": [\"$CREDENTIAL_ID\"], \"verificationPurpose\": \"Test\", \"verificationDetails\": {\"structureValid\": true, \"signatureValid\": true, \"notExpired\": true, \"notRevoked\": true, \"credentialsValid\": true}}" | jq '.'
```

---

## Security Testing

### 1. Input Validation Tests

**Test Invalid Inputs**:
```bash
# Empty wallet address
curl -X POST http://localhost:3001/api/did/create \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "", "name": "Test"}'
# Expected: 400 Bad Request

# Invalid credential type
curl -X POST http://localhost:3001/api/credentials/issue \
  -H "Content-Type: application/json" \
  -d '{"studentAddress": "WALLET", "credentialType": "INVALID_TYPE", "issuerAddress": "ISSUER"}'
# Expected: 400 Bad Request or validation error

# SQL injection attempt (should be safe)
curl -X POST http://localhost:3001/api/did/create \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "WALLET'; DROP TABLE users;--", "name": "Test"}'
# Expected: Safe handling, no SQL execution
```

### 2. XSS Testing

Test HTML injection in forms:
- Try entering `<script>alert('XSS')</script>` in service name
- Expected: Escaped or sanitized

### 3. CORS Testing

```bash
# Test from different origin
curl -H "Origin: http://evil.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS http://localhost:3001/api/did/create
# Expected: CORS headers present in response
```

---

## Performance Testing

### 1. Load Testing with Apache Bench

```bash
# Test DID creation endpoint
ab -n 100 -c 10 -T 'application/json' \
  -p did_payload.json \
  http://localhost:3001/api/did/create

# Test credential fetching
ab -n 1000 -c 50 \
  http://localhost:3001/api/credentials/WALLET_ADDRESS
```

### 2. Response Time Testing

Expected response times:
- DID operations: < 500ms
- Credential issuance: < 2000ms (includes blockchain)
- Credential retrieval: < 200ms
- Presentation creation: < 300ms
- Verification: < 500ms

### 3. Concurrent Users

Test with 50+ concurrent users:
```bash
# Using wrk
wrk -t12 -c400 -d30s http://localhost:3001/api/credentials/WALLET
```

---

## Browser Testing

### Cross-Browser Testing

Test on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

### Responsive Design

Test at breakpoints:
- Mobile: 375px, 414px
- Tablet: 768px, 1024px
- Desktop: 1280px, 1920px

### Wallet Integration

Test Pera Wallet:
- ✅ Desktop extension
- ✅ Mobile app (QR code connection)
- ✅ WalletConnect fallback

---

## Automated Testing Tips

### Setup Jest (Optional)

```bash
cd backend
npm install --save-dev jest supertest

# Create test file
# backend/__tests__/api.test.js
```

Example test:
```javascript
const request = require('supertest')
const app = require('../server')

describe('DID API', () => {
  it('should create a DID', async () => {
    const response = await request(app)
      .post('/api/did/create')
      .send({
        walletAddress: 'TEST_WALLET',
        name: 'Test User',
        publicKey: 'TEST_KEY'
      })
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.did).toContain('did:algo:testnet:')
  })
})
```

---

## Test Checklist

### Functionality
- [ ] Student can register DID
- [ ] Admin can issue all credential types
- [ ] Student can view credentials
- [ ] Student can create presentations
- [ ] Student can revoke presentations
- [ ] Service can register
- [ ] Service can verify presentations
- [ ] Trust scores calculate correctly
- [ ] All navigation links work
- [ ] Role switching works
- [ ] Wallet connect/disconnect works

### Data Integrity
- [ ] DIDs follow correct format
- [ ] Credentials stored properly
- [ ] Presentations include correct credentials
- [ ] Verification records accurate
- [ ] Timestamps correct
- [ ] Revocation status tracked

### UI/UX
- [ ] All pages responsive
- [ ] Loading states shown
- [ ] Error messages clear
- [ ] Success toasts appear
- [ ] Forms validate inputs
- [ ] Buttons disabled during loading
- [ ] Animations smooth
- [ ] Navigation intuitive

### Security
- [ ] Input validation works
- [ ] No XSS vulnerabilities
- [ ] CORS configured correctly
- [ ] Sensitive data not exposed
- [ ] Environment variables secure

### Performance
- [ ] Pages load quickly
- [ ] API responses fast
- [ ] No memory leaks
- [ ] Smooth scrolling
- [ ] No console errors

---

## Reporting Bugs

When reporting issues, include:
1. Steps to reproduce
2. Expected vs actual behavior
3. Browser/OS version
4. Console errors (if any)
5. Network tab (for API errors)
6. Screenshots/videos

---

**Last Updated**: March 2, 2026  
**Testing Guide Version**: 1.0
