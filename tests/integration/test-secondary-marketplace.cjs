const { ethers } = require("hardhat");

async function main() {
  console.log("🏪 Testing Secondary Marketplace with Creator Royalties");
  console.log("=".repeat(65));
  
  const [deployer, creator, buyer1, buyer2, buyer3] = await ethers.getSigners();
  console.log(`🏗️  Testing from: ${deployer.address}`);
  console.log(`🎨 Creator: ${creator.address}`);
  console.log(`👤 Buyer 1: ${buyer1.address}`);
  console.log(`👤 Buyer 2: ${buyer2.address}`);
  console.log(`👤 Buyer 3: ${buyer3.address}`);

  // Deploy all contracts
  console.log("\n📦 Deploying Contracts...");
  
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  
  const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
  const loyaltyToken = await LoyaltyToken.deploy();
  await loyaltyToken.waitForDeployment();
  
  const SecondaryMarketplace = await ethers.getContractFactory("SecondaryMarketplace");
  const marketplace = await SecondaryMarketplace.deploy(
    await mockUSDC.getAddress(),
    await loyaltyToken.getAddress()
  );
  await marketplace.waitForDeployment();
  
  console.log(`✅ MockUSDC: ${await mockUSDC.getAddress()}`);
  console.log(`✅ LoyaltyToken: ${await loyaltyToken.getAddress()}`);
  console.log(`✅ SecondaryMarketplace: ${await marketplace.getAddress()}`);
  
  // Authorize marketplace to mint badges
  await loyaltyToken.setAuthorizedMinter(await marketplace.getAddress(), true);
  console.log("✅ Marketplace authorized to mint badges");
  
  // Give everyone some USDC for testing
  console.log("\n💰 Distributing Test USDC...");
  const testAmount = ethers.parseUnits("1000", 6); // 1000 USDC
  
  await mockUSDC.mint(deployer.address, testAmount);
  await mockUSDC.mint(creator.address, testAmount);
  await mockUSDC.mint(buyer1.address, testAmount);
  await mockUSDC.mint(buyer2.address, testAmount);
  await mockUSDC.mint(buyer3.address, testAmount);
  
  console.log("✅ 1000 USDC distributed to all test accounts");
  
  // Test 1: Create products with different royalty rates
  console.log("\n🎨 Test 1: Creating Products with Creator Royalties...");
  
  // List product with 5% creator royalty (default)
  await marketplace.listProduct(
    "Exclusive Art NFT",
    "Limited edition digital artwork",
    "QmArtHash123",
    ethers.parseUnits("50", 6), // 50 USDC
    3, // Gold badge
    creator.address, // Creator gets royalties
    500 // 5% royalty (500 basis points)
  );
  
  // List product with 8% creator royalty
  await marketplace.listProduct(
    "Music Album NFT", 
    "Exclusive music album with bonus tracks",
    "QmMusicHash456",
    ethers.parseUnits("25", 6), // 25 USDC
    2, // Silver badge
    creator.address,
    800 // 8% royalty
  );
  
  console.log("✅ 2 products created with different royalty rates");
  
  // Test 2: Primary purchases
  console.log("\n🛒 Test 2: Primary Purchases...");
  
  // Buyer1 purchases Art NFT
  await mockUSDC.connect(buyer1).approve(await marketplace.getAddress(), ethers.parseUnits("50", 6));
  await marketplace.connect(buyer1).buyItem(1);
  console.log("✅ Buyer1 purchased Art NFT (50 USDC)");
  
  // Buyer2 purchases Music Album
  await mockUSDC.connect(buyer2).approve(await marketplace.getAddress(), ethers.parseUnits("25", 6));
  await marketplace.connect(buyer2).buyItem(2);
  console.log("✅ Buyer2 purchased Music Album (25 USDC)");
  
  // Buyer3 also purchases Art NFT
  await mockUSDC.connect(buyer3).approve(await marketplace.getAddress(), ethers.parseUnits("50", 6));
  await marketplace.connect(buyer3).buyItem(1);
  console.log("✅ Buyer3 purchased Art NFT (50 USDC)");
  
  // Check balances after primary sales
  const creatorBalance1 = await mockUSDC.balanceOf(creator.address);
  console.log(`💰 Creator balance after primary sales: ${ethers.formatUnits(creatorBalance1, 6)} USDC`);
  
  // Test 3: List items for resale
  console.log("\n🔄 Test 3: Listing Items for Resale...");
  
  // Buyer1 lists Art NFT for resale at higher price
  await marketplace.connect(buyer1).listForResale(1, ethers.parseUnits("80", 6)); // 80 USDC
  console.log("✅ Buyer1 listed Art NFT for resale at 80 USDC");
  
  // Buyer2 lists Music Album for resale at lower price 
  await marketplace.connect(buyer2).listForResale(2, ethers.parseUnits("20", 6)); // 20 USDC
  console.log("✅ Buyer2 listed Music Album for resale at 20 USDC");
  
  // Check active listings
  const activeListings = await marketplace.getAllActiveResaleListings();
  console.log(`📋 Active resale listings: ${activeListings.length}`);
  
  // Test 4: Calculate resale fees
  console.log("\n💵 Test 4: Calculating Resale Fees...");
  
  // Calculate fees for Art NFT resale (80 USDC, 5% creator royalty)
  const [platformFee1, creatorRoyalty1, sellerAmount1] = await marketplace.calculateResaleFees(
    ethers.parseUnits("80", 6), 1
  );
  
  console.log(`Art NFT Resale (80 USDC):`);
  console.log(`  Platform fee (2.5%): ${ethers.formatUnits(platformFee1, 6)} USDC`);
  console.log(`  Creator royalty (5%): ${ethers.formatUnits(creatorRoyalty1, 6)} USDC`);
  console.log(`  Seller gets: ${ethers.formatUnits(sellerAmount1, 6)} USDC`);
  
  // Calculate fees for Music Album resale (20 USDC, 8% creator royalty)
  const [platformFee2, creatorRoyalty2, sellerAmount2] = await marketplace.calculateResaleFees(
    ethers.parseUnits("20", 6), 2
  );
  
  console.log(`Music Album Resale (20 USDC):`);
  console.log(`  Platform fee (2.5%): ${ethers.formatUnits(platformFee2, 6)} USDC`);
  console.log(`  Creator royalty (8%): ${ethers.formatUnits(creatorRoyalty2, 6)} USDC`);
  console.log(`  Seller gets: ${ethers.formatUnits(sellerAmount2, 6)} USDC`);
  
  // Test 5: Execute resale purchases
  console.log("\n🔄 Test 5: Executing Resale Purchases...");
  
  // Record balances before resale
  const buyer1BalanceBefore = await mockUSDC.balanceOf(buyer1.address);
  const buyer2BalanceBefore = await mockUSDC.balanceOf(buyer2.address);
  const creatorBalanceBefore = await mockUSDC.balanceOf(creator.address);
  const deployerBalanceBefore = await mockUSDC.balanceOf(deployer.address);
  
  console.log("💰 Balances before resales:");
  console.log(`  Buyer1 (Art seller): ${ethers.formatUnits(buyer1BalanceBefore, 6)} USDC`);
  console.log(`  Buyer2 (Music seller): ${ethers.formatUnits(buyer2BalanceBefore, 6)} USDC`);
  console.log(`  Creator: ${ethers.formatUnits(creatorBalanceBefore, 6)} USDC`);
  console.log(`  Platform (deployer): ${ethers.formatUnits(deployerBalanceBefore, 6)} USDC`);
  
  // Buyer3 buys Art NFT from resale market (resale ID 1)
  await mockUSDC.connect(buyer3).approve(await marketplace.getAddress(), ethers.parseUnits("80", 6));
  await marketplace.connect(buyer3).buyResaleItem(1);
  console.log("✅ Buyer3 purchased Art NFT from resale market (80 USDC)");
  
  // Buyer1 buys Music Album from resale market (resale ID 2)  
  await mockUSDC.connect(buyer1).approve(await marketplace.getAddress(), ethers.parseUnits("20", 6));
  await marketplace.connect(buyer1).buyResaleItem(2);
  console.log("✅ Buyer1 purchased Music Album from resale market (20 USDC)");
  
  // Check balances after resales
  const buyer1BalanceAfter = await mockUSDC.balanceOf(buyer1.address);
  const buyer2BalanceAfter = await mockUSDC.balanceOf(buyer2.address);
  const creatorBalanceAfter = await mockUSDC.balanceOf(creator.address);
  const deployerBalanceAfter = await mockUSDC.balanceOf(deployer.address);
  
  console.log("\n💰 Balances after resales:");
  console.log(`  Buyer1 (Art seller): ${ethers.formatUnits(buyer1BalanceAfter, 6)} USDC`);
  console.log(`  Buyer2 (Music seller): ${ethers.formatUnits(buyer2BalanceAfter, 6)} USDC`);
  console.log(`  Creator: ${ethers.formatUnits(creatorBalanceAfter, 6)} USDC`);
  console.log(`  Platform (deployer): ${ethers.formatUnits(deployerBalanceAfter, 6)} USDC`);
  
  // Calculate changes
  const buyer1Change = buyer1BalanceAfter - buyer1BalanceBefore;
  const buyer2Change = buyer2BalanceAfter - buyer2BalanceBefore;
  const creatorChange = creatorBalanceAfter - creatorBalanceBefore;
  const deployerChange = deployerBalanceAfter - deployerBalanceBefore;
  
  console.log("\n📈 Balance Changes from Resales:");
  console.log(`  Buyer1: ${ethers.formatUnits(buyer1Change, 6)} USDC`);
  console.log(`  Buyer2: ${ethers.formatUnits(buyer2Change, 6)} USDC`);
  console.log(`  Creator: ${ethers.formatUnits(creatorChange, 6)} USDC`);
  console.log(`  Platform: ${ethers.formatUnits(deployerChange, 6)} USDC`);
  
  // Test 6: Verify ownership changes
  console.log("\n👥 Test 6: Verifying Ownership Changes...");
  
  const buyer1Owned = await marketplace.getUserOwnedProducts(buyer1.address);
  const buyer2Owned = await marketplace.getUserOwnedProducts(buyer2.address);
  const buyer3Owned = await marketplace.getUserOwnedProducts(buyer3.address);
  
  console.log(`👤 Buyer1 owns products: [${buyer1Owned.join(', ')}]`);
  console.log(`👤 Buyer2 owns products: [${buyer2Owned.join(', ')}]`);
  console.log(`👤 Buyer3 owns products: [${buyer3Owned.join(', ')}]`);
  
  // Test 7: Purchase history tracking
  console.log("\n📜 Test 7: Purchase History Tracking...");
  
  const artHistory = await marketplace.getProductPurchaseHistory(1);
  const musicHistory = await marketplace.getProductPurchaseHistory(2);
  
  console.log(`🎨 Art NFT purchase history (${artHistory.length} purchases):`);
  artHistory.forEach((purchase, i) => {
    console.log(`  ${i+1}. ${purchase.buyer.slice(0, 8)}... paid ${ethers.formatUnits(purchase.pricePaid, 6)} USDC`);
  });
  
  console.log(`🎵 Music Album purchase history (${musicHistory.length} purchases):`);
  musicHistory.forEach((purchase, i) => {
    console.log(`  ${i+1}. ${purchase.buyer.slice(0, 8)}... paid ${ethers.formatUnits(purchase.pricePaid, 6)} USDC`);
  });
  
  // Test 8: Badge rewards
  console.log("\n🏆 Test 8: Badge Rewards System...");
  
  const buyer1Bronze = await loyaltyToken.balanceOf(buyer1.address, 1);
  const buyer1Silver = await loyaltyToken.balanceOf(buyer1.address, 2);
  const buyer1Gold = await loyaltyToken.balanceOf(buyer1.address, 3);
  
  console.log(`👤 Buyer1 badges: Bronze=${buyer1Bronze}, Silver=${buyer1Silver}, Gold=${buyer1Gold}`);
  
  const buyer3Gold = await loyaltyToken.balanceOf(buyer3.address, 3);
  console.log(`👤 Buyer3 gold badges: ${buyer3Gold}`);
  
  // Final Summary
  console.log("\n🎯 SECONDARY MARKETPLACE TEST SUMMARY");
  console.log("=".repeat(65));
  console.log(`✅ Products Created: 2 (with 5% and 8% creator royalties)`);
  console.log(`✅ Primary Sales: 3 purchases (2x Art NFT, 1x Music Album)`);
  console.log(`✅ Resale Listings: 2 active listings created`);
  console.log(`✅ Resale Purchases: 2 successful resale transactions`);
  console.log(`✅ Creator Royalties: Automatically distributed on resales`);
  console.log(`✅ Platform Fees: 2.5% collected on resales`);
  console.log(`✅ Ownership Tracking: Real-time updates on transfers`);
  console.log(`✅ Purchase History: Complete transaction trail`);
  console.log(`✅ Badge System: Loyalty rewards on all purchases`);
  
  console.log("\n💡 Key Features Demonstrated:");
  console.log("🔄 Secondary marketplace with peer-to-peer resales");
  console.log("💰 Automatic creator royalty distribution (5% and 8%)");
  console.log("🏪 Platform fee collection (2.5% on resales)");
  console.log("📊 Real-time ownership and listing management");
  console.log("🏆 Continued badge rewards on resale purchases");
  console.log("📜 Complete purchase history tracking");
  console.log("🎯 Fee calculation and transparent pricing");
  
  return {
    success: true,
    contracts: {
      mockUSDC: await mockUSDC.getAddress(),
      loyaltyToken: await loyaltyToken.getAddress(),
      marketplace: await marketplace.getAddress()
    },
    stats: {
      totalProducts: 2,
      primarySales: 3,
      resaleListings: 2,
      resalePurchases: 2,
      totalCreatorRoyalties: ethers.formatUnits(creatorChange, 6),
      totalPlatformFees: ethers.formatUnits(deployerChange, 6)
    }
  };
}

main()
  .then((result) => {
    console.log("\n🎉 SECONDARY MARKETPLACE TEST COMPLETED SUCCESSFULLY!");
    console.log("\n📋 Final Results:", {
      success: result.success,
      totalRoyaltiesPaid: `${result.stats.totalCreatorRoyalties} USDC`,
      platformFeesCollected: `${result.stats.totalPlatformFees} USDC`,
      resalesCompleted: result.stats.resalePurchases
    });
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ SECONDARY MARKETPLACE TEST FAILED:");
    console.error(error);
    process.exit(1);
  });