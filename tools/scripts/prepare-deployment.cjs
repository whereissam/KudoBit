const fs = require('fs');
const path = require('path');

console.log("🚀 Monad Commerce Deployment Preparation");
console.log("=========================================\n");

// Check if .env file exists
const envPath = path.join(__dirname, '../.env');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log("❌ .env file not found");
  console.log("📝 Please create .env file from .env.example:");
  console.log("   cp .env.example .env");
  console.log("   Add your PRIVATE_KEY (without 0x prefix)\n");
} else {
  console.log("✅ .env file found");
  
  // Check if private key is set
  require('dotenv').config();
  if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === 'your_private_key_here') {
    console.log("❌ PRIVATE_KEY not set in .env");
    console.log("📝 Please add your private key to .env file\n");
  } else {
    console.log("✅ PRIVATE_KEY configured");
  }
}

console.log("📋 Next Steps:");
console.log("1. Get Monad Testnet MON: https://faucet.monad.xyz");
console.log("2. Run deployment: npx hardhat run scripts/deploy.cjs --network monadTestnet");
console.log("3. Update contract addresses in src/lib/contracts.ts");
console.log("4. Test the complete flow");

console.log("\n📊 Contract Deployment Gas Estimates (from tests):");
console.log("- MockUSDC: ~778,455 gas (~0.016 MON)");
console.log("- LoyaltyToken: ~1,682,133 gas (~0.034 MON)");
console.log("- Shopfront: ~2,178,799 gas (~0.044 MON)");
console.log("- Total: ~4.6M gas (~0.094 MON)");

console.log("\n🌐 Network Details:");
console.log("- Network: Monad Testnet");
console.log("- RPC: https://testnet-rpc.monad.xyz");
console.log("- Chain ID: 10143");
console.log("- Explorer: https://testnet.monadscan.com");