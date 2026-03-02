# Campus DID - API Documentation

Complete API reference for the Campus DID system.

**Base URL**: `http://localhost:3001/api`

---

## Table of Contents
1. [DID Endpoints](#did-endpoints)
2. [Credential Endpoints](#credential-endpoints)
3. [Presentation Endpoints](#presentation-endpoints)
4. [Service Endpoints](#service-endpoints)
5. [Verification Endpoints](#verification-endpoints)
6. [Error Responses](#error-responses)

---

## DID Endpoints

### Create DID
Create a new decentralized identifier for a student.

**Endpoint**: `POST /did/create`

**Request Body**:
```json
{
  "walletAddress": "GTSZHH4VGF7ZHTY2TR5KZQ3TWECELNV7HLMXTZ2OXYB5BLM23CSXHM74EY",
  "name": "Alice Johnson",
  "publicKey": "GTSZHH4VGF7ZHTY2TR5KZQ3TWECELNV7HLMXTZ2OXYB5BLM23CSXHM74EY"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "did": "did:algo:testnet:GTSZHH4VGF7ZHTY2TR5KZQ3TWECELNV7HLMXTZ2OXYB5BLM23CSXHM74EY",
    "didDocument": {
      "@context": ["https://www.w3.org/ns/did/v1"],
      "id": "did:algo:testnet:GTSZHH4VGF7ZHTY2TR5KZQ3TWECELNV7HLMXTZ2OXYB5BLM23CSXHM74EY",
      "verificationMethod": [{
        "id": "did:algo:testnet:...#key-1",
        "type": "Ed25519VerificationKey2020",
        "controller": "did:algo:testnet:...",
        "publicKeyMultibase": "..."
      }],
      "authentication": ["did:algo:testnet:...#key-1"],
      "created": "2026-03-02T10:30:00Z"
    }
  }
}
```

---

### Register DID On-Chain
Register a DID on the Algorand blockchain.

**Endpoint**: `POST /did/register`

**Request Body**:
```json
{
  "studentDID": "did:algo:testnet:GTSZHH4VGF7ZHTY2TR5KZQ3TWECELNV7HLMXTZ2OXYB5BLM23CSXHM74EY",
  "studentWallet": "GTSZHH4VGF7ZHTY2TR5KZQ3TWECELNV7HLMXTZ2OXYB5BLM23CSXHM74EY",
  "name": "Alice Johnson"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "txId": "TXID123...",
    "appId": 756415000,
    "message": "DID registered on-chain successfully"
  }
}
```

---

### Resolve DID
Retrieve a DID document for a given wallet address.

**Endpoint**: `GET /did/:walletAddress`

**URL Parameters**:
- `walletAddress` - Algorand wallet address

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "@context": ["https://www.w3.org/ns/did/v1"],
    "id": "did:algo:testnet:GTSZHH4VGF7ZHTY2TR5KZQ3TWECELNV7HLMXTZ2OXYB5BLM23CSXHM74EY",
    "verificationMethod": [...],
    "authentication": [...],
    "created": "2026-03-02T10:30:00Z"
  }
}
```

**Response** (404 Not Found):
```json
{
  "success": false,
  "message": "DID not found"
}
```

---

## Credential Endpoints

### Issue Credential
Issue a verifiable credential as an NFT to a student.

**Endpoint**: `POST /credentials/issue`

**Request Body**:
```json
{
  "studentAddress": "GTSZHH4VGF7ZHTY2TR5KZQ3TWECELNV7HLMXTZ2OXYB5BLM23CSXHM74EY",
  "credentialType": "STUDENT_ENROLLED",
  "issuerAddress": "ISSUER_WALLET_ADDRESS"
}
```

**Credential Types**:
- `STUDENT_ENROLLED` - 📚 Student Enrolled
- `LIBRARY_ACCESS` - 📖 Library Access
- `HOSTEL_RESIDENT` - 🏠 Hostel Resident
- `EVENT_PASS` - 🎫 Event Pass

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "credentialId": "urn:uuid:abc123...",
    "assetId": 123456789,
    "txId": "TXID...",
    "credential": {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      "type": ["VerifiableCredential"],
      "id": "urn:uuid:abc123...",
      "issuer": "did:algo:testnet:ISSUER...",
      "issuanceDate": "2026-03-02T10:30:00Z",
      "expirationDate": "2027-03-02T10:30:00Z",
      "credentialSubject": {
        "id": "did:algo:testnet:STUDENT...",
        "credentialType": "STUDENT_ENROLLED"
      },
      "proof": {
        "type": "Ed25519Signature2020",
        "created": "2026-03-02T10:30:00Z",
        "verificationMethod": "did:algo:testnet:ISSUER...#key-1",
        "proofPurpose": "assertionMethod",
        "signature": "base64encodedSignature..."
      }
    },
    "ipfsHash": "Qm..."
  }
}
```

---

### Get Student Credentials
Retrieve all credentials for a student wallet.

**Endpoint**: `GET /credentials/:walletAddress`

**URL Parameters**:
- `walletAddress` - Student's Algorand wallet address

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "credentialId": "urn:uuid:abc123...",
      "credentialType": "STUDENT_ENROLLED",
      "issuerDID": "did:algo:testnet:ISSUER...",
      "issuedAt": "2026-03-02T10:30:00Z",
      "expiresAt": "2027-03-02T10:30:00Z",
      "assetId": 123456789,
      "ipfsHash": "Qm..."
    },
    ...
  ]
}
```

---

### Get Credential Details
Retrieve full details of a specific credential.

**Endpoint**: `GET /credentials/details/:credentialId`

**URL Parameters**:
- `credentialId` - Credential ID (e.g., `urn:uuid:abc123...`)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "type": ["VerifiableCredential"],
    "id": "urn:uuid:abc123...",
    "issuer": "did:algo:testnet:ISSUER...",
    "issuanceDate": "2026-03-02T10:30:00Z",
    "expirationDate": "2027-03-02T10:30:00Z",
    "credentialSubject": {...},
    "proof": {...}
  }
}
```

---

### Verify Credential
Verify the authenticity and validity of a credential.

**Endpoint**: `POST /credentials/verify`

**Request Body**:
```json
{
  "credentialId": "urn:uuid:abc123..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "checks": {
      "structureValid": true,
      "signatureValid": true,
      "notExpired": true,
      "notRevoked": true
    },
    "credentialType": "STUDENT_ENROLLED",
    "issuer": "did:algo:testnet:ISSUER...",
    "subject": "did:algo:testnet:STUDENT...",
    "issuedAt": "2026-03-02T10:30:00Z",
    "expiresAt": "2027-03-02T10:30:00Z"
  }
}
```

---

## Presentation Endpoints

### Create Presentation
Create a selective disclosure presentation from selected credentials.

**Endpoint**: `POST /presentations/create`

**Request Body**:
```json
{
  "holderDID": "did:algo:testnet:STUDENT...",
  "credentialIds": [
    "urn:uuid:credential1...",
    "urn:uuid:credential2..."
  ],
  "purpose": "Employment Verification",
  "recipientDID": "did:algo:testnet:EMPLOYER..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "presentationId": "pres_abc123...",
    "presentation": {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      "type": ["VerifiablePresentation"],
      "id": "pres_abc123...",
      "holder": "did:algo:testnet:STUDENT...",
      "verifiableCredential": [...],
      "proof": {
        "type": "Ed25519Signature2020",
        "created": "2026-03-02T10:30:00Z",
        "verificationMethod": "did:algo:testnet:STUDENT...#key-1",
        "proofPurpose": "authentication",
        "challenge": "random-nonce",
        "signature": "base64encodedSignature..."
      }
    },
    "createdAt": "2026-03-02T10:30:00Z",
    "status": "active"
  }
}
```

---

### Verify Presentation
Verify a presentation and its included credentials.

**Endpoint**: `POST /presentations/verify`

**Request Body**:
```json
{
  "presentationId": "pres_abc123..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "presentationId": "pres_abc123...",
    "holderDID": "did:algo:testnet:STUDENT...",
    "checks": {
      "structureValid": true,
      "signatureValid": true,
      "notExpired": true,
      "notRevoked": true,
      "credentialsValid": true
    },
    "credentials": [
      {
        "credentialId": "urn:uuid:...",
        "type": "STUDENT_ENROLLED",
        "isValid": true
      }
    ],
    "createdAt": "2026-03-02T10:30:00Z"
  }
}
```

---

### Get Student Presentations
Retrieve all presentations created by a student.

**Endpoint**: `GET /presentations/:studentWallet`

**URL Parameters**:
- `studentWallet` - Student's Algorand wallet address

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "presentationId": "pres_abc123...",
      "purpose": "Employment Verification",
      "credentialCount": 2,
      "recipientDID": "did:algo:testnet:EMPLOYER...",
      "status": "active",
      "createdAt": "2026-03-02T10:30:00Z"
    },
    ...
  ]
}
```

---

### Revoke Presentation
Revoke a presentation, making it invalid for future use.

**Endpoint**: `POST /presentations/:presentationId/revoke`

**URL Parameters**:
- `presentationId` - ID of the presentation to revoke

**Request Body**:
```json
{
  "reason": "No longer needed"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Presentation revoked successfully",
  "presentationId": "pres_abc123...",
  "revokedAt": "2026-03-02T11:00:00Z"
}
```

---

## Service Endpoints

### Register Service
Register a new service for credential verification.

**Endpoint**: `POST /services/register`

**Request Body**:
```json
{
  "serviceName": "Campus Library",
  "serviceType": "library",
  "contactEmail": "library@university.edu",
  "verificationPublicKey": "optional-public-key"
}
```

**Service Types**:
- `employer` - Employer/Recruiter
- `library` - Campus Library
- `hostel` - Campus Hostel
- `events` - Campus Events
- `other` - Other Services

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "serviceId": "srv_abc123...",
    "serviceName": "Campus Library",
    "serviceType": "library",
    "contactEmail": "library@university.edu",
    "verificationPublicKey": "...",
    "registeredAt": "2026-03-02T10:30:00Z"
  }
}
```

---

### Get Service Profile
Retrieve service profile with verification statistics.

**Endpoint**: `GET /services/:serviceId`

**URL Parameters**:
- `serviceId` - Service ID

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "profile": {
      "serviceId": "srv_abc123...",
      "serviceName": "Campus Library",
      "serviceType": "library",
      "contactEmail": "library@university.edu",
      "registeredAt": "2026-03-02T10:30:00Z"
    },
    "statistics": {
      "totalVerifications": 150,
      "validVerifications": 145,
      "failedVerifications": 5,
      "successRate": 96.67,
      "averageTrustScore": 92.5,
      "credentialStatistics": {
        "STUDENT_ENROLLED": 80,
        "LIBRARY_ACCESS": 70
      }
    },
    "recentVerifications": [
      {
        "verificationId": "ver_xyz...",
        "studentDID": "did:algo:testnet:STUDENT...",
        "credentialCount": 2,
        "isValid": true,
        "trustScore": 100,
        "performedAt": "2026-03-02T10:00:00Z"
      },
      ...
    ]
  }
}
```

---

### Verify Presentation (Service)
Verify a student's presentation and receive a trust score.

**Endpoint**: `POST /services/:serviceId/verify`

**URL Parameters**:
- `serviceId` - Service ID

**Request Body**:
```json
{
  "presentationId": "pres_abc123...",
  "studentDID": "did:algo:testnet:STUDENT...",
  "credentialIds": ["urn:uuid:cred1...", "urn:uuid:cred2..."],
  "verificationPurpose": "Library Access Verification",
  "verificationDetails": {
    "structureValid": true,
    "signatureValid": true,
    "notExpired": true,
    "notRevoked": true,
    "credentialsValid": true
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "verificationId": "ver_xyz...",
    "isValid": true,
    "trustScore": 100,
    "details": {
      "structureValid": true,
      "signatureValid": true,
      "notExpired": true,
      "notRevoked": true,
      "credentialsValid": true
    },
    "verificationRecord": {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      "id": "ver_xyz...",
      "service": {
        "id": "srv_abc123...",
        "name": "Campus Library"
      },
      "presentation": {
        "id": "pres_abc123...",
        "credentialCount": 2
      },
      "student": {
        "did": "did:algo:testnet:STUDENT..."
      },
      "verification": {
        "purpose": "Library Access Verification",
        "performedAt": "2026-03-02T10:30:00Z",
        "isValid": true,
        "details": {...}
      },
      "trustScore": 100,
      "metadata": {
        "createdAt": "2026-03-02T10:30:00Z",
        "expiresAt": "2027-03-02T10:30:00Z"
      }
    }
  }
}
```

**Trust Score Calculation** (0-100):
- Structure Valid: 20 points
- Signature Valid: 20 points
- Not Expired: 20 points
- Not Revoked: 20 points
- Credentials Valid: 20 points

---

### List Service Verifications
Retrieve all verifications performed by a service.

**Endpoint**: `GET /services/:serviceId/verifications`

**URL Parameters**:
- `serviceId` - Service ID

**Query Parameters**:
- `limit` (optional) - Number of records to return (default: 50, max: 100)
- `offset` (optional) - Pagination offset (default: 0)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "total": 150,
    "verifications": [
      {
        "verificationId": "ver_xyz...",
        "studentDID": "did:algo:testnet:STUDENT...",
        "presentationId": "pres_abc123...",
        "credentialCount": 2,
        "isValid": true,
        "trustScore": 100,
        "purpose": "Library Access",
        "performedAt": "2026-03-02T10:30:00Z",
        "isExpired": false
      },
      ...
    ]
  }
}
```

---

### Get Verification Details
Retrieve full details of a specific verification.

**Endpoint**: `GET /services/:serviceId/verify/:verificationId`

**URL Parameters**:
- `serviceId` - Service ID
- `verificationId` - Verification ID

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "verificationRecord": {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      "id": "ver_xyz...",
      "service": {...},
      "presentation": {...},
      "student": {...},
      "verification": {...},
      "trustScore": 100,
      "metadata": {...}
    },
    "details": {
      "structureValid": true,
      "signatureValid": true,
      "notExpired": true,
      "notRevoked": true,
      "credentialsValid": true
    }
  }
}
```

---

### Get Student Verification History
Retrieve verification history for a student across all services.

**Endpoint**: `GET /services/student/:studentDID`

**URL Parameters**:
- `studentDID` - Student's DID (URL-encoded)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "studentDID": "did:algo:testnet:STUDENT...",
    "totalVerifications": 25,
    "validVerifications": 24,
    "averageTrustScore": 95.5,
    "verifications": [
      {
        "verificationId": "ver_xyz...",
        "serviceId": "srv_abc123...",
        "serviceName": "Campus Library",
        "serviceType": "library",
        "presentationId": "pres_abc123...",
        "credentialCount": 2,
        "isValid": true,
        "trustScore": 100,
        "purpose": "Library Access",
        "performedAt": "2026-03-02T10:30:00Z"
      },
      ...
    ]
  }
}
```

---

## Error Responses

All endpoints follow a consistent error response format.

### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required field: studentAddress"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Database connection failed"
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented in this MVP. For production deployment, consider implementing rate limiting using middleware like `express-rate-limit`.

---

## Authentication

This MVP does not implement authentication. All endpoints are public for demonstration purposes. For production:

1. Implement JWT authentication
2. Add role-based access control (RBAC)
3. Require API keys for service endpoints
4. Use OAuth 2.0 for admin access

---

## CORS Policy

CORS is enabled for all origins in development mode. For production:

```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}))
```

---

## Headers

### Required Headers
- `Content-Type: application/json` for POST/PUT requests

### Recommended Headers
- `X-Request-ID` - Unique request identifier for tracing
- `User-Agent` - Client identification

---

## Webhooks (Future Feature)

Future versions may support webhooks for:
- Credential issuance notifications
- Presentation verification events
- Revocation alerts

---

## API Versioning

Current version: **v1** (implicit)

Future versions will use URL versioning: `/api/v2/...`

---

## Support

For API issues or questions:
- Check error messages in response
- Review server logs for debugging
- Ensure all required fields are provided
- Verify network connectivity to Algorand TestNet

---

**Last Updated**: March 2, 2026  
**API Version**: 1.0  
**Documentation Version**: 1.0
