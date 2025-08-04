const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Simple KudoBit DAO System...");
  
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying from: ${deployer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH`);

  // Get existing contract addresses
  const BADGE_CHECKER_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  // Distribution addresses (using deployer for demo)
  const communityTreasury = deployer.address;
  const creatorRewards = deployer.address;
  const teamMultisig = deployer.address;
  const liquidityManager = deployer.address;
  
  console.log("\n📄 Step 1: Deploying Simple Governance Token...");
  
  // Deploy Simple Governance Token
  const SimpleGovernanceToken = await ethers.getContractFactory("SimpleGovernanceToken");
  const governanceToken = await SimpleGovernanceToken.deploy(
    communityTreasury,
    creatorRewards,
    deployer.address, // DAO treasury (will be updated after DAO deployment)
    teamMultisig,
    liquidityManager
  );
  await governanceToken.waitForDeployment();
  
  const tokenAddress = await governanceToken.getAddress();
  console.log(`✅ Simple Governance Token deployed to: ${tokenAddress}`);
  
  console.log("\n🏛️ Step 2: Deploying Simple DAO...");
  
  // Deploy Simple DAO
  const SimpleKudoBitDAO = await ethers.getContractFactory("SimpleKudoBitDAO");
  const dao = await SimpleKudoBitDAO.deploy(
    tokenAddress,
    BADGE_CHECKER_ADDRESS
  );
  await dao.waitForDeployment();
  
  const daoAddress = await dao.getAddress();
  console.log(`✅ Simple DAO deployed to: ${daoAddress}`);
  
  console.log("\n💰 Step 3: Executing Initial Token Distribution...");
  
  try {
    await governanceToken.executeInitialDistribution();
    console.log("✅ Initial token distribution completed");
    
    // Update DAO treasury address
    await governanceToken.updateDistributionAddresses(
      ethers.ZeroAddress, // Keep community treasury
      ethers.ZeroAddress, // Keep creator rewards
      daoAddress,         // Update DAO treasury to DAO contract
      ethers.ZeroAddress, // Keep team multisig
      ethers.ZeroAddress  // Keep liquidity manager
    );
    console.log("✅ DAO treasury address updated");
    
  } catch (error) {
    console.log("⚠️  Initial distribution failed or already completed:", error.message);
  }
  
  console.log("\n💸 Step 4: Funding DAO Treasury...");
  
  try {
    // Fund the DAO with some ETH for proposals
    const fundingAmount = ethers.parseEther("1.0"); // 1 ETH
    await dao.fundTreasury({ value: fundingAmount });
    console.log(`✅ DAO treasury funded with ${ethers.formatEther(fundingAmount)} ETH`);
  } catch (error) {
    console.log("⚠️  Treasury funding failed:", error.message);
  }
  
  console.log("\n🧪 Step 5: Testing Basic Functionality...");
  
  // Test governance token
  const totalSupply = await governanceToken.totalSupply();
  const deployerBalance = await governanceToken.balanceOf(deployer.address);
  
  console.log(`  Token Total Supply: ${ethers.formatEther(totalSupply)} KUDO`);
  console.log(`  Deployer Balance: ${ethers.formatEther(deployerBalance)} KUDO`);
  
  // Test DAO parameters
  const daoStats = await dao.getDAOStats();
  
  console.log(`  Total Proposals: ${daoStats[0]}`);
  console.log(`  Treasury Balance: ${ethers.formatEther(daoStats[3])} ETH`);
  console.log(`  Quorum Threshold: ${ethers.formatEther(daoStats[5])} votes`);
  
  console.log("\n🗳️ Step 6: Creating Test Proposal...");
  
  try {
    // Create a test proposal (if user has enough tokens)
    if (deployerBalance >= ethers.parseEther("100000")) { // 100k threshold
      const tx = await dao.propose(
        "Test Proposal: Update Platform Fee",
        "This is a test proposal to demonstrate the governance system. Propose to update platform fee from 2% to 1.5%.",
        1, // Fee change proposal type
        ethers.ZeroAddress,
        0,
        "0x"
      );
      
      const receipt = await tx.wait();
      console.log("✅ Test proposal created successfully");
      
      // Get the proposal ID from events
      const proposalEvent = receipt.logs.find(log => log.topics[0] === dao.interface.getEvent("ProposalCreated").topicHash);
      if (proposalEvent) {
        const proposalId = ethers.AbiCoder.defaultAbiCoder().decode(['uint256'], proposalEvent.topics[1])[0];
        console.log(`  Proposal ID: ${proposalId}`);
      }
    } else {
      console.log("⚠️  Insufficient tokens for creating proposal (need 100k KUDO)");
    }
  } catch (error) {
    console.log("⚠️  Test proposal creation failed:", error.message);
  }
  
  // Save deployment info
  const deploymentInfo = {
    network: "morphHolesky",
    timestamp: new Date().toISOString(),
    contracts: {
      simpleGovernanceToken: {
        address: tokenAddress,
        name: "SimpleGovernanceToken",
        symbol: "KUDO"
      },
      simpleDAO: {
        address: daoAddress,
        name: "SimpleKudoBitDAO"
      }
    },
    configuration: {
      votingPeriod: "7 days",
      proposalThreshold: "100,000 KUDO",
      quorumThreshold: "4%"
    }
  };
  
  console.log("\n📋 Deployment Summary:");
  console.log("=".repeat(60));
  console.log(`Simple Governance Token: ${tokenAddress}`);
  console.log(`Simple DAO: ${daoAddress}`);
  console.log("=".repeat(60));
  
  console.log("\n🔧 Next Steps:");
  console.log("1. Update frontend configuration with new addresses");
  console.log("2. Test proposal creation and voting");
  console.log("3. Create real governance proposals");
  console.log("4. Distribute governance tokens to community");
  
  console.log("\n📚 Usage Instructions:");
  console.log("- Users can create proposals with 100k+ KUDO tokens");
  console.log("- Voting period is 7 days for each proposal");
  console.log("- Badge holders get voting power bonuses");
  console.log("- Quorum requirement is 4% of total token supply");
  
  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Simple DAO deployment failed:");
    console.error(error);
    process.exit(1);
  });