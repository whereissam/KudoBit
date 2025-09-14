// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "../core/LoyaltyToken.sol";

contract BadgeChecker {
    struct BadgeRequirement {
        address badgeContract;
        uint256 badgeId;
        uint256 minimumAmount;
    }
    
    struct UserBadgeInfo {
        uint256 badgeId;
        uint256 balance;
        string badgeName;
        string tier;
    }
    
    LoyaltyToken public loyaltyToken;
    
    constructor(address _loyaltyTokenAddress) {
        loyaltyToken = LoyaltyToken(_loyaltyTokenAddress);
    }
    
    function checkBadgeOwnership(
        address user,
        uint256 badgeId,
        uint256 minimumAmount
    ) public view returns (bool) {
        uint256 balance = loyaltyToken.balanceOf(user, badgeId);
        return balance >= minimumAmount;
    }
    
    function checkMultipleBadgeRequirements(
        address user,
        BadgeRequirement[] memory requirements
    ) public view returns (bool[] memory) {
        bool[] memory results = new bool[](requirements.length);
        
        for (uint256 i = 0; i < requirements.length; i++) {
            LoyaltyToken badgeContract = LoyaltyToken(requirements[i].badgeContract);
            uint256 balance = badgeContract.balanceOf(user, requirements[i].badgeId);
            results[i] = balance >= requirements[i].minimumAmount;
        }
        
        return results;
    }
    
    function getUserBadgeBalances(address user) public view returns (UserBadgeInfo[] memory) {
        UserBadgeInfo[] memory userBadges = new UserBadgeInfo[](4);
        
        // Check all 4 badge tiers
        userBadges[0] = UserBadgeInfo({
            badgeId: 1,
            balance: loyaltyToken.balanceOf(user, 1),
            badgeName: "Bronze Badge",
            tier: "Bronze"
        });
        
        userBadges[1] = UserBadgeInfo({
            badgeId: 2,
            balance: loyaltyToken.balanceOf(user, 2),
            badgeName: "Silver Badge",
            tier: "Silver"
        });
        
        userBadges[2] = UserBadgeInfo({
            badgeId: 3,
            balance: loyaltyToken.balanceOf(user, 3),
            badgeName: "Gold Badge",
            tier: "Gold"
        });
        
        userBadges[3] = UserBadgeInfo({
            badgeId: 4,
            balance: loyaltyToken.balanceOf(user, 4),
            badgeName: "Diamond Badge",
            tier: "Diamond"
        });
        
        return userBadges;
    }
    
    function getUserHighestTier(address user) public view returns (uint256 highestTier, string memory tierName) {
        if (loyaltyToken.balanceOf(user, 4) > 0) {
            return (4, "Diamond");
        } else if (loyaltyToken.balanceOf(user, 3) > 0) {
            return (3, "Gold");
        } else if (loyaltyToken.balanceOf(user, 2) > 0) {
            return (2, "Silver");
        } else if (loyaltyToken.balanceOf(user, 1) > 0) {
            return (1, "Bronze");
        } else {
            return (0, "None");
        }
    }
    
    function checkAnyBadgeOwnership(address user) public view returns (bool) {
        for (uint256 i = 1; i <= 4; i++) {
            if (loyaltyToken.balanceOf(user, i) > 0) {
                return true;
            }
        }
        return false;
    }
    
    function checkMinimumTierRequirement(address user, uint256 minimumTier) public view returns (bool) {
        (uint256 highestTier,) = getUserHighestTier(user);
        return highestTier >= minimumTier;
    }
    
    function getTotalBadgeCount(address user) public view returns (uint256) {
        uint256 totalBadges = 0;
        for (uint256 i = 1; i <= 4; i++) {
            totalBadges += loyaltyToken.balanceOf(user, i);
        }
        return totalBadges;
    }
}