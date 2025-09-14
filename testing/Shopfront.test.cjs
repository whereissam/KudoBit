const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Shopfront Contract", function () {
  let mockUSDC, loyaltyToken, shopfront;
  let owner, user1;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

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

    // Authorize shopfront to mint loyalty tokens
    await loyaltyToken.setAuthorizedMinter(await shopfront.getAddress(), true);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await shopfront.owner()).to.equal(owner.address);
    });

    it("Should create initial items", async function () {
      const itemCount = await shopfront.itemCount();
      expect(itemCount).to.equal(3);
      
      const item1 = await shopfront.getItem(1);
      expect(item1.name).to.equal("Exclusive Wallpaper NFT");
      expect(item1.priceInUSDC).to.equal(ethers.parseUnits("10", 6));
    });

    it("Should set payment and loyalty tokens", async function () {
      expect(await shopfront.paymentToken()).to.equal(await mockUSDC.getAddress());
      expect(await shopfront.loyaltyToken()).to.equal(await loyaltyToken.getAddress());
    });
  });

  describe("Item Management", function () {
    it("Should allow owner to add new items", async function () {
      await shopfront.addItem(
        "Test Item",
        "Test Description",
        "test-image.jpg",
        ethers.parseUnits("15", 6),
        2
      );

      const item = await shopfront.getItem(4);
      expect(item.name).to.equal("Test Item");
      expect(item.priceInUSDC).to.equal(ethers.parseUnits("15", 6));
      expect(item.loyaltyBadgeId).to.equal(2);
    });

    it("Should return all items", async function () {
      const allItems = await shopfront.getAllItems();
      expect(allItems.length).to.equal(3);
      expect(allItems[0].name).to.equal("Exclusive Wallpaper NFT");
    });
  });

  describe("Purchase Flow", function () {
    beforeEach(async function () {
      // Give user1 some USDC
      await mockUSDC.mint(user1.address, ethers.parseUnits("100", 6));
      
      // User1 approves shopfront to spend USDC
      await mockUSDC.connect(user1).approve(
        await shopfront.getAddress(),
        ethers.parseUnits("100", 6)
      );
    });

    it("Should allow user to purchase item", async function () {
      const item1 = await shopfront.getItem(1);
      const initialBalance = await mockUSDC.balanceOf(user1.address);

      await shopfront.connect(user1).buyItem(1);

      // Check payment transferred
      const finalBalance = await mockUSDC.balanceOf(user1.address);
      expect(finalBalance).to.equal(initialBalance - item1.priceInUSDC);

      // Check loyalty badge minted
      const badgeBalance = await loyaltyToken.balanceOf(user1.address, 1);
      expect(badgeBalance).to.equal(1);

      // Check purchase recorded
      const purchases = await shopfront.getUserPurchases(user1.address);
      expect(purchases.length).to.equal(1);
      expect(purchases[0]).to.equal(1);
    });

    it("Should fail when user has insufficient balance", async function () {
      // Try to buy expensive item without enough USDC
      await expect(
        shopfront.connect(user1).buyItem(2) // 25 USDC item, user has 100
      ).to.not.be.reverted;

      // But should fail with 0 balance
      const user2 = (await ethers.getSigners())[2];
      await expect(
        shopfront.connect(user2).buyItem(1)
      ).to.be.reverted;
    });

    it("Should fail for non-existent item", async function () {
      await expect(
        shopfront.connect(user1).buyItem(999)
      ).to.be.revertedWith("Item does not exist");
    });
  });

  describe("USDC Faucet", function () {
    it("Should allow users to claim test USDC", async function () {
      const claimAmount = ethers.parseUnits("50", 6);
      
      await mockUSDC.connect(user1).faucet(claimAmount);
      
      const balance = await mockUSDC.balanceOf(user1.address);
      expect(balance).to.equal(claimAmount);
    });

    it("Should reject claims above maximum", async function () {
      const tooMuch = ethers.parseUnits("1001", 6);
      
      await expect(
        mockUSDC.connect(user1).faucet(tooMuch)
      ).to.be.revertedWith("Amount too large");
    });
  });

  describe("Loyalty Token", function () {
    it("Should allow authorized minter to mint badges", async function () {
      await loyaltyToken.connect(owner).mintBadge(user1.address, 1, 1);
      
      const balance = await loyaltyToken.balanceOf(user1.address, 1);
      expect(balance).to.equal(1);
    });

    it("Should reject unauthorized minting", async function () {
      await expect(
        loyaltyToken.connect(user1).mintBadge(user1.address, 1, 1)
      ).to.be.revertedWith("Not authorized to mint");
    });
  });
});