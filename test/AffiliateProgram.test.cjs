const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AffiliateProgram Contract", function () {
  let mockUSDC, loyaltyToken, affiliateProgram;
  let owner, affiliate1, affiliate2, user1, user2, creator1;
  
  beforeEach(async function () {
    [owner, affiliate1, affiliate2, user1, user2, creator1] = await ethers.getSigners();
    
    // Deploy MockUSDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();
    
    // Deploy LoyaltyToken
    const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
    loyaltyToken = await LoyaltyToken.deploy();
    
    // Deploy AffiliateProgram
    const AffiliateProgram = await ethers.getContractFactory("AffiliateProgram");
    affiliateProgram = await AffiliateProgram.deploy(
      await mockUSDC.getAddress(),
      await loyaltyToken.getAddress()
    );
    
    // Set permissions
    await loyaltyToken.setAuthorizedMinter(await affiliateProgram.getAddress(), true);
    
    // Mint USDC to contract for rewards
    const rewardAmount = ethers.parseUnits("1000", 6);
    await mockUSDC.mint(await affiliateProgram.getAddress(), rewardAmount);
  });

  describe("Affiliate Registration", function () {
    it("Should register new affiliate", async function () {
      await expect(affiliateProgram.connect(affiliate1).registerAffiliate(
        "TestAffiliate",
        "I help people discover Web3!"
      ))
        .to.emit(affiliateProgram, "AffiliateRegistered");
      
      const profile = await affiliateProgram.affiliates(affiliate1.address);
      expect(profile.displayName).to.equal("TestAffiliate");
      expect(profile.bio).to.equal("I help people discover Web3!");
      expect(profile.isActive).to.be.true;
      expect(profile.isVerified).to.be.false;
    });

    it("Should generate unique referral code", async function () {
      await affiliateProgram.connect(affiliate1).registerAffiliate("Affiliate1", "Bio1");
      await affiliateProgram.connect(affiliate2).registerAffiliate("Affiliate2", "Bio2");
      
      const profile1 = await affiliateProgram.affiliates(affiliate1.address);
      const profile2 = await affiliateProgram.affiliates(affiliate2.address);
      
      expect(profile1.referralCode).to.not.equal(profile2.referralCode);
      expect(profile1.referralCode).to.not.equal(ethers.ZeroHash);
    });

    it("Should prevent duplicate registration", async function () {
      await affiliateProgram.connect(affiliate1).registerAffiliate("TestAffiliate", "Bio");
      
      await expect(
        affiliateProgram.connect(affiliate1).registerAffiliate("TestAffiliate2", "Bio2")
      ).to.be.revertedWith("Already registered as affiliate");
    });

    it("Should require display name", async function () {
      await expect(
        affiliateProgram.connect(affiliate1).registerAffiliate("", "Bio")
      ).to.be.revertedWith("Display name required");
    });
  });

  describe("Referral Tracking", function () {
    let referralCode;

    beforeEach(async function () {
      await affiliateProgram.connect(affiliate1).registerAffiliate("TestAffiliate", "Bio");
      const profile = await affiliateProgram.affiliates(affiliate1.address);
      referralCode = profile.referralCode;
    });

    it("Should track buyer signup referral", async function () {
      const expectedBonus = ethers.parseUnits("0.1", 6); // Bronze tier buyer bonus
      
      await expect(affiliateProgram.trackReferral(
        referralCode,
        user1.address,
        0, // BUYER_SIGNUP
        0
      ))
        .to.emit(affiliateProgram, "ReferralMade")
        .withArgs(affiliate1.address, user1.address, referralCode, 0, expectedBonus);
      
      const profile = await affiliateProgram.affiliates(affiliate1.address);
      expect(profile.totalReferrals).to.equal(1);
      expect(profile.buyerReferrals).to.equal(1);
      expect(profile.pendingEarnings).to.equal(expectedBonus);
    });

    it("Should track creator signup referral", async function () {
      const expectedBonus = ethers.parseUnits("0.5", 6); // Bronze tier creator bonus
      
      await expect(affiliateProgram.trackReferral(
        referralCode,
        creator1.address,
        1, // CREATOR_SIGNUP
        0
      ))
        .to.emit(affiliateProgram, "ReferralMade")
        .withArgs(affiliate1.address, creator1.address, referralCode, 1, expectedBonus);
      
      const profile = await affiliateProgram.affiliates(affiliate1.address);
      expect(profile.creatorReferrals).to.equal(1);
      expect(profile.pendingEarnings).to.equal(expectedBonus);
    });

    it("Should track purchase referral with commission", async function () {
      const purchaseAmount = ethers.parseUnits("100", 6); // $100 purchase
      const expectedCommission = purchaseAmount * 200n / 10000n; // 2% bronze tier
      
      await affiliateProgram.trackReferral(
        referralCode,
        user1.address,
        2, // PURCHASE
        purchaseAmount
      );
      
      const profile = await affiliateProgram.affiliates(affiliate1.address);
      expect(profile.totalSalesGenerated).to.equal(purchaseAmount);
      expect(profile.pendingEarnings).to.equal(expectedCommission);
    });

    it("Should track subscription referral with higher commission", async function () {
      const subscriptionAmount = ethers.parseUnits("50", 6); // $50 subscription
      const expectedCommission = subscriptionAmount * 300n / 10000n; // 3% bronze tier
      
      await affiliateProgram.trackReferral(
        referralCode,
        user1.address,
        3, // SUBSCRIPTION
        subscriptionAmount
      );
      
      const profile = await affiliateProgram.affiliates(affiliate1.address);
      expect(profile.subscriptionReferrals).to.equal(1);
      expect(profile.pendingEarnings).to.equal(expectedCommission);
    });

    it("Should prevent double attribution", async function () {
      // First referral
      await affiliateProgram.trackReferral(referralCode, user1.address, 0, 0);
      
      // Try to refer same user again - should not increase counts
      await affiliateProgram.trackReferral(referralCode, user1.address, 0, 0);
      
      const profile = await affiliateProgram.affiliates(affiliate1.address);
      expect(profile.totalReferrals).to.equal(1); // Should still be 1
    });

    it("Should prevent self-referral", async function () {
      await expect(
        affiliateProgram.trackReferral(referralCode, affiliate1.address, 0, 0)
      ).to.be.revertedWith("Cannot refer yourself");
    });

    it("Should fail with invalid referral code", async function () {
      const invalidCode = ethers.keccak256(ethers.toUtf8Bytes("invalid"));
      
      await expect(
        affiliateProgram.trackReferral(invalidCode, user1.address, 0, 0)
      ).to.be.revertedWith("Referral code not found");
    });
  });

  describe("Commission Tiers", function () {
    let referralCode;

    beforeEach(async function () {
      await affiliateProgram.connect(affiliate1).registerAffiliate("TestAffiliate", "Bio");
      const profile = await affiliateProgram.affiliates(affiliate1.address);
      referralCode = profile.referralCode;
    });

    it("Should upgrade to silver tier after 10 referrals", async function () {
      // Make 10 referrals to reach silver tier
      for (let i = 0; i < 10; i++) {
        const [, , , , , , , , , , newUser] = await ethers.getSigners();
        await affiliateProgram.trackReferral(referralCode, newUser.address, 0, 0);
      }
      
      // 11th referral should use silver tier rates
      const purchaseAmount = ethers.parseUnits("100", 6);
      const expectedCommission = purchaseAmount * 250n / 10000n; // 2.5% silver tier
      
      const [, , , , , , , , , , , user11] = await ethers.getSigners();
      await affiliateProgram.trackReferral(referralCode, user11.address, 2, purchaseAmount);
      
      const [totalRefs, totalEarnings, pendingEarnings, currentTier, tierName] = 
        await affiliateProgram.getAffiliateStats(affiliate1.address);
      
      expect(currentTier).to.equal(2); // Silver tier
      expect(tierName).to.equal("Silver Affiliate");
    });

    it("Should award loyalty badge for tier upgrade", async function () {
      // Make enough referrals to reach silver tier
      for (let i = 0; i < 10; i++) {
        const [, , , , , , , , , , ...users] = await ethers.getSigners();
        await affiliateProgram.trackReferral(referralCode, users[i].address, 0, 0);
      }
      
      // Check if affiliate received silver badge
      const badgeBalance = await loyaltyToken.balanceOf(affiliate1.address, 2);
      expect(badgeBalance).to.equal(1);
    });

    it("Should have correct commission rates for each tier", async function () {
      const tiers = await Promise.all([1, 2, 3, 4].map(async (tierId) => {
        return await affiliateProgram.commissionTiers(tierId);
      }));
      
      // Bronze tier
      expect(tiers[0].purchaseCommission).to.equal(200); // 2%
      expect(tiers[0].subscriptionCommission).to.equal(300); // 3%
      
      // Silver tier
      expect(tiers[1].purchaseCommission).to.equal(250); // 2.5%
      expect(tiers[1].subscriptionCommission).to.equal(350); // 3.5%
      
      // Gold tier
      expect(tiers[2].purchaseCommission).to.equal(300); // 3%
      expect(tiers[2].subscriptionCommission).to.equal(400); // 4%
      
      // Diamond tier
      expect(tiers[3].purchaseCommission).to.equal(400); // 4%
      expect(tiers[3].subscriptionCommission).to.equal(500); // 5%
    });
  });

  describe("Commission Withdrawal", function () {
    let referralCode;

    beforeEach(async function () {
      await affiliateProgram.connect(affiliate1).registerAffiliate("TestAffiliate", "Bio");
      const profile = await affiliateProgram.affiliates(affiliate1.address);
      referralCode = profile.referralCode;
      
      // Generate some earnings
      await affiliateProgram.trackReferral(referralCode, user1.address, 1, 0); // Creator signup bonus
    });

    it("Should allow withdrawal of earned commissions", async function () {
      const initialBalance = await mockUSDC.balanceOf(affiliate1.address);
      
      await expect(affiliateProgram.connect(affiliate1).withdrawCommissions())
        .to.emit(affiliateProgram, "CommissionWithdrawn");
      
      const finalBalance = await mockUSDC.balanceOf(affiliate1.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
      
      // Pending earnings should be reset
      const profile = await affiliateProgram.affiliates(affiliate1.address);
      expect(profile.pendingEarnings).to.equal(0);
    });

    it("Should enforce minimum withdrawal amount", async function () {
      // Register new affiliate with no earnings
      await affiliateProgram.connect(affiliate2).registerAffiliate("NewAffiliate", "Bio");
      
      await expect(
        affiliateProgram.connect(affiliate2).withdrawCommissions()
      ).to.be.revertedWith("Below minimum withdrawal amount");
    });

    it("Should prevent non-affiliate from withdrawing", async function () {
      await expect(
        affiliateProgram.connect(user1).withdrawCommissions()
      ).to.be.revertedWith("Not an affiliate");
    });
  });

  describe("Profile Management", function () {
    beforeEach(async function () {
      await affiliateProgram.connect(affiliate1).registerAffiliate("TestAffiliate", "Original bio");
    });

    it("Should allow affiliate to update profile", async function () {
      await affiliateProgram.connect(affiliate1).updateAffiliateProfile(
        "Updated Name",
        "Updated bio"
      );
      
      const profile = await affiliateProgram.affiliates(affiliate1.address);
      expect(profile.displayName).to.equal("Updated Name");
      expect(profile.bio).to.equal("Updated bio");
    });

    it("Should allow owner to verify affiliate", async function () {
      await affiliateProgram.verifyAffiliate(affiliate1.address);
      
      const profile = await affiliateProgram.affiliates(affiliate1.address);
      expect(profile.isVerified).to.be.true;
      
      // Should receive diamond badge for verification
      const badgeBalance = await loyaltyToken.balanceOf(affiliate1.address, 4);
      expect(badgeBalance).to.equal(1);
    });

    it("Should allow owner to deactivate affiliate", async function () {
      await affiliateProgram.deactivateAffiliate(affiliate1.address);
      
      const profile = await affiliateProgram.affiliates(affiliate1.address);
      expect(profile.isActive).to.be.false;
    });

    it("Should prevent tracking for inactive affiliate", async function () {
      await affiliateProgram.deactivateAffiliate(affiliate1.address);
      
      const profile = await affiliateProgram.affiliates(affiliate1.address);
      const referralCode = profile.referralCode;
      
      // This should not emit any events or update stats
      await affiliateProgram.trackReferral(referralCode, user1.address, 0, 0);
      
      // Stats should remain unchanged
      const updatedProfile = await affiliateProgram.affiliates(affiliate1.address);
      expect(updatedProfile.totalReferrals).to.equal(0);
    });
  });

  describe("Statistics and Leaderboards", function () {
    beforeEach(async function () {
      // Set up test data
      await affiliateProgram.connect(affiliate1).registerAffiliate("TopAffiliate", "Bio1");
      await affiliateProgram.connect(affiliate2).registerAffiliate("SecondAffiliate", "Bio2");
      
      const profile1 = await affiliateProgram.affiliates(affiliate1.address);
      const profile2 = await affiliateProgram.affiliates(affiliate2.address);
      
      // Give affiliate1 more referrals
      await affiliateProgram.trackReferral(profile1.referralCode, user1.address, 0, 0);
      await affiliateProgram.trackReferral(profile1.referralCode, user2.address, 1, 0);
      await affiliateProgram.trackReferral(profile2.referralCode, creator1.address, 0, 0);
    });

    it("Should return affiliate statistics", async function () {
      const [totalReferrals, totalEarnings, pendingEarnings, currentTier, tierName, 
             creatorReferrals, buyerReferrals, subscriptionReferrals, totalSalesGenerated] = 
        await affiliateProgram.getAffiliateStats(affiliate1.address);
      
      expect(totalReferrals).to.equal(2);
      expect(creatorReferrals).to.equal(1);
      expect(buyerReferrals).to.equal(1);
      expect(currentTier).to.equal(1); // Bronze tier
      expect(tierName).to.equal("Bronze Affiliate");
    });

    it("Should return affiliate referrals", async function () {
      const [referees, referralTypes, timestamps, purchaseAmounts] = 
        await affiliateProgram.getAffiliateReferrals(affiliate1.address, 10);
      
      expect(referees.length).to.equal(2);
      expect(referralTypes[0]).to.equal(1); // CREATOR_SIGNUP (most recent first)
      expect(referralTypes[1]).to.equal(0); // BUYER_SIGNUP
    });

    it("Should return top affiliates", async function () {
      const [affiliateAddresses, displayNames, totalReferrals, totalEarnings] = 
        await affiliateProgram.getTopAffiliates(10);
      
      expect(affiliateAddresses.length).to.equal(2);
      expect(displayNames[0]).to.equal("TopAffiliate"); // Should be first with 2 referrals
      expect(totalReferrals[0]).to.equal(2);
    });

    it("Should return platform statistics", async function () {
      const [totalAffiliatesCount, totalReferralsCount, totalCommissionsPaidAmount, activeAffiliatesCount] = 
        await affiliateProgram.getPlatformStats();
      
      expect(totalAffiliatesCount).to.equal(2);
      expect(totalReferralsCount).to.equal(3);
      expect(activeAffiliatesCount).to.equal(2);
    });

    it("Should get affiliate by referral code", async function () {
      const profile = await affiliateProgram.affiliates(affiliate1.address);
      
      const [affiliateAddress, displayName, isActive, isVerified] = 
        await affiliateProgram.getAffiliateByCode(profile.referralCode);
      
      expect(affiliateAddress).to.equal(affiliate1.address);
      expect(displayName).to.equal("TopAffiliate");
      expect(isActive).to.be.true;
      expect(isVerified).to.be.false;
    });

    it("Should get referral source for user", async function () {
      const profile = await affiliateProgram.affiliates(affiliate1.address);
      
      const referralSource = await affiliateProgram.getReferralSource(user1.address);
      expect(referralSource).to.equal(profile.referralCode);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update commission tier", async function () {
      await affiliateProgram.updateCommissionTier(
        1, // Bronze tier
        0, // minReferrals
        300, // 3% purchase commission
        400, // 4% subscription commission
        ethers.parseUnits("0.75", 6), // $0.75 creator bonus
        ethers.parseUnits("0.15", 6)  // $0.15 buyer bonus
      );
      
      const tier = await affiliateProgram.commissionTiers(1);
      expect(tier.purchaseCommission).to.equal(300);
      expect(tier.subscriptionCommission).to.equal(400);
    });

    it("Should allow owner to set program status", async function () {
      await affiliateProgram.setProgramStatus(false);
      
      await expect(
        affiliateProgram.connect(user1).registerAffiliate("TestUser", "Bio")
      ).to.be.revertedWith("Affiliate program is disabled");
    });

    it("Should allow owner to set minimum withdrawal", async function () {
      const newMinimum = ethers.parseUnits("5", 6); // $5
      await affiliateProgram.setMinimumWithdrawal(newMinimum);
      
      const minimum = await affiliateProgram.minimumWithdrawal();
      expect(minimum).to.equal(newMinimum);
    });

    it("Should allow owner to emergency withdraw", async function () {
      const initialBalance = await mockUSDC.balanceOf(owner.address);
      
      await affiliateProgram.emergencyWithdraw();
      
      const finalBalance = await mockUSDC.balanceOf(owner.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });

    it("Should prevent non-owner from admin functions", async function () {
      await expect(
        affiliateProgram.connect(user1).setProgramStatus(false)
      ).to.be.revertedWithCustomError(affiliateProgram, "OwnableUnauthorizedAccount");
      
      await expect(
        affiliateProgram.connect(user1).verifyAffiliate(affiliate1.address)
      ).to.be.revertedWithCustomError(affiliateProgram, "OwnableUnauthorizedAccount");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle empty referral tracking gracefully", async function () {
      await affiliateProgram.connect(affiliate1).registerAffiliate("TestAffiliate", "Bio");
      
      const [referees, referralTypes, timestamps, purchaseAmounts] = 
        await affiliateProgram.getAffiliateReferrals(affiliate1.address, 10);
      
      expect(referees.length).to.equal(0);
    });

    it("Should handle commission calculation for zero amount", async function () {
      await affiliateProgram.connect(affiliate1).registerAffiliate("TestAffiliate", "Bio");
      const profile = await affiliateProgram.affiliates(affiliate1.address);
      
      await affiliateProgram.trackReferral(profile.referralCode, user1.address, 2, 0); // Purchase with 0 amount
      
      const updatedProfile = await affiliateProgram.affiliates(affiliate1.address);
      expect(updatedProfile.pendingEarnings).to.equal(0);
    });

    it("Should handle maximum tier correctly", async function () {
      // Create affiliate and simulate reaching diamond tier
      await affiliateProgram.connect(affiliate1).registerAffiliate("DiamondAffiliate", "Bio");
      const profile = await affiliateProgram.affiliates(affiliate1.address);
      
      // Make 200+ referrals to reach diamond tier
      for (let i = 0; i < 200; i++) {
        // Use a simple counter-based address generation for testing
        const userAddress = ethers.getAddress('0x' + (i + 1000).toString(16).padStart(40, '0'));
        await affiliateProgram.trackReferral(profile.referralCode, userAddress, 0, 0);
      }
      
      const [, , , currentTier, tierName] = await affiliateProgram.getAffiliateStats(affiliate1.address);
      expect(currentTier).to.equal(4); // Diamond tier
      expect(tierName).to.equal("Diamond Affiliate");
    });
  });
});