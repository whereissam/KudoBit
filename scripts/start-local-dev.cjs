require("dotenv").config();
const { ethers } = require("hardhat");

async function checkContractExists(address) {
  try {
    const code = await ethers.provider.getCode(address);
    return code !== "0x";
  } catch (error) {
    return false;
  }
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🔍 Checking local development setup...");
  console.log("👤 Account:", deployer.address);
  
  // Contract addresses from your contracts.ts
  const addresses = {
    mockUSDC: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    loyaltyToken: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', 
    creatorStore: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    shopfront: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
  };

  // Check if contracts are already deployed
  let needsDeploy = false;
  for (const [name, address] of Object.entries(addresses)) {
    const exists = await checkContractExists(address);
    if (exists) {
      console.log(`✅ ${name}: ${address} (deployed)`);
    } else {
      console.log(`❌ ${name}: ${address} (not found)`);
      needsDeploy = true;
    }
  }

  if (needsDeploy) {
    console.log("\n🚀 Some contracts missing, running deployment...");
    // Run the deployment script
    const deployScript = require('./deploy-core.cjs');
    // Execute the deployment (assuming it has a main function)
    // Note: This is a simplified approach - you might need to adjust based on your deploy script structure
  } else {
    console.log("\n✅ All contracts already deployed and ready!");
    console.log("\n📋 Contract Summary:");
    console.log("MockUSDC:", addresses.mockUSDC);
    console.log("LoyaltyToken:", addresses.loyaltyToken);
    console.log("CreatorStore:", addresses.creatorStore);
    console.log("Shopfront:", addresses.shopfront);
    
    console.log("\n🎯 Ready for testing!");
    console.log("1. Make sure hardhat node is running: npx hardhat node");
    console.log("2. Start your frontend: bun run dev");
    console.log("3. Connect MetaMask to localhost:8545 (Chain ID: 31337)");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});