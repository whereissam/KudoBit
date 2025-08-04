const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LoyaltyToken", function () {
  let loyaltyToken;
  let owner, minter, recipient, otherAccount;

  beforeEach(async function () {
    [owner, minter, recipient, otherAccount] = await ethers.getSigners();

    const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
    loyaltyToken = await LoyaltyToken.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await loyaltyToken.owner()).to.equal(owner.address);
    });

    it("Should set the correct name and symbol", async function () {
      expect(await loyaltyToken.name()).to.equal("Loyalty Badges");
      expect(await loyaltyToken.symbol()).to.equal("LB");
    });

    it("Should have correct badge constants", async function () {
      expect(await loyaltyToken.BRONZE_BADGE()).to.equal(1);
      expect(await loyaltyToken.SILVER_BADGE()).to.equal(2);
      expect(await loyaltyToken.GOLD_BADGE()).to.equal(3);
      expect(await loyaltyToken.DIAMOND_BADGE()).to.equal(4);
    });
  });

  describe("Minter Authorization", function () {
    it("Should allow owner to set authorized minters", async function () {
      await loyaltyToken.setAuthorizedMinter(minter.address, true);
      expect(await loyaltyToken.authorizedMinters(minter.address)).to.be.true;
    });

    it("Should allow owner to remove authorized minters", async function () {
      await loyaltyToken.setAuthorizedMinter(minter.address, true);
      await loyaltyToken.setAuthorizedMinter(minter.address, false);
      expect(await loyaltyToken.authorizedMinters(minter.address)).to.be.false;
    });

    it("Should not allow non-owner to set authorized minters", async function () {
      await expect(
        loyaltyToken.connect(otherAccount).setAuthorizedMinter(minter.address, true)
      ).to.be.revertedWithCustomError(loyaltyToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Badge Minting", function () {
    beforeEach(async function () {
      await loyaltyToken.setAuthorizedMinter(minter.address, true);
    });

    it("Should allow owner to mint badges", async function () {
      await loyaltyToken.mintBadge(recipient.address, 1, 1);
      expect(await loyaltyToken.balanceOf(recipient.address, 1)).to.equal(1);
    });

    it("Should allow authorized minter to mint badges", async function () {
      await loyaltyToken.connect(minter).mintBadge(recipient.address, 2, 1);
      expect(await loyaltyToken.balanceOf(recipient.address, 2)).to.equal(1);
    });

    it("Should not allow unauthorized address to mint badges", async function () {
      await expect(
        loyaltyToken.connect(otherAccount).mintBadge(recipient.address, 1, 1)
      ).to.be.revertedWith("Not authorized to mint");
    });

    it("Should allow minting multiple badges of same type", async function () {
      await loyaltyToken.mintBadge(recipient.address, 1, 5);
      expect(await loyaltyToken.balanceOf(recipient.address, 1)).to.equal(5);
    });

    it("Should allow batch minting", async function () {
      const badgeIds = [1, 2, 3];
      const amounts = [1, 2, 1];
      
      await loyaltyToken.mintBadgeBatch(recipient.address, badgeIds, amounts);
      
      expect(await loyaltyToken.balanceOf(recipient.address, 1)).to.equal(1);
      expect(await loyaltyToken.balanceOf(recipient.address, 2)).to.equal(2);
      expect(await loyaltyToken.balanceOf(recipient.address, 3)).to.equal(1);
    });
  });

  describe("Token URI", function () {
    it("Should return correct URI for each badge type", async function () {
      const bronzeURI = await loyaltyToken.uri(1);
      const silverURI = await loyaltyToken.uri(2);
      const goldURI = await loyaltyToken.uri(3);
      const diamondURI = await loyaltyToken.uri(4);
      
      expect(bronzeURI).to.contain("bronze-badge");
      expect(silverURI).to.contain("silver-badge");
      expect(goldURI).to.contain("gold-badge");
      expect(diamondURI).to.contain("diamond-badge");
    });

    it("Should allow owner to update token URIs", async function () {
      const newURI = "https://new-metadata.example/badge.json";
      await loyaltyToken.setTokenURI(1, newURI);
      expect(await loyaltyToken.uri(1)).to.equal(newURI);
    });

    it("Should not allow non-owner to update token URIs", async function () {
      await expect(
        loyaltyToken.connect(otherAccount).setTokenURI(1, "https://malicious.example")
      ).to.be.revertedWithCustomError(loyaltyToken, "OwnableUnauthorizedAccount");
    });
  });
});