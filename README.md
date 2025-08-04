# KudoBit 🎯

**A Web3 Creator Economy Platform with Loyalty System & Secondary Marketplace**

KudoBit empowers creators to monetize their content through NFT-based products while building loyal communities through an integrated badge system and secondary marketplace revenue sharing.

## ✨ Key Features

- 🏆 **Loyalty Badge System** - Automatic badge rewards based on spending tiers
- 💱 **Secondary Marketplace** - Revenue sharing between creators, platforms, and resellers  
- 🎨 **Creator Dashboard** - Simple product creation and management
- 💰 **USDC Payments** - Stable cryptocurrency payments with faucet for testing
- 🏅 **Tier Progression** - Bronze → Silver → Gold → Diamond based on user spending
- 📊 **Revenue Analytics** - Track earnings from primary and secondary sales

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or bun
- Hardhat for smart contract development

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd KudoBit

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your private key and RPC URLs

# Start local blockchain
npx hardhat node

# Deploy contracts (new terminal)
npx hardhat run scripts/deploy.cjs --network localhost

# Start frontend
npm run dev
```

## 📁 Project Structure

```
KudoBit/
├── contracts/                 # Smart contracts
│   ├── core/                 # Core system contracts
│   │   ├── CreatorStore.sol  # Primary marketplace
│   │   ├── LoyaltyToken.sol  # Badge NFT system
│   │   ├── MockUSDC.sol      # Test token
│   │   └── SecondaryMarketplace.sol # Resale system
│   ├── extensions/           # Additional features
│   └── legacy/              # Deprecated contracts
├── src/                     # Frontend React app
│   ├── components/          # UI components
│   ├── lib/                # Utilities and services
│   └── routes/             # App routing
├── scripts/                # Deployment and utility scripts
├── tests/                  # Organized test suite
│   ├── integration/        # End-to-end tests
│   ├── unit/              # Contract unit tests
│   └── debug/             # Debug utilities
├── backend/               # Express.js API server
├── build/                 # Build artifacts
├── config/               # Configuration files
├── docs/                 # Documentation
└── tools/                # Development utilities
```

## 🏆 Loyalty System

The loyalty system automatically rewards users with badges based on their spending:

- **Bronze Badge** (🥉): 0.1+ USDC spent
- **Silver Badge** (🥈): 1.0+ USDC spent  
- **Gold Badge** (🥇): 5.0+ USDC spent
- **Diamond Badge** (💎): 10.0+ USDC spent

Badges are ERC-1155 NFTs that can be displayed in wallets and used for future perks.

## 💱 Secondary Market Revenue Sharing

When users resell purchased items:

- **Creator Royalty**: 5.0% goes to original creator
- **Platform Fee**: 2.5% goes to platform
- **Seller Amount**: 92.5% goes to reseller

All revenue distribution is handled automatically by smart contracts.

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npx hardhat test

# Run specific test suites
npx hardhat run tests/integration/test-loyalty-working.cjs --network localhost
npx hardhat run tests/integration/test-final-comprehensive.cjs --network localhost

# Debug contracts
npx hardhat run tests/debug/debug-creator-addresses.cjs --network localhost
```

### Test Coverage

- ✅ **Loyalty System**: Badge minting, tier progression, spending tracking
- ✅ **Secondary Market**: Revenue sharing, fee calculations, resale mechanics
- ✅ **Payment System**: USDC transfers, approvals, balance management
- ✅ **Contract Integration**: Cross-contract interactions and authorization

## 🛠️ Development

### Smart Contracts

Core contracts are located in `contracts/core/`:

- **CreatorStore.sol**: Primary marketplace for creator products
- **SecondaryMarketplace.sol**: Resale marketplace with revenue sharing
- **LoyaltyToken.sol**: ERC-1155 badge system
- **MockUSDC.sol**: Test USDC token with faucet

### Frontend

React app with TanStack Router and Wagmi for Web3 integration:

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend API

Express.js server with SQLite database:

```bash
cd backend
npm run dev          # Start API server
npm run test         # Run API tests
```

## 📋 Deployment

### Local Development
```bash
# Start local network
npx hardhat node

# Deploy contracts
npx hardhat run scripts/deploy.cjs --network localhost
```

### Morph Holesky Testnet
```bash
# Deploy to testnet
npx hardhat run scripts/deploy.cjs --network morphHolesky

# Verify contracts
npx hardhat verify --network morphHolesky <contract-address>
```

Contract addresses are automatically saved to `deployments.json`.

## 🎯 System Status

### ✅ Fully Functional Systems

- **Loyalty System**: Automatic badge minting and tier progression
- **Secondary Marketplace**: Revenue sharing with proper fee distribution
- **Payment Integration**: USDC token transfers and approvals
- **Contract Architecture**: Modular, upgradeable smart contract design
- **Frontend Integration**: Web3 wallet connection and contract interaction

### 🔧 Technical Achievements

- **ABI Interface Issues**: ✅ Resolved through proper contract deployment
- **Revenue Distribution**: ✅ Mathematical accuracy with 100% fee accounting
- **Cross-Contract Authorization**: ✅ Proper minter permissions and ownership
- **Event Emission**: ✅ Comprehensive transaction logging
- **Error Handling**: ✅ Robust validation and user feedback

## 📖 Documentation

- [Project Structure](PROJECT-STRUCTURE.md) - Detailed architecture overview
- [Testing Guide](docs/archive/TESTING-GUIDE.md) - Comprehensive testing documentation
- [API Documentation](backend/docs/) - Backend API reference
- [Deployment Guide](docs/DEPLOYMENT-GUIDE.md) - Production deployment instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Acknowledgments

- Built with Hardhat, React, and Vite
- Uses OpenZeppelin contracts for security
- Inspired by creator economy and Web3 innovation

---

**KudoBit**: Empowering creators through Web3 technology 🚀