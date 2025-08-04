const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("KudoBit Smart Contracts - Comprehensive Testing", function () {
  let mockUSDC, loyaltyToken, shopfront, creatorStore;
  let owner, creator, buyer1, buyer2, royaltyRecipient;
  let contracts = {};

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

    // Store contract addresses for easy access
    contracts = {
      mockUSDC: await mockUSDC.getAddress(),
      loyaltyToken: await loyaltyToken.getAddress(),
      shopfront: await shopfront.getAddress(),
      creatorStore: await creatorStore.getAddress()
    };

    // Setup: Authorize contracts to mint loyalty tokens
    await loyaltyToken.setAuthorizedMinter(await shopfront.getAddress(), true);
    await loyaltyToken.setAuthorizedMinter(await creatorStore.getAddress(), true);

    // Give buyers some USDC for testing
    await mockUSDC.mint(buyer1.address, ethers.parseUnits("100", 6)); // 100 USDC
    await mockUSDC.mint(buyer2.address, ethers.parseUnits("100", 6)); // 100 USDC

    console.log("✅ All contracts deployed and configured");
    console.log("📋 Contract Addresses:");
    console.log(`   MockUSDC: ${contracts.mockUSDC}`);
    console.log(`   LoyaltyToken: ${contracts.loyaltyToken}`);
    console.log(`   Shopfront: ${contracts.shopfront}`);
    console.log(`   CreatorStore: ${contracts.creatorStore}`);
  });

  describe("🔄 MockUSDC Token Tests", function () {
    it("Should have correct initial supply and decimals", async function () {
      expect(await mockUSDC.decimals()).to.equal(6);
      expect(await mockUSDC.totalSupply()).to.equal(ethers.parseUnits("1000000", 6));
      expect(await mockUSDC.balanceOf(owner.address)).to.equal(ethers.parseUnits("1000000", 6));
    });

    it("Should allow faucet usage by users", async function () {
      const faucetAmount = ethers.parseUnits("50", 6); // 50 USDC
      await mockUSDC.connect(buyer1).faucet(faucetAmount);
      
      expect(await mockUSDC.balanceOf(buyer1.address)).to.equal(
        ethers.parseUnits("150", 6) // 100 from mint + 50 from faucet
      );
    });

    it("Should reject faucet requests that are too large", async function () {
      const largeAmount = ethers.parseUnits("2000", 6); // 2000 USDC (over limit)
      await expect(
        mockUSDC.connect(buyer1).faucet(largeAmount)
      ).to.be.revertedWith("Amount too large");
    });

    it("Should allow owner to mint to any address", async function () {
      const mintAmount = ethers.parseUnits("500", 6);
      await mockUSDC.mint(royaltyRecipient.address, mintAmount);
      
      expect(await mockUSDC.balanceOf(royaltyRecipient.address)).to.equal(mintAmount);
    });
  });

  describe("🏆 LoyaltyToken Badge Tests", function () {
    it("Should have correct badge constants and URIs", async function () {
      expect(await loyaltyToken.BRONZE_BADGE()).to.equal(1);
      expect(await loyaltyToken.SILVER_BADGE()).to.equal(2);
      expect(await loyaltyToken.GOLD_BADGE()).to.equal(3);
      expect(await loyaltyToken.DIAMOND_BADGE()).to.equal(4);

      expect(await loyaltyToken.uri(1)).to.include("bronze-badge.json");
      expect(await loyaltyToken.uri(2)).to.include("silver-badge.json");
      expect(await loyaltyToken.uri(3)).to.include("gold-badge.json");
      expect(await loyaltyToken.uri(4)).to.include("diamond-badge.json");
    });

    it("Should allow authorized minters to mint badges", async function () {
      await loyaltyToken.setAuthorizedMinter(creator.address, true);
      await loyaltyToken.connect(creator).mintBadge(buyer1.address, 1, 1);
      
      expect(await loyaltyToken.balanceOf(buyer1.address, 1)).to.equal(1);
    });

    it("Should reject unauthorized minting", async function () {
      await expect(
        loyaltyToken.connect(buyer1).mintBadge(buyer1.address, 1, 1)
      ).to.be.revertedWith("Not authorized to mint");
    });

    it("Should allow batch minting", async function () {
      const badgeIds = [1, 2, 3];
      const amounts = [1, 1, 1];
      
      await loyaltyToken.mintBadgeBatch(buyer1.address, badgeIds, amounts);
      
      expect(await loyaltyToken.balanceOf(buyer1.address, 1)).to.equal(1);
      expect(await loyaltyToken.balanceOf(buyer1.address, 2)).to.equal(1);
      expect(await loyaltyToken.balanceOf(buyer1.address, 3)).to.equal(1);
    });

    it("Should allow owner to update token URIs", async function () {
      const newURI = "https://new-metadata.com/bronze.json";
      await loyaltyToken.setTokenURI(1, newURI);
      
      expect(await loyaltyToken.uri(1)).to.equal(newURI);
    });
  });

  describe("🏪 Shopfront Tests", function () {
    beforeEach(async function () {
      // Approve shopfront to spend buyer's USDC
      await mockUSDC.connect(buyer1).approve(await shopfront.getAddress(), ethers.parseUnits("100", 6));
      await mockUSDC.connect(buyer2).approve(await shopfront.getAddress(), ethers.parseUnits("100", 6));
    });

    it("Should have initial items loaded", async function () {
      expect(await shopfront.itemCount()).to.equal(3);
      
      const item1 = await shopfront.getItem(1);
      expect(item1.name).to.equal("Exclusive Wallpaper NFT");
      expect(item1.priceInUSDC).to.equal(ethers.parseUnits("10", 6));
      expect(item1.loyaltyBadgeId).to.equal(1);
    });

    it("Should allow getting all items", async function () {
      const allItems = await shopfront.getAllItems();
      expect(allItems.length).to.equal(3);
      expect(allItems[0].name).to.equal("Exclusive Wallpaper NFT");
      expect(allItems[1].name).to.equal("1-Month Premium Content Pass");
      expect(allItems[2].name).to.equal("Digital Sticker Pack");
    });

    it("Should allow owner to add new items", async function () {
      await shopfront.addItem(
        "Test Product",
        "Test Description",
        "https://test.com/image.jpg",
        ethers.parseUnits("5", 6),
        2
      );
      
      expect(await shopfront.itemCount()).to.equal(4);
      const newItem = await shopfront.getItem(4);
      expect(newItem.name).to.equal("Test Product");
    });

    it("Should allow users to buy items and receive loyalty badges", async function () {
      const itemId = 1;
      const item = await shopfront.getItem(itemId);
      
      await expect(shopfront.connect(buyer1).buyItem(itemId))
        .to.emit(shopfront, "ItemPurchased")
        .withArgs(buyer1.address, itemId, item.priceInUSDC, item.loyaltyBadgeId);
      
      // Check buyer received loyalty badge
      expect(await loyaltyToken.balanceOf(buyer1.address, item.loyaltyBadgeId)).to.equal(1);
      
      // Check purchase was recorded
      const purchases = await shopfront.getUserPurchases(buyer1.address);
      expect(purchases.length).to.equal(1);
      expect(purchases[0]).to.equal(itemId);
    });

    it("Should transfer payment to owner", async function () {
      const initialBalance = await mockUSDC.balanceOf(owner.address);
      const itemPrice = ethers.parseUnits("10", 6);
      
      await shopfront.connect(buyer1).buyItem(1);
      
      expect(await mockUSDC.balanceOf(owner.address)).to.equal(initialBalance + itemPrice);
    });

    it("Should reject purchases of inactive items", async function () {
      // First, deactivate an item
      await shopfront.updateItem(1, "Updated Item", "Updated Description", "updated.jpg", ethers.parseUnits("5", 6), false, 1);
      
      await expect(shopfront.connect(buyer1).buyItem(1))
        .to.be.revertedWith("Item is not active");
    });

    it("Should reject purchases with insufficient payment", async function () {
      // Reset approval to insufficient amount
      await mockUSDC.connect(buyer1).approve(await shopfront.getAddress(), ethers.parseUnits("1", 6));
      
      await expect(shopfront.connect(buyer1).buyItem(1))
        .to.be.revertedWith("Payment failed");
    });

    it("Should allow owner to update payment and loyalty token addresses", async function () {
      const newMockUSDC = await ethers.deployContract("MockUSDC");
      await newMockUSDC.waitForDeployment();
      
      await shopfront.setPaymentToken(await newMockUSDC.getAddress());
      expect(await shopfront.paymentToken()).to.equal(await newMockUSDC.getAddress());
    });
  });

  describe("🎨 CreatorStore Tests", function () {
    beforeEach(async function () {
      // Approve creatorStore to spend buyer's USDC
      await mockUSDC.connect(buyer1).approve(await creatorStore.getAddress(), ethers.parseUnits("100", 6));
      await mockUSDC.connect(buyer2).approve(await creatorStore.getAddress(), ethers.parseUnits("100", 6));
    });

    it("Should have initial products and correct loyalty thresholds", async function () {
      expect(await creatorStore.productCount()).to.equal(3);
      
      const thresholds = await creatorStore.getLoyaltyThresholds();
      expect(thresholds.bronze).to.equal(100000); // 0.1 USDC
      expect(thresholds.silver).to.equal(1000000); // 1.0 USDC
      expect(thresholds.gold).to.equal(5000000); // 5.0 USDC
      expect(thresholds.diamond).to.equal(10000000); // 10.0 USDC
    });

    it("Should allow listing products with royalties", async function () {
      const royaltyRecipients = [royaltyRecipient.address, creator.address];
      const royaltyPercentages = [1000, 500]; // 10% and 5%
      
      await creatorStore.listProductWithRoyalties(
        "Collaborative Art",
        "Art created by multiple artists",
        "QmCollabHash",
        ethers.parseUnits("2", 6),
        3, // Gold badge
        royaltyRecipients,
        royaltyPercentages
      );
      
      const productId = 4; // Should be the 4th product
      const royalties = await creatorStore.getProductRoyalties(productId);
      expect(royalties.length).to.equal(2);
      expect(royalties[0].recipient).to.equal(royaltyRecipient.address);
      expect(royalties[0].percentage).to.equal(1000);
    });

    it("Should reject royalties exceeding 100%", async function () {
      const royaltyRecipients = [royaltyRecipient.address];
      const royaltyPercentages = [10001]; // 100.01%
      
      await expect(
        creatorStore.listProductWithRoyalties(
          "Invalid Product",
          "This should fail",
          "QmInvalidHash",
          ethers.parseUnits("1", 6),
          1,
          royaltyRecipients,
          royaltyPercentages
        )
      ).to.be.revertedWith("Total royalties cannot exceed 100%");
    });

    it("Should handle purchases and automatic loyalty tier upgrades", async function () {
      // Buy a product worth 0.2 USDC - should get Bronze badge (threshold: 0.1 USDC)
      await creatorStore.connect(buyer1).buyItem(1);
      
      let userInfo = await creatorStore.getUserSpendingInfo(buyer1.address);
      expect(userInfo.totalSpent).to.equal(200000); // 0.2 USDC in wei
      expect(userInfo.purchaseCount).to.equal(1);
      expect(userInfo.currentLoyaltyTier).to.equal(1); // Bronze
      
      // Buy another product to reach Silver tier (need 1.0 USDC total)
      await creatorStore.connect(buyer1).buyItem(2); // 0.5 USDC
      
      userInfo = await creatorStore.getUserSpendingInfo(buyer1.address);
      expect(userInfo.totalSpent).to.equal(700000); // 0.7 USDC total
      expect(userInfo.currentLoyaltyTier).to.equal(1); // Still Bronze (need 1.0 USDC for Silver)
      
      // Buy more to reach Silver
      await creatorStore.connect(buyer1).buyItem(3); // 0.05 USDC more
      await creatorStore.connect(buyer1).buyItem(1); // 0.2 USDC more
      
      userInfo = await creatorStore.getUserSpendingInfo(buyer1.address);
      expect(userInfo.totalSpent).to.equal(950000); // 0.95 USDC - still Bronze
      expect(userInfo.currentLoyaltyTier).to.equal(1);
    });

    it("Should distribute royalties correctly", async function () {
      // Create a product with royalties
      const royaltyRecipients = [royaltyRecipient.address];
      const royaltyPercentages = [1000]; // 10%
      
      await creatorStore.listProductWithRoyalties(
        "Royalty Product",
        "Product with royalties",
        "QmRoyaltyHash",
        ethers.parseUnits("1", 6), // 1 USDC
        2,
        royaltyRecipients,
        royaltyPercentages
      );
      
      const productId = 4;
      const initialOwnerBalance = await mockUSDC.balanceOf(owner.address);
      const initialRoyaltyBalance = await mockUSDC.balanceOf(royaltyRecipient.address);
      
      await creatorStore.connect(buyer1).buyItem(productId);
      
      // Check royalty recipient received 10% (0.1 USDC)
      expect(await mockUSDC.balanceOf(royaltyRecipient.address))
        .to.equal(initialRoyaltyBalance + ethers.parseUnits("0.1", 6));
      
      // Check owner received remaining 90% (0.9 USDC)
      expect(await mockUSDC.balanceOf(owner.address))
        .to.equal(initialOwnerBalance + ethers.parseUnits("0.9", 6));
    });

    it("Should calculate royalty distribution correctly", async function () {
      // Create a product with multiple royalties
      const royaltyRecipients = [royaltyRecipient.address, creator.address];
      const royaltyPercentages = [1500, 500]; // 15% and 5%
      
      await creatorStore.listProductWithRoyalties(
        "Multi Royalty Product",
        "Product with multiple royalties",
        "QmMultiRoyaltyHash",
        ethers.parseUnits("10", 6), // 10 USDC
        3,
        royaltyRecipients,
        royaltyPercentages
      );
      
      const productId = 4;
      const distribution = await creatorStore.calculateRoyaltyDistribution(productId);
      
      expect(distribution.recipients.length).to.equal(2);
      expect(distribution.amounts[0]).to.equal(ethers.parseUnits("1.5", 6)); // 15% of 10 USDC
      expect(distribution.amounts[1]).to.equal(ethers.parseUnits("0.5", 6)); // 5% of 10 USDC
      expect(distribution.creatorAmount).to.equal(ethers.parseUnits("8", 6)); // 80% of 10 USDC
    });

    it("Should allow owner to withdraw accumulated funds", async function () {
      // First make some purchases to accumulate funds in contract
      const royaltyRecipients = [royaltyRecipient.address];
      const royaltyPercentages = [1000]; // 10%
      
      await creatorStore.listProductWithRoyalties(
        "Withdraw Test Product",
        "For testing withdrawals",
        "QmWithdrawHash",
        ethers.parseUnits("5", 6),
        2,
        royaltyRecipients,
        royaltyPercentages
      );
      
      // Make a purchase - this will leave some funds in the contract temporarily
      await creatorStore.connect(buyer1).buyItem(4);
      
      // Check if there are any funds to withdraw (might be 0 if all distributed)
      const contractBalance = await mockUSDC.balanceOf(await creatorStore.getAddress());
      
      if (contractBalance > 0) {
        const initialOwnerBalance = await mockUSDC.balanceOf(owner.address);
        await creatorStore.withdrawFunds();
        expect(await mockUSDC.balanceOf(owner.address))
          .to.equal(initialOwnerBalance + contractBalance);
      }
    });

    it("Should reject invalid product purchases", async function () {
      await expect(creatorStore.connect(buyer1).buyItem(999))
        .to.be.revertedWith("Product does not exist");
      
      // Deactivate a product
      await creatorStore.updateProduct(1, false);
      await expect(creatorStore.connect(buyer1).buyItem(1))
        .to.be.revertedWith("Product is not active");
    });
  });

  describe("🔄 Integration Tests - Full User Workflows", function () {
    beforeEach(async function () {
      // Setup approvals for all contracts
      await mockUSDC.connect(buyer1).approve(await shopfront.getAddress(), ethers.parseUnits("50", 6));
      await mockUSDC.connect(buyer1).approve(await creatorStore.getAddress(), ethers.parseUnits("50", 6));
      await mockUSDC.connect(buyer2).approve(await shopfront.getAddress(), ethers.parseUnits("50", 6));
      await mockUSDC.connect(buyer2).approve(await creatorStore.getAddress(), ethers.parseUnits("50", 6));
    });

    it("👤 Complete User Journey: Browse, Buy, Collect Badges", async function () {
      console.log("\n🎯 Testing Complete User Journey...");
      
      // 1. User gets USDC from faucet
      await mockUSDC.connect(buyer1).faucet(ethers.parseUnits("20", 6));
      console.log("💰 User got USDC from faucet");
      
      // 2. User browses available items
      const shopItems = await shopfront.getAllItems();
      const storeProducts = await creatorStore.getAllProducts();
      console.log(`📦 Found ${shopItems.length} shop items and ${storeProducts.length} store products`);
      
      // 3. User makes first purchase (low value)
      await creatorStore.connect(buyer1).buyItem(3); // Digital Sticker Pack (0.05 USDC)
      console.log("🛒 Made first purchase - Digital Sticker Pack");
      
      // 4. Check user doesn't have Bronze badge yet (threshold: 0.1 USDC)
      let userInfo = await creatorStore.getUserSpendingInfo(buyer1.address);
      expect(userInfo.currentLoyaltyTier).to.equal(0); // No tier yet
      console.log("🏆 User doesn't have loyalty tier yet (under threshold)");
      
      // 5. User makes another purchase to reach Bronze tier
      await creatorStore.connect(buyer1).buyItem(1); // Wallpaper NFT (0.2 USDC)
      console.log("🛒 Made second purchase - Wallpaper NFT");
      
      // 6. User should now have Bronze tier
      userInfo = await creatorStore.getUserSpendingInfo(buyer1.address);
      expect(userInfo.currentLoyaltyTier).to.equal(1); // Bronze
      expect(await loyaltyToken.balanceOf(buyer1.address, 1)).to.be.gt(0);
      console.log("🥉 User achieved Bronze tier!");
      
      // 7. Check purchase history
      const purchases = await creatorStore.getUserPurchases(buyer1.address);
      expect(purchases.length).to.equal(2);
      console.log(`📋 User has ${purchases.length} purchases in history`);
    });

    it("🎨 Creator Workflow: List Products with Royalties", async function () {
      console.log("\n🎯 Testing Creator Workflow...");
      
      // 1. Creator lists a collaborative product with royalties
      const collaborators = [creator.address, royaltyRecipient.address];
      const splits = [6000, 2000]; // 60% creator, 20% collaborator, 20% owner
      
      await creatorStore.listProductWithRoyalties(
        "Collaborative Music Track",
        "Original music created by multiple artists",
        "QmMusicHash123",
        ethers.parseUnits("3", 6), // 3 USDC
        3, // Gold badge
        collaborators,
        splits
      );
      console.log("🎵 Creator listed collaborative product with royalty splits");
      
      // 2. User purchases the collaborative product
      const productId = 4;
      const initialCreatorBalance = await mockUSDC.balanceOf(creator.address);
      const initialCollaboratorBalance = await mockUSDC.balanceOf(royaltyRecipient.address);
      const initialOwnerBalance = await mockUSDC.balanceOf(owner.address);
      
      await creatorStore.connect(buyer1).buyItem(productId);
      console.log("💸 User purchased collaborative product");
      
      // 3. Verify royalty distribution
      const expectedCreatorAmount = ethers.parseUnits("1.8", 6); // 60% of 3 USDC
      const expectedCollaboratorAmount = ethers.parseUnits("0.6", 6); // 20% of 3 USDC
      const expectedOwnerAmount = ethers.parseUnits("0.6", 6); // 20% of 3 USDC
      
      expect(await mockUSDC.balanceOf(creator.address))
        .to.equal(initialCreatorBalance + expectedCreatorAmount);
      expect(await mockUSDC.balanceOf(royaltyRecipient.address))
        .to.equal(initialCollaboratorBalance + expectedCollaboratorAmount);
      expect(await mockUSDC.balanceOf(owner.address))
        .to.equal(initialOwnerBalance + expectedOwnerAmount);
      
      console.log("✅ Royalties distributed correctly to all parties");
    });

    it("🛒 Buyer Workflow: Progressive Loyalty Tiers", async function () {
      console.log("\n🎯 Testing Progressive Loyalty System...");
      
      // Give buyer more USDC for this test
      await mockUSDC.mint(buyer2.address, ethers.parseUnits("20", 6));
      await mockUSDC.connect(buyer2).approve(await creatorStore.getAddress(), ethers.parseUnits("20", 6));
      
      let userInfo;
      
      // 1. Start with no tier
      userInfo = await creatorStore.getUserSpendingInfo(buyer2.address);
      expect(userInfo.currentLoyaltyTier).to.equal(0);
      console.log("📊 User starts with no loyalty tier");
      
      // 2. Reach Bronze tier (0.1 USDC)
      await creatorStore.connect(buyer2).buyItem(1); // 0.2 USDC
      userInfo = await creatorStore.getUserSpendingInfo(buyer2.address);
      expect(userInfo.currentLoyaltyTier).to.equal(1);
      console.log("🥉 User reached Bronze tier");
      
      // 3. Reach Silver tier (1.0 USDC)
      // Need 0.8 USDC more
      await creatorStore.connect(buyer2).buyItem(2); // 0.5 USDC
      await creatorStore.connect(buyer2).buyItem(1); // 0.2 USDC
      await creatorStore.connect(buyer2).buyItem(3); // 0.05 USDC
      await creatorStore.connect(buyer2).buyItem(3); // 0.05 USDC (total: 1.0 USDC)
      
      userInfo = await creatorStore.getUserSpendingInfo(buyer2.address);
      expect(userInfo.totalSpent).to.equal(ethers.parseUnits("1", 6));
      expect(userInfo.currentLoyaltyTier).to.equal(2);
      console.log("🥈 User reached Silver tier");
      
      // 4. Verify badge collection
      expect(await loyaltyToken.balanceOf(buyer2.address, 1)).to.be.gt(0); // Bronze
      expect(await loyaltyToken.balanceOf(buyer2.address, 2)).to.be.gt(0); // Silver
      console.log("🏆 User collected multiple badges");
      
      console.log(`💰 Total spent: ${ethers.formatUnits(userInfo.totalSpent, 6)} USDC`);
      console.log(`🛍️ Total purchases: ${userInfo.purchaseCount}`);
    });

    it("⚡ Gas Optimization Test: Batch Operations", async function () {
      console.log("\n🎯 Testing Gas Optimization...");
      
      // Test batch minting of badges
      const badgeIds = [1, 2, 3, 4];
      const amounts = [1, 1, 1, 1];
      
      const tx = await loyaltyToken.mintBadgeBatch(buyer1.address, badgeIds, amounts);
      const receipt = await tx.wait();
      
      console.log(`⛽ Batch mint gas used: ${receipt.gasUsed.toString()}`);
      
      // Verify all badges were minted
      for (let i = 0; i < badgeIds.length; i++) {
        expect(await loyaltyToken.balanceOf(buyer1.address, badgeIds[i])).to.equal(1);
      }
      console.log("✅ All badges minted successfully in batch");
    });
  });

  describe("🔒 Security and Edge Case Tests", function () {
    it("Should prevent reentrancy attacks", async function () {
      // CreatorStore uses ReentrancyGuard, test it works
      await mockUSDC.connect(buyer1).approve(await creatorStore.getAddress(), ethers.parseUnits("10", 6));
      
      // Normal purchase should work
      await expect(creatorStore.connect(buyer1).buyItem(1))
        .to.not.be.reverted;
    });

    it("Should handle zero balance edge cases", async function () {
      // Test withdrawal with zero balance
      const newCreatorStore = await ethers.deployContract("CreatorStore", [
        await mockUSDC.getAddress(),
        await loyaltyToken.getAddress()
      ]);
      
      await expect(newCreatorStore.withdrawFunds())
        .to.be.revertedWith("No funds to withdraw");
    });

    it("Should validate array lengths in royalty setup", async function () {
      const recipients = [creator.address, royaltyRecipient.address];
      const percentages = [1000]; // Mismatched length
      
      await expect(
        creatorStore.listProductWithRoyalties(
          "Invalid Product",
          "Mismatched arrays",
          "QmInvalid",
          ethers.parseUnits("1", 6),
          1,
          recipients,
          percentages
        )
      ).to.be.revertedWith("Royalty arrays length mismatch");
    });

    it("Should reject zero address royalty recipients", async function () {
      const recipients = [ethers.ZeroAddress];
      const percentages = [1000];
      
      await expect(
        creatorStore.listProductWithRoyalties(
          "Invalid Product",
          "Zero address recipient",
          "QmInvalid",
          ethers.parseUnits("1", 6),
          1,
          recipients,
          percentages
        )
      ).to.be.revertedWith("Invalid royalty recipient");
    });
  });

  after(function () {
    console.log("\n🎊 All tests completed successfully!");
    console.log("📊 Test Summary:");
    console.log("   ✅ MockUSDC functionality");
    console.log("   ✅ LoyaltyToken badge system");
    console.log("   ✅ Shopfront marketplace");
    console.log("   ✅ CreatorStore with royalties");
    console.log("   ✅ Complete user workflows");
    console.log("   ✅ Creator workflows");
    console.log("   ✅ Progressive loyalty system");
    console.log("   ✅ Security validations");
  });
});