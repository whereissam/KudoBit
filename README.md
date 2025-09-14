# KudoBit

> **Digital Value, Instantly Rewarded.**

A professional decentralized commerce platform that enables seamless micro-transactions and transparent loyalty programs using modern blockchain infrastructure. Originally built on Morph's hybrid rollup technology, this platform demonstrates enterprise-grade digital commerce capabilities.

## 🏗️ Architecture

This application showcases advanced blockchain infrastructure capabilities:

- **⚡ High Performance**: Sub-second transaction finality with optimistic confirmation
- **💰 Cost Effective**: Micro-transaction friendly with minimal gas fees
- **🔒 Secure**: Multi-layered security with validity proofs and robust verification
- **🏛️ Decentralized**: Distributed sequencer network for fair transaction ordering

## ✨ Features

### For Buyers
- **Instant Wallet Connection**: Connect MetaMask to start shopping
- **Digital Marketplace**: Browse curated digital products (wallpapers, content passes, sticker packs)
- **One-Click Purchases**: Buy items with USDC in a single transaction
- **Automatic Loyalty Rewards**: Earn badges instantly after each purchase
- **Real-time Balance**: See your USDC balance and transaction status

### For Merchants (Demo)
- **Product Management**: Pre-configured digital items with pricing
- **Loyalty Integration**: Automatic badge distribution based on purchase value
- **Admin Panel**: Manually award badges and manage test tokens

### Technical Features
- **ERC-1155 Loyalty Badges**: Collectible NFT badges for different tiers
- **ERC-20 Mock USDC**: Testnet stablecoin for purchases
- **Smart Contract Integration**: Seamless Web3 interactions via Wagmi
- **Responsive Design**: Works on desktop and mobile

## 🛠 Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: TailwindCSS with shadcn/ui component library
- **Routing**: TanStack Router for type-safe navigation

### Blockchain
- **Web3 Integration**: Wagmi v2 + Viem for Ethereum interactions
- **Smart Contracts**: Solidity with OpenZeppelin standards
- **Development**: Hardhat framework for testing and deployment
- **Network**: Configurable for multiple EVM-compatible chains

## 📦 Quick Start

### Prerequisites
- **Node.js**: Version 18 or higher
- **Package Manager**: npm, yarn, or pnpm
- **Web3 Wallet**: MetaMask or compatible wallet
- **Testnet Tokens**: For development and testing

### Installation & Setup

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd kudobit
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Configure environment variables as needed
   ```

3. **Smart Contract Deployment**
   ```bash
   # Compile contracts
   npm run compile
   
   # Deploy to testnet
   npm run deploy:testnet
   ```

4. **Configure Contract Addresses**
   Update deployed contract addresses in `src/lib/contracts.ts`

5. **Development Server**
   ```bash
   npm run dev
   ```

### Network Configuration

The application supports multiple EVM-compatible networks. Default configuration includes:

- **Testnet**: Morph Holesky (Chain ID: 2810)
- **RPC**: `https://rpc-quicknode-holesky.morphl2.io`
- **Explorer**: `https://explorer-holesky.morphl2.io`
- **Faucet**: Available for testnet tokens

## 🏗 Smart Contracts

### MockUSDC.sol
- Standard ERC-20 token for payments
- Built-in faucet for testing (1000 USDC max per claim)
- 6 decimal precision matching real USDC

### LoyaltyToken.sol
- ERC-1155 multi-token for loyalty badges
- Four badge tiers: Bronze, Silver, Gold, Diamond
- Authorized minter system for security
- IPFS metadata support

### Shopfront.sol
- Main marketplace contract
- Item management with pricing in USDC
- Automatic badge distribution on purchase
- Purchase history tracking
- Reentrancy protection

## 🎯 Platform Benefits

### Performance & Economics
- **Fast Finality**: Sub-second transaction confirmation
- **Low Costs**: Minimal transaction fees enable micro-transactions
- **Scalability**: High throughput for commercial applications

### Security & Reliability
- **Multi-layer Security**: Advanced cryptographic proofs
- **Decentralized Architecture**: No single points of failure
- **Transparent Operations**: Open and verifiable transaction processing

### Developer Experience
- **EVM Compatibility**: Standard Ethereum tooling and libraries
- **Modern Stack**: TypeScript, React, and industry-standard frameworks
- **Comprehensive Testing**: Hardhat integration with full test coverage

## 🚀 Usage Flow

1. **Wallet Connection**: Connect compatible Web3 wallet to the application
2. **Token Acquisition**: Obtain test tokens from integrated faucet
3. **Product Browsing**: Explore available digital products and services
4. **Seamless Purchasing**: Execute transactions with single-click approval
5. **Loyalty Rewards**: Automatically receive NFT badges for purchases
6. **Portfolio Management**: Track rewards and transaction history

## 📱 User Experience

- **Web2-like UX**: Abstracts blockchain complexity
- **Instant Feedback**: Real-time transaction updates
- **Mobile Responsive**: Works seamlessly on all devices
- **Clear Pricing**: Transparent costs in familiar USDC

## 🔮 Roadmap

### Phase 1: Core Platform
- [x] Smart contract architecture
- [x] Web3 wallet integration
- [x] Basic marketplace functionality
- [x] Loyalty token system

### Phase 2: Advanced Features
- [ ] Multi-chain deployment
- [ ] Advanced analytics dashboard
- [ ] Creator onboarding tools
- [ ] Mobile application

### Phase 3: Enterprise Ready
- [ ] API integrations
- [ ] White-label solutions
- [ ] Advanced governance features
- [ ] Institutional partnerships

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

We welcome contributions from the community. Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

## 📞 Support

- **Documentation**: [docs.kudobit.com](https://docs.kudobit.com)
- **Issues**: GitHub Issues tracker
- **Community**: Discord server
- **Email**: support@kudobit.com

---

**Professional blockchain commerce platform for the modern digital economy.**