# Campus DID — Decentralized Identity for Campus Ecosystem

## Overview

Campus DID is a blockchain-based identity system built on Algorand TestNet that empowers students to control their own decentralized identities while enabling universities to issue verifiable credentials and campus services to verify them instantaneously.

The system implements W3C standards for DIDs and Verifiable Credentials, combined with Algorand's scalability and low costs, to create a trustless ecosystem where students selectively disclose credentials without exposing sensitive information.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Pera Wallet                            │
│              (Student & Admin Transaction Signing)            │
└────────┬────────────────────────────┬───────────────┬────────┘
         │                            │               │
    Student                       Admin            Service
    Wallet                        Wallet           Interface
         │                            │               │
         └────────┬──────────────────┬───────────────┘
                  │                  │
         ┌────────▼──────────────────▼────────┐
         │    Frontend (Vite + React 18)       │
         │  ┌─ Landing Page                   │
         │  ├─ Student Dashboard              │
         │  │  - Create DID                  │
         │  │  - View Credentials            │
         │  │  - Share Selectively           │
         │  ├─ Admin Dashboard               │
         │  │  - Issue Credentials           │
         │  │  - Manage Universities         │
         │  └─ Service Dashboard             │
         │     - Verify Identities           │
         │     - Check Credentials           │
         └────────┬──────────────────────────┘
                  │
         ┌────────▼──────────────────────────┐
         │  Backend API (Node.js + Express)   │
         │  ┌─ /api/did                       │
         │  │  - POST /create (DID creation) │
         │  │  - GET /:address (DID resolve) │
         │  ├─ /api/credentials              │
         │  │  - POST /issue (NFT minting)   │
         │  │  - GET /:address (fetch list)  │
         │  └─ /api/verify                   │
         │     - POST /presentation (verify) │
         │     - Smart Contract Integration  │
         └────────┬────────────────┬─────────┘
                  │                │
         ┌────────▼────┐  ┌────────▼──────┐
         │  Algorand   │  │  Pinata IPFS  │
         │  TestNet    │  │  Gateway      │
         │  - Smart    │  │  - Store DID  │
         │    Contract │  │    Documents  │
         │  - ASA NFTs │  │  - Store VCs  │
         │  - Verify   │  │  - Metadata   │
         └─────────────┘  └───────────────┘
```

## Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Wallet Integration**: @txnlab/use-wallet (Pera Wallet)
- **Blockchain**: algosdk
- **UI Components**: lucide-react icons
- **Routing**: react-router-dom
- **Notifications**: react-hot-toast
- **HTTP Client**: axios
- **QR Codes**: qrcode.react + html5-qrcode

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Blockchain**: algosdk
- **IPFS**: Pinata SDK (@pinata/sdk)
- **Security**: helmet, cors
- **Configuration**: dotenv

### Smart Contracts
- **Language**: Algorand Python (algopy)
- **Standard**: ARC-52 (DID Method)
- **Network**: Algorand TestNet

### Standards
- **W3C DID Core v1.0** - Decentralized Identifiers
- **W3C Verifiable Credentials** - Data Model 1.1
- **ARC-52** - Algorand DID Method
- **ARC-69** - Algorand NFT Tokenomics

## Prerequisites

- **Node.js**: v18+ (check with `node --version`)
- **npm**: v9+ (check with `npm --version`)
- **Python**: 3.10+ (for smart contracts)
- **Pera Wallet**: Browser extension or mobile app
- **Algorand TestNet**: Account with test tokens from [dispenser](https://testnet-dispenser.algoexplorer.io/)
- **Pinata Account**: For IPFS storage ([sign up free](https://pinata.cloud))

## Documentation

📚 **Complete documentation available**:
- **[USER_GUIDE.md](USER_GUIDE.md)** - User guide for all roles (Student, Admin, Service)
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API reference with all endpoints
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[TESTING.md](TESTING.md)** - Comprehensive testing guide and scenarios
- **[PROGRESS.md](PROGRESS.md)** - Development progress tracker

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/your-org/campus-did.git
cd campus-did
```

### 2. Smart Contract Deployment

```bash
cd contracts

# Install dependencies
pip install -r requirements.txt

# Deploy to Algorand TestNet
python deploy_corrected.py

# Save the App ID from output (e.g., 756415000)
```

**Important**: Save the App ID! You'll need it in the next steps.

### 3. Backend Setup

```bash
cd ../backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your values
nano .env
```

**Required environment variables**:
```env
# Algorand
ALGORAND_APP_ID=756415000  # Your deployed App ID
UNIVERSITY_MNEMONIC=your 25-word mnemonic here

# Pinata IPFS
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_KEY=your_pinata_secret

# Server
PORT=3001
ALGORAND_NETWORK=testnet
```

See [backend/.env.example](backend/.env.example) for all variables.

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your values
nano .env
```

**Required environment variables**:
```env
VITE_BACKEND_URL=http://localhost:3001
VITE_ALGOD_URL=https://testnet-api.algonode.cloud
VITE_INDEXER_URL=https://testnet-idx.algonode.cloud
VITE_APP_ID=756415000  # Your deployed App ID
```

See [frontend/.env.example](frontend/.env.example) for all variables.

### 5. Start Servers

**Terminal 1 - Backend**:
```bash
cd backend
npm start
# Expected: ✓ Campus DID API running on port 3001
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
# Expected: ✓ VITE ready at http://localhost:5173
```

### 6. Access Application

Open your browser and navigate to:
```
http://localhost:5173
```

**First-time setup**:
1. Install [Pera Wallet](https://perawallet.app) browser extension
2. Switch wallet to Algorand TestNet
3. Get test ALGO from [dispenser](https://dispenser.testnet.aws.algodev.network/)

## Setup Instructions

### 1. Clone and Navigate

```bash
cd c:\Users\akura\Desktop\did\ system\campus-did
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local`:
```env
VITE_BACKEND_URL=http://localhost:3001
VITE_ALGOD_URL=https://testnet-api.algonode.cloud
VITE_INDEXER_URL=https://testnet-idx.algonode.cloud
VITE_APP_ID=<app-id-after-contract-deploy>
```

### 3. Backend Setup

```bash
cd ../backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
PORT=3001
VITE_ALGOD_URL=https://testnet-api.algonode.cloud
VITE_INDEXER_URL=https://testnet-idx.algonode.cloud
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret
UNIVERSITY_MNEMONIC=your_25_word_mnemonic
```

### 4. Smart Contracts Setup

```bash
cd ../contracts
pip install -r requirements.txt
python deploy.py
```

Save the returned App ID in backend `.env` and frontend `.env.local`

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Expected: `Campus DID API running on port 3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Expected: `VITE v5.0.x ready in XXX ms` and accessible at http://localhost:5173

## Environment Variables

| Variable | Backend | Frontend | Description |
|----------|---------|----------|-------------|
| PORT | [OK] | [NO] | Backend server port (default: 3001) |
| VITE_BACKEND_URL | [NO] | [OK] | Backend API base URL |
| VITE_ALGOD_URL | [OK] | [OK] | Algorand node RPC endpoint |
| VITE_INDEXER_URL | [OK] | [OK] | Algorand indexer endpoint |
| VITE_APP_ID | [NO] | [OK] | Deployed contract App ID |
| PINATA_API_KEY | [OK] | [NO] | Pinata IPFS API key |
| PINATA_SECRET_KEY | [OK] | [NO] | Pinata IPFS secret key |
| UNIVERSITY_MNEMONIC | [OK] | [NO] | 25-word mnemonic for university wallet |

## Smart Contract Deployment

The DID Registry contract is deployed to Algorand TestNet during the setup phase:

```bash
cd contracts
python deploy.py
```

This creates:
- Smart contract on chain
- Saves App ID to `deployed_app_id.txt`
- Ready to accept DID registrations and credential issuances

**Contract Methods:**
- `register_did(did_document_hash, display_name)` → Returns DID string
- `issue_credential(student_address, credential_type, credential_hash, expiry)` → Issues credential
- `verify_credential(student_address, credential_type)` → Returns credential hash or status
- `get_did(wallet_address)` → Returns DID document hash

