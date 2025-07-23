const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts to Morph Holesky...");

  // Deploy MockUSDC
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  
  console.log("MockUSDC deployed to:", await mockUSDC.getAddress());

  // Deploy LoyaltyToken
  const LoyaltyToken = await hre.ethers.getContractFactory("LoyaltyToken");
  const loyaltyToken = await LoyaltyToken.deploy();
  await loyaltyToken.waitForDeployment();
  
  console.log("LoyaltyToken deployed to:", await loyaltyToken.getAddress());

  // Deploy Shopfront
  const Shopfront = await hre.ethers.getContractFactory("Shopfront");
  const shopfront = await Shopfront.deploy(
    await mockUSDC.getAddress(),
    await loyaltyToken.getAddress()
  );
  await shopfront.waitForDeployment();
  
  console.log("Shopfront deployed to:", await shopfront.getAddress());

  // Set Shopfront as authorized minter for LoyaltyToken
  const authorizeTx = await loyaltyToken.setAuthorizedMinter(await shopfront.getAddress(), true);
  await authorizeTx.wait();
  
  console.log("Shopfront authorized as minter for LoyaltyToken");

  // Save deployment addresses
  const deployments = {
    mockUSDC: await mockUSDC.getAddress(),
    loyaltyToken: await loyaltyToken.getAddress(),
    shopfront: await shopfront.getAddress(),
    network: hre.network.name,
    chainId: hre.network.config.chainId
  };

  console.log("Deployment completed!");
  console.log("Contract addresses:", deployments);
  
  // Write to file for frontend use
  const fs = require("fs");
  fs.writeFileSync("./deployments.json", JSON.stringify(deployments, null, 2));
  
  return deployments;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });