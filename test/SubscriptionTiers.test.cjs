const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SubscriptionTiers Contract", function () {
  let mockUSDC, loyaltyToken, subscriptionTiers;
  let owner, creator, user1, user2;
  
  beforeEach(async function () {
    [owner, creator, user1, user2] = await ethers.getSigners();
    
    // Deploy MockUSDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();
    
    // Deploy LoyaltyToken
    const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
    loyaltyToken = await LoyaltyToken.deploy();
    
    // Deploy SubscriptionTiers
    const SubscriptionTiers = await ethers.getContractFactory("SubscriptionTiers");
    subscriptionTiers = await SubscriptionTiers.deploy(
      await mockUSDC.getAddress(),
      await loyaltyToken.getAddress()
    );
    
    // Set permissions
    await loyaltyToken.setAuthorizedMinter(await subscriptionTiers.getAddress(), true);
    
    // Mint USDC to users
    const mintAmount = ethers.parseUnits("100", 6);
    await mockUSDC.mint(user1.address, mintAmount);
    await mockUSDC.mint(user2.address, mintAmount);
  });

  describe("Initial Setup", function () {
    it("Should have correct initial tiers", async function () {
      const tierCount = await subscriptionTiers.tierCount();
      expect(tierCount).to.equal(3);
      
      // Check basic tier
      const basicTier = await subscriptionTiers.getSubscriptionTier(1);
      expect(basicTier.name).to.equal("Basic Supporter");
      expect(basicTier.monthlyPrice).to.equal(2000000); // $2.00
    });

    it("Should initialize with correct payment token", async function () {
      const paymentToken = await subscriptionTiers.paymentToken();
      expect(paymentToken).to.equal(await mockUSDC.getAddress());
    });
  });

  describe("Subscription Management", function () {
    it("Should allow user to subscribe to basic tier", async function () {
      const tierId = 1;
      const monthlyPrice = 2000000; // $2.00
      
      // Approve spending
      await mockUSDC.connect(user1).approve(await subscriptionTiers.getAddress(), monthlyPrice);
      
      // Subscribe
      await expect(subscriptionTiers.connect(user1).subscribeToTier(tierId, false))
        .to.emit(subscriptionTiers, "SubscriptionPurchased")
        .withArgs(user1.address, tierId, 30 * 24 * 60 * 60, monthlyPrice, false);
      
      // Check subscription status
      const isActive = await subscriptionTiers.isSubscriptionActive(user1.address, tierId);
      expect(isActive).to.be.true;
    });

    it("Should award loyalty badge on subscription", async function () {
      const tierId = 1;
      const monthlyPrice = 2000000;
      
      await mockUSDC.connect(user1).approve(await subscriptionTiers.getAddress(), monthlyPrice);
      await subscriptionTiers.connect(user1).subscribeToTier(tierId, false);
      
      // Check if user received silver badge (tier 1 = badge 2)
      const badgeBalance = await loyaltyToken.balanceOf(user1.address, 2);
      expect(badgeBalance).to.equal(1);
    });

    it("Should allow annual subscription with discount", async function () {
      const tierId = 1;
      const annualPrice = 20000000; // $20.00 (vs $24 for 12 months)
      
      await mockUSDC.connect(user1).approve(await subscriptionTiers.getAddress(), annualPrice);
      
      await expect(subscriptionTiers.connect(user1).subscribeToTier(tierId, true))
        .to.emit(subscriptionTiers, "SubscriptionPurchased")
        .withArgs(user1.address, tierId, 365 * 24 * 60 * 60, annualPrice, true);
    });

    it("Should extend existing subscription", async function () {
      const tierId = 1;
      const monthlyPrice = 2000000;
      
      // First subscription
      await mockUSDC.connect(user1).approve(await subscriptionTiers.getAddress(), monthlyPrice);
      await subscriptionTiers.connect(user1).subscribeToTier(tierId, false);
      
      // Get initial end time
      const initialInfo = await subscriptionTiers.getUserSubscriptionInfo(user1.address, tierId);
      
      // Extend subscription
      await mockUSDC.connect(user1).approve(await subscriptionTiers.getAddress(), monthlyPrice);
      await expect(subscriptionTiers.connect(user1).subscribeToTier(tierId, false))
        .to.emit(subscriptionTiers, "SubscriptionRenewed");
      
      // Check extended end time
      const extendedInfo = await subscriptionTiers.getUserSubscriptionInfo(user1.address, tierId);
      expect(extendedInfo.endTime).to.be.greaterThan(initialInfo.endTime);
    });

    it("Should allow subscription cancellation", async function () {
      const tierId = 1;
      const monthlyPrice = 2000000;
      
      await mockUSDC.connect(user1).approve(await subscriptionTiers.getAddress(), monthlyPrice);
      await subscriptionTiers.connect(user1).subscribeToTier(tierId, false);
      
      await expect(subscriptionTiers.connect(user1).cancelSubscription(tierId))
        .to.emit(subscriptionTiers, "SubscriptionCancelled")
        .withArgs(user1.address, tierId);
      
      const subscriptionInfo = await subscriptionTiers.getUserSubscriptionInfo(user1.address, tierId);
      expect(subscriptionInfo.isActive).to.be.false;
    });
  });

  describe("Tier Access", function () {
    it("Should grant access to subscribed tier", async function () {
      const tierId = 1;
      const monthlyPrice = 2000000;
      
      await mockUSDC.connect(user1).approve(await subscriptionTiers.getAddress(), monthlyPrice);
      await subscriptionTiers.connect(user1).subscribeToTier(tierId, false);
      
      const hasAccess = await subscriptionTiers.hasAccessToTier(user1.address, tierId);
      expect(hasAccess).to.be.true;
    });

    it("Should grant access to lower tiers when subscribed to higher tier", async function () {
      const tierId = 2; // Premium tier
      const monthlyPrice = 5000000; // $5.00
      
      await mockUSDC.mint(user1.address, ethers.parseUnits("10", 6)); // More USDC
      await mockUSDC.connect(user1).approve(await subscriptionTiers.getAddress(), monthlyPrice);
      await subscriptionTiers.connect(user1).subscribeToTier(tierId, false);
      
      // Should have access to both tier 1 and tier 2
      const hasAccessTier1 = await subscriptionTiers.hasAccessToTier(user1.address, 1);
      const hasAccessTier2 = await subscriptionTiers.hasAccessToTier(user1.address, 2);
      
      expect(hasAccessTier1).to.be.true;
      expect(hasAccessTier2).to.be.true;
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to create new tier", async function () {
      const perks = ["Exclusive content", "Monthly call"];
      
      await subscriptionTiers.createSubscriptionTier(
        "Custom Tier",
        "Custom tier description",
        3000000, // $3.00 monthly
        30000000, // $30.00 annually
        perks,
        3, // Gold badge
        "QmCustomTierHash"
      );
      
      const tierCount = await subscriptionTiers.tierCount();
      expect(tierCount).to.equal(4);
      
      const newTier = await subscriptionTiers.getSubscriptionTier(4);
      expect(newTier.name).to.equal("Custom Tier");
    });

    it("Should allow owner to update tier status", async function () {
      await subscriptionTiers.updateTierStatus(1, false);
      
      const tier = await subscriptionTiers.subscriptionTiers(1);
      expect(tier.isActive).to.be.false;
    });

    it("Should allow owner to update tier pricing", async function () {
      const newMonthlyPrice = 2500000; // $2.50
      const newAnnualPrice = 25000000; // $25.00
      
      await subscriptionTiers.updateTierPricing(1, newMonthlyPrice, newAnnualPrice);
      
      const tier = await subscriptionTiers.getSubscriptionTier(1);
      expect(tier.monthlyPrice).to.equal(newMonthlyPrice);
      expect(tier.annualPrice).to.equal(newAnnualPrice);
    });

    it("Should prevent non-owner from admin functions", async function () {
      await expect(
        subscriptionTiers.connect(user1).updateTierStatus(1, false)
      ).to.be.revertedWithCustomError(subscriptionTiers, "OwnableUnauthorizedAccount");
    });
  });

  describe("Statistics", function () {
    it("Should return correct user active tiers", async function () {
      const tierId1 = 1;
      const tierId2 = 2;
      
      // Subscribe to multiple tiers
      await mockUSDC.mint(user1.address, ethers.parseUnits("10", 6));
      await mockUSDC.connect(user1).approve(await subscriptionTiers.getAddress(), ethers.parseUnits("10", 6));
      
      await subscriptionTiers.connect(user1).subscribeToTier(tierId1, false);
      await subscriptionTiers.connect(user1).subscribeToTier(tierId2, false);
      
      const [activeTierIds, tierNames] = await subscriptionTiers.getUserActiveTiers(user1.address);
      expect(activeTierIds.length).to.equal(2);
      expect(tierNames[0]).to.equal("Basic Supporter");
    });

    it("Should return all subscription tiers", async function () {
      const [tierIds, names, monthlyPrices, annualPrices, activeStatus] = 
        await subscriptionTiers.getAllSubscriptionTiers();
      
      expect(tierIds.length).to.equal(3);
      expect(names[0]).to.equal("Basic Supporter");
      expect(monthlyPrices[0]).to.equal(2000000);
    });
  });

  describe("Error Cases", function () {
    it("Should fail to subscribe to inactive tier", async function () {
      await subscriptionTiers.updateTierStatus(1, false);
      
      await mockUSDC.connect(user1).approve(await subscriptionTiers.getAddress(), 2000000);
      
      await expect(
        subscriptionTiers.connect(user1).subscribeToTier(1, false)
      ).to.be.revertedWith("Tier is not active");
    });

    it("Should fail to subscribe without sufficient balance", async function () {
      // Don't mint enough USDC
      await expect(
        subscriptionTiers.connect(user2).subscribeToTier(1, false)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Should fail to cancel non-existent subscription", async function () {
      await expect(
        subscriptionTiers.connect(user1).cancelSubscription(1)
      ).to.be.revertedWith("No active subscription found");
    });
  });
});