## Running the App

### Application Overview

Campus DID provides three distinct dashboards based on user role. Access the main interface at http://localhost:5173 and select your role.

### 🎓 Student Dashboard

**What you can do**:
- Register your decentralized identity (DID)
- View all your credentials as visual cards
- Create selective disclosure presentations
- Share specific credentials with services
- Track verification history
- Revoke shared presentations

**Getting started**:
1. Click "Student" on the landing page
2. Connect your Pera Wallet
3. Click "Register Identity" to create your DID
4. Wait for credentials to be issued by admins
5. View credentials in your dashboard

### 🛡️ Admin Dashboard

**What you can do**:
- Issue verifiable credentials to students
- Support multiple credential types:
  - 📚 Student Enrolled
  - 📖 Library Access
  - 🏠 Hostel Resident
  - 🎫 Event Pass
- Track issued credentials
- Monitor issuance statistics

**Getting started**:
1. Click "Admin" on the landing page
2. Connect your admin wallet
3. Enter student's wallet address
4. Select credential type
5. Click "Issue Credential"

### 💼 Service Dashboard

**What you can do**:
- Register your service (library, employer, hostel, events)
- Verify student presentations
- View trust scores (0-100)
- Access verification history and analytics
- Track verification statistics

**Getting started**:
1. Click "Service" on the landing page
2. Connect your service wallet
3. Register your service (one-time setup)
4. Request presentation ID from student
5. Verify and receive trust score

### Complete Workflow Example

See [USER_GUIDE.md](USER_GUIDE.md) for detailed step-by-step workflows.

**Quick Demo** (5 minutes):
1. **Student**: Register identity → Receive DID
2. **Admin**: Issue "Student Enrolled" credential
3. **Student**: View credential in dashboard
4. **Student**: Create presentation with credential
5. **Service**: Register service
6. **Service**: Verify presentation → Get trust score

## Key Features

### Identity Management
- ✅ **W3C DID Creation** - Standards-compliant decentralized identifiers
- ✅ **On-Chain Registration** - DIDs anchored on Algorand blockchain
- ✅ **IPFS Storage** - DID documents stored on decentralized storage
- ✅ **Wallet Integration** - Seamless Pera Wallet integration

### Credential System
- ✅ **NFT Credentials** - Credentials issued as Algorand NFTs
- ✅ **W3C Verifiable Credentials** - Standards-compliant format
- ✅ **Multiple Types** - Support for diverse credential categories
- ✅ **Cryptographic Proofs** - Ed25519 signatures for authenticity
- ✅ **Expiration Handling** - Automatic validity period management

### Selective Disclosure
- ✅ **Privacy-First** - Share only necessary credentials
- ✅ **Verifiable Presentations** - W3C VP standard compliance
- ✅ **Presentation Control** - Students fully control what they share
- ✅ **Revocation** - Instant presentation revocation capability
- ✅ **Audit Trail** - Complete history of shared presentations

### Service Verification
- ✅ **Trust Scoring** - Mathematical 0-100 trust score system
- ✅ **Multi-Factor Verification** - 5 independent validation checks
- ✅ **Service Profiles** - Registered service management
- ✅ **Verification History** - Complete audit trail
- ✅ **Analytics Dashboard** - Statistics and metrics

### UI/UX
- ✅ **Role-Based Navigation** - Automatic routing by user role
- ✅ **Protected Routes** - Security guards on sensitive pages
- ✅ **Responsive Design** - Works on desktop, tablet, mobile
- ✅ **Smooth Animations** - Professional transitions and effects
- ✅ **Error Boundaries** - Graceful error handling
- ✅ **Loading States** - Clear feedback on async operations
- ✅ **Toast Notifications** - Real-time user feedback

## API Reference

For complete API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

**Quick Reference**:

### DID Endpoints
- `POST /api/did/create` - Create new DID
- `POST /api/did/register` - Register DID on-chain
- `GET /api/did/:address` - Resolve DID document

