# KudoBit Backend API

> **The Web3 Gumroad** - Digital value, instantly rewarded. Backend API with SIWE authentication, event indexing, and creator management.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev

# Start production server
npm start
```

The API will be available at `http://localhost:3001`

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [API Documentation](#-api-documentation)
- [Authentication](#-authentication)
- [Database](#-database)
- [Event Indexing](#-event-indexing)
- [Environment Variables](#-environment-variables)
- [Development](#-development)
- [File Structure](#-file-structure)

## ✨ Features

- **🔐 SIWE Authentication** - Sign-In with Ethereum using secure message signing
- **📊 Event Indexing** - Real-time blockchain event monitoring and indexing
- **👥 Creator Management** - Profile management and content creation tools
- **📈 Analytics** - Purchase tracking, revenue analytics, and user insights
- **🗄️ SQLite Database** - Lightweight, efficient data storage
- **📝 API Documentation** - Auto-generated Swagger/OpenAPI docs
- **🛡️ Security Middleware** - Rate limiting, validation, and error handling
- **📧 Email Service** - Transactional emails via Resend
- **☁️ IPFS Integration** - Decentralized content storage (temporarily disabled)

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Blockchain    │
│   (React)       │◄──►│   (Hono.js)     │◄──►│   (Hardhat)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   SQLite DB     │
                       │   + Event Index │
                       └─────────────────┘
```

### Core Components

- **Hono.js Framework** - Fast, lightweight web framework
- **SIWE Authentication** - Ethereum-native authentication
- **Event Indexer** - Monitors smart contract events
- **MVC Architecture** - Controllers, Services, Models separation
- **Middleware Stack** - Security, validation, rate limiting

## 📚 API Documentation

### Base URL
```
http://localhost:3001
```

### Core Endpoints

#### Authentication
```http
GET  /auth/nonce              # Get nonce for SIWE
POST /auth/verify             # Verify SIWE signature
POST /auth/refresh            # Refresh JWT token
GET  /auth/profile            # Get user profile
```

#### Creators (Protected)
```http
GET    /v1/creators/profile         # Get creator profile
PUT    /v1/creators/profile         # Update creator profile
GET    /v1/creators/products        # Get creator's products
GET    /v1/creators/analytics       # Get creator analytics
POST   /v1/creators/withdraw        # Withdraw earnings
```

#### Products (Protected)
```http
GET    /v1/products                 # List all products
POST   /v1/products                 # Create new product
GET    /v1/products/:id             # Get product details
PUT    /v1/products/:id             # Update product
DELETE /v1/products/:id             # Delete product
```

#### Analytics (Public)
```http
GET    /v1/analytics/overview       # Platform overview
GET    /v1/analytics/products       # Product statistics
GET    /v1/analytics/creators       # Creator statistics
```

#### Event Indexer (Protected)
```http
GET    /v1/indexer/events           # Get indexed events
GET    /v1/indexer/status           # Get indexer status
POST   /v1/indexer/sync             # Manual sync trigger
```

## 🔐 Authentication

KudoBit uses **Sign-In with Ethereum (SIWE)** for authentication:

### Flow
1. **Get Nonce**: `GET /auth/nonce`
2. **Sign Message**: Client signs SIWE message with wallet
3. **Verify**: `POST /auth/verify` with signed message
4. **JWT Token**: Receive JWT for authenticated requests

### Example SIWE Message
```
localhost:3001 wants you to sign in with your Ethereum account:
0x1234...5678

KudoBit - The Web3 Gumroad

URI: http://localhost:3001
Version: 1
Chain ID: 1337
Nonce: abc123def456
Issued At: 2024-01-01T00:00:00.000Z
```

### Protected Routes
All `/v1/creators/*`, `/v1/products/*`, and `/v1/indexer/*` routes require:
```http
Authorization: Bearer <jwt-token>
```

## 🗄️ Database

### SQLite Schema

#### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  address TEXT UNIQUE NOT NULL,
  nonce TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Creator Profiles Table
```sql
CREATE TABLE creator_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  social_links JSON,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Products Table
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id INTEGER REFERENCES users(id),
  contract_product_id INTEGER,
  name TEXT NOT NULL,
  description TEXT,
  price_usdc REAL,
  ipfs_hash TEXT,
  category TEXT,
  tags JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## ⚡ Event Indexing

The backend continuously monitors blockchain events:

### Indexed Events
- **ProductPurchased** - Track all purchases
- **LoyaltyBadgeAwarded** - Monitor badge awards
- **ProductListed** - New product listings
- **CreatorRegistered** - New creator signups

### Indexer Features
- **Real-time Monitoring** - WebSocket connection to blockchain
- **Historical Sync** - Backfill past events
- **Retry Logic** - Robust error handling
- **Performance Optimization** - Efficient batch processing

### Indexer Status
```http
GET /v1/indexer/status
```
```json
{
  "status": "running",
  "latestBlock": 19028950,
  "eventsIndexed": 1247,
  "lastSync": "2024-01-01T12:00:00Z"
}
```

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Database
DATABASE_URL=./kudobit.db

# Blockchain Configuration
RPC_URL=http://localhost:8545
CREATOR_STORE_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
LOYALTY_TOKEN_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
MOCK_USDC_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# External Services
RESEND_API_KEY=re_your_resend_api_key
PINATA_JWT=your_pinata_jwt_token

# CORS Origins
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🛠️ Development

### Scripts
```bash
npm run dev      # Development with auto-reload
npm start        # Production server
npm test         # Run tests (not implemented)
```

### Development Workflow
1. **Start Hardhat Node**: `npx hardhat node` (from root)
2. **Deploy Contracts**: `npm run dev:check` (from root)
3. **Start Backend**: `npm run dev` (from backend/)
4. **Start Frontend**: `bun run dev` (from root)

### Testing API
```bash
# Test health endpoint
curl http://localhost:3001

# Get nonce
curl http://localhost:3001/auth/nonce

# Test analytics (public)
curl http://localhost:3001/v1/analytics/overview
```

### Logging
Logs are written to:
- Console (development)
- `server.log` (production)
- `enhanced-server.log` (detailed logs)

## 📁 File Structure

```
backend/
├── 📄 README.md                    # This file
├── 📦 package.json                 # Dependencies & scripts
├── 🚀 index.js                     # Main server entry point
├── 🗄️ database-sqlite.js          # Database setup & migrations
├── ⚡ event-indexer.js             # Blockchain event indexer
│
├── 📁 controllers/                 # Request handlers
│   ├── authController.js           # Authentication logic
│   ├── creatorController.js        # Creator management
│   └── productController.js        # Product operations
│
├── 📁 services/                    # Business logic
│   ├── authService.js              # Auth utilities
│   ├── creatorService.js           # Creator operations
│   └── productService.js           # Product utilities
│
├── 📁 models/                      # Data models
│   ├── authModel.js                # User & auth models
│   ├── creatorModel.js             # Creator profile models
│   └── productModel.js             # Product models
│
├── 📁 routes/v1/                   # API route definitions
│   ├── index.js                    # Route mounting
│   ├── authRoutes.js               # Auth endpoints
│   ├── creatorRoutes.js            # Creator endpoints
│   ├── productRoutes.js            # Product endpoints
│   ├── analyticsRoutes.js          # Analytics endpoints
│   └── indexerRoutes.js            # Indexer endpoints
│
├── 📁 middleware/                  # Express middleware
│   ├── auth.js                     # JWT authentication
│   ├── rateLimit.js                # Rate limiting
│   ├── security.js                 # Security headers
│   └── validation.js               # Input validation
│
├── 📁 utils/                       # Utility functions
│   ├── errorHandler.js             # Error handling
│   ├── logger.js                   # Logging utilities
│   └── pagination.js               # Pagination helpers
│
├── 📁 docs/                        # Documentation
│   └── swagger.js                  # API documentation
│
└── 📁 data/                        # Data storage
    ├── kudobit.db                  # SQLite database
    ├── server.log                  # Application logs
    └── enhanced-server.log         # Detailed logs
```

## 🔧 Configuration Files

### Core Configuration
- `package.json` - Dependencies and scripts
- `.env` - Environment variables
- `database-sqlite.js` - Database schema and migrations

### Feature Configuration
- `event-indexer.js` - Blockchain monitoring setup
- `docs/swagger.js` - API documentation config
- `middleware/` - Security and validation rules

## 🚦 Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

### Error Response Format
```json
{
  "error": {
    "code": "INVALID_SIGNATURE",
    "message": "SIWE signature verification failed",
    "details": {
      "address": "0x1234...5678",
      "timestamp": "2024-01-01T12:00:00Z"
    }
  }
}
```

---

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

Built with ❤️ for the Web3 creator economy.