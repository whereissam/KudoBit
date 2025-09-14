const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CreatorStore", function () {
  let mockUSDC, loyaltyToken, creatorStore;
  let owner, buyer, otherAccount;

  beforeEach(async function () {
    [owner, buyer, otherAccount] = await ethers.getSigners();

    // Deploy MockUSDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();

    // Deploy LoyaltyToken
    const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
    loyaltyToken = await LoyaltyToken.deploy();

    // Deploy CreatorStore
    const CreatorStore = await ethers.getContractFactory("CreatorStore");
    creatorStore = await CreatorStore.deploy(mockUSDC.target, loyaltyToken.target);

    // Set CreatorStore as authorized minter for LoyaltyToken
    await loyaltyToken.setAuthorizedMinter(creatorStore.target, true);

    // Give buyer some MockUSDC
    await mockUSDC.mint(buyer.address, ethers.parseUnits("1000", 6));
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await creatorStore.owner()).to.equal(owner.address);
    });

    it("Should set the correct payment token", async function () {
      expect(await creatorStore.paymentToken()).to.equal(mockUSDC.target);
    });

    it("Should set the correct loyalty token", async function () {
      expect(await creatorStore.loyaltyToken()).to.equal(loyaltyToken.target);
    });

    it("Should initialize with demo products", async function () {
      expect(await creatorStore.productCount()).to.equal(3);
      
      const product1 = await creatorStore.getProduct(1);
      expect(product1.name).to.equal("Exclusive Wallpaper NFT");
      expect(product1.priceInUSDC).to.equal(200000); // 0.2 USDC
    });
  });

  describe("Product Management", function () {
    it("Should allow owner to list new products", async function () {
      await creatorStore.listProduct(
        "Test Product",
        "Test Description", 
        "QmTestHash",
        1000000, // 1 USDC
        1 // Bronze badge
      );

      expect(await creatorStore.productCount()).to.equal(4);
      
      const product = await creatorStore.getProduct(4);
      expect(product.name).to.equal("Test Product");
      expect(product.priceInUSDC).to.equal(1000000);
    });

    it("Should not allow non-owner to list products", async function () {
      await expect(
        creatorStore.connect(buyer).listProduct(
          "Unauthorized Product",
          "Test Description",
          "QmTestHash", 
          1000000,
          1
        )
      ).to.be.revertedWithCustomError(creatorStore, "OwnableUnauthorizedAccount");
    });
  });

  describe("Purchase Flow", function () {
    beforeEach(async function () {
      // Buyer approves CreatorStore to spend MockUSDC
      await mockUSDC.connect(buyer).approve(creatorStore.target, ethers.parseUnits("100", 6));
    });

    it("Should allow purchase of active products", async function () {
      const productId = 1;
      const product = await creatorStore.getProduct(productId);
      
      await expect(creatorStore.connect(buyer).buyItem(productId))
        .to.emit(creatorStore, "ProductPurchased")
        .withArgs(buyer.address, productId, product.priceInUSDC, product.loyaltyBadgeId);
    });

    it("Should transfer payment to creator", async function () {
      const productId = 1;
      const product = await creatorStore.getProduct(productId);
      const initialOwnerBalance = await mockUSDC.balanceOf(owner.address);
      
      await creatorStore.connect(buyer).buyItem(productId);
      
      const finalOwnerBalance = await mockUSDC.balanceOf(owner.address);
      expect(finalOwnerBalance - initialOwnerBalance).to.equal(product.priceInUSDC);
    });

    it("Should mint loyalty badge to buyer", async function () {
      const productId = 1;
      const product = await creatorStore.getProduct(productId);
      
      await creatorStore.connect(buyer).buyItem(productId);
      
      const badgeBalance = await loyaltyToken.balanceOf(buyer.address, product.loyaltyBadgeId);
      expect(badgeBalance).to.equal(1);
    });

    it("Should fail if buyer has insufficient balance", async function () {
      // Give buyer very little USDC
      const buyerBalance = await mockUSDC.balanceOf(buyer.address);
      await mockUSDC.connect(buyer).transfer(otherAccount.address, buyerBalance);
      
      await expect(creatorStore.connect(buyer).buyItem(1))
        .to.be.revertedWithCustomError(mockUSDC, "ERC20InsufficientBalance");
    });

    it("Should fail if buyer hasn't approved enough tokens", async function () {
      await mockUSDC.connect(buyer).approve(creatorStore.target, 0);
      
      await expect(creatorStore.connect(buyer).buyItem(1))
        .to.be.revertedWithCustomError(mockUSDC, "ERC20InsufficientAllowance");
    });
  });

  describe("Withdrawal", function () {
    it("Should fail when no funds to withdraw", async function () {
      // Contract has no funds since payments go directly to owner
      await expect(creatorStore.withdrawFunds())
        .to.be.revertedWith("No funds to withdraw");
    });

    it("Should not allow non-owner to withdraw funds", async function () {
      await expect(creatorStore.connect(buyer).withdrawFunds())
        .to.be.revertedWithCustomError(creatorStore, "OwnableUnauthorizedAccount");
    });

    it("Should allow withdrawal if funds are sent to contract", async function () {
      // Manually send some USDC to the contract
      await mockUSDC.mint(creatorStore.target, ethers.parseUnits("100", 6));
      
      const contractBalance = await mockUSDC.balanceOf(creatorStore.target);
      const initialOwnerBalance = await mockUSDC.balanceOf(owner.address);
      
      await creatorStore.withdrawFunds();
      
      const finalOwnerBalance = await mockUSDC.balanceOf(owner.address);
      const finalContractBalance = await mockUSDC.balanceOf(creatorStore.target);
      
      expect(finalContractBalance).to.equal(0);
      expect(finalOwnerBalance - initialOwnerBalance).to.equal(contractBalance);
    });
  });
});