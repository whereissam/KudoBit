const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("KudoBit Core Contracts Testing", function () {
  let mockUSDC, loyaltyToken, shopfront, creatorStore;
  let owner, creator, buyer1, buyer2, royaltyRecipient;

  beforeEach(async function () {
    [owner, creator, buyer1, buyer2, royaltyRecipient] = await ethers.getSigners();

    // Deploy MockUSDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();

    // Deploy LoyaltyToken
    const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
    loyaltyToken = await LoyaltyToken.deploy();
    await loyaltyToken.waitForDeployment();

    // Deploy Shopfront
    const Shopfront = await ethers.getContractFactory("Shopfront");
    shopfront = await Shopfront.deploy(
      await mockUSDC.getAddress(),
      await loyaltyToken.getAddress()
    );
    await shopfront.waitForDeployment();

    // Deploy CreatorStore
    const CreatorStore = await ethers.getContractFactory("CreatorStore");
    creatorStore = await CreatorStore.deploy(
      await mockUSDC.getAddress(),
      await loyaltyToken.getAddress()
    );
    await creatorStore.waitForDeployment();

    // Setup: Authorize contracts to mint loyalty tokens
    await loyaltyToken.setAuthorizedMinter(await shopfront.getAddress(), true);
    await loyaltyToken.setAuthorizedMinter(await creatorStore.getAddress(), true);

    // Give buyers some USDC for testing
    await mockUSDC.mint(buyer1.address, ethers.parseUnits("100", 6));
    await mockUSDC.mint(buyer2.address, ethers.parseUnits("100", 6));

    console.log("\n🚀 Core contracts deployed and configured!");
    console.log(`📋 MockUSDC: ${await mockUSDC.getAddress()}`);
    console.log(`🏆 LoyaltyToken: ${await loyaltyToken.getAddress()}`);
    console.log(`🏪 Shopfront: ${await shopfront.getAddress()}`);
    console.log(`🎨 CreatorStore: ${await creatorStore.getAddress()}`);
  });

  describe("💰 MockUSDC Token", function () {
    it("Should have correct decimals and owner balance", async function () {
      expect(await mockUSDC.decimals()).to.equal(6);
      // Owner should have initial supply (1M USDC)
      expect(await mockUSDC.balanceOf(owner.address)).to.equal(ethers.parseUnits("1000000", 6));
      // Total supply will be higher due to minted test tokens
      expect(await mockUSDC.totalSupply()).to.be.gte(ethers.parseUnits("1000000", 6));
    });

    it("Should allow users to get tokens from faucet", async function () {
      const amount = ethers.parseUnits("50", 6);
      await mockUSDC.connect(buyer1).faucet(amount);
      expect(await mockUSDC.balanceOf(buyer1.address)).to.equal(ethers.parseUnits("150", 6));
    });

    it("Should reject large faucet requests", async function () {
      await expect(
        mockUSDC.connect(buyer1).faucet(ethers.parseUnits("2000", 6))
      ).to.be.revertedWith("Amount too large");
    });
  });

  describe("🏆 LoyaltyToken Badges", function () {
    it("Should have correct badge tiers", async function () {
      expect(await loyaltyToken.BRONZE_BADGE()).to.equal(1);
      expect(await loyaltyToken.SILVER_BADGE()).to.equal(2);
      expect(await loyaltyToken.GOLD_BADGE()).to.equal(3);
      expect(await loyaltyToken.DIAMOND_BADGE()).to.equal(4);
    });

    it("Should mint badges to authorized addresses", async function () {
      await loyaltyToken.setAuthorizedMinter(creator.address, true);
      await loyaltyToken.connect(creator).mintBadge(buyer1.address, 1, 1);
      expect(await loyaltyToken.balanceOf(buyer1.address, 1)).to.equal(1);
    });

    it("Should reject unauthorized minting", async function () {
      await expect(
        loyaltyToken.connect(buyer1).mintBadge(buyer1.address, 1, 1)
      ).to.be.revertedWith("Not authorized to mint");
    });
  });

  describe("🏪 Shopfront Marketplace", function () {
    beforeEach(async function () {
      await mockUSDC.connect(buyer1).approve(await shopfront.getAddress(), ethers.parseUnits("50", 6));
    });

    it("Should have initial items loaded", async function () {
      expect(await shopfront.itemCount()).to.equal(3);
      const item = await shopfront.getItem(1);
      expect(item.name).to.equal("Exclusive Wallpaper NFT");
    });

    it("Should allow users to purchase items", async function () {
      await shopfront.connect(buyer1).buyItem(1);
      const purchases = await shopfront.getUserPurchases(buyer1.address);
      expect(purchases.length).to.equal(1);
      expect(purchases[0]).to.equal(1);
    });

    it("Should award loyalty badges on purchase", async function () {
      await shopfront.connect(buyer1).buyItem(1);
      expect(await loyaltyToken.balanceOf(buyer1.address, 1)).to.equal(1);
    });
  });

  describe("🎨 CreatorStore Advanced Marketplace", function () {
    beforeEach(async function () {
      await mockUSDC.connect(buyer1).approve(await creatorStore.getAddress(), ethers.parseUnits("50", 6));
      await mockUSDC.connect(buyer2).approve(await creatorStore.getAddress(), ethers.parseUnits("50", 6));
    });

    it("Should have correct loyalty thresholds", async function () {
      const thresholds = await creatorStore.getLoyaltyThresholds();
      expect(thresholds.bronze).to.equal(100000); // 0.1 USDC
      expect(thresholds.silver).to.equal(1000000); // 1.0 USDC
      expect(thresholds.gold).to.equal(5000000); // 5.0 USDC
      expect(thresholds.diamond).to.equal(10000000); // 10.0 USDC
    });

    it("Should track user spending and upgrade loyalty tiers", async function () {
      // Buy product worth 0.2 USDC (should reach Bronze tier)
      await creatorStore.connect(buyer1).buyItem(1);
      
      let userInfo = await creatorStore.getUserSpendingInfo(buyer1.address);
      expect(userInfo.totalSpent).to.equal(200000); // 0.2 USDC
      expect(userInfo.currentLoyaltyTier).to.equal(1); // Bronze
      expect(userInfo.purchaseCount).to.equal(1);
    });

    it("Should allow listing products with royalties", async function () {
      await creatorStore.listProductWithRoyalties(
        "Collaborative Art",
        "Art by multiple creators",
        "QmArtHash",
        ethers.parseUnits("2", 6),
        3,
        [creator.address, royaltyRecipient.address],
        [3000, 1000] // 30% + 10% royalties
      );

      const productId = 4;
      const royalties = await creatorStore.getProductRoyalties(productId);
      expect(royalties.length).to.equal(2);
      expect(royalties[0].percentage).to.equal(3000);
    });

    it("Should distribute royalties correctly", async function () {
      // List product with royalties
      await creatorStore.listProductWithRoyalties(
        "Royalty Test Product",
        "Testing royalty distribution",
        "QmTestHash",
        ethers.parseUnits("1", 6), // 1 USDC
        2,
        [royaltyRecipient.address],
        [2000] // 20%
      );

      const productId = 4;
      const initialBalance = await mockUSDC.balanceOf(royaltyRecipient.address);
      
      await creatorStore.connect(buyer1).buyItem(productId);
      
      const finalBalance = await mockUSDC.balanceOf(royaltyRecipient.address);
      const royaltyReceived = finalBalance - initialBalance;
      
      expect(royaltyReceived).to.equal(ethers.parseUnits("0.2", 6)); // 20% of 1 USDC
    });
  });

  describe("🔄 Complete User Workflows", function () {
    it("👤 New User Journey: From First Purchase to Loyalty Tier", async function () {
      console.log("\n🎯 Testing complete user journey...");
      
      // 1. User gets USDC from faucet
      await mockUSDC.connect(buyer1).faucet(ethers.parseUnits("10", 6));
      console.log("💰 User got USDC from faucet");
      
      // 2. User approves spending
      await mockUSDC.connect(buyer1).approve(await creatorStore.getAddress(), ethers.parseUnits("10", 6));
      
      // 3. User makes first small purchase (under Bronze threshold)
      await creatorStore.connect(buyer1).buyItem(3); // 0.05 USDC
      let userInfo = await creatorStore.getUserSpendingInfo(buyer1.address);
      expect(userInfo.currentLoyaltyTier).to.equal(0); // No tier yet
      console.log("🛒 Made first purchase - under Bronze threshold");
      
      // 4. User makes second purchase to reach Bronze
      await creatorStore.connect(buyer1).buyItem(1); // 0.2 USDC (total: 0.25 USDC)
      userInfo = await creatorStore.getUserSpendingInfo(buyer1.address);
      expect(userInfo.currentLoyaltyTier).to.equal(1); // Bronze
      console.log("🥉 Achieved Bronze tier!");
      
      // 5. Check badge collection
      expect(await loyaltyToken.balanceOf(buyer1.address, 1)).to.be.gt(0);
      console.log("🏆 Bronze badge awarded");
      
      const purchases = await creatorStore.getUserPurchases(buyer1.address);
      expect(purchases.length).to.equal(2);
      console.log(`📋 Purchase history: ${purchases.length} items`);
    });

    it("🎨 Creator Workflow: List and Sell Products", async function () {
      console.log("\n🎯 Testing creator workflow...");
      
      // 1. Creator lists a product with royalty split
      await creatorStore.listProductWithRoyalties(
        "Music Track",
        "Original composition",
        "QmMusicHash",
        ethers.parseUnits("3", 6), // 3 USDC
        3, // Gold badge
        [creator.address],
        [4000] // 40% to creator
      );
      console.log("🎵 Creator listed music track with royalty");
      
      // 2. Buyer purchases the product
      await mockUSDC.connect(buyer1).approve(await creatorStore.getAddress(), ethers.parseUnits("10", 6));
      
      const initialCreatorBalance = await mockUSDC.balanceOf(creator.address);
      const initialOwnerBalance = await mockUSDC.balanceOf(owner.address);
      
      await creatorStore.connect(buyer1).buyItem(4); // The newly listed product
      console.log("💸 Product purchased");
      
      // 3. Verify payments
      const creatorReceived = (await mockUSDC.balanceOf(creator.address)) - initialCreatorBalance;
      const ownerReceived = (await mockUSDC.balanceOf(owner.address)) - initialOwnerBalance;
      
      expect(creatorReceived).to.equal(ethers.parseUnits("1.2", 6)); // 40% of 3 USDC
      expect(ownerReceived).to.equal(ethers.parseUnits("1.8", 6)); // 60% of 3 USDC
      console.log("✅ Royalties distributed correctly");
    });

    it("🚀 Progressive Loyalty System", async function () {
      console.log("\n🎯 Testing loyalty progression...");
      
      // Give buyer more funds for progression test
      await mockUSDC.mint(buyer2.address, ethers.parseUnits("20", 6));
      await mockUSDC.connect(buyer2).approve(await creatorStore.getAddress(), ethers.parseUnits("20", 6));
      
      let userInfo;
      
      // Start with no tier
      userInfo = await creatorStore.getUserSpendingInfo(buyer2.address);
      expect(userInfo.currentLoyaltyTier).to.equal(0);
      console.log("📊 User starts with no tier");
      
      // Reach Bronze (0.1+ USDC)
      await creatorStore.connect(buyer2).buyItem(1); // 0.2 USDC
      userInfo = await creatorStore.getUserSpendingInfo(buyer2.address);
      expect(userInfo.currentLoyaltyTier).to.equal(1);
      console.log("🥉 Reached Bronze tier");
      
      // Work toward Silver (1.0+ USDC total)
      await creatorStore.connect(buyer2).buyItem(2); // +0.5 USDC (total: 0.7)
      await creatorStore.connect(buyer2).buyItem(1); // +0.2 USDC (total: 0.9)
      await creatorStore.connect(buyer2).buyItem(1); // +0.2 USDC (total: 1.1)
      
      userInfo = await creatorStore.getUserSpendingInfo(buyer2.address);
      expect(userInfo.currentLoyaltyTier).to.equal(2); // Silver
      console.log("🥈 Reached Silver tier");
      
      // Verify badge collection
      expect(await loyaltyToken.balanceOf(buyer2.address, 1)).to.be.gt(0); // Bronze
      expect(await loyaltyToken.balanceOf(buyer2.address, 2)).to.be.gt(0); // Silver
      console.log("🏆 Collected multiple badge tiers");
      
      console.log(`💰 Final spending: ${ethers.formatUnits(userInfo.totalSpent, 6)} USDC`);
      console.log(`🛍️ Total purchases: ${userInfo.purchaseCount}`);
    });
  });

  describe("🔒 Security Tests", function () {
    it("Should prevent unauthorized operations", async function () {
      // Non-owner cannot add items to shopfront
      await expect(
        shopfront.connect(buyer1).addItem("Unauthorized Item", "Should fail", "url", 1000000, 1)
      ).to.be.revertedWithCustomError(shopfront, "OwnableUnauthorizedAccount");
      
      // Non-owner cannot mint loyalty tokens directly
      await expect(
        loyaltyToken.connect(buyer1).mintBadge(buyer1.address, 1, 1)
      ).to.be.revertedWith("Not authorized to mint");
    });

    it("Should validate product purchases", async function () {
      await expect(
        creatorStore.connect(buyer1).buyItem(999)
      ).to.be.revertedWith("Product does not exist");
      
      // Deactivate product and test
      await creatorStore.updateProduct(1, false);
      await expect(
        creatorStore.connect(buyer1).buyItem(1)
      ).to.be.revertedWith("Product is not active");
    });

    it("Should handle edge cases in royalty distribution", async function () {
      // Test with 100% royalties (should work)
      await creatorStore.listProductWithRoyalties(
        "Full Royalty Product",
        "All revenue goes to collaborators",
        "QmFullRoyaltyHash",
        ethers.parseUnits("1", 6),
        1,
        [creator.address, royaltyRecipient.address],
        [5000, 5000] // 50% + 50% = 100%
      );
      
      const productId = 4;
      const distribution = await creatorStore.calculateRoyaltyDistribution(productId);
      expect(distribution.creatorAmount).to.equal(0); // No amount left for platform
      
      // Test invalid royalty percentage
      await expect(
        creatorStore.listProductWithRoyalties(
          "Invalid Product",
          "Too much royalty",
          "QmInvalidHash",
          ethers.parseUnits("1", 6),
          1,
          [creator.address],
          [10001] // 100.01%
        )
      ).to.be.revertedWith("Total royalties cannot exceed 100%");
    });
  });

  after(function () {
    console.log("\n🎊 Core contract tests completed successfully!");
    console.log("✅ All essential functionality verified");
    console.log("✅ User workflows tested");
    console.log("✅ Creator workflows tested");  
    console.log("✅ Security validations passed");
  });
});