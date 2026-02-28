# 🚀 KudoBit Deployment Guide

## 📋 Overview

This guide covers deploying the complete **KudoBit Web3 Commerce Platform** across all three tiers:
- 🎨 **Frontend** (React + TypeScript)
- 🖥️ **Backend** (Node.js + Hono) 
- ⛓️ **Smart Contracts** (Solidity)

## 🛠️ Prerequisites

### **Required Tools**
```bash
# Node.js & Package Managers
node --version  # v18+ required
npm --version   # v8+ required

# Blockchain Development
git --version
docker --version (optional)
```

### **Required Accounts**
- **Vercel/Netlify** - Frontend hosting
- **Railway/Render** - Backend hosting  
- **PostgreSQL** - Production database
- **Pinata** - IPFS file storage
- **Infura/Alchemy** - Blockchain RPC
- **Etherscan** - Contract verification

## 🗂️ Environment Configuration

### **Frontend Environment (.env)**
```env
# API Configuration
VITE_API_BASE_URL=https://your-api-domain.com

# Web3 Configuration  
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
VITE_ENABLE_TESTNETS=true

# Analytics (Optional)
VITE_POSTHOG_KEY=your_posthog_key
VITE_SENTRY_DSN=your_sentry_dsn
```

### **Backend Environment (.env)**
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@host:port/database
# For development: uses SQLite automatically

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-here

# IPFS Storage
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
PINATA_GATEWAY=your-gateway-url

# Blockchain Integration
CREATOR_STORE_ADDRESS=0x...deployed_contract_address
LOYALTY_TOKEN_ADDRESS=0x...deployed_contract_address
USDC_TOKEN_ADDRESS=0x...usdc_contract_address

# External Services
CORS_ORIGINS=https://your-frontend-domain.com,https://www.your-domain.com
```

### **Smart Contract Environment (.env)**
```env
# Deployment
PRIVATE_KEY=your_deployer_wallet_private_key
DEPLOYER_ADDRESS=0x...your_deployer_address

# RPC Endpoints
MAINNET_RPC_URL=https://mainnet.infura.io/v3/your_key
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/your_key  
OPTIMISM_RPC_URL=https://optimism-mainnet.infura.io/v3/your_key
ARBITRUM_RPC_URL=https://arbitrum-mainnet.infura.io/v3/your_key
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/your_key
MORPH_RPC_URL=https://rpc-quicknode-holesky.morphl2.io

# Verification
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
OPTIMISTIC_ETHERSCAN_API_KEY=your_optimistic_etherscan_api_key
ARBISCAN_API_KEY=your_arbiscan_api_key
BASESCAN_API_KEY=your_basescan_api_key
```

## ⛓️ Smart Contract Deployment

### **1. Compile Contracts**
```bash
cd blockchain
npm install
npm run compile
```

### **2. Deploy to Testnets First**
```bash
# Deploy to Morph Holesky (recommended for testing)
npm run deploy:testnet

# Deploy to other testnets
npm run deploy:sepolia
npm run deploy:polygon-mumbai
```

### **3. Verify Contracts**
```bash
# Verify on block explorers
npm run verify:testnet
```

### **4. Deploy to Mainnets**
```bash
# Deploy to production networks
npm run deploy:mainnet
npm run deploy:polygon
npm run deploy:optimism
npm run deploy:arbitrum
npm run deploy:base

# Verify mainnet contracts
npm run verify:mainnet
```

### **5. Update Contract Addresses**
After deployment, update these files:
- `src/lib/contracts.ts` (Frontend)
- `backend/.env` (Backend)
- `deployments.json` (Contracts)

## 🖥️ Backend Deployment

### **Option 1: Railway (Recommended)**

1. **Create Railway Account** - Sign up at railway.app

2. **Connect Repository**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and link project
   railway login
   railway link
   ```

3. **Configure Environment**
   ```bash
   # Set environment variables
   railway variables set PORT=5000
   railway variables set JWT_SECRET=your-secret
   railway variables set DATABASE_URL=postgresql://...
   # Add all other env vars
   ```

4. **Deploy**
   ```bash
   # Deploy backend
   cd backend
   railway up
   ```

### **Option 2: Render**

1. **Create Render Account** - Sign up at render.com

2. **Create Web Service**
   - Connect your GitHub repo
   - Root directory: `backend`
   - Build command: `npm install`  
   - Start command: `npm start`

3. **Configure Environment Variables** in Render dashboard

4. **Deploy** - Automatic on git push

### **Option 3: Docker Deployment**

```dockerfile
# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

```bash
# Build and deploy
docker build -t kudobit-backend .
docker run -p 5000:5000 --env-file .env kudobit-backend
```

## 🎨 Frontend Deployment

### **Option 1: Vercel (Recommended)**

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Configure Build**
   ```json
   // vercel.json
   {
     "framework": "vite",
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "installCommand": "npm install"
   }
   ```

3. **Deploy**
   ```bash
   # Link and deploy
   vercel --prod
   ```

4. **Environment Variables** - Set in Vercel dashboard:
   - `VITE_API_BASE_URL`
   - `VITE_WALLETCONNECT_PROJECT_ID`

### **Option 2: Netlify**

1. **Build Configuration**
   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy**
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables

### **Option 3: Static Hosting**

```bash
# Build for production
npm run build

# Upload dist/ folder to:
# - AWS S3 + CloudFront
# - Google Cloud Storage
# - Azure Static Web Apps
```

## 🗄️ Database Setup

### **Production Database (PostgreSQL)**

1. **Create Database Instance**
   - **Railway**: Built-in PostgreSQL
   - **Render**: PostgreSQL addon
   - **AWS RDS**: Managed PostgreSQL
   - **DigitalOcean**: Managed Database

2. **Connection Setup**
   ```env
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

3. **Database Migration**
   ```bash
   # Backend will auto-create tables on first run
   # Or run manual migration:
   cd backend
   node -e "import('./database-sqlite.js').then(db => db.initializeDatabase())"
   ```

## 🔄 CI/CD Pipeline

### **GitHub Actions Workflow**
```yaml
# .github/workflows/deploy.yml
name: Deploy KudoBit Platform

on:
  push:
    branches: [main]

jobs:
  test-contracts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Test Smart Contracts
        run: |
          cd blockchain
          npm install
          npm test

  deploy-backend:
    runs-on: ubuntu-latest
    needs: test-contracts
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          cd backend
          railway up --detach

  deploy-frontend:
    runs-on: ubuntu-latest
    needs: deploy-backend
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

## 🔍 Monitoring Setup

### **Error Tracking**
```bash
# Install Sentry
npm install @sentry/react @sentry/node

# Configure in both frontend and backend
```

### **Analytics**
```bash
# PostHog for privacy-focused analytics
npm install posthog-js
```

### **Uptime Monitoring**
- **UptimeRobot** - Free tier available
- **Pingdom** - Detailed monitoring
- **DataDog** - Enterprise monitoring

## ✅ Deployment Checklist

### **Pre-Deployment**
- [ ] All environment variables configured
- [ ] Smart contracts deployed and verified  
- [ ] Database connection tested
- [ ] CORS origins configured
- [ ] SSL certificates ready

### **Smart Contracts**
- [ ] Contracts deployed to all target networks
- [ ] Contract addresses updated in frontend/backend
- [ ] Verification completed on block explorers
- [ ] Contract ownership transferred (if needed)

### **Backend**  
- [ ] API endpoints tested
- [ ] Database migrations completed
- [ ] Authentication flow verified
- [ ] File uploads working
- [ ] WebSocket connections tested

### **Frontend**
- [ ] Build completes without errors
- [ ] All environment variables set
- [ ] Web3 connections working
- [ ] API integration tested
- [ ] Responsive design verified

### **Post-Deployment**
- [ ] End-to-end user flow tested
- [ ] Payment processing verified
- [ ] Error monitoring configured
- [ ] Analytics tracking enabled
- [ ] Performance metrics baseline established

## 🚀 Launch Strategy

### **Soft Launch**
1. Deploy to staging environment
2. Internal testing with team
3. Limited beta with select users
4. Bug fixes and optimizations

### **Public Launch**
1. Deploy to production
2. Enable all features
3. Monitor system performance
4. Scale resources as needed

## 🛠️ Maintenance

### **Regular Tasks**
- Monitor error rates and performance
- Update dependencies monthly
- Backup database regularly
- Review security logs
- Update smart contracts if needed

### **Scaling Considerations**
- **Database**: Read replicas, connection pooling
- **Backend**: Load balancers, horizontal scaling
- **Frontend**: CDN optimization, code splitting
- **Blockchain**: Layer 2 integration for lower costs

---

🎉 **Your KudoBit platform is now production-ready!**

For support, check the [Architecture Guide](ARCHITECTURE.md) or create an issue in the repository.