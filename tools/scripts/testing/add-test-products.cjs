const { ethers } = require('hardhat');

async function main() {
  console.log('Adding test products to CreatorStore...');
  
  const [deployer] = await ethers.getSigners();
  console.log('Using account:', deployer.address);
  
  // Contract addresses from previous deployment
  const creatorStoreAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
  
  const CreatorStore = await ethers.getContractFactory('CreatorStore');
  const creatorStore = CreatorStore.attach(creatorStoreAddress);
  
  const testProducts = [
    {
      name: "Premium Wallpaper Pack",
      description: "High-quality 4K wallpapers for your devices",
      ipfsHash: "QmX4K3VZm7nF8R9P2L6Y1A5C8B7D0E9F1",
      price: ethers.parseUnits("5", 6), // 5 USDC
      badgeId: 1 // Bronze badge
    },
    {
      name: "Digital Art NFT Collection",
      description: "Exclusive digital art pieces minted on blockchain",
      ipfsHash: "QmA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P",
      price: ethers.parseUnits("25", 6), // 25 USDC
      badgeId: 2 // Silver badge
    },
    {
      name: "Music Album - Digital Download",
      description: "Complete album with bonus tracks and lyrics",
      ipfsHash: "QmZ9Y8X7W6V5U4T3S2R1Q0P9O8N7M6L5K",
      price: ethers.parseUnits("15", 6), // 15 USDC
      badgeId: 1 // Bronze badge
    },
    {
      name: "Video Course - Web3 Development",
      description: "Complete guide to building DApps and smart contracts",
      ipfsHash: "QmP0Q1R2S3T4U5V6W7X8Y9Z0A1B2C3D4E",
      price: ethers.parseUnits("50", 6), // 50 USDC
      badgeId: 3 // Gold badge
    },
    {
      name: "Exclusive Membership Access",
      description: "VIP access to private community and events",
      ipfsHash: "QmE4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T",
      price: ethers.parseUnits("100", 6), // 100 USDC
      badgeId: 4 // Diamond badge
    }
  ];
  
  console.log('Adding products to contract...');
  
  for (let i = 0; i < testProducts.length; i++) {
    const product = testProducts[i];
    console.log(`Adding product ${i + 1}: ${product.name}`);
    
    try {
      const tx = await creatorStore.listProduct(
        product.name,
        product.description,
        product.ipfsHash,
        product.price,
        product.badgeId
      );
      
      await tx.wait();
      console.log(`✅ Product ${i + 1} added successfully`);
    } catch (error) {
      console.error(`❌ Failed to add product ${i + 1}:`, error.message);
    }
  }
  
  // Verify products were added
  console.log('\nVerifying products...');
  try {
    const products = await creatorStore.getAllProducts();
    console.log(`📦 Total products in store: ${products.length}`);
    
    products.forEach((product, index) => {
      console.log(`Product ${index + 1}:`);
      console.log(`  Name: ${product.name}`);
      console.log(`  Price: ${ethers.formatUnits(product.priceInUSDC, 6)} USDC`);
      console.log(`  Badge ID: ${product.loyaltyBadgeId}`);
      console.log(`  Active: ${product.isActive}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error fetching products:', error.message);
  }
  
  console.log('✅ Test products setup complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });