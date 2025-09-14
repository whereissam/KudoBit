const { ethers } = require('hardhat');

async function testSystem() {
  console.log('🧪 Testing KudoBit system...');
  
  // Connect to the ProductNFT contract
  const productNFT = await ethers.getContractAt('ProductNFT', '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0');
  
  try {
    // Test getting product count
    const productCount = await productNFT.productCounter();
    console.log(`📦 Total products: ${productCount}`);
    
    // Get first few products
    for (let i = 1; i <= Math.min(productCount, 3); i++) {
      const product = await productNFT.products(i);
      console.log(`🛍️  Product ${i}: ${product.title} - $${ethers.utils.formatUnits(product.price, 6)} USDC`);
      console.log(`    📝 Description: ${product.description}`);
      console.log(`    👤 Creator: ${product.creator}`);
      console.log(`    ✅ Active: ${product.active}`);
    }
    
    console.log('✅ Contract interaction successful!');
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testSystem().catch(console.error);
