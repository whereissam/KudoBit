const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MockUSDC", function () {
  let mockUSDC;
  let owner, user, otherAccount;

  beforeEach(async function () {
    [owner, user, otherAccount] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await mockUSDC.owner()).to.equal(owner.address);
    });

    it("Should have correct name, symbol and decimals", async function () {
      expect(await mockUSDC.name()).to.equal("Mock USDC");
      expect(await mockUSDC.symbol()).to.equal("USDC");
      expect(await mockUSDC.decimals()).to.equal(6);
    });

    it("Should mint initial supply to owner", async function () {
      const ownerBalance = await mockUSDC.balanceOf(owner.address);
      expect(ownerBalance).to.equal(ethers.parseUnits("1000000", 6)); // 1M USDC
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseUnits("1000", 6);
      await mockUSDC.mint(user.address, mintAmount);
      
      const userBalance = await mockUSDC.balanceOf(user.address);
      expect(userBalance).to.equal(mintAmount);
    });

    it("Should not allow non-owner to mint tokens", async function () {
      const mintAmount = ethers.parseUnits("1000", 6);
      
      await expect(
        mockUSDC.connect(user).mint(otherAccount.address, mintAmount)
      ).to.be.revertedWithCustomError(mockUSDC, "OwnableUnauthorizedAccount");
    });
  });

  describe("Faucet", function () {
    it("Should allow anyone to use faucet within limits", async function () {
      const faucetAmount = ethers.parseUnits("100", 6); // 100 USDC
      
      await mockUSDC.connect(user).faucet(faucetAmount);
      
      const userBalance = await mockUSDC.balanceOf(user.address);
      expect(userBalance).to.equal(faucetAmount);
    });

    it("Should not allow faucet amounts over limit", async function () {
      const excessiveAmount = ethers.parseUnits("2000", 6); // 2000 USDC (over 1000 limit)
      
      await expect(
        mockUSDC.connect(user).faucet(excessiveAmount)
      ).to.be.revertedWith("Amount too large");
    });

    it("Should allow multiple faucet calls up to limit", async function () {
      const amount1 = ethers.parseUnits("500", 6);
      const amount2 = ethers.parseUnits("400", 6);
      
      await mockUSDC.connect(user).faucet(amount1);
      await mockUSDC.connect(user).faucet(amount2);
      
      const userBalance = await mockUSDC.balanceOf(user.address);
      expect(userBalance).to.equal(amount1 + amount2);
    });
  });

  describe("Standard ERC20 Functions", function () {
    beforeEach(async function () {
      // Give user some tokens to test with
      await mockUSDC.mint(user.address, ethers.parseUnits("1000", 6));
    });

    it("Should allow transfers", async function () {
      const transferAmount = ethers.parseUnits("100", 6);
      
      await mockUSDC.connect(user).transfer(otherAccount.address, transferAmount);
      
      expect(await mockUSDC.balanceOf(otherAccount.address)).to.equal(transferAmount);
      expect(await mockUSDC.balanceOf(user.address)).to.equal(ethers.parseUnits("900", 6));
    });

    it("Should allow approvals and transferFrom", async function () {
      const approvalAmount = ethers.parseUnits("200", 6);
      const transferAmount = ethers.parseUnits("150", 6);
      
      await mockUSDC.connect(user).approve(otherAccount.address, approvalAmount);
      expect(await mockUSDC.allowance(user.address, otherAccount.address)).to.equal(approvalAmount);
      
      await mockUSDC.connect(otherAccount).transferFrom(user.address, otherAccount.address, transferAmount);
      
      expect(await mockUSDC.balanceOf(otherAccount.address)).to.equal(transferAmount);
      expect(await mockUSDC.allowance(user.address, otherAccount.address)).to.equal(approvalAmount - transferAmount);
    });
  });
});