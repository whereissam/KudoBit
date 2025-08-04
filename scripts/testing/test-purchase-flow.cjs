const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing complete purchase flow...");

  // Get contract instances
  const creatorStoreAddress = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e";
  const loyaltyTokenAddress = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";
  const mockUSDCAddress = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";

  const CreatorStore = await ethers.getContractFactory("CreatorStore");
  const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");

  const creatorStore = CreatorStore.attach(creatorStoreAddress);
  const loyaltyToken = LoyaltyToken.attach(loyaltyTokenAddress);
  const mockUSDC = MockUSDC.attach(mockUSDCAddress);

  // Get test accounts
  const [owner, buyer1, buyer2] = await ethers.getSigners();
  console.log("👤 Owner (Creator):", owner.address);
  console.log("👤 Buyer 1:", buyer1.address);
  console.log("👤 Buyer 2:", buyer2.address);

  try {
    // Step 1: Check initial state
    console.log("\\n📊 Initial State Check:");
    const allProducts = await creatorStore.getAllProducts();
    console.log(`   Products available: ${allProducts.length}`);
    
    if (allProducts.length === 0) {
      console.log("❌ No products found! Please run create-sample-products.cjs first");
      return;
    }

    // Pick the first few products for testing
    const testProduct1 = allProducts[0]; // Should be "Exclusive Wallpaper NFT" - 0.2 USDC
    const testProduct2 = allProducts[3]; // Should be "Digital Art Collection" - 25.99 USDC
    
    console.log(`   Test Product 1: ${testProduct1.name} - ${ethers.formatUnits(testProduct1.priceInUSDC, 6)} USDC`);
    console.log(`   Test Product 2: ${testProduct2.name} - ${ethers.formatUnits(testProduct2.priceInUSDC, 6)} USDC`);

    // Step 2: Give buyers some MockUSDC
    console.log("\\n💰 Setting up buyer wallets with MockUSDC:");
    
    // Give buyer1 some USDC
    await mockUSDC.connect(buyer1).faucet(ethers.parseUnits("1000", 6));
    const buyer1Balance = await mockUSDC.balanceOf(buyer1.address);
    console.log(`   Buyer 1 USDC balance: ${ethers.formatUnits(buyer1Balance, 6)} USDC`);
    
    // Give buyer2 some USDC  
    await mockUSDC.connect(buyer2).faucet(ethers.parseUnits("500", 6));
    const buyer2Balance = await mockUSDC.balanceOf(buyer2.address);
    console.log(`   Buyer 2 USDC balance: ${ethers.formatUnits(buyer2Balance, 6)} USDC`);

    // Step 3: Test Purchase Flow for Buyer 1
    console.log("\\n🛒 Testing Purchase Flow - Buyer 1:");
    
    // Approve USDC spending
    console.log("   Approving USDC for CreatorStore...");
    await mockUSDC.connect(buyer1).approve(creatorStoreAddress, testProduct1.priceInUSDC);
    
    // Check allowance
    const allowance = await mockUSDC.allowance(buyer1.address, creatorStoreAddress);
    console.log(`   Approved amount: ${ethers.formatUnits(allowance, 6)} USDC`);
    
    // Purchase the product
    console.log(`   Purchasing "${testProduct1.name}"...`);
    const purchaseTx = await creatorStore.connect(buyer1).buyItem(testProduct1.id);
    const purchaseReceipt = await purchaseTx.wait();
    console.log(`   ✅ Purchase successful! Gas used: ${purchaseReceipt.gasUsed}`);
    
    // Check buyer's purchases
    const buyer1Purchases = await creatorStore.getUserPurchases(buyer1.address);
    console.log(`   Buyer 1 now owns ${buyer1Purchases.length} products: [${buyer1Purchases.map(p => p.toString()).join(', ')}]`);
    
    // Check loyalty badge
    const loyaltyBadgeId = testProduct1.loyaltyBadgeId;
    const badgeBalance = await loyaltyToken.balanceOf(buyer1.address, loyaltyBadgeId);
    console.log(`   Loyalty badge ${loyaltyBadgeId} balance: ${badgeBalance.toString()}`);

    // Step 4: Test Purchase Flow for Buyer 2 (different product)
    console.log("\\n🛒 Testing Purchase Flow - Buyer 2:");
    
    // Approve and purchase more expensive product
    await mockUSDC.connect(buyer2).approve(creatorStoreAddress, testProduct2.priceInUSDC);
    console.log(`   Purchasing "${testProduct2.name}"...`);
    
    const purchase2Tx = await creatorStore.connect(buyer2).buyItem(testProduct2.id);
    const purchase2Receipt = await purchase2Tx.wait();
    console.log(`   ✅ Purchase successful! Gas used: ${purchase2Receipt.gasUsed}`);
    
    // Check buyer 2's purchases
    const buyer2Purchases = await creatorStore.getUserPurchases(buyer2.address);
    console.log(`   Buyer 2 now owns ${buyer2Purchases.length} products: [${buyer2Purchases.map(p => p.toString()).join(', ')}]`);
    
    // Check loyalty badge
    const loyaltyBadgeId2 = testProduct2.loyaltyBadgeId;
    const badgeBalance2 = await loyaltyToken.balanceOf(buyer2.address, loyaltyBadgeId2);
    console.log(`   Loyalty badge ${loyaltyBadgeId2} balance: ${badgeBalance2.toString()}`);

    // Step 5: Test multiple purchases by same buyer
    console.log("\\n🛒 Testing Multiple Purchases - Buyer 1:");
    
    // Buy another product
    const testProduct3 = allProducts[2]; // Digital Sticker Pack - 0.05 USDC
    await mockUSDC.connect(buyer1).approve(creatorStoreAddress, testProduct3.priceInUSDC);
    
    console.log(`   Purchasing "${testProduct3.name}"...`);
    const purchase3Tx = await creatorStore.connect(buyer1).buyItem(testProduct3.id);
    await purchase3Tx.wait();
    console.log(`   ✅ Second purchase successful!`);
    
    // Check updated purchases
    const buyer1UpdatedPurchases = await creatorStore.getUserPurchases(buyer1.address);
    console.log(`   Buyer 1 now owns ${buyer1UpdatedPurchases.length} products: [${buyer1UpdatedPurchases.map(p => p.toString()).join(', ')}]`);

    // Step 6: Test Creator Revenue Withdrawal
    console.log("\\n💸 Testing Creator Revenue Withdrawal:");
    
    // Check creator's USDC balance before withdrawal
    const creatorBalanceBefore = await mockUSDC.balanceOf(owner.address);
    console.log(`   Creator balance before: ${ethers.formatUnits(creatorBalanceBefore, 6)} USDC`);
    
    // Check contract balance
    const contractBalance = await mockUSDC.balanceOf(creatorStoreAddress);
    console.log(`   Contract balance: ${ethers.formatUnits(contractBalance, 6)} USDC`);
    
    // Withdraw funds
    console.log("   Withdrawing funds...");
    const withdrawTx = await creatorStore.connect(owner).withdrawFunds();
    await withdrawTx.wait();
    console.log("   ✅ Withdrawal successful!");
    
    // Check creator's balance after withdrawal
    const creatorBalanceAfter = await mockUSDC.balanceOf(owner.address);
    console.log(`   Creator balance after: ${ethers.formatUnits(creatorBalanceAfter, 6)} USDC`);
    
    const revenue = creatorBalanceAfter - creatorBalanceBefore;
    console.log(`   Revenue earned: ${ethers.formatUnits(revenue, 6)} USDC`);

    // Step 7: Final Summary
    console.log("\\n📈 Final Test Summary:");
    
    // Get all products again to see updated state
    const finalProducts = await creatorStore.getAllProducts();
    console.log(`   Total products: ${finalProducts.length}`);
    
    // Check total purchases across all buyers
    const allBuyer1Purchases = await creatorStore.getUserPurchases(buyer1.address);
    const allBuyer2Purchases = await creatorStore.getUserPurchases(buyer2.address);
    
    console.log(`   Buyer 1 total purchases: ${allBuyer1Purchases.length}`);
    console.log(`   Buyer 2 total purchases: ${allBuyer2Purchases.length}`);
    
    // Check loyalty badge distribution
    const buyer1Bronze = await loyaltyToken.balanceOf(buyer1.address, 1);
    const buyer1Silver = await loyaltyToken.balanceOf(buyer1.address, 2);
    const buyer1Gold = await loyaltyToken.balanceOf(buyer1.address, 3);
    
    const buyer2Bronze = await loyaltyToken.balanceOf(buyer2.address, 1);
    const buyer2Silver = await loyaltyToken.balanceOf(buyer2.address, 2);
    const buyer2Gold = await loyaltyToken.balanceOf(buyer2.address, 3);
    
    console.log("\\n🏆 Loyalty Badge Summary:");
    console.log(`   Buyer 1 - Bronze: ${buyer1Bronze}, Silver: ${buyer1Silver}, Gold: ${buyer1Gold}`);
    console.log(`   Buyer 2 - Bronze: ${buyer2Bronze}, Silver: ${buyer2Silver}, Gold: ${buyer2Gold}`);
    
    console.log("\\n🎉 All purchase flow tests completed successfully!");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.reason) {
      console.error("   Reason:", error.reason);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });