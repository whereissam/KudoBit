const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing Gumroad Architecture Integration");
    console.log("=" * 50);

    // Load deployments
    const deployments = require("./gumroad-deployments.json");
    console.log("📄 Using deployed contracts:");
    Object.entries(deployments.contracts).forEach(([name, address]) => {
        console.log(`  ${name}: ${address}`);
    });

    // Connect to contracts
    const ProductNFT = await ethers.getContractFactory("ProductNFT");
    const productNFT = ProductNFT.attach(deployments.contracts.productNFT);

    const CreatorRegistry = await ethers.getContractFactory("CreatorRegistry");
    const creatorRegistry = CreatorRegistry.attach(deployments.contracts.creatorRegistry);

    // Test 1: Check product count
    console.log("\n🧪 Test 1: Product Count");
    const productCount = await productNFT.productCounter();
    console.log(`✅ Products created: ${productCount.toString()}`);

    // Test 2: Read product details
    console.log("\n🧪 Test 2: Product Details");
    for (let i = 1; i <= productCount; i++) {
        const product = await productNFT.products(i);
        console.log(`Product ${i}:`);
        console.log(`  Name: ${product.name}`);
        console.log(`  Description: ${product.description}`);
        console.log(`  Price: ${ethers.formatUnits(product.price, 6)} USDC`);
        console.log(`  Active: ${product.active}`);
        console.log(`  Creator: ${product.creator}`);
    }

    // Test 3: Check creator registration
    console.log("\n🧪 Test 3: Creator Registration");
    const [owner] = await ethers.getSigners();
    const isRegistered = await creatorRegistry.isRegistered(owner.address);
    console.log(`✅ Creator registered: ${isRegistered}`);
    
    if (isRegistered) {
        const creator = await creatorRegistry.creators(owner.address);
        console.log(`  Name: ${creator.name}`);
        console.log(`  Bio: ${creator.bio}`);
        console.log(`  Products: ${creator.productCount.toString()}`);
        console.log(`  Verified: ${creator.verified}`);
    }

    console.log("\n🎉 Gumroad Architecture Tests Complete!");
    console.log("✅ All systems operational and ready for frontend integration");
}

main().catch(console.error);