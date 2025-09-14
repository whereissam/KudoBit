const { ethers } = require('hardhat');

async function main() {
  console.log('🔍 === DEBUGGING CREATOR ADDRESSES ===');
  
  const [deployer, creator, buyer1, buyer2] = await ethers.getSigners();
  
  // Contract addresses
  const secondaryMarketplaceAddress = '0x998abeb3E57409262aE5b751f60747921B33613E';
  
  // Get contract instance
  const SecondaryMarketplace = await ethers.getContractFactory('SecondaryMarketplace');
  const secondaryMarketplace = SecondaryMarketplace.attach(secondaryMarketplaceAddress);
  
  console.log('\n👥 === ADDRESSES ===');
  console.log('Deployer:', deployer.address);
  console.log('Creator:', creator.address);
  console.log('Buyer1:', buyer1.address);
  console.log('Buyer2:', buyer2.address);
  
  // Check contract owner
  const contractOwner = await secondaryMarketplace.owner();
  console.log('Contract Owner:', contractOwner);
  
  // Get products and check their creator field
  const products = await secondaryMarketplace.getAllProducts();
  console.log('\n🛍️ === PRODUCTS ===');
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`\nProduct ${i + 1}: ${product.name}`);
    console.log(`  Creator: ${product.creator}`);
    console.log(`  Creator Royalty: ${product.creatorRoyaltyPercentage} basis points (${Number(product.creatorRoyaltyPercentage) / 100}%)`);
    console.log(`  Creator is deployer: ${product.creator === deployer.address}`);
    console.log(`  Creator is creator param: ${product.creator === creator.address}`);
    console.log(`  Creator is zero address: ${product.creator === '0x0000000000000000000000000000000000000000'}`);
  }
  
  // Test fee calculation
  const resalePrice = ethers.parseUnits('2.0', 6);
  const testProduct = products[0];
  
  console.log('\n💰 === FEE CALCULATION TEST ===');
  const feeCalculation = await secondaryMarketplace.calculateResaleFees(resalePrice, testProduct.id);
  console.log(`Resale Price: ${ethers.formatUnits(resalePrice, 6)} USDC`);
  console.log(`Platform Fee: ${ethers.formatUnits(feeCalculation.platformFee, 6)} USDC`);
  console.log(`Creator Royalty: ${ethers.formatUnits(feeCalculation.creatorRoyalty, 6)} USDC`);
  console.log(`Seller Amount: ${ethers.formatUnits(feeCalculation.sellerAmount, 6)} USDC`);
  
  // Check if creator royalty is calculated correctly
  const expectedCreatorRoyalty = (resalePrice * testProduct.creatorRoyaltyPercentage) / BigInt(10000);
  console.log(`Expected Creator Royalty: ${ethers.formatUnits(expectedCreatorRoyalty, 6)} USDC`);
  console.log(`Calculation correct: ${feeCalculation.creatorRoyalty === expectedCreatorRoyalty}`);
  
  // Test constants
  console.log('\n📊 === CONTRACT CONSTANTS ===');
  const platformFee = await secondaryMarketplace.PLATFORM_FEE();
  const defaultCreatorRoyalty = await secondaryMarketplace.DEFAULT_CREATOR_ROYALTY();
  
  console.log(`Platform Fee: ${platformFee} basis points (${Number(platformFee) / 100}%)`);
  console.log(`Default Creator Royalty: ${defaultCreatorRoyalty} basis points (${Number(defaultCreatorRoyalty) / 100}%)`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  });