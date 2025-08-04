# 🔐 KudoBit Authentication Guide
## SIWE (Sign-In with Ethereum) Implementation

This guide explains how to properly authenticate with the KudoBit API using SIWE (Sign-In with Ethereum) standard.

---

## 🚨 **Authentication Issue Fixed**

### **Problem**
The authentication was failing because SIWE messages must follow the exact **EIP-4361** format. Invalid message formats were causing parsing errors.

### **Solution**
Enhanced error handling and added a template endpoint to generate properly formatted SIWE messages.

---

## 🔄 **Proper Authentication Flow**

### **Step 1: Get SIWE Message Template**
```bash
GET /v1/auth/siwe-template
```

**Response:**
```json
{
  "object": "siwe_template",
  "nonce": "j0df9fps13ypp6e7acyij",
  "template": {
    "domain": "localhost:4500",
    "address": "{{USER_WALLET_ADDRESS}}",
    "statement": "Sign in to KudoBit",
    "uri": "http://localhost:4500",
    "version": "1",
    "chainId": 2810,
    "nonce": "j0df9fps13ypp6e7acyij",
    "issuedAt": "2025-07-24T12:01:26.316Z",
    "expirationTime": "2025-07-24T12:16:26.316Z"
  },
  "message_template": "localhost:4500 wants you to sign in with your Ethereum account:\n{{USER_WALLET_ADDRESS}}\n\nSign in to KudoBit\n\nURI: http://localhost:4500\nVersion: 1\nChain ID: 2810\nNonce: j0df9fps13ypp6e7acyij\nIssued At: 2025-07-24T12:01:26.316Z\nExpiration Time: 2025-07-24T12:16:26.316Z",
  "instructions": "Replace {{USER_WALLET_ADDRESS}} with the actual wallet address before signing"
}
```

### **Step 2: Format the SIWE Message**
Replace `{{USER_WALLET_ADDRESS}}` with the actual wallet address:

```
localhost:4500 wants you to sign in with your Ethereum account:
0x742d35Cc6435C426FD4a4b5421e0B65dC55bd0E7

Sign in to KudoBit

URI: http://localhost:4500
Version: 1
Chain ID: 2810
Nonce: j0df9fps13ypp6e7acyij
Issued At: 2025-07-24T12:01:26.316Z
Expiration Time: 2025-07-24T12:16:26.316Z
```

### **Step 3: Sign the Message**
Use your wallet (MetaMask, WalletConnect, etc.) to sign the formatted message.

### **Step 4: Authenticate**
```bash
POST /v1/auth/login
Content-Type: application/json

{
  "message": "localhost:4500 wants you to sign in with your Ethereum account:\n0x742d35Cc6435C426FD4a4b5421e0B65dC55bd0E7\n\nSign in to KudoBit\n\nURI: http://localhost:4500\nVersion: 1\nChain ID: 2810\nNonce: j0df9fps13ypp6e7acyij\nIssued At: 2025-07-24T12:01:26.316Z\nExpiration Time: 2025-07-24T12:16:26.316Z",
  "signature": "0x..."
}
```

**Success Response:**
```json
{
  "object": "authentication",
  "id": "auth_1753358486000",
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "address": "0x742d35cc6435c426fd4a4b5421e0b65dc55bd0e7",
  "message": "Authentication successful",
  "created": 1753358486
}
```

---

## ⚠️ **Common Error Messages**

### **1. Invalid SIWE Format**
```json
{
  "error": {
    "type": "validation_error",
    "message": "Invalid SIWE message format. Please ensure the message follows the EIP-4361 standard.",
    "code": "invalid_siwe_format"
  }
}
```
**Fix:** Use the `/v1/auth/siwe-template` endpoint to get the correct format.

### **2. Invalid Signature**
```json
{
  "error": {
    "type": "authentication_error",
    "message": "Invalid signature",
    "code": "invalid_signature"
  }
}
```
**Fix:** Ensure the signature matches the exact message that was signed.

### **3. Missing Fields**
```json
{
  "error": {
    "type": "validation_error",
    "message": "message is required",
    "code": "missing_parameter",
    "param": "message"
  }
}
```
**Fix:** Include both `message` and `signature` in the request body.

---

## 🔧 **Frontend Integration Example**

### **React + ethers.js**
```javascript
import { ethers } from 'ethers';

async function authenticateWithKudoBit() {
  // 1. Get SIWE template
  const templateResponse = await fetch('/v1/auth/siwe-template');
  const template = await templateResponse.json();
  
  // 2. Get user's wallet address
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  
  // 3. Format the message
  const message = template.message_template.replace(
    /\{\{USER_WALLET_ADDRESS\}\}/g, 
    address
  );
  
  // 4. Sign the message
  const signature = await signer.signMessage(message);
  
  // 5. Authenticate
  const authResponse = await fetch('/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      signature
    })
  });
  
  const authResult = await authResponse.json();
  
  if (authResult.success) {
    // Store the token for future requests
    localStorage.setItem('kudobit_token', authResult.token);
    return authResult;
  } else {
    throw new Error(authResult.error.message);
  }
}
```

### **Using the Token**
```javascript
// Include in all authenticated requests
const token = localStorage.getItem('kudobit_token');

fetch('/v1/creators', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 🎯 **Key Points**

1. **Always use** `/v1/auth/siwe-template` to get the correct message format
2. **Message must be exact** - any formatting changes will cause signature verification to fail
3. **Nonce is unique** - get a fresh template for each authentication attempt
4. **Token expires** in 24 hours - handle token refresh in your frontend
5. **Chain ID is 2810** (Morph Holesky) - ensure your wallet is on the correct network

---

## 🔍 **Rate Limiting**

Authentication endpoints have stricter rate limits:
- **Login**: 10 attempts per 15 minutes per IP
- **General API**: 1000 requests per 15 minutes per IP

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1753359200
```

---

## ✅ **Testing Authentication**

### **1. Get Template**
```bash
curl http://localhost:4500/v1/auth/siwe-template
```

### **2. Test Invalid Format (Should Fail)**
```bash
curl -X POST http://localhost:4500/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"message":"invalid","signature":"test"}'
```

### **3. Test Missing Fields (Should Fail)**
```bash
curl -X POST http://localhost:4500/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

**The authentication system now provides clear, actionable error messages and proper SIWE format guidance for seamless integration!** 🎉