### Credential Endpoints
- `POST /api/credentials/issue` - Issue credential NFT
- `GET /api/credentials/:address` - Get student credentials
- `GET /api/credentials/details/:id` - Get credential details
- `POST /api/credentials/verify` - Verify credential

### Presentation Endpoints
- `POST /api/presentations/create` - Create selective disclosure
- `POST /api/presentations/verify` - Verify presentation
- `GET /api/presentations/:wallet` - List presentations
- `POST /api/presentations/:id/revoke` - Revoke presentation

### Service Endpoints
- `POST /api/services/register` - Register service
- `GET /api/services/:id` - Get service profile
- `POST /api/services/:id/verify` - Verify presentation (with trust score)
- `GET /api/services/:id/verifications` - List verifications
- `GET /api/services/student/:did` - Student verification history

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for request/response formats and examples.

## Testing

For comprehensive testing guide, see [TESTING.md](TESTING.md).

### Quick Test Checklist

**Before Testing**:
- [ ] Backend running on port 3001
- [ ] Frontend running on port 5173  
- [ ] Pera Wallet installed and configured
- [ ] Test ALGO in wallet

**Core Functionality**:
- [ ] Student can register DID
- [ ] Admin can issue all 4 credential types
- [ ] Student can view credentials
- [ ] Student can create presentations
- [ ] Student can revoke presentations
- [ ] Service can register
- [ ] Service can verify presentations with trust scores
- [ ] All navigation links work
- [ ] Role switching works correctly

**API Testing**:
```bash
# Health check
curl http://localhost:3001/health

# Create DID
curl -X POST http://localhost:3001/api/did/create \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "YOUR_WALLET", "name": "Test", "publicKey": "KEY"}'

# Get credentials
curl http://localhost:3001/api/credentials/YOUR_WALLET
```

See [TESTING.md](TESTING.md) for complete test scenarios, integration tests, and performance testing.

## Troubleshooting

### Common Issues

**Backend won't start**:
```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001  # Windows
lsof -i :3001  # Mac/Linux

# Kill process if needed
# Then restart: npm start
```

**Frontend build errors**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Wallet connection issues**:
- Ensure Pera Wallet extension is installed
- Switch wallet to Algorand TestNet
- Clear browser cache and reconnect
- Check console for detailed errors

**"DID not found" error**:
- Verify wallet address is correct
- Ensure DID was registered successfully
- Check backend logs for errors
- Verify smart contract App ID is correct

**Credential not showing**:
- Wait 5-10 seconds after issuance
- Refresh the page
- Check if NFT was minted (AlgoExplorer)
- Verify correct wallet address was used

**Service verification fails**:
- Ensure presentation ID is correct
- Check if presentation was revoked
- Verify credentials haven't expired
- Review trust score breakdown for details

### Debugging Tips

**Enable verbose logging**:
```javascript
// In backend server.js, add:
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.body)
  next()
})
```

**Check browser console**:
- Open DevTools (F12)
- Look for errors in Console tab
- Check Network tab for failed requests
- Review Response data

**Test Algorand connectivity**:
```bash
# Test node connection
curl https://testnet-api.algonode.cloud/v2/status

# Check account balance
curl https://testnet-api.algonode.cloud/v2/accounts/YOUR_ADDRESS
```

