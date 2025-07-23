const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const address = await signer.getAddress();
  const balance = await hre.ethers.provider.getBalance(address);
  
  console.log("Wallet Address:", address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    console.log("\n🚨 You need Morph Holesky ETH for gas fees!");
    console.log("Get test ETH from: https://faucet.morphl2.io");
    console.log("Or try: https://faucet.quicknode.com/morph/holesky");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });