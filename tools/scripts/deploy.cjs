const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts to Morph Holesky...");

  // Get signer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

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

  // Deploy CreatorStore
  const CreatorStore = await hre.ethers.getContractFactory("CreatorStore");
  const creatorStore = await CreatorStore.deploy(
    await mockUSDC.getAddress(),
    await loyaltyToken.getAddress()
  );
  await creatorStore.waitForDeployment();
  
  console.log("CreatorStore deployed to:", await creatorStore.getAddress());

  // Deploy SecondaryMarketplace
  const SecondaryMarketplace = await hre.ethers.getContractFactory("SecondaryMarketplace");
  const secondaryMarketplace = await SecondaryMarketplace.deploy(
    await mockUSDC.getAddress(),
    await loyaltyToken.getAddress()
  );
  await secondaryMarketplace.waitForDeployment();
  
  console.log("SecondaryMarketplace deployed to:", await secondaryMarketplace.getAddress());

  // Set both contracts as authorized minters for LoyaltyToken
  const authorizeTx1 = await loyaltyToken.setAuthorizedMinter(await creatorStore.getAddress(), true);
  await authorizeTx1.wait();
  
  const authorizeTx2 = await loyaltyToken.setAuthorizedMinter(await secondaryMarketplace.getAddress(), true);
  await authorizeTx2.wait();
  
  console.log("CreatorStore authorized as minter for LoyaltyToken");
  console.log("SecondaryMarketplace authorized as minter for LoyaltyToken");

  // Save deployment addresses
  const deployments = {
    mockUSDC: await mockUSDC.getAddress(),
    loyaltyToken: await loyaltyToken.getAddress(),
    creatorStore: await creatorStore.getAddress(),
    secondaryMarketplace: await secondaryMarketplace.getAddress(),
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