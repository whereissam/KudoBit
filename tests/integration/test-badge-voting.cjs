const { ethers } = require("hardhat");

async function main() {
  console.log("🏆 Testing Badge-Based Voting Power System...");
  
  const [deployer, user1] = await ethers.getSigners();
  
  // Use addresses from previous deployment
  const loyaltyTokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const governanceTokenAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const badgeCheckerAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const daoAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
  
  // Get contract instances
  const loyaltyToken = await ethers.getContractAt("LoyaltyToken", loyaltyTokenAddress);
  const governanceToken = await ethers.getContractAt("SimpleGovernanceToken", governanceTokenAddress);
  const badgeChecker = await ethers.getContractAt("BadgeChecker", badgeCheckerAddress);
  const dao = await ethers.getContractAt("SimpleKudoBitDAO", daoAddress);
  
  console.log("\n🎯 Step 1: Check initial voting power (no badges)...");
  
  const initialVotingPower = await dao.getVotingPower(deployer.address);
  console.log(`  Initial voting power: ${ethers.formatEther(initialVotingPower)} votes`);
  
  console.log("\n🏅 Step 2: Mint badges to test bonus system...");
  
  // Mint different tier badges to deployer
  await loyaltyToken.mint(deployer.address, 1, 1, "0x"); // Bronze badge
  await loyaltyToken.mint(deployer.address, 2, 1, "0x"); // Silver badge
  await loyaltyToken.mint(deployer.address, 3, 2, "0x"); // Gold badge (2 of them)
  await loyaltyToken.mint(deployer.address, 4, 1, "0x"); // Diamond badge
  
  console.log("✅ Badges minted successfully");
  
  // Check badge balances
  const bronzeBalance = await loyaltyToken.balanceOf(deployer.address, 1);
  const silverBalance = await loyaltyToken.balanceOf(deployer.address, 2);
  const goldBalance = await loyaltyToken.balanceOf(deployer.address, 3);
  const diamondBalance = await loyaltyToken.balanceOf(deployer.address, 4);
  
  console.log(`  Bronze badges: ${bronzeBalance}`);
  console.log(`  Silver badges: ${silverBalance}`);
  console.log(`  Gold badges: ${goldBalance}`);
  console.log(`  Diamond badges: ${diamondBalance}`);
  
  console.log("\n🔍 Step 3: Test badge checking functions...");
  
  const hasAnyBadge = await badgeChecker.checkAnyBadgeOwnership(deployer.address);
  const totalBadgeCount = await badgeChecker.getTotalBadgeCount(deployer.address);
  const [highestTier, tierName] = await badgeChecker.getUserHighestTier(deployer.address);
  
  console.log(`  Has any badge: ${hasAnyBadge}`);
  console.log(`  Total badge count: ${totalBadgeCount}`);
  console.log(`  Highest tier: ${highestTier} (${tierName})`);
  
  console.log("\n⚡ Step 4: Test voting power with badge bonuses...");
  
  const tokenBalance = await governanceToken.balanceOf(deployer.address);
  const votingPowerWithBadges = await dao.getVotingPower(deployer.address);
  
  console.log(`  Token balance: ${ethers.formatEther(tokenBalance)} KUDO`);
  console.log(`  Voting power with badges: ${ethers.formatEther(votingPowerWithBadges)} votes`);
  
  // Calculate expected bonus
  const expectedBonus = highestTier === 4 ? 20 : // Diamond: 20%
                       highestTier === 3 ? 15 : // Gold: 15%
                       highestTier === 2 ? 10 : // Silver: 10%
                       highestTier === 1 ? 5 : 0; // Bronze: 5%
  
  const expectedVotingPower = tokenBalance * BigInt(100 + expectedBonus) / BigInt(100);
  
  console.log(`  Expected bonus: ${expectedBonus}%`);
  console.log(`  Expected voting power: ${ethers.formatEther(expectedVotingPower)} votes`);
  console.log(`  Actual voting power: ${ethers.formatEther(votingPowerWithBadges)} votes`);
  console.log(`  Bonus working correctly: ${votingPowerWithBadges === expectedVotingPower}`);
  
  console.log("\n🗳️ Step 5: Test voting with enhanced power...");
  
  // Create a new proposal to test enhanced voting
  const proposalTx = await dao.propose(
    "Badge Bonus Test Proposal",
    "Testing voting with badge-enhanced voting power",
    1, // fee change proposal type
    ethers.ZeroAddress, // no target
    0, // no value
    "0x" // empty calldata
  );
  await proposalTx.wait();
  
  const proposalCount = await dao.proposalCount();
  console.log(`✅ New proposal created (ID: ${proposalCount})`);
  
  // Vote on the new proposal
  const voteTx = await dao.castVoteWithReason(proposalCount, 1, "Voting with diamond badge bonus!");
  await voteTx.wait();
  
  console.log("✅ Vote cast with enhanced voting power");
  
  // Check the vote weight
  const proposal = await dao.proposals(proposalCount);
  console.log(`  Votes recorded: ${ethers.formatEther(proposal.forVotes)} votes`);
  
  console.log("\n👥 Step 6: Compare with user without badges...");
  
  // Give user1 some tokens
  await governanceToken.transfer(user1.address, ethers.parseEther("100000"));
  
  const user1Balance = await governanceToken.balanceOf(user1.address);
  const user1VotingPower = await dao.getVotingPower(user1.address);
  const [user1Tier, user1TierName] = await badgeChecker.getUserHighestTier(user1.address);
  
  console.log(`  User1 token balance: ${ethers.formatEther(user1Balance)} KUDO`);
  console.log(`  User1 voting power: ${ethers.formatEther(user1VotingPower)} votes`);
  console.log(`  User1 highest tier: ${user1Tier} (${user1TierName})`);
  
  // User1 votes on the same proposal
  const user1VoteTx = await dao.connect(user1).castVote(proposalCount, 1);
  await user1VoteTx.wait();
  
  console.log("✅ User1 voted without badge bonus");
  
  // Check updated proposal votes
  const updatedProposal = await dao.proposals(proposalCount);
  console.log(`  Total votes for: ${ethers.formatEther(updatedProposal.forVotes)} votes`);
  
  const deployerVoteWeight = votingPowerWithBadges;
  const user1VoteWeight = user1VotingPower;
  const expectedTotal = deployerVoteWeight + user1VoteWeight;
  
  console.log(`  Expected total: ${ethers.formatEther(expectedTotal)} votes`);
  console.log(`  Vote counting accurate: ${updatedProposal.forVotes === expectedTotal}`);
  
  console.log("\n📊 Badge Voting Power Test Summary:");
  console.log("=".repeat(60));
  console.log(`Deployer (with ${tierName} badge): ${ethers.formatEther(votingPowerWithBadges)} votes (+${expectedBonus}% bonus)`);
  console.log(`User1 (no badges): ${ethers.formatEther(user1VotingPower)} votes`);
  console.log(`Badge system is working: ${votingPowerWithBadges > tokenBalance && user1VotingPower === user1Balance}`);
  console.log("=".repeat(60));
  
  console.log("\n✅ Badge-Based Voting Power Test Complete!");
  
  return {
    deployerVotingPower: ethers.formatEther(votingPowerWithBadges),
    user1VotingPower: ethers.formatEther(user1VotingPower),
    badgeBonus: expectedBonus,
    highestTier: highestTier,
    tierName: tierName
  };
}

main()
  .then((result) => {
    console.log("\n🎉 Badge voting test completed successfully!");
    console.log("Results:", result);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Badge voting test failed:");
    console.error(error);
    process.exit(1);
  });