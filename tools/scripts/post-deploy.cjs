const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🔄 Post-Deployment Setup");
  console.log("========================\n");

  // Check if deployments.json exists
  const deploymentsPath = path.join(__dirname, '../deployments.json');
  if (!fs.existsSync(deploymentsPath)) {
    console.log("❌ deployments.json not found");
    console.log("Run deployment first: npx hardhat run scripts/deploy.cjs --network morphHolesky\n");
    return;
  }

  // Read deployment addresses
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));
  console.log("✅ Deployment addresses found:");
  console.log(`MockUSDC: ${deployments.mockUSDC}`);
  console.log(`LoyaltyToken: ${deployments.loyaltyToken}`);
  console.log(`Shopfront: ${deployments.shopfront}\n`);

  // Update contracts.ts
  const contractsPath = path.join(__dirname, '../src/lib/contracts.ts');
  let contractsContent = fs.readFileSync(contractsPath, 'utf8');

  // Replace placeholder addresses
  contractsContent = contractsContent.replace(
    /mockUSDC: '0x' as Address,/,
    `mockUSDC: '${deployments.mockUSDC}' as Address,`
  );
  contractsContent = contractsContent.replace(
    /loyaltyToken: '0x' as Address,/,
    `loyaltyToken: '${deployments.loyaltyToken}' as Address,`
  );
  contractsContent = contractsContent.replace(
    /shopfront: '0x' as Address,/,
    `shopfront: '${deployments.shopfront}' as Address,`
  );

  fs.writeFileSync(contractsPath, contractsContent);
  console.log("✅ Updated contract addresses in src/lib/contracts.ts\n");

  // Create test instructions
  console.log("🧪 Next Steps - Test Your Deployment:");
  console.log("====================================");
  console.log("1. Start development server:");
  console.log("   npm run dev");
  console.log("");
  console.log("2. Open browser to http://localhost:5173");
  console.log("");
  console.log("3. Test complete flow:");
  console.log("   ✓ Connect wallet to Morph Holesky");
  console.log("   ✓ Go to /admin and claim test USDC");
  console.log("   ✓ Return to shop and buy an item");
  console.log("   ✓ Check /loyalty page for badges");
  console.log("   ✓ Test admin badge minting");
  console.log("");
  console.log("4. Build for production:");
  console.log("   npm run build");
  console.log("");
  console.log("5. Deploy to Vercel:");
  console.log("   - Upload dist/ folder to vercel.com");
  console.log("   - Or use: npx vercel --prod");
  console.log("");

  // Generate explorer links
  console.log("🔗 Contract Verification Links:");
  console.log("==============================");
  console.log(`MockUSDC: https://explorer-holesky.morphl2.io/address/${deployments.mockUSDC}`);
  console.log(`LoyaltyToken: https://explorer-holesky.morphl2.io/address/${deployments.loyaltyToken}`);
  console.log(`Shopfront: https://explorer-holesky.morphl2.io/address/${deployments.shopfront}`);
  console.log("");

  console.log("🎯 Demo Preparation:");
  console.log("===================");
  console.log("• Practice the user flow multiple times");
  console.log("• Prepare 2-3 test wallets with USDC");
  console.log("• Test on both desktop and mobile");
  console.log("• Have backup screenshots ready");
  console.log("• Time your pitch with live demo");
  console.log("");
  console.log("🚀 You're almost ready to launch! 🚀");
}

main().catch(console.error);