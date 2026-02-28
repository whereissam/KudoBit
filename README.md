# KudoBit

**Digital Value, Instantly Rewarded**

KudoBit is a comprehensive decentralized commerce platform that enables creators to sell digital products with blockchain-powered payments, automated loyalty rewards, and community governance. Built as a Web3 alternative to traditional e-commerce platforms, it combines the familiar user experience of modern web applications with the transparency and ownership benefits of blockchain technology.

![Platform](https://img.shields.io/badge/Platform-Web3_Commerce-blue)
![Stack](https://img.shields.io/badge/Stack-React_Node_Solidity-green)
![Status](https://img.shields.io/badge/Status-Production_Ready-success)

## Overview

KudoBit provides a complete ecosystem for digital commerce, featuring a React-based frontend, Node.js backend API, and Solidity smart contracts. The platform supports product creation, secure transactions via USDC, automated loyalty NFT distribution, and decentralized governance through a DAO structure.

### Key Capabilities

**E-Commerce Foundation**
- Digital product management and secure file delivery
- Blockchain-powered transactions with USDC payments
- Purchase history and transaction tracking
- Protected content access control

**Creator Economy**
- Comprehensive creator profiles with verification
- Real-time analytics and performance dashboards
- KYC integration for regulatory compliance
- Transparent revenue management and payouts

**Community & Governance**
- DAO-based platform governance with proposal systems
- Community forums with threaded discussions
- Real-time messaging via WebSocket connections
- Collaborative product creation with revenue sharing

**Advanced Features**
- ERC-1155 loyalty badge system for customer rewards
- Product wishlist and recommendation engine
- Community-driven reviews and rating system
- Affiliate program with referral tracking
- Multi-chain deployment across EVM networks

## Architecture

The platform follows a three-tier architecture design:

```
Frontend (React + TypeScript)
├── TanStack Router for type-safe navigation
├── TailwindCSS + shadcn/ui for design system
├── Wagmi v2 + Viem for Web3 integration
└── TanStack Query + Zustand for state management

Backend (Node.js + Hono)
├── RESTful API with 40+ endpoints
├── JWT authentication with SIWE integration
├── SQLite/PostgreSQL database with 13 tables
├── WebSocket support for real-time features
└── IPFS integration for decentralized storage

Smart Contracts (Solidity + Hardhat)
├── ERC-20 token integration (USDC payments)
├── ERC-1155 loyalty token system
├── Marketplace and governance contracts
└── Multi-chain deployment support
```

## Technology Stack

**Frontend Technologies**
- React 18 with TypeScript for type safety
- TanStack Router for file-based routing
- TailwindCSS with shadcn/ui components
- Wagmi v2 and Viem for Ethereum integration
- Vite for development and build optimization

**Backend Technologies**
- Node.js with Hono framework for performance
- JWT authentication with SIWE (Sign-In with Ethereum)
- SQLite for development, PostgreSQL for production
- WebSocket connections for real-time features
- IPFS integration via Pinata for file storage

**Blockchain Technologies**
- Solidity smart contracts with OpenZeppelin standards
- Hardhat development framework with comprehensive testing
- Multi-chain deployment across 6+ EVM networks
- Event indexing for blockchain data synchronization

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git for version control
- MetaMask or compatible Web3 wallet

### Installation

Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd kudobit
npm install
```

### Development Setup

Start the backend server:
```bash
cd backend
npm install
npm start
```
The API will be available at `http://localhost:5000`

Start the frontend development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### Smart Contract Deployment

Compile and deploy contracts to testnet:
```bash
cd blockchain
npm install
npm run compile
npm run deploy:testnet
```

## API Documentation

The backend provides a comprehensive RESTful API with the following endpoint categories:

**Authentication & Users**
- `/auth/*` - SIWE authentication and session management
- `/creators/*` - Creator profile management and verification

**Commerce Operations**  
- `/products/*` - Product CRUD operations and metadata
- `/purchases/*` - Transaction history and tracking
- `/wishlist/*` - User wishlist management

**Community Features**
- `/forum/*` - Community discussions and posts
- `/reviews/*` - Product ratings and feedback
- `/collaborative/*` - Multi-creator product management

**Platform Management**
- `/dao/*` - Governance proposals and voting
- `/analytics/*` - Platform and creator metrics
- WebSocket `/ws` - Real-time messaging and notifications

## Database Schema

The platform uses a relational database with 13 core tables supporting:

- User management (creators, sessions, profiles)
- Commerce operations (products, purchases, reviews)
- Community features (forum posts, replies, wishlist)
- Governance systems (proposals, votes, treasury)
- Business logic (collaborative products, affiliate programs)

## Development Commands

**Frontend Development**
```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run preview      # Preview production build
npm run type-check   # TypeScript validation
```

**Backend Development**
```bash
cd backend
npm start            # Start production server
npm run dev          # Development with hot reload
npm test             # Run API tests
node test-backend.js # Backend verification
```

**Smart Contract Development**
```bash
cd blockchain
npm run compile      # Compile contracts
npm run test         # Run contract tests
npm run deploy       # Deploy to networks
npm run verify       # Verify on block explorers
```

## Deployment

### Production Environment Setup

**Frontend Deployment**
Deploy to Vercel, Netlify, or similar static hosting with build command `npm run build` and publish directory `dist`.

**Backend Deployment**
Deploy to Railway, Render, or container platforms. Configure environment variables for database connection, JWT secrets, and external service API keys.

**Smart Contract Deployment**
Deploy contracts to target EVM networks using Hardhat scripts. Update contract addresses in frontend and backend configuration files.

### Environment Configuration

Configure the following environment variables:

**Backend (.env)**
```env
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PINATA_API_KEY=your-pinata-key
```

**Frontend (.env)**
```env
VITE_API_BASE_URL=https://your-api.com
VITE_WALLETCONNECT_PROJECT_ID=your-wc-id
```

## Documentation

- [Architecture Guide](docs/architecture/ARCHITECTURE.md) - Detailed system design and component relationships
- [Deployment Guide](docs/deployment/DEPLOYMENT.md) - Comprehensive deployment instructions
- [Backend Integration](docs/setup/BACKEND-INTEGRATION-COMPLETE.md) - Backend setup and integration guide
- [Setup Complete](docs/setup/SETUP-COMPLETE.md) - Initial setup documentation
- [API Reference](backend/README.md) - Complete API endpoint documentation

## Contributing

We welcome contributions from the community. Please read our contributing guidelines and code of conduct before submitting pull requests.

**Development Process**
- Fork the repository and create a feature branch
- Make changes with appropriate tests and documentation
- Submit a pull request with clear description of changes
- All pull requests require review and passing CI checks

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Issues**: Report bugs and request features via GitHub Issues
- **Documentation**: Comprehensive guides available in the `/docs` directory
- **Community**: Join our Discord server for discussions and support

---

**Built for the decentralized future of digital commerce**