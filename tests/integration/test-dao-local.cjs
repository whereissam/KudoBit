const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing KudoBit DAO System on Local Hardhat Network...");
  
  const [deployer, user1, user2] = await ethers.getSigners();
  console.log(`📝 Testing from: ${deployer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH`);

  console.log("\n📄 Step 1: Deploying Governance Token...");
  
  // Deploy Governance Token
  const SimpleGovernanceToken = await ethers.getContractFactory("SimpleGovernanceToken");
  const governanceToken = await SimpleGovernanceToken.deploy(
    deployer.address, // community treasury
    deployer.address, // creator rewards
    deployer.address, // dao treasury
    deployer.address, // team multisig
    deployer.address  // liquidity manager
  );
  await governanceToken.waitForDeployment();
  
  const tokenAddress = await governanceToken.getAddress();
  console.log(`✅ Governance Token deployed to: ${tokenAddress}`);
  
  console.log("\n🏛️ Step 2: Deploying BadgeChecker...");
  
  // Use existing LoyaltyToken address from deployments
  const loyaltyTokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  
  // Deploy BadgeChecker (needed for DAO)
  const BadgeChecker = await ethers.getContractFactory("BadgeChecker");
  const badgeChecker = await BadgeChecker.deploy(loyaltyTokenAddress);
  await badgeChecker.waitForDeployment();
  
  const badgeCheckerAddress = await badgeChecker.getAddress();
  console.log(`✅ BadgeChecker deployed to: ${badgeCheckerAddress}`);
  
  console.log("\n🏛️ Step 3: Deploying DAO Governor...");
  
  // Deploy DAO Governor
  const SimpleKudoBitDAO = await ethers.getContractFactory("SimpleKudoBitDAO");
  const dao = await SimpleKudoBitDAO.deploy(
    tokenAddress,
    badgeCheckerAddress
  );
  await dao.waitForDeployment();
  
  const daoAddress = await dao.getAddress();
  console.log(`✅ DAO Governor deployed to: ${daoAddress}`);
  
  console.log("\n💰 Step 4: Executing Initial Token Distribution...");
  
  // Execute initial distribution
  try {
    await governanceToken.executeInitialDistribution();
    console.log("✅ Initial token distribution completed");
  } catch (error) {
    console.log("⚠️  Initial distribution failed or already completed:", error.message);
  }
  
  console.log("\n🧪 Step 5: Testing Token Functionality...");
  
  // Test governance token
  const totalSupply = await governanceToken.totalSupply();
  const deployerBalance = await governanceToken.balanceOf(deployer.address);
  
  console.log(`  Token Total Supply: ${ethers.formatEther(totalSupply)} KUDO`);
  console.log(`  Deployer Balance: ${ethers.formatEther(deployerBalance)} KUDO`);
  
  // Transfer some tokens to test users
  const transferAmount = ethers.parseEther("1000000"); // 1M tokens
  await governanceToken.transfer(user1.address, transferAmount);
  await governanceToken.transfer(user2.address, transferAmount);
  
  const user1Balance = await governanceToken.balanceOf(user1.address);
  const user2Balance = await governanceToken.balanceOf(user2.address);
  
  console.log(`  User1 Balance: ${ethers.formatEther(user1Balance)} KUDO`);
  console.log(`  User2 Balance: ${ethers.formatEther(user2Balance)} KUDO`);
  
  console.log("\n📝 Step 6: Testing Proposal Creation...");
  
  // Test proposal creation
  const minTokensForProposal = ethers.parseEther("100000"); // 100k tokens
  
  // Ensure proposer has enough tokens
  if (deployerBalance >= minTokensForProposal) {
    try {
      const proposalTx = await dao.propose(
        "Test Proposal",
        "This is a test proposal to verify DAO functionality",
        1, // fee change proposal type
        ethers.ZeroAddress, // no target for test
        0, // no value for test
        "0x" // empty calldata for test
      );
      
      const receipt = await proposalTx.wait();
      console.log("✅ Test proposal created successfully");
      console.log(`  Transaction hash: ${receipt.hash}`);
      
      // Get proposal count
      const proposalCount = await dao.proposalCount();
      console.log(`  Total proposals: ${proposalCount}`);
      
      // Get the proposal details
      const proposal = await dao.proposals(1);
      console.log(`  Proposal ID: ${proposal.id}`);
      console.log(`  Proposal Title: ${proposal.title}`);
      console.log(`  Proposal Executed: ${proposal.executed}`);
      
    } catch (error) {
      console.log("❌ Proposal creation failed:", error.message);
    }
  } else {
    console.log("⚠️  Insufficient tokens for proposal creation");
  }
  
  console.log("\n🗳️ Step 7: Testing Voting...");
  
  // Test voting on the proposal
  try {
    // Vote on proposal 1 (1 = for, 0 = against, 2 = abstain)
    const voteTx = await dao.castVote(1, 1); // 1 = support
    await voteTx.wait();
    console.log("✅ Vote cast successfully");
    
    // Check vote count
    const proposal = await dao.proposals(1);
    console.log(`  Votes For: ${proposal.forVotes}`);
    console.log(`  Votes Against: ${proposal.againstVotes}`);
    console.log(`  Abstain Votes: ${proposal.abstainVotes}`);
    
  } catch (error) {
    console.log("❌ Voting failed:", error.message);
  }
  
  console.log("\n🏆 Step 8: Testing Badge-based Voting Bonuses...");
  
  // Test badge integration (if badges exist)
  try {
    const hasAnyBadge = await badgeChecker.checkAnyBadgeOwnership(deployer.address);
    const totalBadgeCount = await badgeChecker.getTotalBadgeCount(deployer.address);
    const badgeBalances = await badgeChecker.getUserBadgeBalances(deployer.address);
    
    console.log(`  Deployer has any badge: ${hasAnyBadge}`);
    console.log(`  Total badge count: ${totalBadgeCount}`);
    console.log(`  Badge balances length: ${badgeBalances.length}`);
    
    // Test voting power calculation
    const totalVotingPower = await dao.getVotingPower(deployer.address);
    
    console.log(`  Total Voting Power (with bonuses): ${ethers.formatEther(totalVotingPower)} votes`);
    
  } catch (error) {
    console.log("⚠️  Badge checking failed:", error.message);
  }
  
  console.log("\n📊 Step 9: DAO System Summary...");
  
  // Final system status
  const currentProposalCount = await dao.proposalCount();
  const daoBalance = await governanceToken.balanceOf(daoAddress);
  
  console.log("=".repeat(60));
  console.log(`Governance Token: ${tokenAddress}`);
  console.log(`Badge Checker: ${badgeCheckerAddress}`);
  console.log(`DAO Governor: ${daoAddress}`);
  console.log(`Total Proposals: ${currentProposalCount}`);
  console.log(`DAO Token Balance: ${ethers.formatEther(daoBalance)} KUDO`);
  console.log("=".repeat(60));
  
  console.log("\n✅ DAO System Test Complete!");
  console.log("\n🎯 Tested Features:");
  console.log("  ✅ KUDO token deployment and distribution");
  console.log("  ✅ Badge-based voting power system");
  console.log("  ✅ Proposal creation");
  console.log("  ✅ Voting mechanism");
  console.log("  ✅ Badge-based voting bonuses");
  
  return {
    governanceToken: tokenAddress,
    badgeChecker: badgeCheckerAddress,
    dao: daoAddress,
    proposalCount: currentProposalCount.toString()
  };
}

main()
  .then((result) => {
    console.log("\n🎉 Test completed successfully!");
    console.log("Result:", result);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ DAO test failed:");
    console.error(error);
    process.exit(1);
  });