**Verify smart contract**:
- Check App ID on [AlgoExplorer TestNet](https://testnet.algoexplorer.io)
- Verify contract is active
- Check transaction history

For more troubleshooting, see:
- [TESTING.md](TESTING.md) - Test scenarios and debugging
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production issues
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API error codes

## Deployment

For production deployment, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Production Checklist

Before deploying to production:
- [ ] Deploy smart contract to Algorand MainNet
- [ ] Update all environment variables for MainNet
- [ ] Configure production backend server (PM2 recommended)
- [ ] Build and deploy frontend (Nginx + SSL)
- [ ] Setup firewall and security measures
- [ ] Configure rate limiting
- [ ] Implement authentication and authorization
- [ ] Setup monitoring and logging
- [ ] Configure backups
- [ ] Test all functionality on MainNet
- [ ] Perform security audit

**Quick Production Setup**:
1. Deploy contract to MainNet → Get App ID
2. Update `.env` files with MainNet values
3. Setup PM2 for backend process management
4. Configure Nginx as reverse proxy
5. Install SSL certificates (Let's Encrypt)
6. Enable firewall (UFW)
7. Setup monitoring (PM2 Plus or similar)

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete step-by-step production deployment guide.

## Performance Metrics

Expected performance on standard hardware:
- **Page Load**: < 1 second
- **DID Registration**: 3-5 seconds (blockchain confirmation)
- **Credential Issuance**: 5-7 seconds (NFT minting + IPFS)
- **Credential Fetch**: < 500ms
- **Presentation Creation**: < 300ms 
- **Presentation Verification**: < 500ms
- **IPFS Upload**: 2-3 seconds

## Security Considerations

⚠️ **This is an MVP for demonstration purposes**

### Current Security Measures
- ✅ Input validation on all endpoints
- ✅ CORS configuration
- ✅ Helmet.js security headers
- ✅ Environment variable isolation
- ✅ Ed25519 cryptographic signatures
- ✅ Blockchain immutability

### Production Security Requirements
- ⚠️ **Never commit mnemonics or private keys to version control**
- ⚠️ **Always use environment variables for secrets**
- ⚠️ **Implement JWT authentication**
- ⚠️ **Add role-based access control (RBAC)**
- ⚠️ **Use HTTPS only in production**
- ⚠️ **Implement rate limiting**
- ⚠️ **Add request validation middleware**
- ⚠️ **Setup WAF (Web Application Firewall)**
- ⚠️ **Regular security audits**
- ⚠️ **Implement API key authentication for services**
- ⚠️ **Setup intrusion detection**
- ⚠️ **Use secure session management**

### Best Practices
1. **Key Management**: Use hardware wallets or key management systems
2. **Database**: Implement PostgreSQL with encryption at rest
3. **Logging**: Log all security events without exposing sensitive data
4. **Monitoring**: Setup alerts for suspicious activities
5. **Backups**: Regular encrypted backups with tested recovery procedures
6. **Updates**: Keep all dependencies updated
7. **Audit Trail**: Maintain immutable audit logs

## Project Structure

```
campus-did/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── CredentialCard.jsx
│   │   │   ├── SelectiveDisclosure.jsx
│   │   │   ├── RoleSwitcher.jsx
│   │   │   ├── WalletConnect.jsx
│   │   │   └── VerifyPanel.jsx
│   │   ├── context/         # React context providers
│   │   │   ├── WalletContext.jsx
│   │   │   └── RoleContext.jsx
│   │   ├── pages/           # Main page components
│   │   │   ├── Landing.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── ServiceDashboard.jsx
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main app component
│   │   └── index.css        # Global styles
│   ├── .env.example         # Frontend environment variables template
│   └── package.json
├── backend/                 # Node.js + Express backend
│   ├── routes/              # API route handlers
│   │   ├── did.js          # DID management endpoints
│   │   ├── credentials.js  # Credential issuance endpoints
│   │   ├── verify.js       # Credential verification
│   │   └── services.js     # Service verification endpoints
│   ├── algorand/           # Algorand blockchain utilities
│   │   ├── createDID.js
│   │   ├── issueNFT.js
│   │   └── verifyCredential.js
│   ├── utils/              # Backend utilities
│   │   ├── crypto.js       # Cryptographic operations
│   │   ├── ipfs.js         # IPFS integration
│   │   ├── credentialBuilder.js
│   │   ├── presentationBuilder.js
│   │   └── verificationBuilder.js
│   ├── server.js           # Express server setup
│   ├── .env.example        # Backend environment variables template
│   └── package.json
├── contracts/              # Smart contracts
│   ├── did_registry.py     # Algorand smart contract
│   ├── deploy_corrected.py # Deployment script
│   └── requirements.txt
├── API_DOCUMENTATION.md    # Complete API reference
├── DEPLOYMENT.md          # Production deployment guide
├── TESTING.md             # Testing guide and scenarios
├── USER_GUIDE.md          # User documentation for all roles
├── PROGRESS.md            # Development progress tracker
└── README.md              # This file
```

## Technology Stack

### Frontend
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **Styling**: Tailwind CSS 3.4.0
- **Routing**: React Router DOM 6.20.1
- **Wallet**: @perawallet/connect 1.3.2
- **Blockchain**: algosdk 2.7.0
- **Icons**: lucide-react 0.303.0
- **Notifications**: react-hot-toast 2.4.1

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18.2
- **Blockchain**: algosdk 2.7.0
- **IPFS**: @pinata/sdk
- **Security**: helmet 7.1.0, cors 2.8.5
- **Utilities**: uuid, nanoid

### Smart Contracts
- **Language**: Algorand Python (algopy)
- **Network**: Algorand TestNet/MainNet
- **Standards**: ARC-52 (DID Method), ARC-69 (NFT)

### Standards Compliance
- **W3C DID Core** v1.0
- **W3C Verifiable Credentials** Data Model 1.1
- **W3C Verifiable Presentations**
- **ARC-52** Algorand DID Method
- **ARC-69** Algorand NFT Standard

## Performance Metrics

## Security Considerations

⚠️ **Never store mnemonics in .env files in production**
⚠️ **Always use environment variables for secrets**
⚠️ **Validate all inputs server-side**
⚠️ **Use HTTPS in production**
⚠️ **Implement rate limiting on API endpoints**

## Future Enhancements

### Planned Features (v2.0)
- [ ] **Authentication**: JWT-based auth with role management
- [ ] **Database**: PostgreSQL for persistent storage
- [ ] **Caching**: Redis for performance optimization
- [ ] **Revocation Registry**: BBS+ signatures for privacy-preserving revocation
- [ ] **Zero-Knowledge Proofs**: Advanced privacy features
- [ ] **Multi-Signature**: Require multiple approvers for credentials
- [ ] **Credential Templates**: Customizable credential schemas
- [ ] **Mobile App**: React Native mobile application
- [ ] **Analytics**: Dashboard for system-wide insights
- [ ] **Notifications**: Email/SMS for important events
- [ ] **API Keys**: Service authentication system
- [ ] **Webhooks**: Real-time event notifications
- [ ] **Batch Operations**: Issue multiple credentials at once
- [ ] **Export/Import**: Backup and restore functionality
- [ ] **Internationalization**: Multi-language support

### Advanced Features (v3.0+)
- [ ] AI-powered fraud detection
- [ ] Biometric verification integration
- [ ] Cross-chain compatibility
- [ ] Decentralized governance
- [ ] Compliance certifications (GDPR, etc.)

## Contributing

This is an MVP demonstration project. To contribute:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Ensure all tests pass

### Before Production Use
1. **Security Audit**: Conduct comprehensive security review
2. **Performance Testing**: Load test all endpoints
3. **Code Review**: Peer review all changes
4. **Compliance Check**: Ensure regulatory compliance
5. **Documentation**: Complete all API and user docs
6. **Monitoring**: Setup error tracking and analytics
7. **Backup Strategy**: Implement reliable backup system

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Support & Resources

### Documentation
- **[USER_GUIDE.md](USER_GUIDE.md)** - How to use the system
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - API reference
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment guide
- **[TESTING.md](TESTING.md)** - Testing guide
- **[PROGRESS.md](PROGRESS.md)** - Development status

### External Resources
- **Algorand**: https://developer.algorand.org
- **W3C DID Core**: https://www.w3.org/TR/did-core/
- **W3C VC Data Model**: https://www.w3.org/TR/vc-data-model/
- **Pera Wallet**: https://perawallet.app
- **TestNet Dispenser**: https://dispenser.testnet.aws.algodev.network/

### Getting Help
- Review the documentation above
- Check [TESTING.md](TESTING.md) for troubleshooting
- Inspect browser console for errors
- Check backend logs for API issues
- Test with TestNet dispenser ALGO

---

**Built with ❤️ for the Algorand ecosystem**

**Campus DID MVP v1.0** • W3C Standards Compliant • Privacy-First • Decentralized

**Status**: ✅ Complete (10/10 features) • Ready for Testing • Production-Ready Architecture