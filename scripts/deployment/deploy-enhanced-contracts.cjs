const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Enhanced KudoBit Contracts to Local Network...\n");

  // Get signers
  const [deployer, creator1, creator2, user1, user2, affiliate1] = await ethers.getSigners();
  
  console.log("📋 Account Setup:");
  console.log("Deployer:", deployer.address);
  console.log("Creator 1:", creator1.address);
  console.log("Creator 2:", creator2.address);
  console.log("User 1:", user1.address);
  console.log("User 2:", user2.address);
  console.log("Affiliate 1:", affiliate1.address);
  console.log("Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  try {
    // 1. Deploy MockUSDC first
    console.log("1️⃣ Deploying MockUSDC...");
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();
    const mockUSDCAddress = await mockUSDC.getAddress();
    console.log("✅ MockUSDC deployed to:", mockUSDCAddress);

    // 2. Deploy LoyaltyToken
    console.log("\n2️⃣ Deploying LoyaltyToken...");
    const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
    const loyaltyToken = await LoyaltyToken.deploy();
    await loyaltyToken.waitForDeployment();
    const loyaltyTokenAddress = await loyaltyToken.getAddress();
    console.log("✅ LoyaltyToken deployed to:", loyaltyTokenAddress);

    // 3. Deploy CreatorStore
    console.log("\n3️⃣ Deploying CreatorStore...");
    const CreatorStore = await ethers.getContractFactory("CreatorStore");
    const creatorStore = await CreatorStore.deploy(mockUSDCAddress, loyaltyTokenAddress);
    await creatorStore.waitForDeployment();
    const creatorStoreAddress = await creatorStore.getAddress();
    console.log("✅ CreatorStore deployed to:", creatorStoreAddress);

    // 4. Deploy SubscriptionTiers
    console.log("\n4️⃣ Deploying SubscriptionTiers...");
    const SubscriptionTiers = await ethers.getContractFactory("SubscriptionTiers");
    const subscriptionTiers = await SubscriptionTiers.deploy(mockUSDCAddress, loyaltyTokenAddress);
    await subscriptionTiers.waitForDeployment();
    const subscriptionTiersAddress = await subscriptionTiers.getAddress();
    console.log("✅ SubscriptionTiers deployed to:", subscriptionTiersAddress);

    // 5. Deploy NFTGatedContent
    console.log("\n5️⃣ Deploying NFTGatedContent...");
    const NFTGatedContent = await ethers.getContractFactory("NFTGatedContent");
    const nftGatedContent = await NFTGatedContent.deploy(loyaltyTokenAddress, subscriptionTiersAddress);
    await nftGatedContent.waitForDeployment();
    const nftGatedContentAddress = await nftGatedContent.getAddress();
    console.log("✅ NFTGatedContent deployed to:", nftGatedContentAddress);

    // 6. Deploy TippingAndCrowdfunding
    console.log("\n6️⃣ Deploying TippingAndCrowdfunding...");
    const TippingAndCrowdfunding = await ethers.getContractFactory("TippingAndCrowdfunding");
    const tippingAndCrowdfunding = await TippingAndCrowdfunding.deploy(mockUSDCAddress, loyaltyTokenAddress);
    await tippingAndCrowdfunding.waitForDeployment();
    const tippingAndCrowdfundingAddress = await tippingAndCrowdfunding.getAddress();
    console.log("✅ TippingAndCrowdfunding deployed to:", tippingAndCrowdfundingAddress);

    // 7. Deploy GamefiedEngagement
    console.log("\n7️⃣ Deploying GamefiedEngagement...");
    const GamefiedEngagement = await ethers.getContractFactory("GamefiedEngagement");
    const gamefiedEngagement = await GamefiedEngagement.deploy(mockUSDCAddress, loyaltyTokenAddress);
    await gamefiedEngagement.waitForDeployment();
    const gamefiedEngagementAddress = await gamefiedEngagement.getAddress();
    console.log("✅ GamefiedEngagement deployed to:", gamefiedEngagementAddress);

    // 8. Deploy AffiliateProgram
    console.log("\n8️⃣ Deploying AffiliateProgram...");
    const AffiliateProgram = await ethers.getContractFactory("AffiliateProgram");
    const affiliateProgram = await AffiliateProgram.deploy(mockUSDCAddress, loyaltyTokenAddress);
    await affiliateProgram.waitForDeployment();
    const affiliateProgramAddress = await affiliateProgram.getAddress();
    console.log("✅ AffiliateProgram deployed to:", affiliateProgramAddress);

    // Setup permissions and initial state
    console.log("\n🔧 Setting up permissions and initial state...");

    // Set authorized minters for LoyaltyToken
    await loyaltyToken.setAuthorizedMinter(creatorStoreAddress, true);
    await loyaltyToken.setAuthorizedMinter(subscriptionTiersAddress, true);
    await loyaltyToken.setAuthorizedMinter(tippingAndCrowdfundingAddress, true);
    await loyaltyToken.setAuthorizedMinter(gamefiedEngagementAddress, true);
    await loyaltyToken.setAuthorizedMinter(affiliateProgramAddress, true);
    console.log("✅ LoyaltyToken minter permissions set");

    // Mint some MockUSDC to test accounts
    const mintAmount = ethers.parseUnits("1000", 6); // 1000 USDC
    await mockUSDC.mint(creator1.address, mintAmount);
    await mockUSDC.mint(creator2.address, mintAmount);
    await mockUSDC.mint(user1.address, mintAmount);
    await mockUSDC.mint(user2.address, mintAmount);
    await mockUSDC.mint(affiliate1.address, mintAmount);
    console.log("✅ Minted 1000 USDC to each test account");

    // Setup some initial data for testing
    console.log("\n📝 Setting up test data...");

    // Register affiliate
    await affiliateProgram.connect(affiliate1).registerAffiliate("TestAffiliate", "I help people discover Web3!");
    console.log("✅ Registered test affiliate");

    // Create creator profiles for tipping
    await tippingAndCrowdfunding.connect(creator1).createCreatorProfile(
      "DigitalArtist",
      "Creating amazing digital art and NFTs",
      "QmCreatorProfileHash123"
    );
    console.log("✅ Created creator profile for testing");

    // Save deployment addresses
    const deploymentData = {
      network: "localhost",
      chainId: 1337,
      contracts: {
        MockUSDC: mockUSDCAddress,
        LoyaltyToken: loyaltyTokenAddress,
        CreatorStore: creatorStoreAddress,
        SubscriptionTiers: subscriptionTiersAddress,
        NFTGatedContent: nftGatedContentAddress,
        TippingAndCrowdfunding: tippingAndCrowdfundingAddress,
        GamefiedEngagement: gamefiedEngagementAddress,
        AffiliateProgram: affiliateProgramAddress
      },
      accounts: {
        deployer: deployer.address,
        creator1: creator1.address,
        creator2: creator2.address,
        user1: user1.address,
        user2: user2.address,
        affiliate1: affiliate1.address
      },
      timestamp: new Date().toISOString()
    };

    // Write to deployments file
    const fs = require('fs');
    fs.writeFileSync(
      './deployments-local.json',
      JSON.stringify(deploymentData, null, 2)
    );

    console.log("\n🎉 All contracts deployed successfully!");
    console.log("\n📋 Contract Addresses:");
    console.log("MockUSDC:", mockUSDCAddress);
    console.log("LoyaltyToken:", loyaltyTokenAddress);
    console.log("CreatorStore:", creatorStoreAddress);
    console.log("SubscriptionTiers:", subscriptionTiersAddress);
    console.log("NFTGatedContent:", nftGatedContentAddress);
    console.log("TippingAndCrowdfunding:", tippingAndCrowdfundingAddress);
    console.log("GamefiedEngagement:", gamefiedEngagementAddress);
    console.log("AffiliateProgram:", affiliateProgramAddress);

    console.log("\n💾 Deployment data saved to deployments-local.json");
    console.log("\n🧪 Ready for testing! Run: npm run test");

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });