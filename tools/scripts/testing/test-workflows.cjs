const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Running interactive workflow tests...");
  
  // Get deployed contract addresses (assumes contracts are already deployed)
  const [deployer, creator, buyer1, buyer2, royaltyRecipient] = await ethers.getSigners();
  
  // You would replace these with actual deployed addresses
  // For now, we'll deploy fresh contracts
  console.log("📦 Deploying contracts for testing...");
  
  // Deploy contracts
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  
  const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
  const loyaltyToken = await LoyaltyToken.deploy();
  await loyaltyToken.waitForDeployment();
  
  const Shopfront = await ethers.getContractFactory("Shopfront");
  const shopfront = await Shopfront.deploy(
    await mockUSDC.getAddress(),
    await loyaltyToken.getAddress()
  );
  await shopfront.waitForDeployment();
  
  const CreatorStore = await ethers.getContractFactory("CreatorStore");
  const creatorStore = await CreatorStore.deploy(
    await mockUSDC.getAddress(),
    await loyaltyToken.getAddress()
  );
  await creatorStore.waitForDeployment();
  
  // Setup
  await loyaltyToken.setAuthorizedMinter(await shopfront.getAddress(), true);
  await loyaltyToken.setAuthorizedMinter(await creatorStore.getAddress(), true);
  
  // Give test accounts USDC
  await mockUSDC.mint(buyer1.address, ethers.parseUnits("50", 6));
  await mockUSDC.mint(buyer2.address, ethers.parseUnits("50", 6));
  
  console.log("✅ Setup complete!");
  
  // Test Workflow 1: New User Journey
  console.log("\n🌟 === USER WORKFLOW TEST ===");
  await testUserWorkflow(mockUSDC, loyaltyToken, shopfront, creatorStore, buyer1);
  
  // Test Workflow 2: Creator Workflow
  console.log("\n🎨 === CREATOR WORKFLOW TEST ===");
  await testCreatorWorkflow(mockUSDC, loyaltyToken, creatorStore, creator, royaltyRecipient, buyer2);
  
  // Test Workflow 3: Loyalty Progression
  console.log("\n🏆 === LOYALTY PROGRESSION TEST ===");
  await testLoyaltyProgression(mockUSDC, creatorStore, loyaltyToken, buyer1);
  
  console.log("\n🎊 All workflow tests completed!");
}

async function testUserWorkflow(mockUSDC, loyaltyToken, shopfront, creatorStore, buyer) {
  console.log("👤 Testing complete user journey...");
  
  // 1. User checks balance
  let balance = await mockUSDC.balanceOf(buyer.address);
  console.log(`💰 User balance: ${ethers.formatUnits(balance, 6)} USDC`);
  
  // 2. User uses faucet to get more USDC
  await mockUSDC.connect(buyer).faucet(ethers.parseUnits("25", 6));
  balance = await mockUSDC.balanceOf(buyer.address);
  console.log(`💰 After faucet: ${ethers.formatUnits(balance, 6)} USDC`);
  
  // 3. User browses marketplace
  const shopItems = await shopfront.getAllItems();
  const storeProducts = await creatorStore.getAllProducts();
  console.log(`🛍️ Found ${shopItems.length} shop items and ${storeProducts.length} store products`);
  
  // 4. User approves spending
  await mockUSDC.connect(buyer).approve(await creatorStore.getAddress(), ethers.parseUnits("10", 6));
  console.log("✅ Approved CreatorStore for spending");
  
  // 5. User makes first purchase
  await creatorStore.connect(buyer).buyItem(1); // Wallpaper NFT - 0.2 USDC
  console.log("🛒 Purchased: Wallpaper NFT");
  
  // 6. Check loyalty status
  let userInfo = await creatorStore.getUserSpendingInfo(buyer.address);
  console.log(`📊 Spending: ${ethers.formatUnits(userInfo.totalSpent, 6)} USDC, Tier: ${userInfo.currentLoyaltyTier}, Purchases: ${userInfo.purchaseCount}`);
  
  // 7. Check badge balance
  const bronzeBadges = await loyaltyToken.balanceOf(buyer.address, 1);
  console.log(`🏆 Bronze badges owned: ${bronzeBadges}`);
  
  // 8. User makes another purchase
  await creatorStore.connect(buyer).buyItem(2); // Premium Pass - 0.5 USDC
  console.log("🛒 Purchased: Premium Content Pass");
  
  // 9. Final status check
  userInfo = await creatorStore.getUserSpendingInfo(buyer.address);
  console.log(`📊 Final spending: ${ethers.formatUnits(userInfo.totalSpent, 6)} USDC, Tier: ${userInfo.currentLoyaltyTier}`);
  
  const purchases = await creatorStore.getUserPurchases(buyer.address);
  console.log(`📋 Purchase history: ${purchases.length} items`);
}

async function testCreatorWorkflow(mockUSDC, loyaltyToken, creatorStore, creator, royaltyRecipient, buyer) {
  console.log("🎨 Testing creator product listing and sales...");
  
  // 1. Creator lists a new product with royalties
  const royaltyRecipients = [creator.address, royaltyRecipient.address];
  const royaltyPercentages = [4000, 1000]; // 40% creator, 10% collaborator, 50% platform
  
  await creatorStore.listProductWithRoyalties(
    "Exclusive Music Album",
    "Limited edition digital album",
    "QmMusicAlbumHash",
    ethers.parseUnits("5", 6), // 5 USDC
    3, // Gold badge
    royaltyRecipients,
    royaltyPercentages
  );
  console.log("🎵 Listed: Exclusive Music Album with royalty splits");
  
  // 2. Check product was listed
  const productCount = await creatorStore.productCount();
  const newProduct = await creatorStore.getProduct(productCount);
  console.log(`📦 Product listed: ${newProduct.name} for ${ethers.formatUnits(newProduct.priceInUSDC, 6)} USDC`);
  
  // 3. Check royalty calculation
  const distribution = await creatorStore.calculateRoyaltyDistribution(productCount);
  console.log("💰 Royalty distribution:");
  console.log(`   Creator: ${ethers.formatUnits(distribution.amounts[0], 6)} USDC (40%)`);
  console.log(`   Collaborator: ${ethers.formatUnits(distribution.amounts[1], 6)} USDC (10%)`);
  console.log(`   Platform: ${ethers.formatUnits(distribution.creatorAmount, 6)} USDC (50%)`);
  
  // 4. Buyer purchases the product
  await mockUSDC.connect(buyer).approve(await creatorStore.getAddress(), ethers.parseUnits("10", 6));
  
  const initialCreatorBalance = await mockUSDC.balanceOf(creator.address);
  const initialCollaboratorBalance = await mockUSDC.balanceOf(royaltyRecipient.address);
  
  await creatorStore.connect(buyer).buyItem(productCount);
  console.log("💸 Product purchased by buyer");
  
  // 5. Verify royalty payments
  const finalCreatorBalance = await mockUSDC.balanceOf(creator.address);
  const finalCollaboratorBalance = await mockUSDC.balanceOf(royaltyRecipient.address);
  
  console.log("💵 Royalty payments verified:");
  console.log(`   Creator received: ${ethers.formatUnits(finalCreatorBalance - initialCreatorBalance, 6)} USDC`);
  console.log(`   Collaborator received: ${ethers.formatUnits(finalCollaboratorBalance - initialCollaboratorBalance, 6)} USDC`);
}

async function testLoyaltyProgression(mockUSDC, creatorStore, loyaltyToken, buyer) {
  console.log("🏆 Testing loyalty tier progression...");
  
  // Get thresholds
  const thresholds = await creatorStore.getLoyaltyThresholds();
  console.log("🎯 Loyalty thresholds:");
  console.log(`   Bronze: ${ethers.formatUnits(thresholds.bronze, 6)} USDC`);
  console.log(`   Silver: ${ethers.formatUnits(thresholds.silver, 6)} USDC`);
  console.log(`   Gold: ${ethers.formatUnits(thresholds.gold, 6)} USDC`);
  console.log(`   Diamond: ${ethers.formatUnits(thresholds.diamond, 6)} USDC`);
  
  // Check current user spending
  let userInfo = await creatorStore.getUserSpendingInfo(buyer.address);
  console.log(`💰 Current spending: ${ethers.formatUnits(userInfo.totalSpent, 6)} USDC (Tier ${userInfo.currentLoyaltyTier})`);
  
  // Make more purchases to reach Silver (need 1.0 USDC total)
  const neededForSilver = thresholds.silver - userInfo.totalSpent;
  console.log(`🎯 Need ${ethers.formatUnits(neededForSilver, 6)} more USDC for Silver tier`);
  
  if (neededForSilver > 0) {
    // Buy more products to reach Silver
    const purchasesNeeded = Math.ceil(Number(neededForSilver) / 200000); // 0.2 USDC per wallpaper
    console.log(`🛒 Making ${purchasesNeeded} more purchases...`);
    
    for (let i = 0; i < purchasesNeeded; i++) {
      await creatorStore.connect(buyer).buyItem(1); // Wallpaper NFT - 0.2 USDC each
    }
    
    userInfo = await creatorStore.getUserSpendingInfo(buyer.address);
    console.log(`✅ New spending: ${ethers.formatUnits(userInfo.totalSpent, 6)} USDC (Tier ${userInfo.currentLoyaltyTier})`);
  }
  
  // Check badge collection
  const bronzeBadges = await loyaltyToken.balanceOf(buyer.address, 1);
  const silverBadges = await loyaltyToken.balanceOf(buyer.address, 2);
  const goldBadges = await loyaltyToken.balanceOf(buyer.address, 3);
  
  console.log("🏆 Badge collection:");
  console.log(`   Bronze: ${bronzeBadges}`);
  console.log(`   Silver: ${silverBadges}`);
  console.log(`   Gold: ${goldBadges}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Workflow test failed:", error);
    process.exit(1);
  });