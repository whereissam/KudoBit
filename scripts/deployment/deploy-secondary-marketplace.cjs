const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("🚀 Deploying Enhanced Secondary Marketplace System...");
  
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying from: ${deployer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH`);

  // Deploy MockUSDC
  console.log("\n💰 Deploying MockUSDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  const mockUSDCAddress = await mockUSDC.getAddress();
  console.log(`✅ MockUSDC deployed to: ${mockUSDCAddress}`);

  // Deploy LoyaltyToken
  console.log("\n🏆 Deploying LoyaltyToken...");
  const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
  const loyaltyToken = await LoyaltyToken.deploy();
  await loyaltyToken.waitForDeployment();
  const loyaltyTokenAddress = await loyaltyToken.getAddress();
  console.log(`✅ LoyaltyToken deployed to: ${loyaltyTokenAddress}`);

  // Deploy SecondaryMarketplace
  console.log("\n🏪 Deploying SecondaryMarketplace...");
  const SecondaryMarketplace = await ethers.getContractFactory("SecondaryMarketplace");
  const marketplace = await SecondaryMarketplace.deploy(
    mockUSDCAddress,
    loyaltyTokenAddress
  );
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log(`✅ SecondaryMarketplace deployed to: ${marketplaceAddress}`);

  // Authorize marketplace to mint badges
  console.log("\n🔧 Setting up permissions...");
  await loyaltyToken.setAuthorizedMinter(marketplaceAddress, true);
  console.log("✅ Marketplace authorized to mint loyalty badges");

  // Create deployment info
  const deploymentInfo = {
    network: "hardhat",
    chainId: 1337,
    timestamp: new Date().toISOString(),
    mockUSDC: mockUSDCAddress,
    loyaltyToken: loyaltyTokenAddress,
    secondaryMarketplace: marketplaceAddress,
    features: {
      primaryMarketplace: true,
      secondaryMarketplace: true,
      creatorRoyalties: true,
      platformFees: true,
      loyaltyBadges: true,
      ownershipTracking: true,
      purchaseHistory: true
    },
    configuration: {
      defaultCreatorRoyalty: "5%",
      platformFee: "2.5%",
      loyaltyTiers: {
        bronze: "0.1 USDC",
        silver: "1.0 USDC", 
        gold: "5.0 USDC",
        diamond: "10.0 USDC"
      }
    }
  };

  // Save deployment info
  fs.writeFileSync('deployments.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("✅ Deployment info saved to deployments.json");

  console.log("\n📋 Deployment Summary:");
  console.log("=".repeat(60));
  console.log(`MockUSDC: ${mockUSDCAddress}`);
  console.log(`LoyaltyToken: ${loyaltyTokenAddress}`);
  console.log(`SecondaryMarketplace: ${marketplaceAddress}`);
  console.log("=".repeat(60));

  console.log("\n🎯 Enhanced Features Available:");
  console.log("✅ Primary product sales with creator royalties");
  console.log("✅ Secondary marketplace for peer-to-peer resales");
  console.log("✅ Automatic creator royalty distribution (customizable %)");
  console.log("✅ Platform fee collection (2.5% on resales)");
  console.log("✅ Real-time ownership tracking");
  console.log("✅ Complete purchase history");
  console.log("✅ Loyalty badge rewards on all purchases");
  console.log("✅ Fee calculation and transparency");

  console.log("\n🔧 Next Steps:");
  console.log("1. Update frontend contracts.ts with new addresses");
  console.log("2. Test marketplace functionality through UI");
  console.log("3. Configure creator royalty percentages as needed");
  console.log("4. Monitor platform fees and creator earnings");

  console.log("\n💡 Usage Examples:");
  console.log("- Primary purchase: Buy directly from creator");
  console.log("- List for resale: Set your own resale price");
  console.log("- Buy from resale: Purchase from other users");
  console.log("- Creator earnings: Automatic 5% on every resale");
  
  return deploymentInfo;
}

main()
  .then((deploymentInfo) => {
    console.log("\n🎉 Enhanced Secondary Marketplace deployed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });