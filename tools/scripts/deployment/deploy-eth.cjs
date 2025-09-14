const hre = require("hardhat");

async function main() {
  console.log("Deploying ETH-based contracts to Morph Holesky...");

  // Get signer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy LoyaltyToken
  const LoyaltyToken = await hre.ethers.getContractFactory("LoyaltyToken");
  const loyaltyToken = await LoyaltyToken.deploy();
  await loyaltyToken.waitForDeployment();
  
  console.log("LoyaltyToken deployed to:", await loyaltyToken.getAddress());

  // Deploy ShopfrontETH (no USDC needed)
  const ShopfrontETH = await hre.ethers.getContractFactory("ShopfrontETH");
  const shopfront = await ShopfrontETH.deploy(
    await loyaltyToken.getAddress()
  );
  await shopfront.waitForDeployment();
  
  console.log("ShopfrontETH deployed to:", await shopfront.getAddress());

  // Set Shopfront as authorized minter for LoyaltyToken
  const authorizeTx = await loyaltyToken.setAuthorizedMinter(await shopfront.getAddress(), true);
  await authorizeTx.wait();
  
  console.log("ShopfrontETH authorized as minter for LoyaltyToken");

  // Save deployment addresses
  const deployments = {
    loyaltyToken: await loyaltyToken.getAddress(),
    shopfront: await shopfront.getAddress(),
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    paymentMethod: "ETH"
  };

  console.log("Deployment completed!");
  console.log("Contract addresses:", deployments);
  
  // Write to file for frontend use
  const fs = require("fs");
  fs.writeFileSync("./deployments-eth.json", JSON.stringify(deployments, null, 2));
  
  return deployments;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });