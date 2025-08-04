const { ethers } = require('hardhat');

async function main() {
  console.log('💱 === REVENUE SHARING TEST (FIXED) ===');
  
  const [deployer, creator, buyer1, buyer2] = await ethers.getSigners();
  
  // Contract addresses
  const mockUSDCAddress = '0x851356ae760d987E095750cCeb3bC6014560891C';
  const secondaryMarketplaceAddress = '0x998abeb3E57409262aE5b751f60747921B33613E';
  
  // Get contract instances
  const MockUSDC = await ethers.getContractFactory('MockUSDC');
  const SecondaryMarketplace = await ethers.getContractFactory('SecondaryMarketplace');
  
  const mockUSDC = MockUSDC.attach(mockUSDCAddress);
  const secondaryMarketplace = SecondaryMarketplace.attach(secondaryMarketplaceAddress);
  
  console.log('\n👥 === PARTICIPANTS ===');
  console.log('Deployer (Contract Owner & Product Creator):', deployer.address);
  console.log('Buyer 1 (Seller):', buyer1.address);
  console.log('Buyer 2 (Buyer):', buyer2.address);
  
  // Setup funds
  console.log('\n💰 Setting up test funds...');
  await mockUSDC.connect(buyer1).faucet(ethers.parseUnits('1000', 6));
  await mockUSDC.connect(buyer2).faucet(ethers.parseUnits('1000', 6));
  
  // Approve spending
  await mockUSDC.connect(buyer1).approve(secondaryMarketplaceAddress, ethers.parseUnits('100', 6));
  await mockUSDC.connect(buyer2).approve(secondaryMarketplaceAddress, ethers.parseUnits('100', 6));
  
  // Get products
  const products = await secondaryMarketplace.getAllProducts();
  const testProduct = products[0];
  console.log(`\n🛍️ Test Product: ${testProduct.name}`);
  console.log(`💲 Price: ${ethers.formatUnits(testProduct.priceInUSDC, 6)} USDC`);
  console.log(`👤 Product Creator: ${testProduct.creator}`);
  
  // Buyer1 makes initial purchase
  console.log('\n🛒 Step 1: Buyer1 makes primary purchase...');
  await secondaryMarketplace.connect(buyer1).buyItem(testProduct.id);
  console.log('✅ Primary purchase completed');
  
  // Buyer1 lists for resale
  const resalePrice = ethers.parseUnits('2.0', 6);
  console.log(`\n🏷️ Step 2: Buyer1 lists product for resale at ${ethers.formatUnits(resalePrice, 6)} USDC...`);
  await secondaryMarketplace.connect(buyer1).listForResale(testProduct.id, resalePrice);
  
  const resaleListings = await secondaryMarketplace.getAllActiveResaleListings();
  console.log(`✅ Resale listing created: ID ${resaleListings[0].id}`);
  
  // Get balances before resale (checking correct addresses)
  console.log('\n📊 Step 3: Recording balances before resale...');
  const buyer1BalanceBefore = await mockUSDC.balanceOf(buyer1.address);
  const deployerBalanceBefore = await mockUSDC.balanceOf(deployer.address); // Correct creator address
  const contractBalanceBefore = await mockUSDC.balanceOf(secondaryMarketplaceAddress);
  
  console.log(`Buyer1 (seller): ${ethers.formatUnits(buyer1BalanceBefore, 6)} USDC`);
  console.log(`Deployer (creator): ${ethers.formatUnits(deployerBalanceBefore, 6)} USDC`);
  console.log(`Contract: ${ethers.formatUnits(contractBalanceBefore, 6)} USDC`);
  
  // Calculate expected fees
  const feeCalculation = await secondaryMarketplace.calculateResaleFees(resalePrice, testProduct.id);
  console.log('\n🧮 Expected revenue split:');
  console.log(`Platform Fee: ${ethers.formatUnits(feeCalculation.platformFee, 6)} USDC (2.5%)`);
  console.log(`Creator Royalty: ${ethers.formatUnits(feeCalculation.creatorRoyalty, 6)} USDC (5.0%)`);
  console.log(`Seller Amount: ${ethers.formatUnits(feeCalculation.sellerAmount, 6)} USDC (92.5%)`);
  
  // Buyer2 purchases the resale item
  console.log('\n💸 Step 4: Buyer2 purchases resale item...');
  await secondaryMarketplace.connect(buyer2).buyResaleItem(resaleListings[0].id);
  console.log('✅ Resale transaction completed');
  
  // Get balances after resale
  console.log('\n📈 Step 5: Checking balances after resale...');
  const buyer1BalanceAfter = await mockUSDC.balanceOf(buyer1.address);
  const deployerBalanceAfter = await mockUSDC.balanceOf(deployer.address);
  const contractBalanceAfter = await mockUSDC.balanceOf(secondaryMarketplaceAddress);
  
  console.log(`Buyer1 (seller): ${ethers.formatUnits(buyer1BalanceAfter, 6)} USDC`);
  console.log(`Deployer (creator): ${ethers.formatUnits(deployerBalanceAfter, 6)} USDC`);
  console.log(`Contract: ${ethers.formatUnits(contractBalanceAfter, 6)} USDC`);
  
  // Calculate actual distributions
  const buyer1Received = buyer1BalanceAfter - buyer1BalanceBefore;
  const deployerReceived = deployerBalanceAfter - deployerBalanceBefore;
  const contractReceived = contractBalanceAfter - contractBalanceBefore;
  
  console.log('\n💰 Actual revenue distribution:');
  console.log(`Seller received: ${ethers.formatUnits(buyer1Received, 6)} USDC`);
  console.log(`Creator received: ${ethers.formatUnits(deployerReceived, 6)} USDC`);
  console.log(`Platform received: ${ethers.formatUnits(contractReceived, 6)} USDC`);
  
  // Verify amounts match expectations
  const sellerMatch = buyer1Received === feeCalculation.sellerAmount;
  const creatorMatch = deployerReceived === feeCalculation.creatorRoyalty;
  const platformMatch = contractReceived === feeCalculation.platformFee;
  
  console.log('\n🎯 Revenue sharing verification:');
  console.log(`Seller amount: ${sellerMatch ? '✅ CORRECT' : '❌ INCORRECT'} (Expected: ${ethers.formatUnits(feeCalculation.sellerAmount, 6)}, Got: ${ethers.formatUnits(buyer1Received, 6)})`);
  console.log(`Creator royalty: ${creatorMatch ? '✅ CORRECT' : '❌ INCORRECT'} (Expected: ${ethers.formatUnits(feeCalculation.creatorRoyalty, 6)}, Got: ${ethers.formatUnits(deployerReceived, 6)})`);
  console.log(`Platform fee: ${platformMatch ? '✅ CORRECT' : '❌ INCORRECT'} (Expected: ${ethers.formatUnits(feeCalculation.platformFee, 6)}, Got: ${ethers.formatUnits(contractReceived, 6)})`);
  
  const allCorrect = sellerMatch && creatorMatch && platformMatch;
  
  // Verify total adds up
  const totalDistributed = buyer1Received + deployerReceived + contractReceived;
  const totalCorrect = totalDistributed === resalePrice;
  
  console.log(`Total distributed: ${ethers.formatUnits(totalDistributed, 6)} USDC`);
  console.log(`Total verification: ${totalCorrect ? '✅ CORRECT' : '❌ INCORRECT'} (should equal ${ethers.formatUnits(resalePrice, 6)} USDC)`);
  
  console.log('\n🎉 === FINAL RESULT ===');
  if (allCorrect && totalCorrect) {
    console.log('🎊 ✅ REVENUE SHARING SYSTEM FULLY FUNCTIONAL! ✅ 🎊');
    console.log('✅ Platform fees collected correctly');
    console.log('✅ Creator royalties paid correctly');
    console.log('✅ Seller amount calculated correctly');
    console.log('✅ All amounts add up to 100%');
    console.log('✅ Revenue distribution working perfectly');
  } else {
    console.log('❌ Revenue sharing has issues');
    if (!allCorrect) console.log('  - Amount calculations are incorrect');
    if (!totalCorrect) console.log('  - Total distribution doesn\'t add up');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });