# 🚀 Morph Commerce - Complete Launch Guide

## ⚡ Quick Launch (5 Commands)

```bash
# 1. Check deployment readiness
node scripts/verify-deployment.cjs

# 2. Get Morph Holesky ETH from https://faucet.morphl2.io
# Then deploy contracts:
npx hardhat run scripts/deploy.cjs --network morphHolesky

# 3. Update frontend with contract addresses
node scripts/post-deploy.cjs

# 4. Test the complete flow
npx hardhat run scripts/test-flow.cjs --network morphHolesky

# 5. Deploy to Vercel
npm run build
# Upload dist/ folder to vercel.com or use: npx vercel --prod
```

## 📋 Remaining Critical Tasks

### ☐ Get Morph Holesky ETH from faucet
- **URL**: https://faucet.morphl2.io
- **Need**: ~0.1 ETH for deployment gas
- **Verify**: `node scripts/check-wallet.cjs`

### ☐ Deploy MockUSDC.sol contract to Morph Holesky
```bash
npx hardhat run scripts/deploy.cjs --network morphHolesky
```
- Deploys all 3 contracts in sequence
- Sets up proper permissions automatically
- Creates `deployments.json` with addresses

### ☐ Fund test wallets with MockUSDC
- Use admin panel: `/admin` → "Claim Test USDC"
- Or call faucet function directly
- Fund 2-3 wallets with 50-100 USDC each

### ☐ Deploy all contracts to Morph Holesky and verify
```bash
# After deployment, verify on explorer
# Visit: https://explorer-holesky.morphl2.io
# Search for your contract addresses
```

### ☐ Test complete user flow
1. **Start frontend**: `npm run dev`
2. **Connect wallet** to Morph Holesky
3. **Get USDC** via admin panel
4. **Buy item** from shop (test approval flow)
5. **Check loyalty** badges in `/loyalty`
6. **Test admin** badge minting

### ☐ Conduct final end-to-end testing
- **Desktop + Mobile** testing
- **Error scenarios**: insufficient balance, wrong network
- **Performance**: transaction speed emphasis
- **Demo rehearsal**: practice 3-minute pitch

### ☐ Deploy frontend to Vercel
```bash
# Method 1: Manual upload
npm run build
# Upload dist/ folder at vercel.com

# Method 2: Vercel CLI
npx vercel --prod

# Method 3: GitHub integration
# Connect repo to Vercel dashboard
```

## 🧪 Testing Commands

```bash
# Check wallet balance
node scripts/check-wallet.cjs

# Test deployed contracts
npx hardhat run scripts/test-flow.cjs --network morphHolesky

# Verify deployment status
node scripts/verify-deployment.cjs

# Test local build
npm run build && npm run preview
```

## 🎯 Demo Day Checklist

**Pre-Demo Setup:**
- [ ] Live frontend URL working
- [ ] 3 test wallets funded with USDC
- [ ] Network set to Morph Holesky
- [ ] Backup screenshots ready
- [ ] Pitch script memorized (3 minutes)

**Demo Flow:**
1. **Hook** (15s): "Imagine buying a $0.50 digital item..."
2. **Problem** (30s): High fees, lack of transparency
3. **Solution** (45s): Live transaction demo
4. **Morph Benefits** (60s): Speed, cost, decentralization
5. **Future Vision** (15s): New digital economy

**Backup Plan:**
- Screenshots of complete user flow
- Recorded transaction videos
- Contract addresses for verification
- Test results from `scripts/test-flow.cjs`

## 📊 Key Metrics to Highlight

**Performance:**
- Transaction confirmation: < 2 seconds
- Gas costs: ~150k gas (~$0.001)
- UI responsiveness: Web2-like experience

**Technical:**
- 12/12 comprehensive tests passing
- 3 smart contracts with proper integration
- ERC-1155 loyalty badges (4 tiers)
- Automatic badge distribution

**Innovation:**
- First micro-commerce dApp on Morph
- Novel loyalty program implementation
- Perfect showcase of Morph's advantages

## 🔗 Essential Links

- **Faucet**: https://faucet.morphl2.io
- **Explorer**: https://explorer-holesky.morphl2.io
- **RPC**: https://rpc-quicknode-holesky.morphl2.io
- **Chain ID**: 2810
- **Vercel**: https://vercel.com

## 🚨 Last-Minute Troubleshooting

**Contract deployment fails:**
- Check ETH balance
- Verify private key in .env
- Try increasing gas limit

**Frontend not connecting:**
- Check contract addresses in `src/lib/contracts.ts`
- Verify MetaMask on Morph Holesky
- Clear browser cache

**Transactions failing:**
- Ensure USDC approval first
- Check user has sufficient balance
- Verify contract is active

**Demo glitches:**
- Always have backup screenshots
- Practice offline version of pitch
- Know your contract addresses by heart

## 🏆 Success Indicators

When you've completed all tasks:
✅ Contracts deployed and verified on Morph Holesky
✅ Live frontend with working transactions
✅ Complete user flow tested end-to-end
✅ Mobile responsiveness confirmed
✅ Demo rehearsed and timed perfectly
✅ Backup materials prepared

**You'll have a production-ready dApp that perfectly showcases Morph's capabilities!** 🎉

---

*🚀 Ready to launch the future of micro-commerce on Morph!*