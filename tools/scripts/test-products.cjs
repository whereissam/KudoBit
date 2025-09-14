const { ethers } = require('hardhat');

async function testProducts() {
  console.log('🔍 Testing ProductNFT contract...');
  
  const productNFT = await ethers.getContractAt(
    'ProductNFT', 
    '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
  );
  
  try {
    // Get product counter
    const counter = await productNFT.productCounter();
    console.log(`📊 Total products: ${counter}`);
    
    // Get product details for each
    for (let i = 1; i <= counter; i++) {
      const product = await productNFT.products(i);
      console.log(`📦 Product ${i}:`, {
        name: product.name,
        description: product.description,
        price: ethers.utils.formatUnits(product.price, 6),
        active: product.active,
        creator: product.creator
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testProducts().catch(console.error);