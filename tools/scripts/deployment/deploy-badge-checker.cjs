const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying BadgeChecker...");
  
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying from: ${deployer.address}`);

  // Use the LoyaltyToken address from previous deployment
  const LOYALTY_TOKEN_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  
  console.log(`🏅 Using LoyaltyToken at: ${LOYALTY_TOKEN_ADDRESS}`);
  
  // Deploy BadgeChecker
  const BadgeChecker = await ethers.getContractFactory("BadgeChecker");
  const badgeChecker = await BadgeChecker.deploy(LOYALTY_TOKEN_ADDRESS);
  await badgeChecker.waitForDeployment();
  
  const badgeCheckerAddress = await badgeChecker.getAddress();
  console.log(`✅ BadgeChecker deployed to: ${badgeCheckerAddress}`);
  
  return { badgeCheckerAddress };
}

main()
  .then((result) => {
    console.log(`Set BADGE_CHECKER_ADDRESS=${result.badgeCheckerAddress} in your environment`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ BadgeChecker deployment failed:");
    console.error(error);
    process.exit(1);
  });