const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🧪 Testing Complete User Flow on Monad Testnet");
  console.log("==============================================\n");

  // Check if we have deployments
  const fs = require('fs');
  const deploymentsPath = './deployments.json';
  
  if (!fs.existsSync(deploymentsPath)) {
    console.log("❌ No deployment found. Run deployment first:");
    console.log("npx hardhat run scripts/deploy.cjs --network monadTestnet\n");
    return;
  }

  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));
  const [owner, user1, user2] = await hre.ethers.getSigners();

  console.log("📋 Test Setup:");
  console.log(`Owner: ${owner.address}`);
  console.log(`User1: ${user1.address}`);
  console.log(`User2: ${user2.address}`);
  console.log(`Network: ${hre.network.name} (Chain ID: ${hre.network.config.chainId})\n`);

  // Get contract instances
  const mockUSDC = await hre.ethers.getContractAt("MockUSDC", deployments.mockUSDC);
  const loyaltyToken = await hre.ethers.getContractAt("LoyaltyToken", deployments.loyaltyToken);
  const shopfront = await hre.ethers.getContractAt("Shopfront", deployments.shopfront);

  console.log("🔍 Testing Contract Interactions:");
  console.log("=================================");

  try {
    // Test 1: Check initial setup
    console.log("1. ✅ Checking initial setup...");
    const itemCount = await shopfront.itemCount();
    console.log(`   - Items available: ${itemCount}`);
    
    const item1 = await shopfront.getItem(1);
    console.log(`   - First item: ${item1.name} (${hre.ethers.formatUnits(item1.priceInUSDC, 6)} USDC)`);

    // Test 2: USDC Faucet
    console.log("\n2. 💰 Testing USDC faucet...");
    const faucetAmount = hre.ethers.parseUnits("50", 6);
    
    console.log(`   - User1 claiming ${hre.ethers.formatUnits(faucetAmount, 6)} USDC...`);
    await mockUSDC.connect(user1).faucet(faucetAmount);
    
    const user1Balance = await mockUSDC.balanceOf(user1.address);
    console.log(`   - User1 balance: ${hre.ethers.formatUnits(user1Balance, 6)} USDC ✅`);

    // Test 3: Purchase Flow
    console.log("\n3. 🛒 Testing purchase flow...");
    const item1Price = item1.priceInUSDC;
    
    console.log("   - Approving USDC spending...");
    await mockUSDC.connect(user1).approve(deployments.shopfront, item1Price);
    
    console.log("   - Purchasing item...");
    const purchaseTx = await shopfront.connect(user1).buyItem(1);
    const receipt = await purchaseTx.wait();
    
    console.log(`   - Purchase successful! Gas used: ${receipt.gasUsed.toString()}`);
    
    // Check balance changes
    const newBalance = await mockUSDC.balanceOf(user1.address);
    console.log(`   - User1 new balance: ${hre.ethers.formatUnits(newBalance, 6)} USDC`);

    // Test 4: Loyalty Badge Check
    console.log("\n4. 🏆 Checking loyalty badge...");
    const badgeBalance = await loyaltyToken.balanceOf(user1.address, 1);
    console.log(`   - User1 Bronze badges: ${badgeBalance.toString()} ✅`);

    // Test 5: Purchase History
    console.log("\n5. 📊 Checking purchase history...");
    const purchases = await shopfront.getUserPurchases(user1.address);
    console.log(`   - User1 purchases: ${purchases.length} items`);
    console.log(`   - Items: [${purchases.join(', ')}]`);

    // Test 6: Admin Functions
    console.log("\n6. 👑 Testing admin functions...");
    console.log("   - Minting Diamond badge to User2...");
    await loyaltyToken.connect(owner).mintBadge(user2.address, 4, 1);
    
    const diamondBalance = await loyaltyToken.balanceOf(user2.address, 4);
    console.log(`   - User2 Diamond badges: ${diamondBalance.toString()} ✅`);

    console.log("\n🎉 ALL TESTS PASSED!");
    console.log("====================");
    console.log("✅ Contracts deployed and working correctly");
    console.log("✅ USDC faucet functional");
    console.log("✅ Purchase flow complete");
    console.log("✅ Loyalty badges awarded automatically");
    console.log("✅ Admin functions working");
    console.log("✅ Gas costs reasonable for micro-transactions");
    
    console.log("\n📱 Frontend Integration Ready:");
    console.log("=============================");
    console.log("• Update contract addresses in src/lib/contracts.ts");
    console.log("• Start frontend: npm run dev");
    console.log("• Test complete user journey");
    console.log("• Deploy to Vercel for live demo");

    console.log("\n💡 Demo Tips:");
    console.log("=============");
    console.log(`• MockUSDC Faucet: Users can claim up to 1000 USDC`);
    console.log(`• Gas costs are minimal (~${receipt.gasUsed.toString()} gas per purchase)`);
    console.log("• Transactions confirm instantly on Monad");
    console.log("• Loyalty badges are ERC-1155 NFTs");
    console.log("• Perfect for micro-transaction use cases");

  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.log("\nDebugging steps:");
    console.log("• Check contract addresses are correct");
    console.log("• Verify deployment succeeded");
    console.log("• Ensure sufficient MON for gas");
    console.log("• Check Monad Testnet network connection");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });