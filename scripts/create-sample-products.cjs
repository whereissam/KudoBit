const { ethers } = require("hardhat");

async function main() {
  console.log("Creating sample products on local network...");

  // Get the contract instances
  const creatorStoreAddress = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e";
  const CreatorStore = await ethers.getContractFactory("CreatorStore");
  const creatorStore = CreatorStore.attach(creatorStoreAddress);

  // Get the deployer account (should be the owner)
  const [deployer] = await ethers.getSigners();
  console.log("Creating products with account:", deployer.address);

  // Sample products to create
  const sampleProducts = [
    {
      name: "Digital Art Collection",
      description: "A beautiful collection of digital artworks featuring abstract designs and modern aesthetics. Perfect for digital displays and NFT enthusiasts.",
      ipfsContentHash: "QmSampleHash1",
      priceInUSDC: ethers.parseUnits("25.99", 6), // 25.99 USDC (6 decimals)
      loyaltyBadgeId: 1 // Bronze badge
    },
    {
      name: "Music Production Pack",
      description: "Professional music samples and loops for producers. Includes 50+ high-quality audio files in various genres.",
      ipfsContentHash: "QmSampleHash2", 
      priceInUSDC: ethers.parseUnits("49.99", 6), // 49.99 USDC
      loyaltyBadgeId: 2 // Silver badge
    },
    {
      name: "Web Development Course",
      description: "Complete guide to modern web development with React, Node.js, and blockchain integration. 20+ hours of content.",
      ipfsContentHash: "QmSampleHash3",
      priceInUSDC: ethers.parseUnits("199.99", 6), // 199.99 USDC
      loyaltyBadgeId: 3 // Gold badge
    },
    {
      name: "Photography Preset Bundle",
      description: "Premium Lightroom presets for stunning photo editing. Transform your photos with professional-grade filters.",
      ipfsContentHash: "QmSampleHash4",
      priceInUSDC: ethers.parseUnits("15.99", 6), // 15.99 USDC
      loyaltyBadgeId: 1 // Bronze badge
    },
    {
      name: "Business Plan Template",
      description: "Comprehensive business plan template used by successful startups. Includes financial projections and market analysis.",
      ipfsContentHash: "QmSampleHash5",
      priceInUSDC: ethers.parseUnits("29.99", 6), // 29.99 USDC
      loyaltyBadgeId: 2 // Silver badge
    }
  ];

  console.log("\\nCreating sample products...");

  for (let i = 0; i < sampleProducts.length; i++) {
    const product = sampleProducts[i];
    
    try {
      console.log(`\\nCreating product ${i + 1}: ${product.name}`);
      
      const tx = await creatorStore.listProduct(
        product.name,
        product.description,
        product.ipfsContentHash,
        product.priceInUSDC,
        product.loyaltyBadgeId
      );
      
      const receipt = await tx.wait();
      console.log(`✅ Product created! Transaction hash: ${receipt.hash}`);
      console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
      
    } catch (error) {
      console.error(`❌ Failed to create product ${i + 1}:`, error.message);
    }
  }

  // Verify products were created
  console.log("\\n📊 Fetching all products from blockchain...");
  try {
    const allProducts = await creatorStore.getAllProducts();
    console.log(`\\n✅ Total products on blockchain: ${allProducts.length}`);
    
    allProducts.forEach((product, index) => {
      console.log(`\\nProduct ${index + 1}:`);
      console.log(`  ID: ${product.id.toString()}`);
      console.log(`  Name: ${product.name}`);
      console.log(`  Price: ${ethers.formatUnits(product.priceInUSDC, 6)} USDC`);
      console.log(`  Active: ${product.isActive}`);
      console.log(`  Badge ID: ${product.loyaltyBadgeId.toString()}`);
    });
    
  } catch (error) {
    console.error("❌ Failed to fetch products:", error.message);
  }

  console.log("\\n🎉 Sample product creation completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });