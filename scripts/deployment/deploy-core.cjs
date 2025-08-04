const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting KudoBit Core Contracts Deployment...");
  
  const [deployer, creator, buyer1, buyer2, royaltyRecipient] = await ethers.getSigners();
  
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
  console.log("✅ Authorized minters configured");
  
  // Distribute test tokens for local testing
  if (hre.network.name === "hardhat" || hre.network.name === "localhost") {
    console.log("\n💸 Distributing test tokens for local development...");
    const testAmount = ethers.parseUnits("1000", 6); // 1000 USDC each
    
    const accounts = [creator, buyer1, buyer2, royaltyRecipient];
    for (const account of accounts) {
      await mockUSDC.mint(account.address, testAmount);
      console.log(`   ✅ Minted ${ethers.formatUnits(testAmount, 6)} USDC to ${account.address}`);
    }
  }
  
  // Display initial marketplace content
  console.log("\n📋 Initial marketplace content:");
  
  const shopItems = await shopfront.getAllItems();
  console.log(`\n🏪 Shopfront Items (${shopItems.length}):`);
  for (let i = 0; i < shopItems.length; i++) {
    const item = shopItems[i];
    console.log(`   ${item.id}. ${item.name} - ${ethers.formatUnits(item.priceInUSDC, 6)} USDC (Badge: ${item.loyaltyBadgeId})`);
  }
  
  const storeProducts = await creatorStore.getAllProducts();
  console.log(`\n🎨 CreatorStore Products (${storeProducts.length}):`);
  for (let i = 0; i < storeProducts.length; i++) {
    const product = storeProducts[i];
    console.log(`   ${product.id}. ${product.name} - ${ethers.formatUnits(product.priceInUSDC, 6)} USDC (Badge: ${product.loyaltyBadgeId})`);
  }
  
  // Display loyalty thresholds
  const thresholds = await creatorStore.getLoyaltyThresholds();
  console.log("\n🏆 Loyalty Tier Thresholds:");
  console.log(`   🥉 Bronze: ${ethers.formatUnits(thresholds.bronze, 6)} USDC`);
  console.log(`   🥈 Silver: ${ethers.formatUnits(thresholds.silver, 6)} USDC`);
  console.log(`   🥇 Gold: ${ethers.formatUnits(thresholds.gold, 6)} USDC`);
  console.log(`   💎 Diamond: ${ethers.formatUnits(thresholds.diamond, 6)} USDC`);
  
  // Summary
  const contractAddresses = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    MockUSDC: await mockUSDC.getAddress(),
    LoyaltyToken: await loyaltyToken.getAddress(),
    Shopfront: await shopfront.getAddress(),
    CreatorStore: await creatorStore.getAddress(),
    deployer: deployer.address,
    testAccounts: {
      creator: creator.address,
      buyer1: buyer1.address,
      buyer2: buyer2.address,
      royaltyRecipient: royaltyRecipient.address
    }
  };
  
  console.log("\n📄 Deployment Summary:");
  console.log(JSON.stringify(contractAddresses, null, 2));
  
  console.log("\n🎉 KudoBit Core Contracts deployed successfully!");
  console.log("\n📚 Next steps:");
  console.log("   1. Run tests: npx hardhat test test/core-contracts-test.cjs");
  console.log("   2. Start Hardhat node: npx hardhat node");
  console.log("   3. Deploy to local network: npx hardhat run scripts/deploy-core.cjs --network localhost");
  console.log("   4. Test workflows: npx hardhat run scripts/test-workflows.cjs --network localhost");
  
  return contractAddresses;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });