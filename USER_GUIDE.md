# Campus DID - User Guide

## 🎯 Overview

Campus DID is a decentralized identity system for campus ecosystems. Students own their identity, universities issue verifiable credentials, and services verify authenticity—all on Algorand TestNet.

---

## 👤 Roles

### 1. **Student** 🎓
Students manage their decentralized identity and credentials.

**What You Can Do:**
- Register your student identity (DID)
- View all your credentials (displayed as cards)
- Create selective disclosures (choose which credentials to share)
- Track verification history
- Revoke shared presentations

**Getting Started:**
1. Connect your Pera Wallet
2. Click "Register Identity" to create your DID
3. Wait for admin to issue credentials
4. View credentials in your dashboard

---

### 2. **Administrator** 🛡️
University administrators issue verifiable credentials to students.

**What You Can Do:**
- Issue credentials to student wallets
- Track issued credentials
- Support multiple credential types:
  - 📚 Student Enrolled
  - 📖 Library Access
  - 🏠 Hostel Resident
  - 🎫 Event Pass

**Issuing Credentials:**
1. Connect your admin wallet
2. Enter student's wallet address
3. Select credential type
4. Click "Issue Credential"
5. Credential is minted as NFT on Algorand

---

### 3. **Campus Service** 💼
Services verify student credentials (employers, library, hostel, events).

**What You Can Do:**
- Register your service
- Verify student presentations
- View trust scores (0-100)
- Access verification history
- Track verification statistics

**Verifying Credentials:**
1. Connect service wallet
2. Register your service (name, type, email)
3. Request presentation ID from student
4. Enter presentation ID in verification form
5. Receive trust score and validity status

**Trust Score Breakdown:**
- 20 points: Structure valid
- 20 points: Signature valid
- 20 points: Not expired
- 20 points: Not revoked
- 20 points: Credentials valid
- **Total: 0-100**

---

## 🔄 Complete Workflow

### End-to-End Example:

**Step 1: Student Registration**
- Student switches to "Student" role
- Connects Pera Wallet
- Clicks "Register Identity"
- DID created: `did:algo:testnet:<wallet>`

**Step 2: Credential Issuance**
- Admin switches to "Admin" role
- Connects admin wallet
- Enters student's wallet address
- Issues "Student Enrolled" credential
- NFT minted on Algorand with metadata

**Step 3: Selective Disclosure**
- Student views credentials in dashboard
- Clicks "Create Presentation"
- Selects which credentials to include
- Presentation ID generated (e.g., `pres_abc123`)
- Student shares presentation ID with service

**Step 4: Service Verification**
- Service switches to "Service" role
- Registers service (first time only)
- Enters presentation ID from student
- System verifies:
  - Credential signatures
  - Expiration dates
  - Revocation status
  - Structural validity
- Trust score displayed (0-100)
- Verification recorded

---

## 🔐 Security Features

### Student Privacy
- **Selective Disclosure**: Share only what's needed
- **Presentation Control**: Create multiple presentations with different credential sets
- **Revocation Rights**: Revoke any presentation at any time
- **Verification History**: See who verified your credentials and when

### Verification Trust
- **Trust Scores**: 0-100 score for each verification
- **Multi-factor Checks**: 5 independent validation checks
- **Expiration Tracking**: 1-year validity for verifications
- **Audit Trail**: Complete verification history for services

### On-Chain Security
- **Immutable Records**: Credential metadata on Algorand blockchain
- **NFT Ownership**: Credentials stored as NFTs in student wallets
- **Cryptographic Signatures**: Ed25519 signatures verify authenticity
- **Decentralized Storage**: IPFS for credential content

---

## 📱 Navigation

### Main Navigation Bar
- **Logo (Campus DID)**: Click to return home
- **Role Switcher**: Toggle between Student/Admin/Service
- **Wallet Connect**: Connect/Disconnect Pera Wallet

### Role-Based Links
Each role sees different navigation:
- **Student**: Dashboard (view credentials, create presentations)
- **Admin**: Issue Credentials (credential issuance form)
- **Service**: Verify Credentials (verification dashboard)

---

## 🛠️ Technical Details

### Built With
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Blockchain**: Algorand TestNet
- **Wallet**: Pera Wallet
- **Standards**: W3C DID Core 1.0, W3C VC Data Model 1.1

### Network Information
- **Network**: Algorand TestNet
- **Smart Contract App ID**: 756415000
- **API Endpoint**: https://testnet-api.algonode.cloud
- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:5173

### Credential Format
Credentials follow W3C Verifiable Credentials standard:
```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential"],
  "issuer": "did:algo:testnet:<issuer-wallet>",
  "credentialSubject": {
    "id": "did:algo:testnet:<student-wallet>",
    "credentialType": "STUDENT_ENROLLED"
  },
  "issuanceDate": "2026-03-02T...",
  "expirationDate": "2027-03-02T...",
  "proof": { "type": "Ed25519", "signature": "..." }
}
```

---

## Quick Start

### For Students
1. Install Pera Wallet browser extension
2. Switch wallet to Algorand TestNet
3. Visit http://localhost:5173
4. Select "Student" role
5. Connect wallet → Register identity

### For Admins
1. Connect admin wallet
2. Switch to "Admin" role
3. Get student wallet address
4. Issue credentials

### For Services
1. Connect service wallet
2. Switch to "Service" role
3. Register your service
4. Request presentation IDs from students
5. Verify credentials

---

## 📊 Dashboard Features

### Student Dashboard
- **Identity Card**: Shows your DID, registration status
- **Credentials Grid**: All your credentials as visual cards
- **Selective Disclosure Panel**: Create presentations, view history
- **Statistics**: Total credentials, presentations, verifications

### Admin Dashboard
- **Issuance Form**: Issue credentials to students
- **Credential Type Selector**: Multiple credential types
- **Issued Records**: Track all issued credentials
- **Statistics**: Total issued, success rate

### Service Dashboard
- **Service Info**: Your service profile (name, type, ID)
- **Verification Form**: Verify presentation IDs
- **Statistics Cards**: Total verifications, success rate, avg trust score
- **Verification History**: All past verifications with trust scores
- **Recent Activity**: Last 5 verifications

---

## ❓ Troubleshooting

### Wallet Won't Connect
- Ensure Pera Wallet is installed
- Check you're on Algorand TestNet
- Refresh and try again

### Can't Register Identity
- Verify wallet is connected
- Check backend is running (port 3001)
- View console for error messages

### Credentials Not Showing
- Wait a few seconds after issuance
- Click refresh in dashboard
- Verify credentials were issued to correct wallet

### Presentation Verification Failed
- Check presentation ID is correct
- Ensure presentation isn't revoked
- Verify credential hasn't expired

---

## 🔗 Useful Links

- **Algorand Developer Portal**: https://developer.algorand.org
- **W3C DID Specification**: https://www.w3.org/TR/did-core/
- **W3C VC Specification**: https://www.w3.org/TR/vc-data-model/
- **Pera Wallet**: https://perawallet.app
- **GitHub Repository**: (your repo link)

---

## 📞 Support

For issues, questions, or feedback:
- Check the troubleshooting section above
- Review console logs for error messages
- Verify all services are running (backend on 3001, frontend on 5173)
- Ensure you're on Algorand TestNet

---

**Campus DID MVP v1.0** • For Educational and Demonstration Purposes
