const { ethers } = require('hardhat');

async function main() {
  console.log('🧪 === FINAL INTEGRATION TEST ===');
  
  const [signer] = await ethers.getSigners();
  const userAddress = signer.address;
  
  // Updated contract addresses
  const mockUSDCAddress = '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318';
  const creatorStoreAddress = '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e';
  const loyaltyTokenAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
  
  console.log('👤 User address:', userAddress);
  console.log('💰 MockUSDC:', mockUSDCAddress);
  console.log('🏪 CreatorStore:', creatorStoreAddress);
  console.log('🏆 LoyaltyToken:', loyaltyTokenAddress);
  
  // Get contract instances
  const MockUSDC = await ethers.getContractFactory('MockUSDC');
  const CreatorStore = await ethers.getContractFactory('CreatorStore');
  const LoyaltyToken = await ethers.getContractFactory('LoyaltyToken');
  
  const mockUSDC = MockUSDC.attach(mockUSDCAddress);
  const creatorStore = CreatorStore.attach(creatorStoreAddress);
  const loyaltyToken = LoyaltyToken.attach(loyaltyTokenAddress);
  
  console.log('\n🔍 === PRE-TEST STATUS ===');
  
  // Check balances
  const ethBalance = await signer.provider.getBalance(userAddress);
  const usdcBalance = await mockUSDC.balanceOf(userAddress);
  const bronzeBadges = await loyaltyToken.balanceOf(userAddress, 1);
  
  console.log('ETH Balance:', ethers.formatEther(ethBalance), 'ETH');
  console.log('USDC Balance:', ethers.formatUnits(usdcBalance, 6), 'USDC');
  console.log('Bronze Badges:', bronzeBadges.toString());
  
  // Check products
  const allProducts = await creatorStore.getAllProducts();
  console.log('Available Products:', allProducts.length);
  
  if (allProducts.length === 0) {
    console.log('❌ No products available! Run add-test-products script first.');
    return;
  }
  
  // Test complete purchase flow
  console.log('\n🛒 === PURCHASE FLOW TEST ===');
  
  const testProduct = allProducts[0];
  const productPrice = testProduct.priceInUSDC;
  
  console.log(`Testing purchase of: ${testProduct.name}`);
  console.log(`Price: ${ethers.formatUnits(productPrice, 6)} USDC`);
  
  // Step 1: Check/Set USDC balance
  if (usdcBalance < productPrice) {
    console.log('📲 Getting USDC from faucet...');
    const faucetTx = await mockUSDC.faucet(ethers.parseUnits('1000', 6));
    await faucetTx.wait();
    console.log('✅ Faucet successful');
  }
  
  // Step 2: Approve USDC spend
  const currentAllowance = await mockUSDC.allowance(userAddress, creatorStoreAddress);
  if (currentAllowance < productPrice) {
    console.log('📝 Approving USDC spend...');
    const approveTx = await mockUSDC.approve(creatorStoreAddress, productPrice);
    await approveTx.wait();
    console.log('✅ Approval successful');
  }
  
  // Step 3: Purchase product
  console.log('🛍️  Purchasing product...');
  const purchaseTx = await creatorStore.buyItem(testProduct.id);
  const receipt = await purchaseTx.wait();
  console.log('✅ Purchase successful!');
  
  // Verify results
  console.log('\n📊 === POST-PURCHASE VERIFICATION ===');
  
  const newUsdcBalance = await mockUSDC.balanceOf(userAddress);
  const newBronzeBadges = await loyaltyToken.balanceOf(userAddress, 1);
  const userPurchases = await creatorStore.getUserPurchases(userAddress);
  
  console.log('New USDC Balance:', ethers.formatUnits(newUsdcBalance, 6), 'USDC');
  console.log('New Bronze Badges:', newBronzeBadges.toString());
  console.log('Total Purchases:', userPurchases.length);
  
  const usdcSpent = usdcBalance - newUsdcBalance;
  const badgesEarned = newBronzeBadges - bronzeBadges;
  
  console.log('\n🎯 === SUMMARY ===');
  console.log('USDC Spent:', ethers.formatUnits(usdcSpent, 6), 'USDC');
  console.log('Badges Earned:', badgesEarned.toString());
  console.log('Transaction Hash:', receipt.hash);
  console.log('Gas Used:', receipt.gasUsed.toString());
  
  if (usdcSpent > 0 && userPurchases.length > 0) {
    console.log('🎉 ✅ ALL TESTS PASSED! The purchase flow is working perfectly!');
  } else {
    console.log('❌ Something went wrong with the purchase flow.');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });