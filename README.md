# 🚀 Micro-Commerce & Loyalty on Morph

> **Lightning-fast digital commerce and instant loyalty rewards powered by Morph's hybrid rollup technology**

A pioneering decentralized application that revolutionizes digital commerce by enabling seamless, low-cost micro-transactions and transparent loyalty programs on Morph's cutting-edge blockchain infrastructure.

## 🌟 Why Morph?

This dApp showcases the unique advantages of **Morph's Hybrid Rollup** technology:

- **⚡ Lightning Fast**: Hybrid rollup with optimistic finality for instant transaction confirmation
- **💰 Ultra Low Cost**: Making micro-transactions economically viable for the first time
- **🔒 Truly Secure**: Responsive Validity Proofs (RVP) ensure robust security
- **🏛️ Decentralized**: Decentralized sequencer network guarantees fairness and censorship resistance

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

## 🛠 Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: TailwindCSS + shadcn/ui
- **Web3**: Wagmi + Viem
- **Routing**: TanStack Router
- **Blockchain**: Morph Holesky Testnet
- **Smart Contracts**: Solidity + Hardhat + OpenZeppelin

## 📦 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask wallet
- Morph Holesky testnet ETH

### Installation

1. **Clone & Install**
   ```bash
   git clone <repository-url>
   cd morph-microcommerce-loyalty
   npm install
   ```

2. **Set up Environment**
   ```bash
   cp .env.example .env
   # Add your private key for deployment
   ```

3. **Deploy Contracts**
   ```bash
   npx hardhat run scripts/deploy.js --network morphHolesky
   ```

4. **Update Contract Addresses**
   After deployment, update the contract addresses in `src/lib/contracts.ts`

5. **Start Development Server**
   ```bash
   npm run dev
   ```

### Network Setup

Add Morph Holesky to MetaMask:
- **Network Name**: Morph Holesky
- **RPC URL**: `https://rpc-quicknode-holesky.morphl2.io`
- **Chain ID**: `2810`
- **Currency Symbol**: `ETH`
- **Explorer**: `https://explorer-holesky.morphl2.io`

Get test ETH: [Morph Holesky Faucet](https://faucet.morphl2.io)

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

## 🎯 How Morph Makes This Possible

### Speed & Cost
- **Sub-second confirmations** vs minutes on Ethereum L1
- **~$0.01 transaction fees** vs $10-50 on L1
- Enables **micro-transactions** previously impossible due to high gas

### Decentralized Sequencer
- **Fair ordering** prevents MEV exploitation
- **No single point of failure** like centralized sequencers
- **Transparent** transaction processing

### Hybrid Rollup Security
- **Optimistic + ZK** dual verification system
- **Responsive Validity Proof** for instant finality when needed
- **Full Ethereum security** inheritance

## 🚀 Demo Flow

1. **Connect Wallet**: Link MetaMask to Morph Holesky
2. **Get Test USDC**: Use the faucet in admin panel
3. **Browse Shop**: View digital products with instant preview
4. **Make Purchase**: One-click buying with automatic approval
5. **Earn Badges**: Receive loyalty NFTs immediately
6. **View Rewards**: Check loyalty dashboard for collected badges

## 📱 User Experience

- **Web2-like UX**: Abstracts blockchain complexity
- **Instant Feedback**: Real-time transaction updates
- **Mobile Responsive**: Works seamlessly on all devices
- **Clear Pricing**: Transparent costs in familiar USDC

## 🔮 Future Enhancements

- **Dynamic Pricing**: Market-driven product costs
- **Creator Tools**: Easy product listing interface  
- **Social Features**: Badge sharing and leaderboards
- **Cross-chain**: Bridge to other networks
- **Real Products**: Integration with digital marketplaces

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🤝 Contributing

Built for Morph Hackathon. Contributions welcome for future development!

---

**Experience the future of micro-commerce on Morph - where every transaction is fast, cheap, and secure.**