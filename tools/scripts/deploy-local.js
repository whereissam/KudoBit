const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting local deployment...");
  
  const [deployer, creator, buyer1, buyer2] = await ethers.getSigners();
  
  console.log("👤 Deployer address:", deployer.address);
  console.log("💰 Deployer balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
  
  // Deploy MockUSDC
  console.log("\n📦 Deploying MockUSDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  console.log("✅ MockUSDC deployed at:", await mockUSDC.getAddress());
  
  // Deploy LoyaltyToken
  console.log("\n🏆 Deploying LoyaltyToken...");
  const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
  const loyaltyToken = await LoyaltyToken.deploy();
  await loyaltyToken.waitForDeployment();
  console.log("✅ LoyaltyToken deployed at:", await loyaltyToken.getAddress());
  
  // Deploy Shopfront
  console.log("\n🏪 Deploying Shopfront...");
  const Shopfront = await ethers.getContractFactory("Shopfront");
  const shopfront = await Shopfront.deploy(
    await mockUSDC.getAddress(),
    await loyaltyToken.getAddress()
  );
  await shopfront.waitForDeployment();
  console.log("✅ Shopfront deployed at:", await shopfront.getAddress());
  
  // Deploy CreatorStore
  console.log("\n🎨 Deploying CreatorStore...");
  const CreatorStore = await ethers.getContractFactory("CreatorStore");
  const creatorStore = await CreatorStore.deploy(
    await mockUSDC.getAddress(),
    await loyaltyToken.getAddress()
  );
  await creatorStore.waitForDeployment();
  console.log("✅ CreatorStore deployed at:", await creatorStore.getAddress());
  
  // Setup permissions
  console.log("\n🔧 Setting up permissions...");
  await loyaltyToken.setAuthorizedMinter(await shopfront.getAddress(), true);
  await loyaltyToken.setAuthorizedMinter(await creatorStore.getAddress(), true);
  console.log("✅ Authorized minters set");
  
  // Distribute test tokens
  console.log("\n💸 Distributing test tokens...");
  const testAmount = ethers.parseUnits("100", 6); // 100 USDC each
  
  await mockUSDC.mint(creator.address, testAmount);
  await mockUSDC.mint(buyer1.address, testAmount);
  await mockUSDC.mint(buyer2.address, testAmount);
  
  console.log("✅ Test tokens distributed:");
  console.log(`   Creator (${creator.address}): 100 USDC`);
  console.log(`   Buyer1 (${buyer1.address}): 100 USDC`);
  console.log(`   Buyer2 (${buyer2.address}): 100 USDC`);
  
  // Display initial items/products
  console.log("\n📋 Initial marketplace content:");
  
  const shopItems = await shopfront.getAllItems();
  console.log(`\n🏪 Shopfront Items (${shopItems.length}):`);
  for (let i = 0; i < shopItems.length; i++) {
    const item = shopItems[i];
    console.log(`   ${i + 1}. ${item.name} - ${ethers.formatUnits(item.priceInUSDC, 6)} USDC`);
  }
  
  const storeProducts = await creatorStore.getAllProducts();
  console.log(`\n🎨 CreatorStore Products (${storeProducts.length}):`);
  for (let i = 0; i < storeProducts.length; i++) {
    const product = storeProducts[i];
    console.log(`   ${i + 1}. ${product.name} - ${ethers.formatUnits(product.priceInUSDC, 6)} USDC`);
  }
  
  // Save contract addresses for testing
  const contractAddresses = {
    MockUSDC: await mockUSDC.getAddress(),
    LoyaltyToken: await loyaltyToken.getAddress(),
    Shopfront: await shopfront.getAddress(),
    CreatorStore: await creatorStore.getAddress(),
    deployer: deployer.address,
    creator: creator.address,
    buyer1: buyer1.address,
    buyer2: buyer2.address
  };
  
  console.log("\n📄 Contract Addresses Summary:");
  console.log(JSON.stringify(contractAddresses, null, 2));
  
  console.log("\n🎉 Local deployment completed successfully!");
  console.log("\n📚 Next steps:");
  console.log("   1. Run 'npx hardhat test' to run comprehensive tests");
  console.log("   2. Use the contract addresses above to interact with contracts");
  console.log("   3. Check test/comprehensive-test.js for usage examples");
  
  return contractAddresses;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });