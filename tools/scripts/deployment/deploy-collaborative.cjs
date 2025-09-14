const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying CollaborativeProductFactory...");
  
  // Get the contract factory
  const CollaborativeProductFactory = await ethers.getContractFactory("CollaborativeProductFactory");
  
  // Get existing contract addresses (assuming they're already deployed)
  const MOCK_USDC_ADDRESS = process.env.MOCK_USDC_ADDRESS;
  const LOYALTY_TOKEN_ADDRESS = process.env.LOYALTY_TOKEN_ADDRESS;
  
  if (!MOCK_USDC_ADDRESS || !LOYALTY_TOKEN_ADDRESS) {
    console.error("❌ Missing required contract addresses in environment variables");
    console.log("Please set MOCK_USDC_ADDRESS and LOYALTY_TOKEN_ADDRESS");
    process.exit(1);
  }
  
  console.log(`📄 Using MockUSDC at: ${MOCK_USDC_ADDRESS}`);
  console.log(`🏅 Using LoyaltyToken at: ${LOYALTY_TOKEN_ADDRESS}`);
  
  // Deploy the contract
  const collaborativeFactory = await CollaborativeProductFactory.deploy(
    MOCK_USDC_ADDRESS,
    LOYALTY_TOKEN_ADDRESS
  );
  
  await collaborativeFactory.waitForDeployment();
  
  const collaborativeFactoryAddress = await collaborativeFactory.getAddress();
  console.log(`✅ CollaborativeProductFactory deployed to: ${collaborativeFactoryAddress}`);
  
  // Authorize the collaborative factory to mint loyalty badges
  console.log("🔐 Setting up authorization for loyalty badge minting...");
  
  const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
  const loyaltyToken = LoyaltyToken.attach(LOYALTY_TOKEN_ADDRESS);
  
  try {
    const tx = await loyaltyToken.setAuthorizedMinter(collaborativeFactoryAddress, true);
    await tx.wait();
    console.log("✅ CollaborativeProductFactory authorized to mint loyalty badges");
  } catch (error) {
    console.log("⚠️  Warning: Could not authorize minter (you may need to do this manually)");
    console.log("Error:", error.message);
  }
  
  // Save deployment info
  const deploymentInfo = {
    network: "morphHolesky",
    collaborativeProductFactory: {
      address: collaborativeFactoryAddress,
      deployedAt: new Date().toISOString(),
      constructorArgs: [MOCK_USDC_ADDRESS, LOYALTY_TOKEN_ADDRESS]
    }
  };
  
  console.log("\n📋 Deployment Summary:");
  console.log("=".repeat(50));
  console.log(`Network: ${deploymentInfo.network}`);
  console.log(`CollaborativeProductFactory: ${collaborativeFactoryAddress}`);
  console.log("=".repeat(50));
  
  console.log("\n🔧 Next Steps:");
  console.log("1. Update your frontend contracts configuration with the new address");
  console.log("2. Verify the contract on Morphscan (optional)");
  console.log("3. Test collaborative product creation");
  
  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });