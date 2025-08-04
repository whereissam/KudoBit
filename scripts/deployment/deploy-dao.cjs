const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying KudoBit DAO Governance System...");
  
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying from: ${deployer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH`);

  // Configuration
  const TIMELOCK_DELAY = 24 * 60 * 60; // 24 hours
  const VOTING_DELAY = 7200; // ~1 day in blocks (12 second blocks)
  const VOTING_PERIOD = 50400; // ~7 days in blocks
  const QUORUM_PERCENTAGE = 4; // 4%
  
  // Distribution addresses (using deployer for demo, should be proper addresses in production)
  const communityTreasury = deployer.address;
  const creatorRewards = deployer.address;
  const teamMultisig = deployer.address;
  const liquidityManager = deployer.address;
  
  console.log("\n📄 Step 1: Deploying Governance Token...");
  
  // Deploy Governance Token
  const KudoBitGovernanceToken = await ethers.getContractFactory("KudoBitGovernanceToken");
  const governanceToken = await KudoBitGovernanceToken.deploy(
    communityTreasury,
    creatorRewards,
    deployer.address, // DAO treasury (will be updated after DAO deployment)
    teamMultisig,
    liquidityManager
  );
  await governanceToken.waitForDeployment();
  
  const tokenAddress = await governanceToken.getAddress();
  console.log(`✅ Governance Token deployed to: ${tokenAddress}`);
  
  console.log("\n⏰ Step 2: Deploying Timelock Controller...");
  
  // Deploy Timelock Controller
  const KudoBitTimelock = await ethers.getContractFactory("KudoBitTimelock");
  const timelock = await KudoBitTimelock.deploy(
    TIMELOCK_DELAY,
    [], // proposers (will be set to DAO after deployment)
    [], // executors (will be set to DAO after deployment)
    deployer.address // admin (will transfer to DAO after setup)
  );
  await timelock.waitForDeployment();
  
  const timelockAddress = await timelock.getAddress();
  console.log(`✅ Timelock Controller deployed to: ${timelockAddress}`);
  
  console.log("\n🏛️ Step 3: Deploying DAO Governor...");
  
  // Get existing contract addresses (if available)
  const badgeCheckerAddress = process.env.BADGE_CHECKER_ADDRESS || ethers.ZeroAddress;
  
  // Deploy DAO Governor
  const KudoBitDAO = await ethers.getContractFactory("KudoBitDAO");
  const dao = await KudoBitDAO.deploy(
    tokenAddress,
    timelockAddress,
    badgeCheckerAddress
  );
  await dao.waitForDeployment();
  
  const daoAddress = await dao.getAddress();
  console.log(`✅ DAO Governor deployed to: ${daoAddress}`);
  
  console.log("\n🔧 Step 4: Configuring Roles and Permissions...");
  
  // Get role constants
  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
  const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
  const TIMELOCK_ADMIN_ROLE = await timelock.TIMELOCK_ADMIN_ROLE();
  const DEFAULT_ADMIN_ROLE = await timelock.DEFAULT_ADMIN_ROLE();
  
  // Grant roles to DAO
  console.log("  - Granting PROPOSER_ROLE to DAO...");
  await timelock.grantRole(PROPOSER_ROLE, daoAddress);
  
  console.log("  - Granting EXECUTOR_ROLE to DAO...");
  await timelock.grantRole(EXECUTOR_ROLE, daoAddress);
  
  // Grant executor role to deployer initially (for testing)
  console.log("  - Granting EXECUTOR_ROLE to deployer (temporary)...");
  await timelock.grantRole(EXECUTOR_ROLE, deployer.address);
  
  console.log("\n💰 Step 5: Executing Initial Token Distribution...");
  
  // Execute initial distribution
  try {
    await governanceToken.executeInitialDistribution();
    console.log("✅ Initial token distribution completed");
    
    // Update DAO treasury address in governance token
    await governanceToken.updateDistributionAddresses(
      ethers.ZeroAddress, // Keep community treasury
      ethers.ZeroAddress, // Keep creator rewards
      timelockAddress,    // Update DAO treasury to timelock
      ethers.ZeroAddress, // Keep team multisig
      ethers.ZeroAddress  // Keep liquidity manager
    );
    console.log("✅ DAO treasury address updated");
    
  } catch (error) {
    console.log("⚠️  Initial distribution failed or already completed:", error.message);
  }
  
  console.log("\n🎯 Step 6: Self-delegate voting power...");
  
  // Self-delegate for initial voting power
  try {
    await governanceToken.delegate(deployer.address);
    console.log("✅ Voting power self-delegated");
  } catch (error) {
    console.log("⚠️  Self-delegation failed:", error.message);
  }
  
  console.log("\n🧪 Step 7: Testing Basic Functionality...");
  
  // Test governance token
  const totalSupply = await governanceToken.totalSupply();
  const deployerBalance = await governanceToken.balanceOf(deployer.address);
  const deployerVotes = await governanceToken.getVotes(deployer.address);
  
  console.log(`  Token Total Supply: ${ethers.formatEther(totalSupply)} KUDO`);
  console.log(`  Deployer Balance: ${ethers.formatEther(deployerBalance)} KUDO`);
  console.log(`  Deployer Voting Power: ${ethers.formatEther(deployerVotes)} votes`);
  
  // Test DAO parameters
  const votingDelay = await dao.votingDelay();
  const votingPeriod = await dao.votingPeriod();
  const proposalThreshold = await dao.proposalThreshold();
  const quorum = await dao.quorum(await ethers.provider.getBlockNumber() - 1);
  
  console.log(`  Voting Delay: ${votingDelay} blocks`);
  console.log(`  Voting Period: ${votingPeriod} blocks`);
  console.log(`  Proposal Threshold: ${ethers.formatEther(proposalThreshold)} KUDO`);
  console.log(`  Current Quorum: ${ethers.formatEther(quorum)} votes`);
  
  // Save deployment info
  const deploymentInfo = {
    network: "morphHolesky",
    timestamp: new Date().toISOString(),
    contracts: {
      governanceToken: {
        address: tokenAddress,
        name: "KudoBitGovernanceToken",
        symbol: "KUDO"
      },
      timelock: {
        address: timelockAddress,
        name: "KudoBitTimelock",
        delay: TIMELOCK_DELAY
      },
      dao: {
        address: daoAddress,
        name: "KudoBitDAO",
        votingDelay: votingDelay.toString(),
        votingPeriod: votingPeriod.toString(),
        quorum: QUORUM_PERCENTAGE
      }
    },
    configuration: {
      timelockDelay: TIMELOCK_DELAY,
      votingDelay: VOTING_DELAY,
      votingPeriod: VOTING_PERIOD,
      quorumPercentage: QUORUM_PERCENTAGE
    }
  };
  
  console.log("\n📋 Deployment Summary:");
  console.log("=".repeat(60));
  console.log(`Governance Token: ${tokenAddress}`);
  console.log(`Timelock Controller: ${timelockAddress}`);
  console.log(`DAO Governor: ${daoAddress}`);
  console.log("=".repeat(60));
  
  console.log("\n🔧 Next Steps:");
  console.log("1. Verify contracts on Morphscan");
  console.log("2. Update frontend configuration with new addresses");
  console.log("3. Create initial governance proposal");
  console.log("4. Transfer admin roles to DAO (after testing)");
  console.log("5. Test proposal creation and voting flow");
  
  console.log("\n⚠️  Important Notes:");
  console.log("- Deployer currently has admin roles for testing");
  console.log("- Transfer admin roles to DAO after validation");
  console.log("- Badge checker integration needs to be configured");
  console.log("- Test all governance functions before mainnet deployment");
  
  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ DAO deployment failed:");
    console.error(error);
    process.exit(1);
  });