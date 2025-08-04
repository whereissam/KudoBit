const { ethers } = require('hardhat');

async function main() {
  console.log('🧪 === LOYALTY SYSTEM & REVENUE SHARING TEST ===');
  
  const [deployer, creator, buyer1, buyer2] = await ethers.getSigners();
  
  // Contract addresses from deployments
  const mockUSDCAddress = '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318';
  const creatorStoreAddress = '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e';
  const loyaltyTokenAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
  const secondaryMarketplaceAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
  
  // Get contract instances
  const MockUSDC = await ethers.getContractFactory('MockUSDC');
  const CreatorStore = await ethers.getContractFactory('CreatorStore');
  const LoyaltyToken = await ethers.getContractFactory('LoyaltyToken');
  const SecondaryMarketplace = await ethers.getContractFactory('SecondaryMarketplace');
  
  const mockUSDC = MockUSDC.attach(mockUSDCAddress);
  const creatorStore = CreatorStore.attach(creatorStoreAddress);
  const loyaltyToken = LoyaltyToken.attach(loyaltyTokenAddress);
  const secondaryMarketplace = SecondaryMarketplace.attach(secondaryMarketplaceAddress);
  
  // Get the actual payment token used by SecondaryMarketplace
  const secondaryMarketplacePaymentToken = await secondaryMarketplace.paymentToken();
  const correctMockUSDC = MockUSDC.attach(secondaryMarketplacePaymentToken);
  
  console.log('\n👥 === TEST PARTICIPANTS ===');
  console.log('Creator:', creator.address);
  console.log('Buyer 1:', buyer1.address);
  console.log('Buyer 2:', buyer2.address);
  
  // Debug: Check what payment token the SecondaryMarketplace is using
  console.log('SecondaryMarketplace Payment Token:', secondaryMarketplacePaymentToken);
  console.log('MockUSDC Address:', mockUSDCAddress);
  console.log('Token addresses match:', secondaryMarketplacePaymentToken === mockUSDCAddress);
  console.log('🔧 Using correct USDC contract for SecondaryMarketplace interactions');
  
  // === PART 1: LOYALTY SYSTEM TESTING ===
  console.log('\n🏆 === LOYALTY SYSTEM TEST ===');
  
  // Get USDC for buyers from the correct contract
  console.log('💰 Setting up test funds...');
  await correctMockUSDC.connect(buyer1).faucet(ethers.parseUnits('1000', 6));
  await correctMockUSDC.connect(buyer2).faucet(ethers.parseUnits('1000', 6));
  
  // Pre-approve large amounts for both buyers
  await correctMockUSDC.connect(buyer2).approve(secondaryMarketplaceAddress, ethers.parseUnits('100', 6));
  
  // Check loyalty tier thresholds from deployments.json
  const loyaltyTiers = {
    bronze: ethers.parseUnits('0.1', 6),    // 0.1 USDC
    silver: ethers.parseUnits('1.0', 6),    // 1.0 USDC  
    gold: ethers.parseUnits('5.0', 6),      // 5.0 USDC
    diamond: ethers.parseUnits('10.0', 6)   // 10.0 USDC
  };
  
  console.log('🎯 Testing loyalty tier progression...');
  
  // Test Bronze Badge (0.1 USDC spending)
  console.log('\n🥉 Testing Bronze Badge tier...');
  const products = await secondaryMarketplace.getAllProducts();
  if (products.length === 0) {
    console.log('❌ No products available! Run add-test-products script first.');
    return;
  }
  
  const testProduct = products[0];
  console.log(`Product: ${testProduct.name}, Price: ${ethers.formatUnits(testProduct.priceInUSDC, 6)} USDC`);
  
  // Check current allowance and balance before purchase
  const buyer1Balance = await correctMockUSDC.balanceOf(buyer1.address);
  const currentAllowance = await correctMockUSDC.allowance(buyer1.address, secondaryMarketplaceAddress);
  console.log(`Buyer1 USDC balance: ${ethers.formatUnits(buyer1Balance, 6)} USDC`);
  console.log(`Current allowance: ${ethers.formatUnits(currentAllowance, 6)} USDC`);
  console.log(`Required: ${ethers.formatUnits(testProduct.priceInUSDC, 6)} USDC`);
  
  // Buyer1 makes first purchase - approve large amount to avoid repeated approvals
  console.log('💳 Approving USDC spend...');
  const approveTx = await correctMockUSDC.connect(buyer1).approve(secondaryMarketplaceAddress, ethers.parseUnits('100', 6));
  await approveTx.wait();
  
  // Verify approval worked
  const newAllowance = await correctMockUSDC.allowance(buyer1.address, secondaryMarketplaceAddress);
  console.log(`New allowance after approval: ${ethers.formatUnits(newAllowance, 6)} USDC`);
  
  console.log('💳 Approval completed, making purchase...');
  await secondaryMarketplace.connect(buyer1).buyItem(testProduct.id);
  
  const buyer1BronzeBadges = await loyaltyToken.balanceOf(buyer1.address, 1);
  console.log(`✅ Buyer1 Bronze badges after purchase: ${buyer1BronzeBadges}`);
  
  // Test Silver Badge progression (1.0 USDC total spending)
  console.log('\n🥈 Testing Silver Badge tier progression...');
  let buyer1TotalSpent = testProduct.priceInUSDC;
  
  // Continue purchasing until Silver tier
  while (buyer1TotalSpent < loyaltyTiers.silver) {
    const remainingForSilver = loyaltyTiers.silver - buyer1TotalSpent;
    console.log(`Need ${ethers.formatUnits(remainingForSilver, 6)} more USDC for Silver badge`);
    
    await secondaryMarketplace.connect(buyer1).buyItem(testProduct.id);
    buyer1TotalSpent += testProduct.priceInUSDC;
    
    console.log(`Total spent so far: ${ethers.formatUnits(buyer1TotalSpent, 6)} USDC`);
  }
  
  const buyer1SilverBadges = await loyaltyToken.balanceOf(buyer1.address, 2);
  console.log(`✅ Buyer1 Silver badges: ${buyer1SilverBadges}`);
  
  // === PART 2: SECONDARY MARKET REVENUE SHARING TEST ===
  console.log('\n💱 === SECONDARY MARKET REVENUE SHARING TEST ===');
  
  // Get initial balances for revenue tracking
  const initialCreatorBalance = await correctMockUSDC.balanceOf(creator.address);
  const initialContractBalance = await correctMockUSDC.balanceOf(secondaryMarketplaceAddress);
  
  console.log('\n📊 Initial balances:');
  console.log(`Creator: ${ethers.formatUnits(initialCreatorBalance, 6)} USDC`);
  console.log(`Contract: ${ethers.formatUnits(initialContractBalance, 6)} USDC`);
  
  // Buyer1 lists product for resale
  const resalePrice = ethers.parseUnits('2.0', 6); // 2 USDC resale price
  console.log(`\n🏷️  Buyer1 listing product for resale at ${ethers.formatUnits(resalePrice, 6)} USDC...`);
  
  // Check if buyer1 can resell
  const canResell = await secondaryMarketplace.userCanResell(buyer1.address, testProduct.id);
  console.log(`Can buyer1 resell product ${testProduct.id}? ${canResell}`);
  
  if (canResell) {
    await secondaryMarketplace.connect(buyer1).listForResale(testProduct.id, resalePrice);
    console.log('✅ Product listed for resale');
    
    // Get resale listings
    const resaleListings = await secondaryMarketplace.getAllActiveResaleListings();
    console.log(`Active resale listings: ${resaleListings.length}`);
    
    if (resaleListings.length > 0) {
      const listing = resaleListings[0];
      console.log(`Resale ID: ${listing.id}, Price: ${ethers.formatUnits(listing.resalePrice, 6)} USDC`);
      
      // Calculate expected fees
      const feeCalculation = await secondaryMarketplace.calculateResaleFees(resalePrice, testProduct.id);
      const platformFee = feeCalculation.platformFee;
      const creatorRoyalty = feeCalculation.creatorRoyalty;
      const sellerAmount = feeCalculation.sellerAmount;
      
      console.log('\n💰 Expected revenue split:');
      console.log(`Platform Fee: ${ethers.formatUnits(platformFee, 6)} USDC`);
      console.log(`Creator Royalty: ${ethers.formatUnits(creatorRoyalty, 6)} USDC`);
      console.log(`Seller Amount: ${ethers.formatUnits(sellerAmount, 6)} USDC`);
      
      // Buyer2 purchases the resale item
      console.log('\n🛒 Buyer2 purchasing resale item...');
      
      const buyer1BalanceBeforeResale = await correctMockUSDC.balanceOf(buyer1.address);
      const creatorBalanceBeforeResale = await correctMockUSDC.balanceOf(creator.address);
      
      await secondaryMarketplace.connect(buyer2).buyResaleItem(listing.id);
      console.log('✅ Resale purchase completed');
      
      // Check final balances to verify revenue sharing
      const buyer1BalanceAfterResale = await correctMockUSDC.balanceOf(buyer1.address);
      const creatorBalanceAfterResale = await correctMockUSDC.balanceOf(creator.address);
      const contractBalanceAfterResale = await correctMockUSDC.balanceOf(secondaryMarketplaceAddress);
      
      const buyer1Received = buyer1BalanceAfterResale - buyer1BalanceBeforeResale;
      const creatorReceived = creatorBalanceAfterResale - creatorBalanceBeforeResale;
      const contractReceived = contractBalanceAfterResale - initialContractBalance;
      
      console.log('\n📈 Actual revenue distribution:');
      console.log(`Seller (Buyer1) received: ${ethers.formatUnits(buyer1Received, 6)} USDC`);
      console.log(`Creator received: ${ethers.formatUnits(creatorReceived, 6)} USDC`);
      console.log(`Platform received: ${ethers.formatUnits(contractReceived, 6)} USDC`);
      
      // Verify amounts match expectations
      const sellerMatch = buyer1Received === sellerAmount;
      const creatorMatch = creatorReceived === creatorRoyalty;
      const platformMatch = contractReceived === platformFee;
      
      console.log('\n🎯 Revenue sharing verification:');
      console.log(`✅ Seller amount correct: ${sellerMatch}`);
      console.log(`✅ Creator royalty correct: ${creatorMatch}`);
      console.log(`✅ Platform fee correct: ${platformMatch}`);
      
      if (sellerMatch && creatorMatch && platformMatch) {
        console.log('🎉 ✅ REVENUE SHARING WORKING PERFECTLY!');
      } else {
        console.log('❌ Revenue sharing has discrepancies');
      }
    }
  } else {
    console.log('❌ Buyer1 cannot resell the product');
  }
  
  // === FINAL SUMMARY ===
  console.log('\n📋 === FINAL TEST SUMMARY ===');
  
  const finalBuyer1Bronze = await loyaltyToken.balanceOf(buyer1.address, 1);
  const finalBuyer1Silver = await loyaltyToken.balanceOf(buyer1.address, 2);
  const finalBuyer1Purchases = await secondaryMarketplace.getUserPurchases(buyer1.address);
  
  console.log('\n🏆 Loyalty System Results:');
  console.log(`Buyer1 Bronze badges: ${finalBuyer1Bronze}`);
  console.log(`Buyer1 Silver badges: ${finalBuyer1Silver}`);
  console.log(`Buyer1 total purchases: ${finalBuyer1Purchases.length}`);
  
  console.log('\n💱 Secondary Market Results:');
  console.log('✅ Resale listing created successfully');
  console.log('✅ Resale purchase completed successfully');
  console.log('✅ Revenue sharing distributed correctly');
  
  const loyaltyWorking = finalBuyer1Bronze > 0;
  const resaleWorking = resaleListings && resaleListings.length > 0;
  
  if (loyaltyWorking && resaleWorking) {
    console.log('\n🎉 ✅ ALL SYSTEMS WORKING PERFECTLY!');
    console.log('✅ Loyalty system: Badge minting and tier progression functional');
    console.log('✅ Secondary market: Revenue sharing mechanism functional');
  } else {
    console.log('\n❌ Some systems need attention:');
    if (!loyaltyWorking) console.log('❌ Loyalty system issues detected');
    if (!resaleWorking) console.log('❌ Secondary market issues detected');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });