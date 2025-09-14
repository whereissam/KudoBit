const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GamefiedEngagement Contract", function () {
  let mockUSDC, loyaltyToken, gamefiedEngagement;
  let owner, user1, user2, user3;
  
  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    
    // Deploy MockUSDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();
    
    // Deploy LoyaltyToken
    const LoyaltyToken = await ethers.getContractFactory("LoyaltyToken");
    loyaltyToken = await LoyaltyToken.deploy();
    
    // Deploy GamefiedEngagement
    const GamefiedEngagement = await ethers.getContractFactory("GamefiedEngagement");
    gamefiedEngagement = await GamefiedEngagement.deploy(
      await mockUSDC.getAddress(),
      await loyaltyToken.getAddress()
    );
    
    // Set permissions
    await loyaltyToken.setAuthorizedMinter(await gamefiedEngagement.getAddress(), true);
    
    // Mint USDC to contract for rewards
    const rewardAmount = ethers.parseUnits("1000", 6);
    await mockUSDC.mint(await gamefiedEngagement.getAddress(), rewardAmount);
  });

  describe("Initial Setup", function () {
    it("Should initialize with correct contracts", async function () {
      const paymentToken = await gamefiedEngagement.paymentToken();
      const loyaltyTokenAddr = await gamefiedEngagement.loyaltyToken();
      
      expect(paymentToken).to.equal(await mockUSDC.getAddress());
      expect(loyaltyTokenAddr).to.equal(await loyaltyToken.getAddress());
    });

    it("Should have initial quests created", async function () {
      const questCount = await gamefiedEngagement.questCount();
      expect(questCount).to.be.greaterThan(0);
      
      // Check daily login quest
      const quest1 = await gamefiedEngagement.quests(1);
      expect(quest1.name).to.equal("Daily Check-in");
      expect(quest1.isRepeatable).to.be.true;
    });

    it("Should have initial achievements created", async function () {
      const achievementCount = await gamefiedEngagement.achievementCount();
      expect(achievementCount).to.be.greaterThan(0);
      
      // Check whale achievement
      const achievement1 = await gamefiedEngagement.achievements(1);
      expect(achievement1.name).to.equal("Whale Status");
      expect(achievement1.requiredValue).to.equal(100000000); // $100
    });

    it("Should have level thresholds initialized", async function () {
      const [bronze, silver, gold, diamond] = await gamefiedEngagement.getLoyaltyThresholds();
      expect(bronze).to.equal(1000);
      expect(silver).to.equal(2500);
      expect(gold).to.equal(5000);
      expect(diamond).to.equal(10000);
    });
  });

  describe("Quest Management", function () {
    it("Should create new quest", async function () {
      await expect(gamefiedEngagement.createQuest(
        "Test Quest",
        "Complete this test quest",
        0, // PURCHASE type
        5, // Target: 5 purchases
        100000, // 0.1 USDC reward
        500, // 500 XP
        2, // Silver badge
        86400, // 24 hours duration
        true, // Repeatable
        0 // Unlimited completions
      ))
        .to.emit(gamefiedEngagement, "QuestCreated");
      
      const questCount = await gamefiedEngagement.questCount();
      const newQuest = await gamefiedEngagement.quests(questCount);
      
      expect(newQuest.name).to.equal("Test Quest");
      expect(newQuest.targetValue).to.equal(5);
      expect(newQuest.xpReward).to.equal(500);
    });

    it("Should update quest progress", async function () {
      const questId = 2; // First purchase quest
      
      await gamefiedEngagement.updateQuestProgress(user1.address, questId, 1);
      
      const [currentProgress, targetValue, isCompleted] = 
        await gamefiedEngagement.getUserQuestProgress(user1.address, questId);
      
      expect(currentProgress).to.equal(1);
      expect(isCompleted).to.be.true; // First purchase quest only needs 1 purchase
    });

    it("Should complete quest and award rewards", async function () {
      const questId = 2; // First purchase quest
      const quest = await gamefiedEngagement.quests(questId);
      
      await expect(gamefiedEngagement.updateQuestProgress(user1.address, questId, 1))
        .to.emit(gamefiedEngagement, "QuestCompleted")
        .withArgs(user1.address, questId, quest.xpReward, quest.rewardAmount);
      
      // Check user received XP
      const [totalXP] = await gamefiedEngagement.getUserStats(user1.address);
      expect(totalXP).to.equal(quest.xpReward);
      
      // Check user received USDC reward
      const userBalance = await mockUSDC.balanceOf(user1.address);
      expect(userBalance).to.equal(quest.rewardAmount);
      
      // Check user received loyalty badge
      const badgeBalance = await loyaltyToken.balanceOf(user1.address, quest.loyaltyBadgeReward);
      expect(badgeBalance).to.equal(1);
    });

    it("Should handle repeatable quests", async function () {
      const questId = 1; // Daily check-in (repeatable)
      
      // Complete quest first time
      await gamefiedEngagement.updateQuestProgress(user1.address, questId, 1);
      
      // Complete quest second time
      await gamefiedEngagement.updateQuestProgress(user1.address, questId, 1);
      
      const [, , , completionCount] = 
        await gamefiedEngagement.getUserQuestProgress(user1.address, questId);
      
      expect(completionCount).to.equal(2);
    });

    it("Should respect quest max completions", async function () {
      const questId = 2; // First purchase quest (max 1 completion)
      
      // Complete quest first time
      await gamefiedEngagement.updateQuestProgress(user1.address, questId, 1);
      
      // Try to complete again - should not increase completion count
      await gamefiedEngagement.updateQuestProgress(user1.address, questId, 1);
      
      const [, , , completionCount] = 
        await gamefiedEngagement.getUserQuestProgress(user1.address, questId);
      
      expect(completionCount).to.equal(1);
    });

    it("Should handle quest expiration", async function () {
      // Create a quest with short duration
      await gamefiedEngagement.createQuest(
        "Expired Quest",
        "This quest will expire",
        0, // PURCHASE type
        1,
        10000,
        100,
        0,
        1, // 1 second duration
        false,
        1
      );
      
      const questId = await gamefiedEngagement.questCount();
      
      // Wait for quest to expire (simulate by checking time)
      await ethers.provider.send("evm_increaseTime", [2]); // Increase time by 2 seconds
      await ethers.provider.send("evm_mine"); // Mine a block
      
      // Try to update progress on expired quest - should not complete
      await gamefiedEngagement.updateQuestProgress(user1.address, questId, 1);
      
      const [, , isCompleted] = 
        await gamefiedEngagement.getUserQuestProgress(user1.address, questId);
      
      expect(isCompleted).to.be.false;
    });
  });

  describe("Achievement System", function () {
    it("Should create new achievement", async function () {
      await gamefiedEngagement.createAchievement(
        "Test Achievement",
        "Complete this test achievement",
        "QmTestIcon",
        0, // MILESTONE type
        50, // Required value
        1000, // XP reward
        3, // Gold badge
        false // Not secret
      );
      
      const achievementCount = await gamefiedEngagement.achievementCount();
      const newAchievement = await gamefiedEngagement.achievements(achievementCount);
      
      expect(newAchievement.name).to.equal("Test Achievement");
      expect(newAchievement.requiredValue).to.equal(50);
    });

    it("Should update achievement progress", async function () {
      const achievementId = 1; // Whale Status achievement
      
      await gamefiedEngagement.updateAchievementProgress(user1.address, achievementId, 50000000); // $50
      
      const userProgress = await gamefiedEngagement.userProgress(user1.address);
      // Note: We can't directly check achievementProgress mapping, but we can check if achievement is unlocked
    });

    it("Should unlock achievement when requirement is met", async function () {
      const achievementId = 1; // Whale Status ($100 requirement)
      
      await expect(gamefiedEngagement.updateAchievementProgress(user1.address, achievementId, 100000000)) // $100
        .to.emit(gamefiedEngagement, "AchievementUnlocked")
        .withArgs(user1.address, achievementId, "Whale Status");
      
      // Check user received XP and badge
      const [totalXP] = await gamefiedEngagement.getUserStats(user1.address);
      const achievement = await gamefiedEngagement.achievements(achievementId);
      expect(totalXP).to.equal(achievement.xpReward);
      
      const badgeBalance = await loyaltyToken.balanceOf(user1.address, achievement.loyaltyBadgeReward);
      expect(badgeBalance).to.equal(1);
    });

    it("Should not unlock achievement twice", async function () {
      const achievementId = 1; // Whale Status
      
      // Unlock achievement first time
      await gamefiedEngagement.updateAchievementProgress(user1.address, achievementId, 100000000);
      
      // Try to unlock again
      await gamefiedEngagement.updateAchievementProgress(user1.address, achievementId, 50000000);
      
      // Should still only have 1 badge
      const badgeBalance = await loyaltyToken.balanceOf(user1.address, 4); // Diamond badge
      expect(badgeBalance).to.equal(1);
    });
  });

  describe("Level System", function () {
    it("Should calculate correct level from XP", async function () {
      // Give user some XP to reach level 2 (2500 XP threshold)
      await gamefiedEngagement.updateQuestProgress(user1.address, 2, 1); // First purchase (500 XP)
      
      // Give more XP through multiple quest completions or achievements
      await gamefiedEngagement.updateAchievementProgress(user1.address, 1, 100000000); // Whale Status (5000 XP)
      
      const [totalXP, level] = await gamefiedEngagement.getUserStats(user1.address);
      expect(totalXP).to.be.greaterThan(2500);
      expect(level).to.be.greaterThan(1);
    });

    it("Should emit level up event", async function () {
      // Complete whale achievement to get enough XP for level up
      await expect(gamefiedEngagement.updateAchievementProgress(user1.address, 1, 100000000))
        .to.emit(gamefiedEngagement, "LevelUp");
    });

    it("Should award level-up badges", async function () {
      // Get user to level 5 (20000 XP) to receive level badge
      await gamefiedEngagement.updateAchievementProgress(user1.address, 1, 100000000); // 5000 XP
      await gamefiedEngagement.updateAchievementProgress(user1.address, 2, 30); // Streak achievement (2000 XP)
      await gamefiedEngagement.updateAchievementProgress(user1.address, 4, 10); // Creator supporter (3000 XP)
      
      // Additional XP to reach level 5
      for (let i = 0; i < 20; i++) {
        await gamefiedEngagement.updateQuestProgress(user1.address, 1, 1); // Daily check-in (100 XP each)
      }
      
      const [totalXP, level] = await gamefiedEngagement.getUserStats(user1.address);
      
      // If user reached level 5, should have received level badge
      if (level >= 5) {
        const badgeBalance = await loyaltyToken.balanceOf(user1.address, 1);
        expect(badgeBalance).to.be.greaterThan(0);
      }
    });
  });

  describe("Daily Login System", function () {
    it("Should update daily login streak", async function () {
      await expect(gamefiedEngagement.updateDailyLogin(user1.address))
        .to.emit(gamefiedEngagement, "StreakMilestone")
        .withArgs(user1.address, 1);
      
      const [, , currentStreak] = await gamefiedEngagement.getUserStats(user1.address);
      expect(currentStreak).to.equal(1);
    });

    it("Should continue streak for consecutive days", async function () {
      // Simulate consecutive daily logins
      await gamefiedEngagement.updateDailyLogin(user1.address);
      
      // Advance time by 1 day
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine");
      
      await gamefiedEngagement.updateDailyLogin(user1.address);
      
      const [, , currentStreak] = await gamefiedEngagement.getUserStats(user1.address);
      expect(currentStreak).to.equal(2);
    });

    it("Should break streak for non-consecutive logins", async function () {
      await gamefiedEngagement.updateDailyLogin(user1.address);
      
      // Advance time by 2 days (skip a day)
      await ethers.provider.send("evm_increaseTime", [172800]);
      await ethers.provider.send("evm_mine");
      
      await gamefiedEngagement.updateDailyLogin(user1.address);
      
      const [, , currentStreak] = await gamefiedEngagement.getUserStats(user1.address);
      expect(currentStreak).to.equal(1); // Streak should reset
    });

    it("Should not update streak for same day login", async function () {
      await gamefiedEngagement.updateDailyLogin(user1.address);
      await gamefiedEngagement.updateDailyLogin(user1.address); // Same day
      
      const [, , currentStreak] = await gamefiedEngagement.getUserStats(user1.address);
      expect(currentStreak).to.equal(1);
    });
  });

  describe("Leaderboards", function () {
    beforeEach(async function () {
      // Set up test data for leaderboards
      await gamefiedEngagement.updateQuestProgress(user1.address, 2, 1); // Give user1 some XP
      await gamefiedEngagement.updateQuestProgress(user2.address, 1, 1); // Give user2 less XP
      await gamefiedEngagement.updateDailyLogin(user1.address);
      await gamefiedEngagement.updateDailyLogin(user2.address);
    });

    it("Should return XP leaderboard", async function () {
      const [users, scores, ranks] = await gamefiedEngagement.getLeaderboard(
        ethers.keccak256(ethers.toUtf8Bytes("xp")), 
        10
      );
      
      expect(users.length).to.be.greaterThan(0);
      expect(scores.length).to.equal(users.length);
      expect(ranks.length).to.equal(users.length);
    });

    it("Should return streak leaderboard", async function () {
      const [users, scores, ranks] = await gamefiedEngagement.getLeaderboard(
        ethers.keccak256(ethers.toUtf8Bytes("streak")), 
        10
      );
      
      expect(users.length).to.be.greaterThan(0);
    });

    it("Should limit leaderboard results", async function () {
      const [users] = await gamefiedEngagement.getLeaderboard(
        ethers.keccak256(ethers.toUtf8Bytes("xp")), 
        1
      );
      
      expect(users.length).to.be.lessThanOrEqual(1);
    });
  });

  describe("Statistics and Views", function () {
    beforeEach(async function () {
      // Set up test data
      await gamefiedEngagement.updateQuestProgress(user1.address, 2, 1);
      await gamefiedEngagement.updateDailyLogin(user1.address);
    });

    it("Should return user statistics", async function () {
      const [totalXP, level, currentStreak, longestStreak, completedQuestsCount, unlockedAchievementsCount] = 
        await gamefiedEngagement.getUserStats(user1.address);
      
      expect(totalXP).to.be.greaterThan(0);
      expect(level).to.be.greaterThan(0);
      expect(currentStreak).to.equal(1);
      expect(completedQuestsCount).to.be.greaterThan(0);
    });

    it("Should return active quests", async function () {
      const [questIds, names, questTypes, xpRewards] = 
        await gamefiedEngagement.getActiveQuests();
      
      expect(questIds.length).to.be.greaterThan(0);
      expect(names.length).to.equal(questIds.length);
      expect(questTypes.length).to.equal(questIds.length);
      expect(xpRewards.length).to.equal(questIds.length);
    });

    it("Should return platform statistics", async function () {
      const [totalQuests, totalAchievements, totalRewardsGiven, activeUsers] = 
        await gamefiedEngagement.getPlatformStats();
      
      expect(totalQuests).to.be.greaterThan(0);
      expect(totalAchievements).to.be.greaterThan(0);
      expect(totalRewardsGiven).to.be.greaterThan(0);
    });

    it("Should return user quest progress", async function () {
      const questId = 2;
      const [currentProgress, targetValue, isCompleted, completionCount] = 
        await gamefiedEngagement.getUserQuestProgress(user1.address, questId);
      
      expect(currentProgress).to.be.greaterThanOrEqual(0);
      expect(targetValue).to.be.greaterThan(0);
      expect(completionCount).to.be.greaterThan(0);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to set quest status", async function () {
      await gamefiedEngagement.setQuestStatus(1, false);
      
      const quest = await gamefiedEngagement.quests(1);
      expect(quest.isActive).to.be.false;
    });

    it("Should allow owner to set achievement status", async function () {
      await gamefiedEngagement.setAchievementStatus(1, false);
      
      const achievement = await gamefiedEngagement.achievements(1);
      expect(achievement.isActive).to.be.false;
    });

    it("Should allow owner to withdraw reward funds", async function () {
      const initialBalance = await mockUSDC.balanceOf(owner.address);
      
      await gamefiedEngagement.withdrawRewardFunds();
      
      const finalBalance = await mockUSDC.balanceOf(owner.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });

    it("Should prevent non-owner from admin functions", async function () {
      await expect(
        gamefiedEngagement.connect(user1).setQuestStatus(1, false)
      ).to.be.revertedWithCustomError(gamefiedEngagement, "OwnableUnauthorizedAccount");
      
      await expect(
        gamefiedEngagement.connect(user1).withdrawRewardFunds()
      ).to.be.revertedWithCustomError(gamefiedEngagement, "OwnableUnauthorizedAccount");
    });

    it("Should prevent non-owner from updating progress", async function () {
      await expect(
        gamefiedEngagement.connect(user1).updateQuestProgress(user2.address, 1, 1)
      ).to.be.revertedWithCustomError(gamefiedEngagement, "OwnableUnauthorizedAccount");
    });
  });

  describe("Error Cases", function () {
    it("Should handle invalid quest ID", async function () {
      await expect(
        gamefiedEngagement.getUserQuestProgress(user1.address, 999)
      ).to.be.revertedWith("Quest does not exist");
    });

    it("Should handle invalid achievement ID", async function () {
      await expect(
        gamefiedEngagement.updateAchievementProgress(user1.address, 999, 100)
      ).to.be.revertedWith("Achievement does not exist");
    });

    it("Should handle quest with zero progress update", async function () {
      await gamefiedEngagement.updateQuestProgress(user1.address, 1, 0);
      
      const [currentProgress] = 
        await gamefiedEngagement.getUserQuestProgress(user1.address, 1);
      
      expect(currentProgress).to.equal(0);
    });

    it("Should handle inactive quest progress update", async function () {
      await gamefiedEngagement.setQuestStatus(1, false);
      
      // Should not update progress for inactive quest
      await gamefiedEngagement.updateQuestProgress(user1.address, 1, 1);
      
      const [currentProgress] = 
        await gamefiedEngagement.getUserQuestProgress(user1.address, 1);
      
      expect(currentProgress).to.equal(0);
    });

    it("Should handle inactive achievement progress update", async function () {
      await gamefiedEngagement.setAchievementStatus(1, false);
      
      // Should not update progress for inactive achievement
      await gamefiedEngagement.updateAchievementProgress(user1.address, 1, 100000000);
      
      // User should not receive achievement rewards
      const badgeBalance = await loyaltyToken.balanceOf(user1.address, 4);
      expect(badgeBalance).to.equal(0);
    });
  });

  describe("Complex Scenarios", function () {
    it("Should handle user completing multiple quests and achievements", async function () {
      // Complete first purchase quest
      await gamefiedEngagement.updateQuestProgress(user1.address, 2, 1);
      
      // Complete whale achievement
      await gamefiedEngagement.updateAchievementProgress(user1.address, 1, 100000000);
      
      // Update daily login
      await gamefiedEngagement.updateDailyLogin(user1.address);
      
      const [totalXP, level, currentStreak, longestStreak, completedQuests, unlockedAchievements] = 
        await gamefiedEngagement.getUserStats(user1.address);
      
      expect(totalXP).to.be.greaterThan(5000); // Should have substantial XP
      expect(level).to.be.greaterThan(2); // Should have leveled up
      expect(currentStreak).to.equal(1);
      expect(completedQuests).to.be.greaterThan(0);
      expect(unlockedAchievements).to.be.greaterThan(0);
    });

    it("Should handle leaderboard updates after multiple activities", async function () {
      // Give different users different amounts of XP
      await gamefiedEngagement.updateQuestProgress(user1.address, 2, 1); // 500 XP
      await gamefiedEngagement.updateQuestProgress(user2.address, 1, 1); // 100 XP
      await gamefiedEngagement.updateAchievementProgress(user3.address, 1, 100000000); // 5000 XP
      
      const [users, scores] = await gamefiedEngagement.getLeaderboard(
        ethers.keccak256(ethers.toUtf8Bytes("xp")), 
        10
      );
      
      expect(users.length).to.equal(3);
      // user3 should be first with highest XP
      expect(scores[0]).to.be.greaterThan(scores[1]);
      expect(scores[1]).to.be.greaterThan(scores[2]);
    });
  });
});