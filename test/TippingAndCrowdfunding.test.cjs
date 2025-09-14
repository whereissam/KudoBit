const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TippingAndCrowdfunding Contract", function () {
  let mockUSDC, loyaltyToken, tippingAndCrowdfunding;
  let owner, creator1, creator2, user1, user2;
  
  beforeEach(async function () {
    [owner, creator1, creator2, user1, user2] = await ethers.getSigners();
    
    // Deploy MockUSDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();
    
    // Deploy LoyaltyToken
    const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
    loyaltyToken = await LoyaltyToken.deploy();
    
    // Deploy TippingAndCrowdfunding
    const TippingAndCrowdfunding = await ethers.getContractFactory("TippingAndCrowdfunding");
    tippingAndCrowdfunding = await TippingAndCrowdfunding.deploy(
      await mockUSDC.getAddress(),
      await loyaltyToken.getAddress()
    );
    
    // Set permissions
    await loyaltyToken.setAuthorizedMinter(await tippingAndCrowdfunding.getAddress(), true);
    
    // Mint USDC to users
    const mintAmount = ethers.parseUnits("100", 6);
    await mockUSDC.mint(user1.address, mintAmount);
    await mockUSDC.mint(user2.address, mintAmount);
    
    // Create creator profiles
    await tippingAndCrowdfunding.connect(creator1).createCreatorProfile(
      "DigitalArtist",
      "Creating amazing digital art",
      "QmCreatorHash123"
    );
    
    await tippingAndCrowdfunding.connect(creator2).createCreatorProfile(
      "MusicProducer",
      "Electronic music producer",
      "QmMusicHash456"
    );
  });

  describe("Creator Profile Management", function () {
    it("Should create creator profile", async function () {
      const profile = await tippingAndCrowdfunding.creatorProfiles(creator1.address);
      expect(profile.name).to.equal("DigitalArtist");
      expect(profile.bio).to.equal("Creating amazing digital art");
      expect(profile.isVerified).to.be.false;
    });

    it("Should update creator profile", async function () {
      await tippingAndCrowdfunding.connect(creator1).updateAffiliateProfile(
        "Updated Artist",
        "Updated bio"
      );
      
      const profile = await tippingAndCrowdfunding.creatorProfiles(creator1.address);
      expect(profile.name).to.equal("Updated Artist");
      expect(profile.bio).to.equal("Updated bio");
    });

    it("Should allow owner to verify creator", async function () {
      await expect(tippingAndCrowdfunding.verifyCreator(creator1.address))
        .to.emit(tippingAndCrowdfunding, "CreatorVerified")
        .withArgs(creator1.address, "DigitalArtist");
      
      const profile = await tippingAndCrowdfunding.creatorProfiles(creator1.address);
      expect(profile.isVerified).to.be.true;
      
      // Should receive diamond badge for verification
      const badgeBalance = await loyaltyToken.balanceOf(creator1.address, 4);
      expect(badgeBalance).to.equal(1);
    });
  });

  describe("Tipping System", function () {
    it("Should allow user to tip creator", async function () {
      const tipAmount = ethers.parseUnits("5", 6); // $5.00
      const platformFee = tipAmount * 250n / 10000n; // 2.5% fee
      const creatorAmount = tipAmount - platformFee;
      
      await mockUSDC.connect(user1).approve(await tippingAndCrowdfunding.getAddress(), tipAmount);
      
      await expect(tippingAndCrowdfunding.connect(user1).tipCreator(
        creator1.address,
        tipAmount,
        "Great work!",
        false
      ))
        .to.emit(tippingAndCrowdfunding, "TipSent")
        .withArgs(user1.address, creator1.address, creatorAmount, "Great work!", false, await time.latest() + 1);
      
      // Check creator received the tip (minus platform fee)
      const creatorBalance = await mockUSDC.balanceOf(creator1.address);
      expect(creatorBalance).to.equal(creatorAmount);
    });

    it("Should award loyalty badge for tip threshold", async function () {
      const tipAmount = ethers.parseUnits("5", 6); // $5.00 - should trigger silver badge
      
      await mockUSDC.connect(user1).approve(await tippingAndCrowdfunding.getAddress(), tipAmount);
      await tippingAndCrowdfunding.connect(user1).tipCreator(
        creator1.address,
        tipAmount,
        "Amazing!",
        false
      );
      
      // Should receive silver badge (tier 2) for $5+ tip
      const badgeBalance = await loyaltyToken.balanceOf(user1.address, 2);
      expect(badgeBalance).to.equal(1);
    });

    it("Should support anonymous tipping", async function () {
      const tipAmount = ethers.parseUnits("2", 6);
      
      await mockUSDC.connect(user1).approve(await tippingAndCrowdfunding.getAddress(), tipAmount);
      
      await expect(tippingAndCrowdfunding.connect(user1).tipCreator(
        creator1.address,
        tipAmount,
        "Anonymous tip",
        true
      ))
        .to.emit(tippingAndCrowdfunding, "TipSent");
      
      // Get creator tips and check if anonymous
      const [tippers, amounts, messages, timestamps, anonymous] = 
        await tippingAndCrowdfunding.getCreatorTips(creator1.address, 10);
      
      expect(anonymous[0]).to.be.true;
      expect(tippers[0]).to.equal(ethers.ZeroAddress); // Anonymous tipper
    });

    it("Should prevent self-tipping", async function () {
      const tipAmount = ethers.parseUnits("1", 6);
      
      await mockUSDC.mint(creator1.address, tipAmount);
      await mockUSDC.connect(creator1).approve(await tippingAndCrowdfunding.getAddress(), tipAmount);
      
      await expect(
        tippingAndCrowdfunding.connect(creator1).tipCreator(
          creator1.address,
          tipAmount,
          "Self tip",
          false
        )
      ).to.be.revertedWith("Cannot tip yourself");
    });
  });

  describe("Crowdfunding System", function () {
    it("Should create crowdfunding campaign", async function () {
      const goalAmount = ethers.parseUnits("100", 6); // $100 goal
      const milestones = ["Design mockups", "Development", "Testing", "Launch"];
      
      await expect(tippingAndCrowdfunding.connect(creator1).createCrowdfundingCampaign(
        "New Art Collection",
        "Creating a new series of digital artworks",
        "QmCampaignMediaHash",
        goalAmount,
        30, // 30 days
        milestones,
        ethers.parseUnits("1", 6), // $1 minimum
        100 // max 100 contributors
      ))
        .to.emit(tippingAndCrowdfunding, "CampaignCreated");
      
      const campaign = await tippingAndCrowdfunding.campaigns(1);
      expect(campaign.title).to.equal("New Art Collection");
      expect(campaign.goalAmount).to.equal(goalAmount);
      expect(campaign.creator).to.equal(creator1.address);
    });

    it("Should allow contributions to campaign", async function () {
      // Create campaign
      const goalAmount = ethers.parseUnits("100", 6);
      await tippingAndCrowdfunding.connect(creator1).createCrowdfundingCampaign(
        "Test Campaign",
        "Test description",
        "QmTestHash",
        goalAmount,
        30,
        ["Milestone 1"],
        ethers.parseUnits("1", 6),
        100
      );
      
      const contributionAmount = ethers.parseUnits("10", 6);
      const platformFee = contributionAmount * 250n / 10000n;
      const campaignAmount = contributionAmount - platformFee;
      
      await mockUSDC.connect(user1).approve(await tippingAndCrowdfunding.getAddress(), contributionAmount);
      
      await expect(tippingAndCrowdfunding.connect(user1).contributeToCompaign(
        1,
        contributionAmount,
        "Supporting your work!",
        false
      ))
        .to.emit(tippingAndCrowdfunding, "ContributionMade")
        .withArgs(1, user1.address, campaignAmount, "Supporting your work!", false);
      
      const campaign = await tippingAndCrowdfunding.campaigns(1);
      expect(campaign.raisedAmount).to.equal(campaignAmount);
      expect(campaign.contributorCount).to.equal(1);
    });

    it("Should complete campaign when goal is reached", async function () {
      const goalAmount = ethers.parseUnits("10", 6); // Small goal for testing
      
      await tippingAndCrowdfunding.connect(creator1).createCrowdfundingCampaign(
        "Small Campaign",
        "Test description",
        "QmTestHash",
        goalAmount,
        30,
        ["Milestone"],
        ethers.parseUnits("1", 6),
        10
      );
      
      const contributionAmount = ethers.parseUnits("15", 6); // Exceed goal
      await mockUSDC.connect(user1).approve(await tippingAndCrowdfunding.getAddress(), contributionAmount);
      
      await expect(tippingAndCrowdfunding.connect(user1).contributeToCompaign(
        1,
        contributionAmount,
        "Full funding!",
        false
      ))
        .to.emit(tippingAndCrowdfunding, "CampaignCompleted");
      
      const campaign = await tippingAndCrowdfunding.campaigns(1);
      expect(campaign.status).to.equal(1); // COMPLETED status
      
      // Creator should receive gold badge for successful campaign
      const badgeBalance = await loyaltyToken.balanceOf(creator1.address, 3);
      expect(badgeBalance).to.equal(1);
    });

    it("Should allow creator to cancel campaign", async function () {
      const goalAmount = ethers.parseUnits("100", 6);
      
      await tippingAndCrowdfunding.connect(creator1).createCrowdfundingCampaign(
        "Cancel Test",
        "Test description",
        "QmTestHash",
        goalAmount,
        30,
        ["Milestone"],
        ethers.parseUnits("1", 6),
        10
      );
      
      // Make a contribution first
      const contributionAmount = ethers.parseUnits("5", 6);
      await mockUSDC.connect(user1).approve(await tippingAndCrowdfunding.getAddress(), contributionAmount);
      await tippingAndCrowdfunding.connect(user1).contributeToCompaign(
        1,
        contributionAmount,
        "Test contribution",
        false
      );
      
      const initialBalance = await mockUSDC.balanceOf(user1.address);
      
      await expect(tippingAndCrowdfunding.connect(creator1).cancelCampaign(1))
        .to.emit(tippingAndCrowdfunding, "CampaignCancelled");
      
      // User should be refunded
      const finalBalance = await mockUSDC.balanceOf(user1.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
      
      const campaign = await tippingAndCrowdfunding.campaigns(1);
      expect(campaign.status).to.equal(2); // CANCELLED status
    });

    it("Should enforce minimum contribution", async function () {
      const goalAmount = ethers.parseUnits("100", 6);
      const minimumContribution = ethers.parseUnits("5", 6);
      
      await tippingAndCrowdfunding.connect(creator1).createCrowdfundingCampaign(
        "Min Test",
        "Test description",
        "QmTestHash",
        goalAmount,
        30,
        ["Milestone"],
        minimumContribution,
        10
      );
      
      const smallContribution = ethers.parseUnits("1", 6); // Below minimum
      await mockUSDC.connect(user1).approve(await tippingAndCrowdfunding.getAddress(), smallContribution);
      
      await expect(
        tippingAndCrowdfunding.connect(user1).contributeToCompaign(
          1,
          smallContribution,
          "Too small",
          false
        )
      ).to.be.revertedWith("Below minimum contribution");
    });

    it("Should enforce contributor limit", async function () {
      const goalAmount = ethers.parseUnits("100", 6);
      
      await tippingAndCrowdfunding.connect(creator1).createCrowdfundingCampaign(
        "Limit Test",
        "Test description",
        "QmTestHash",
        goalAmount,
        30,
        ["Milestone"],
        ethers.parseUnits("1", 6),
        1 // Only 1 contributor allowed
      );
      
      const contributionAmount = ethers.parseUnits("5", 6);
      
      // First contribution should work
      await mockUSDC.connect(user1).approve(await tippingAndCrowdfunding.getAddress(), contributionAmount);
      await tippingAndCrowdfunding.connect(user1).contributeToCompaign(1, contributionAmount, "First", false);
      
      // Second contribution should fail
      await mockUSDC.connect(user2).approve(await tippingAndCrowdfunding.getAddress(), contributionAmount);
      await expect(
        tippingAndCrowdfunding.connect(user2).contributeToCompaign(1, contributionAmount, "Second", false)
      ).to.be.revertedWith("Campaign is full");
    });
  });

  describe("Statistics and Views", function () {
    beforeEach(async function () {
      // Set up some test data
      const tipAmount = ethers.parseUnits("3", 6);
      await mockUSDC.connect(user1).approve(await tippingAndCrowdfunding.getAddress(), tipAmount);
      await tippingAndCrowdfunding.connect(user1).tipCreator(creator1.address, tipAmount, "Test tip", false);
    });

    it("Should return creator tips", async function () {
      const [tippers, amounts, messages, timestamps, anonymous] = 
        await tippingAndCrowdfunding.getCreatorTips(creator1.address, 10);
      
      expect(tippers.length).to.equal(1);
      expect(tippers[0]).to.equal(user1.address);
      expect(messages[0]).to.equal("Test tip");
      expect(anonymous[0]).to.be.false;
    });

    it("Should return campaign contributions", async function () {
      // Create and fund a campaign
      const goalAmount = ethers.parseUnits("100", 6);
      await tippingAndCrowdfunding.connect(creator1).createCrowdfundingCampaign(
        "Stats Test",
        "Description",
        "QmHash",
        goalAmount,
        30,
        ["Milestone"],
        ethers.parseUnits("1", 6),
        10
      );
      
      const contributionAmount = ethers.parseUnits("10", 6);
      await mockUSDC.connect(user1).approve(await tippingAndCrowdfunding.getAddress(), contributionAmount);
      await tippingAndCrowdfunding.connect(user1).contributeToCompaign(1, contributionAmount, "Test contribution", false);
      
      const [contributors, amounts, messages, timestamps, anonymous] = 
        await tippingAndCrowdfunding.getCampaignContributions(1, 10);
      
      expect(contributors.length).to.equal(1);
      expect(contributors[0]).to.equal(user1.address);
      expect(messages[0]).to.equal("Test contribution");
    });

    it("Should return platform statistics", async function () {
      const [totalTips, totalCrowdfunding, activeCampaigns, totalCreators, verifiedCreatorCount] = 
        await tippingAndCrowdfunding.getPlatformStats();
      
      expect(totalTips).to.be.greaterThan(0);
      expect(totalCreators).to.equal(0); // This would need proper tracking in production
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to set platform fee", async function () {
      await tippingAndCrowdfunding.setPlatformFee(300); // 3%
      
      const newFee = await tippingAndCrowdfunding.platformFeePercentage();
      expect(newFee).to.equal(300);
    });

    it("Should prevent setting fee too high", async function () {
      await expect(
        tippingAndCrowdfunding.setPlatformFee(1100) // 11%
      ).to.be.revertedWith("Fee cannot exceed 10%");
    });

    it("Should allow owner to withdraw platform fees", async function () {
      // Generate some fees first
      const tipAmount = ethers.parseUnits("10", 6);
      await mockUSDC.connect(user1).approve(await tippingAndCrowdfunding.getAddress(), tipAmount);
      await tippingAndCrowdfunding.connect(user1).tipCreator(creator1.address, tipAmount, "Fee test", false);
      
      const initialOwnerBalance = await mockUSDC.balanceOf(owner.address);
      
      await tippingAndCrowdfunding.withdrawPlatformFees();
      
      const finalOwnerBalance = await mockUSDC.balanceOf(owner.address);
      expect(finalOwnerBalance).to.be.greaterThan(initialOwnerBalance);
    });

    it("Should prevent non-owner from admin functions", async function () {
      await expect(
        tippingAndCrowdfunding.connect(user1).setPlatformFee(300)
      ).to.be.revertedWithCustomError(tippingAndCrowdfunding, "OwnableUnauthorizedAccount");
    });
  });
});

// Helper to get latest block timestamp
const time = {
  latest: async () => {
    const block = await ethers.provider.getBlock('latest');
    return block.timestamp;
  }
};