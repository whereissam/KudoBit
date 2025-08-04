// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../core/LoyaltyToken.sol";

contract GamefiedEngagement is Ownable, ReentrancyGuard {
    IERC20 public paymentToken;
    LoyaltyToken public loyaltyToken;
    
    enum QuestType { PURCHASE, SPEND_AMOUNT, DAILY_LOGIN, SOCIAL_SHARE, CREATOR_SUPPORT, COMMUNITY_ENGAGE }
    enum AchievementType { MILESTONE, STREAK, RARE, SPECIAL }
    
    struct Quest {
        uint256 id;
        string name;
        string description;
        QuestType questType;
        uint256 targetValue; // Amount to spend, number of purchases, etc.
        uint256 rewardAmount; // USDC reward (6 decimals)
        uint256 xpReward;
        uint256 loyaltyBadgeReward; // 0 if no badge reward
        uint256 duration; // Quest duration in seconds (0 for permanent)
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool isRepeatable;
        uint256 maxCompletions; // 0 for unlimited
        uint256 completionCount;
    }
    
    struct Achievement {
        uint256 id;
        string name;
        string description;
        string iconHash; // IPFS hash for achievement icon
        AchievementType achievementType;
        uint256 requiredValue; // Spending threshold, streak length, etc.
        uint256 xpReward;
        uint256 loyaltyBadgeReward;
        bool isSecret; // Hidden until unlocked
        bool isActive;
    }
    
    struct UserProgress {
        uint256 totalXP;
        uint256 level;
        uint256 currentStreak;
        uint256 longestStreak;
        uint256 lastLoginDate;
        mapping(uint256 => bool) completedQuests;
        mapping(uint256 => uint256) questProgress; // questId => current progress
        mapping(uint256 => uint256) questCompletionCount; // questId => times completed
        mapping(uint256 => bool) unlockedAchievements;
        mapping(uint256 => uint256) achievementProgress; // achievementId => current progress
    }
    
    struct LeaderboardEntry {
        address user;
        uint256 score;
        uint256 rank;
    }
    
    mapping(uint256 => Quest) public quests;
    mapping(uint256 => Achievement) public achievements;
    mapping(address => UserProgress) public userProgress;
    mapping(address => uint256[]) public userCompletedQuests;
    mapping(address => uint256[]) public userUnlockedAchievements;
    
    // Leaderboards
    mapping(bytes32 => LeaderboardEntry[]) public leaderboards; // leaderboard type => entries
    mapping(bytes32 => mapping(address => uint256)) public userLeaderboardScores;
    
    uint256 public questCount;
    uint256 public achievementCount;
    uint256 public totalRewardsDistributed;
    
    // XP thresholds for levels (exponential growth)
    uint256[] public levelThresholds;
    
    event QuestCreated(uint256 indexed questId, string name, QuestType questType);
    event QuestCompleted(address indexed user, uint256 indexed questId, uint256 xpReward, uint256 tokenReward);
    event AchievementUnlocked(address indexed user, uint256 indexed achievementId, string name);
    event LevelUp(address indexed user, uint256 newLevel, uint256 totalXP);
    event StreakMilestone(address indexed user, uint256 streakLength);
    event LeaderboardUpdated(bytes32 indexed leaderboardType, address indexed user, uint256 newScore, uint256 rank);
    
    constructor(
        address _paymentToken,
        address _loyaltyToken
    ) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
        loyaltyToken = LoyaltyToken(_loyaltyToken);
        
        _initializeLevelThresholds();
        _createInitialQuests();
        _createInitialAchievements();
    }
    
    function _initializeLevelThresholds() internal {
        // Level progression: 1000, 2500, 5000, 10000, 20000, 40000, 80000, 160000, 320000, 640000
        levelThresholds.push(1000);   // Level 1
        levelThresholds.push(2500);   // Level 2
        levelThresholds.push(5000);   // Level 3
        levelThresholds.push(10000);  // Level 4
        levelThresholds.push(20000);  // Level 5
        levelThresholds.push(40000);  // Level 6
        levelThresholds.push(80000);  // Level 7
        levelThresholds.push(160000); // Level 8
        levelThresholds.push(320000); // Level 9
        levelThresholds.push(640000); // Level 10
    }
    
    function _createInitialQuests() internal {
        // Daily login quest
        createQuest(
            "Daily Check-in",
            "Log in to KudoBit every day to maintain your streak",
            QuestType.DAILY_LOGIN,
            1, // 1 login
            10000, // 0.01 USDC reward
            100, // 100 XP
            0, // No badge reward
            86400, // 24 hours
            true, // Repeatable
            0 // Unlimited completions
        );
        
        // First purchase quest
        createQuest(
            "First Purchase",
            "Make your first purchase on KudoBit",
            QuestType.PURCHASE,
            1, // 1 purchase
            50000, // 0.05 USDC reward
            500, // 500 XP
            1, // Bronze badge
            0, // Permanent
            false, // Not repeatable
            1 // Max 1 completion
        );
        
        // Spending milestone
        createQuest(
            "Big Spender",
            "Spend $5 or more in a single transaction",
            QuestType.SPEND_AMOUNT,
            5000000, // $5.00 (6 decimals)
            100000, // 0.10 USDC reward
            1000, // 1000 XP
            2, // Silver badge
            0, // Permanent
            true, // Repeatable
            0 // Unlimited
        );
        
        // Community engagement
        createQuest(
            "Community Champion",
            "Post 5 messages in the community forum",
            QuestType.COMMUNITY_ENGAGE,
            5, // 5 posts
            25000, // 0.025 USDC reward
            300, // 300 XP
            0, // No badge
            604800, // 1 week
            true, // Repeatable
            0 // Unlimited
        );
    }
    
    function _createInitialAchievements() internal {
        // Spending milestones
        createAchievement(
            "Whale Status",
            "Spend over $100 on KudoBit",
            "QmWhaleIcon123",
            AchievementType.MILESTONE,
            100000000, // $100 (6 decimals)
            5000, // 5000 XP
            4, // Diamond badge
            false // Not secret
        );
        
        // Streak achievements
        createAchievement(
            "Streak Master",
            "Maintain a 30-day login streak",
            "QmStreakIcon456",
            AchievementType.STREAK,
            30, // 30 days
            2000, // 2000 XP
            3, // Gold badge
            false // Not secret
        );
        
        // Rare achievement
        createAchievement(
            "Early Adopter",
            "One of the first 100 users on KudoBit",
            "QmEarlyIcon789",
            AchievementType.RARE,
            100, // First 100 users
            10000, // 10000 XP
            4, // Diamond badge
            true // Secret until unlocked
        );
        
        // Special achievement
        createAchievement(
            "Creator Supporter",
            "Support 10 different creators",
            "QmSupportIcon101",
            AchievementType.SPECIAL,
            10, // 10 different creators
            3000, // 3000 XP
            3, // Gold badge
            false // Not secret
        );
    }
    
    function createQuest(
        string memory name,
        string memory description,
        QuestType questType,
        uint256 targetValue,
        uint256 rewardAmount,
        uint256 xpReward,
        uint256 loyaltyBadgeReward,
        uint256 duration,
        bool isRepeatable,
        uint256 maxCompletions
    ) public onlyOwner returns (uint256) {
        questCount++;
        
        Quest storage quest = quests[questCount];
        quest.id = questCount;
        quest.name = name;
        quest.description = description;
        quest.questType = questType;
        quest.targetValue = targetValue;
        quest.rewardAmount = rewardAmount;
        quest.xpReward = xpReward;
        quest.loyaltyBadgeReward = loyaltyBadgeReward;
        quest.duration = duration;
        quest.startTime = block.timestamp;
        quest.endTime = duration > 0 ? block.timestamp + duration : 0;
        quest.isActive = true;
        quest.isRepeatable = isRepeatable;
        quest.maxCompletions = maxCompletions;
        quest.completionCount = 0;
        
        emit QuestCreated(questCount, name, questType);
        return questCount;
    }
    
    function createAchievement(
        string memory name,
        string memory description,
        string memory iconHash,
        AchievementType achievementType,
        uint256 requiredValue,
        uint256 xpReward,
        uint256 loyaltyBadgeReward,
        bool isSecret
    ) public onlyOwner returns (uint256) {
        achievementCount++;
        
        Achievement storage achievement = achievements[achievementCount];
        achievement.id = achievementCount;
        achievement.name = name;
        achievement.description = description;
        achievement.iconHash = iconHash;
        achievement.achievementType = achievementType;
        achievement.requiredValue = requiredValue;
        achievement.xpReward = xpReward;
        achievement.loyaltyBadgeReward = loyaltyBadgeReward;
        achievement.isSecret = isSecret;
        achievement.isActive = true;
        
        return achievementCount;
    }
    
    function updateQuestProgress(
        address user,
        uint256 questId,
        uint256 progressAmount
    ) external onlyOwner {
        require(questId <= questCount && questId > 0, "Quest does not exist");
        
        Quest memory quest = quests[questId];
        require(quest.isActive, "Quest is not active");
        
        if (quest.endTime > 0 && block.timestamp > quest.endTime) {
            return; // Quest expired
        }
        
        UserProgress storage progress = userProgress[user];
        
        // Check if quest is already completed and not repeatable
        if (!quest.isRepeatable && progress.completedQuests[questId]) {
            return;
        }
        
        // Check max completions
        if (quest.maxCompletions > 0 && progress.questCompletionCount[questId] >= quest.maxCompletions) {
            return;
        }
        
        // Update progress
        progress.questProgress[questId] += progressAmount;
        
        // Check if quest is completed
        if (progress.questProgress[questId] >= quest.targetValue) {
            _completeQuest(user, questId);
        }
    }

    function _updateQuestProgress(
        address user,
        uint256 questId,
        uint256 progressAmount
    ) internal {
        if (questId > questCount || questId == 0) {
            return; // Quest does not exist
        }
        
        Quest memory quest = quests[questId];
        if (!quest.isActive) {
            return; // Quest is not active
        }
        
        if (quest.endTime > 0 && block.timestamp > quest.endTime) {
            return; // Quest expired
        }
        
        UserProgress storage progress = userProgress[user];
        
        // Check if quest is already completed and not repeatable
        if (!quest.isRepeatable && progress.completedQuests[questId]) {
            return;
        }
        
        // Check max completions
        if (quest.maxCompletions > 0 && progress.questCompletionCount[questId] >= quest.maxCompletions) {
            return;
        }
        
        // Update progress
        progress.questProgress[questId] += progressAmount;
        
        // Check if quest is completed
        if (progress.questProgress[questId] >= quest.targetValue) {
            _completeQuest(user, questId);
        }
    }
    
    function _completeQuest(address user, uint256 questId) internal {
        Quest storage quest = quests[questId];
        UserProgress storage progress = userProgress[user];
        
        // Mark as completed
        if (!quest.isRepeatable) {
            progress.completedQuests[questId] = true;
        } else {
            progress.questProgress[questId] = 0; // Reset progress for repeatable quests
        }
        
        progress.questCompletionCount[questId]++;
        quest.completionCount++;
        
        // Award XP
        progress.totalXP += quest.xpReward;
        _checkLevelUp(user);
        
        // Award token reward
        if (quest.rewardAmount > 0) {
            require(
                paymentToken.transfer(user, quest.rewardAmount),
                "Reward transfer failed"
            );
            totalRewardsDistributed += quest.rewardAmount;
        }
        
        // Award loyalty badge
        if (quest.loyaltyBadgeReward > 0) {
            loyaltyToken.mintBadge(user, quest.loyaltyBadgeReward, 1);
        }
        
        // Update leaderboards
        _updateLeaderboard("quests", user, progress.questCompletionCount[questId]);
        
        // Add to completed quests list
        userCompletedQuests[user].push(questId);
        
        emit QuestCompleted(user, questId, quest.xpReward, quest.rewardAmount);
    }
    
    function updateAchievementProgress(
        address user,
        uint256 achievementId,
        uint256 progressAmount
    ) external onlyOwner {
        require(achievementId <= achievementCount && achievementId > 0, "Achievement does not exist");
        
        Achievement memory achievement = achievements[achievementId];
        require(achievement.isActive, "Achievement is not active");
        
        UserProgress storage progress = userProgress[user];
        
        // Check if already unlocked
        if (progress.unlockedAchievements[achievementId]) {
            return;
        }
        
        // Update progress
        progress.achievementProgress[achievementId] += progressAmount;
        
        // Check if achievement is unlocked
        if (progress.achievementProgress[achievementId] >= achievement.requiredValue) {
            _unlockAchievement(user, achievementId);
        }
    }
    
    function _unlockAchievement(address user, uint256 achievementId) internal {
        Achievement memory achievement = achievements[achievementId];
        UserProgress storage progress = userProgress[user];
        
        // Mark as unlocked
        progress.unlockedAchievements[achievementId] = true;
        
        // Award XP
        progress.totalXP += achievement.xpReward;
        _checkLevelUp(user);
        
        // Award loyalty badge
        if (achievement.loyaltyBadgeReward > 0) {
            loyaltyToken.mintBadge(user, achievement.loyaltyBadgeReward, 1);
        }
        
        // Add to unlocked achievements list
        userUnlockedAchievements[user].push(achievementId);
        
        // Update achievements leaderboard
        _updateLeaderboard("achievements", user, userUnlockedAchievements[user].length);
        
        emit AchievementUnlocked(user, achievementId, achievement.name);
    }
    
    function updateDailyLogin(address user) external onlyOwner {
        UserProgress storage progress = userProgress[user];
        uint256 today = block.timestamp / 86400; // Days since epoch
        
        if (progress.lastLoginDate < today) {
            if (progress.lastLoginDate == today - 1) {
                // Consecutive day
                progress.currentStreak++;
                if (progress.currentStreak > progress.longestStreak) {
                    progress.longestStreak = progress.currentStreak;
                    emit StreakMilestone(user, progress.currentStreak);
                }
            } else {
                // Streak broken
                progress.currentStreak = 1;
            }
            
            progress.lastLoginDate = today;
            
            // Update daily login quest
            _updateQuestProgress(user, 1, 1); // Assuming quest ID 1 is daily login
            
            // Update leaderboards
            _updateLeaderboard("streak", user, progress.currentStreak);
            _updateLeaderboard("longest_streak", user, progress.longestStreak);
        }
    }
    
    function _checkLevelUp(address user) internal {
        UserProgress storage progress = userProgress[user];
        uint256 currentLevel = progress.level;
        uint256 newLevel = _calculateLevel(progress.totalXP);
        
        if (newLevel > currentLevel) {
            progress.level = newLevel;
            
            // Award level-up badge every 5 levels
            if (newLevel % 5 == 0 && newLevel <= 20) {
                uint256 badgeId = (newLevel / 5); // 1, 2, 3, 4 for levels 5, 10, 15, 20
                loyaltyToken.mintBadge(user, badgeId, 1);
            }
            
            // Update XP leaderboard
            _updateLeaderboard("xp", user, progress.totalXP);
            
            emit LevelUp(user, newLevel, progress.totalXP);
        }
    }
    
    function _calculateLevel(uint256 totalXP) internal view returns (uint256) {
        for (uint256 i = 0; i < levelThresholds.length; i++) {
            if (totalXP < levelThresholds[i]) {
                return i;
            }
        }
        return levelThresholds.length; // Max level
    }
    
    function _updateLeaderboard(
        bytes32 leaderboardType,
        address user,
        uint256 newScore
    ) internal {
        uint256 oldScore = userLeaderboardScores[leaderboardType][user];
        
        if (newScore <= oldScore) {
            return; // No improvement
        }
        
        userLeaderboardScores[leaderboardType][user] = newScore;
        
        // Simple leaderboard update (in production, use more efficient data structure)
        LeaderboardEntry[] storage entries = leaderboards[leaderboardType];
        
        // Find existing entry or add new one
        bool found = false;
        for (uint256 i = 0; i < entries.length; i++) {
            if (entries[i].user == user) {
                entries[i].score = newScore;
                found = true;
                break;
            }
        }
        
        if (!found) {
            entries.push(LeaderboardEntry({
                user: user,
                score: newScore,
                rank: 0
            }));
        }
        
        // Sort and update ranks (simplified - in production use more efficient sorting)
        _sortLeaderboard(leaderboardType);
        
        emit LeaderboardUpdated(leaderboardType, user, newScore, _getUserRank(leaderboardType, user));
    }
    
    function _sortLeaderboard(bytes32 leaderboardType) internal {
        LeaderboardEntry[] storage entries = leaderboards[leaderboardType];
        
        // Simple bubble sort (use more efficient algorithm in production)
        for (uint256 i = 0; i < entries.length; i++) {
            for (uint256 j = 0; j < entries.length - 1 - i; j++) {
                if (entries[j].score < entries[j + 1].score) {
                    LeaderboardEntry memory temp = entries[j];
                    entries[j] = entries[j + 1];
                    entries[j + 1] = temp;
                }
            }
        }
        
        // Update ranks
        for (uint256 i = 0; i < entries.length; i++) {
            entries[i].rank = i + 1;
        }
    }
    
    function _getUserRank(bytes32 leaderboardType, address user) internal view returns (uint256) {
        LeaderboardEntry[] memory entries = leaderboards[leaderboardType];
        
        for (uint256 i = 0; i < entries.length; i++) {
            if (entries[i].user == user) {
                return entries[i].rank;
            }
        }
        
        return 0; // Not found
    }
    
    function getUserStats(address user) external view returns (
        uint256 totalXP,
        uint256 level,
        uint256 currentStreak,
        uint256 longestStreak,
        uint256 completedQuestsCount,
        uint256 unlockedAchievementsCount
    ) {
        UserProgress storage progress = userProgress[user];
        return (
            progress.totalXP,
            progress.level,
            progress.currentStreak,
            progress.longestStreak,
            userCompletedQuests[user].length,
            userUnlockedAchievements[user].length
        );
    }
    
    function getLeaderboard(bytes32 leaderboardType, uint256 limit) external view returns (
        address[] memory users,
        uint256[] memory scores,
        uint256[] memory ranks
    ) {
        LeaderboardEntry[] memory entries = leaderboards[leaderboardType];
        uint256 returnCount = entries.length > limit ? limit : entries.length;
        
        users = new address[](returnCount);
        scores = new uint256[](returnCount);
        ranks = new uint256[](returnCount);
        
        for (uint256 i = 0; i < returnCount; i++) {
            users[i] = entries[i].user;
            scores[i] = entries[i].score;
            ranks[i] = entries[i].rank;
        }
    }
    
    function getUserQuestProgress(address user, uint256 questId) external view returns (
        uint256 currentProgress,
        uint256 targetValue,
        bool isCompleted,
        uint256 completionCount
    ) {
        require(questId <= questCount && questId > 0, "Quest does not exist");
        
        UserProgress storage progress = userProgress[user];
        Quest memory quest = quests[questId];
        
        return (
            progress.questProgress[questId],
            quest.targetValue,
            progress.completedQuests[questId],
            progress.questCompletionCount[questId]
        );
    }
    
    function getActiveQuests() external view returns (
        uint256[] memory questIds,
        string[] memory names,
        QuestType[] memory questTypes,
        uint256[] memory xpRewards
    ) {
        uint256 activeCount = 0;
        
        // Count active quests
        for (uint256 i = 1; i <= questCount; i++) {
            if (quests[i].isActive && (quests[i].endTime == 0 || block.timestamp <= quests[i].endTime)) {
                activeCount++;
            }
        }
        
        questIds = new uint256[](activeCount);
        names = new string[](activeCount);
        questTypes = new QuestType[](activeCount);
        xpRewards = new uint256[](activeCount);
        
        uint256 index = 0;
        for (uint256 i = 1; i <= questCount; i++) {
            if (quests[i].isActive && (quests[i].endTime == 0 || block.timestamp <= quests[i].endTime)) {
                questIds[index] = quests[i].id;
                names[index] = quests[i].name;
                questTypes[index] = quests[i].questType;
                xpRewards[index] = quests[i].xpReward;
                index++;
            }
        }
    }
    
    function getPlatformStats() external view returns (
        uint256 totalQuests,
        uint256 totalAchievements,
        uint256 totalRewardsGiven,
        uint256 activeUsers
    ) {
        uint256 activeUserCount = 0; // This would need proper tracking in production
        
        return (
            questCount,
            achievementCount,
            totalRewardsDistributed,
            activeUserCount
        );
    }
    
    // Admin functions
    function setQuestStatus(uint256 questId, bool isActive) external onlyOwner {
        require(questId <= questCount && questId > 0, "Quest does not exist");
        quests[questId].isActive = isActive;
    }
    
    function setAchievementStatus(uint256 achievementId, bool isActive) external onlyOwner {
        require(achievementId <= achievementCount && achievementId > 0, "Achievement does not exist");
        achievements[achievementId].isActive = isActive;
    }
    
    function withdrawRewardFunds() external onlyOwner {
        uint256 balance = paymentToken.balanceOf(address(this));
        require(balance > 0, "No funds to withdraw");
        require(paymentToken.transfer(owner(), balance), "Withdrawal failed");
    }
}