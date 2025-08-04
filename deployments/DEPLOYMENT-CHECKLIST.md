# 🚀 Morph Commerce - Final Deployment Checklist

## ✅ Critical Tasks Remaining

### 1. ☐ Get Morph Holesky ETH from faucet
**Action Required:**
- Visit: https://faucet.morphl2.io
- Connect your MetaMask wallet
- Add Morph Holesky network (Chain ID: 2810)
- Claim test ETH (~0.1 ETH should be plenty)

**Verification:**
```bash
# Check your balance after claiming
npx hardhat run scripts/check-wallet.cjs --network morphHolesky
```

### 2. ☐ Deploy MockUSDC.sol contract to Morph Holesky
**Action Required:**
```bash
# Deploy all contracts at once
npx hardhat run scripts/deploy.cjs --network morphHolesky
```

**Expected Output:**
```
MockUSDC deployed to: 0x...
LoyaltyToken deployed to: 0x...
Shopfront deployed to: 0x...
Shopfront authorized as minter for LoyaltyToken
```

### 3. ☐ Update Contract Addresses in Frontend
**Action Required:**
- Copy addresses from deployment output
- Update `src/lib/contracts.ts`:

```typescript
export const CONTRACTS = {
  mockUSDC: '0xYourDeployedMockUSDCAddress' as Address,
  loyaltyToken: '0xYourDeployedLoyaltyTokenAddress' as Address,
  shopfront: '0xYourDeployedShopfrontAddress' as Address,
}
```

### 4. ☐ Fund test wallets with MockUSDC for demo
**Action Required:**
- Use the faucet function in MockUSDC contract
- Or use the admin panel once frontend is running
- Fund 2-3 test wallets with ~100 USDC each

### 5. ☐ Verify contracts on Morph Explorer
**Action Required:**
- Visit: https://explorer-holesky.morphl2.io
- Search for your contract addresses
- Verify source code (optional but recommended)

### 6. ☐ Test complete user flow per detailed specifications
**Test Checklist:**
- [ ] Connect wallet to Morph Holesky
- [ ] Check USDC balance display
- [ ] Use faucet to get USDC
- [ ] Browse products on homepage
- [ ] Purchase an item (approve + buy flow)
- [ ] Verify loyalty badge awarded
- [ ] Check /loyalty page shows badges
- [ ] Test admin panel badge minting
- [ ] Test on mobile device

### 7. ☐ Deploy frontend to Vercel for live demo
**Action Required:**
```bash
# Build for production
npm run build

# Deploy to Vercel (easiest method)
# Option 1: Upload dist/ folder manually to Vercel
# Option 2: Connect GitHub repo to Vercel
# Option 3: Use Vercel CLI
npx vercel --prod
```

### 8. ☐ Conduct final end-to-end testing before submission
**Final Test Suite:**
- [ ] Live frontend works with deployed contracts
- [ ] All transactions confirm quickly on Morph
- [ ] Mobile responsiveness verified
- [ ] Error handling works properly
- [ ] Demo flow rehearsed successfully

## 🛠️ Helper Scripts

### Check Wallet Balance
```bash
node scripts/check-wallet.cjs
```

### Deployment with Gas Estimation
```bash
node scripts/prepare-deployment.cjs
npx hardhat run scripts/deploy.cjs --network morphHolesky
```

### Quick Test
```bash
npm run build && npm run preview
```

## 🚨 Pre-Launch Verification

Before final submission, verify:
- [ ] All contract addresses updated in frontend
- [ ] Live demo URL works end-to-end
- [ ] Pitch script practiced with live demo
- [ ] Screenshots/recordings taken as backup
- [ ] Project builds without errors
- [ ] All critical paths tested

## 📋 Demo Day Setup

**Have Ready:**
1. **Live Demo URL**: Your deployed Vercel app
2. **Backup Plan**: Screenshots if demo fails
3. **Contract Addresses**: For transparency/verification
4. **Test Wallets**: Pre-funded for smooth demo
5. **Pitch Script**: PITCH.md practiced and timed

## 🎯 Success Metrics

When complete, you'll have:
- ✅ Fully deployed smart contracts on Morph Holesky
- ✅ Live frontend application with working transactions
- ✅ Complete user flow from purchase to loyalty rewards
- ✅ Professional demo ready for hackathon judges

## 🔗 Important Links

- **Faucet**: https://faucet.morphl2.io
- **Explorer**: https://explorer-holesky.morphl2.io
- **RPC**: https://rpc-quicknode-holesky.morphl2.io
- **Chain ID**: 2810

---

**🚀 Ready to launch! These final steps will make your project submission complete and demo-ready.**