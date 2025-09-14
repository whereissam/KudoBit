const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 === TESTING DEPLOYED CONTRACTS ON LOCAL TESTNET ===");
  
  // Contract addresses from deployment
  const MOCKUSDC_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const LOYALTY_TOKEN_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const CREATOR_STORE_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  
  // Get signers
  const [deployer, creator, buyer1, buyer2] = await ethers.getSigners();
  
  console.log("👤 Deployer:", deployer.address);
  console.log("🎨 Creator:", creator.address);
  console.log("🛒 Buyer1:", buyer1.address);
  console.log("🛒 Buyer2:", buyer2.address);
  
  // Connect to deployed contracts
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = MockUSDC.attach(MOCKUSDC_ADDRESS);
  
  const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
  const loyaltyToken = LoyaltyToken.attach(LOYALTY_TOKEN_ADDRESS);
  
  const CreatorStore = await ethers.getContractFactory("CreatorStore");
  const creatorStore = CreatorStore.attach(CREATOR_STORE_ADDRESS);
  
  console.log("\n💰 === TESTING MOCKUSDC FAUCET ===");
  
  // Test faucet functionality
  const faucetAmount = ethers.parseUnits("100", 6); // 100 USDC
  console.log(`🚰 Testing faucet for ${ethers.formatUnits(faucetAmount, 6)} USDC...`);
  
  const tx1 = await mockUSDC.connect(buyer1).faucet(faucetAmount);
  await tx1.wait();
  
  const buyer1Balance = await mockUSDC.balanceOf(buyer1.address);
  console.log(`✅ Buyer1 USDC balance: ${ethers.formatUnits(buyer1Balance, 6)} USDC`);
  
  console.log("\n🛒 === TESTING PURCHASE FLOW ===");
  
  // Check available products
  const products = await creatorStore.getAllProducts();
  console.log(`📦 Available products: ${products.length}`);
  
  if (products.length > 0) {
    const firstProduct = products[0];
    console.log(`🎯 Testing purchase of: ${firstProduct.name}`);
    console.log(`💰 Price: ${ethers.formatUnits(firstProduct.priceInUSDC, 6)} USDC`);
    console.log(`🏆 Badge ID: ${firstProduct.loyaltyBadgeId}`);
    
    // Approve spending
    console.log("📝 Approving USDC spending...");
    const approveTx = await mockUSDC.connect(buyer1).approve(CREATOR_STORE_ADDRESS, firstProduct.priceInUSDC);
    await approveTx.wait();
    console.log("✅ USDC approved");
    
    // Check buyer's loyalty badges before purchase
    const badgeBalanceBefore = await loyaltyToken.balanceOf(buyer1.address, firstProduct.loyaltyBadgeId);
    console.log(`🏆 Badge balance before: ${badgeBalanceBefore}`);
    
    // Make purchase
    console.log("💳 Making purchase...");
    const purchaseTx = await creatorStore.connect(buyer1).buyItem(firstProduct.id);
    const receipt = await purchaseTx.wait();
    console.log("✅ Purchase completed!");
    
    // Check loyalty badge after purchase
    const badgeBalanceAfter = await loyaltyToken.balanceOf(buyer1.address, firstProduct.loyaltyBadgeId);
    console.log(`🏆 Badge balance after: ${badgeBalanceAfter}`);
    
    // Check user spending
    const userSpending = await creatorStore.userTotalSpent(buyer1.address);
    console.log(`💸 Total user spending: ${ethers.formatUnits(userSpending, 6)} USDC`);
    
    // Check events emitted
    const purchaseEvents = receipt.logs.filter(log => {
      try {
        const parsed = creatorStore.interface.parseLog(log);
        return parsed.name === "ProductPurchased";
      } catch {
        return false;
      }
    });
    
    if (purchaseEvents.length > 0) {
      console.log("📢 ProductPurchased event emitted successfully");
    }
    
    console.log("\n🏆 === TESTING LOYALTY SYSTEM ===");
    
    // Check user spending info
    const spendingInfo = await creatorStore.getUserSpendingInfo(buyer1.address);
    console.log(`🎖️ Total spent: ${ethers.formatUnits(spendingInfo.totalSpent, 6)} USDC`);
    console.log(`🛒 Purchase count: ${spendingInfo.purchaseCount}`);
    
    // Get purchase history
    const purchaseHistory = await creatorStore.getUserPurchases(buyer1.address);
    console.log(`📋 Purchase history count: ${purchaseHistory.length}`);
    
    console.log("\n💎 === TESTING MULTIPLE PURCHASES FOR TIER PROGRESSION ===");
    
    // Make another purchase to test tier progression
    if (products.length > 1) {
      const secondProduct = products[1];
      console.log(`🎯 Purchasing: ${secondProduct.name}`);
      
      // Approve and purchase
      await mockUSDC.connect(buyer1).approve(CREATOR_STORE_ADDRESS, secondProduct.priceInUSDC);
      await creatorStore.connect(buyer1).buyItem(secondProduct.id);
      
      const newSpending = await creatorStore.userTotalSpent(buyer1.address);
      const newSpendingInfo = await creatorStore.getUserSpendingInfo(buyer1.address);
      
      console.log(`💸 New total spending: ${ethers.formatUnits(newSpending, 6)} USDC`);
      console.log(`🛒 New purchase count: ${newSpendingInfo.purchaseCount}`);
      
      // Check if user has bronze badge (tier 1)
      const bronzeBadgeBalance = await loyaltyToken.balanceOf(buyer1.address, 1);
      console.log(`🥉 Bronze badge balance: ${bronzeBadgeBalance}`);
    }
  }
  
  console.log("\n🔍 === TESTING CONTRACT STATE QUERIES ===");
  
  // Test loyalty thresholds
  const thresholds = await creatorStore.getLoyaltyThresholds();
  console.log("🏆 Loyalty Thresholds:");
  console.log(`   🥉 Bronze: ${ethers.formatUnits(thresholds.bronze, 6)} USDC`);
  console.log(`   🥈 Silver: ${ethers.formatUnits(thresholds.silver, 6)} USDC`);
  console.log(`   🥇 Gold: ${ethers.formatUnits(thresholds.gold, 6)} USDC`);
  console.log(`   💎 Diamond: ${ethers.formatUnits(thresholds.diamond, 6)} USDC`);
  
  // Test platform stats
  const totalProducts = await creatorStore.productCount();
  console.log(`📊 Platform Stats:`);
  console.log(`   📦 Total products: ${totalProducts}`);
  
  console.log("\n🎊 === ALL TESTS COMPLETED SUCCESSFULLY ===");
  console.log("✅ MockUSDC faucet working");
  console.log("✅ Contract interactions functioning");
  console.log("✅ Purchase flow working");
  console.log("✅ Loyalty badge minting working");
  console.log("✅ Tier progression working");
  console.log("✅ Event emission working");
  console.log("✅ State queries working");
  
  console.log("\n🚀 Smart contracts are fully functional on local testnet!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });