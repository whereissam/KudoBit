// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../core/LoyaltyToken.sol";

contract PerksRegistry is Ownable {
    struct Perk {
        uint256 id;
        address creator;
        string name;
        string description;
        string perkType; // "discount", "exclusive_content", "early_access", etc.
        uint256 requiredBadgeId;
        address requiredBadgeContract;
        uint256 minimumBadgeAmount;
        string metadata; // JSON metadata or IPFS hash
        bool isActive;
        uint256 usageLimit; // 0 = unlimited
        uint256 timesUsed;
        uint256 expirationTimestamp; // 0 = no expiration
        string redemptionCode; // Optional redemption code
    }
    
    struct PerkRedemption {
        uint256 perkId;
        address user;
        uint256 timestamp;
        string additionalData; // Any additional redemption data
    }
    
    mapping(uint256 => Perk) public perks;
    mapping(address => uint256[]) public creatorPerks;
    mapping(uint256 => PerkRedemption[]) public perkRedemptions;
    mapping(address => mapping(uint256 => bool)) public userPerkRedeemed; // user => perkId => redeemed
    
    uint256 public perkCount;
    LoyaltyToken public loyaltyToken;
    
    event PerkCreated(
        uint256 indexed perkId,
        address indexed creator,
        string name,
        uint256 requiredBadgeId,
        address requiredBadgeContract
    );
    
    event PerkRedeemed(
        uint256 indexed perkId,
        address indexed user,
        address indexed creator,
        uint256 timestamp
    );
    
    event PerkStatusUpdated(uint256 indexed perkId, bool isActive);
    
    constructor(address _loyaltyTokenAddress) Ownable(msg.sender) {
        loyaltyToken = LoyaltyToken(_loyaltyTokenAddress);
    }
    
    function createPerk(
        string memory name,
        string memory description,
        string memory perkType,
        uint256 requiredBadgeId,
        address requiredBadgeContract,
        uint256 minimumBadgeAmount,
        string memory metadata,
        uint256 usageLimit,
        uint256 expirationTimestamp,
        string memory redemptionCode
    ) public returns (uint256) {
        require(bytes(name).length > 0, "Perk name cannot be empty");
        require(requiredBadgeId > 0, "Invalid badge ID");
        require(requiredBadgeContract != address(0), "Invalid badge contract");
        require(minimumBadgeAmount > 0, "Minimum badge amount must be greater than 0");
        
        perkCount++;
        
        perks[perkCount] = Perk({
            id: perkCount,
            creator: msg.sender,
            name: name,
            description: description,
            perkType: perkType,
            requiredBadgeId: requiredBadgeId,
            requiredBadgeContract: requiredBadgeContract,
            minimumBadgeAmount: minimumBadgeAmount,
            metadata: metadata,
            isActive: true,
            usageLimit: usageLimit,
            timesUsed: 0,
            expirationTimestamp: expirationTimestamp,
            redemptionCode: redemptionCode
        });
        
        creatorPerks[msg.sender].push(perkCount);
        
        emit PerkCreated(perkCount, msg.sender, name, requiredBadgeId, requiredBadgeContract);
        
        return perkCount;
    }
    
    function checkPerkEligibility(address user, uint256 perkId) public view returns (bool eligible, string memory reason) {
        require(perkId <= perkCount && perkId > 0, "Perk does not exist");
        
        Perk memory perk = perks[perkId];
        
        if (!perk.isActive) {
            return (false, "Perk is not active");
        }
        
        if (perk.expirationTimestamp > 0 && block.timestamp > perk.expirationTimestamp) {
            return (false, "Perk has expired");
        }
        
        if (perk.usageLimit > 0 && perk.timesUsed >= perk.usageLimit) {
            return (false, "Perk usage limit reached");
        }
        
        if (userPerkRedeemed[user][perkId]) {
            return (false, "User has already redeemed this perk");
        }
        
        // Check badge ownership
        LoyaltyToken badgeContract = LoyaltyToken(perk.requiredBadgeContract);
        uint256 userBadgeBalance = badgeContract.balanceOf(user, perk.requiredBadgeId);
        
        if (userBadgeBalance < perk.minimumBadgeAmount) {
            return (false, "Insufficient badge balance");
        }
        
        return (true, "Eligible");
    }
    
    function redeemPerk(uint256 perkId, string memory additionalData) public {
        (bool eligible, string memory reason) = checkPerkEligibility(msg.sender, perkId);
        require(eligible, reason);
        
        Perk storage perk = perks[perkId];
        
        // Mark as redeemed
        userPerkRedeemed[msg.sender][perkId] = true;
        perk.timesUsed++;
        
        // Record redemption
        perkRedemptions[perkId].push(PerkRedemption({
            perkId: perkId,
            user: msg.sender,
            timestamp: block.timestamp,
            additionalData: additionalData
        }));
        
        emit PerkRedeemed(perkId, msg.sender, perk.creator, block.timestamp);
    }
    
    function updatePerkStatus(uint256 perkId, bool isActive) public {
        require(perkId <= perkCount && perkId > 0, "Perk does not exist");
        require(perks[perkId].creator == msg.sender || msg.sender == owner(), "Not authorized");
        
        perks[perkId].isActive = isActive;
        emit PerkStatusUpdated(perkId, isActive);
    }
    
    function getPerk(uint256 perkId) public view returns (Perk memory) {
        require(perkId <= perkCount && perkId > 0, "Perk does not exist");
        return perks[perkId];
    }
    
    function getCreatorPerks(address creator) public view returns (uint256[] memory) {
        return creatorPerks[creator];
    }
    
    function getPerkRedemptions(uint256 perkId) public view returns (PerkRedemption[] memory) {
        require(perkId <= perkCount && perkId > 0, "Perk does not exist");
        require(perks[perkId].creator == msg.sender || msg.sender == owner(), "Not authorized");
        return perkRedemptions[perkId];
    }
    
    function getAllActivePerks() public view returns (Perk[] memory) {
        // Count active perks first
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= perkCount; i++) {
            if (perks[i].isActive && 
                (perks[i].expirationTimestamp == 0 || block.timestamp <= perks[i].expirationTimestamp) &&
                (perks[i].usageLimit == 0 || perks[i].timesUsed < perks[i].usageLimit)) {
                activeCount++;
            }
        }
        
        // Create array of active perks
        Perk[] memory activePerks = new Perk[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= perkCount; i++) {
            if (perks[i].isActive && 
                (perks[i].expirationTimestamp == 0 || block.timestamp <= perks[i].expirationTimestamp) &&
                (perks[i].usageLimit == 0 || perks[i].timesUsed < perks[i].usageLimit)) {
                activePerks[index] = perks[i];
                index++;
            }
        }
        
        return activePerks;
    }
    
    function getEligiblePerksForUser(address user) public view returns (Perk[] memory) {
        // Count eligible perks first
        uint256 eligibleCount = 0;
        for (uint256 i = 1; i <= perkCount; i++) {
            (bool eligible,) = checkPerkEligibility(user, i);
            if (eligible) {
                eligibleCount++;
            }
        }
        
        // Create array of eligible perks
        Perk[] memory eligiblePerks = new Perk[](eligibleCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= perkCount; i++) {
            (bool eligible,) = checkPerkEligibility(user, i);
            if (eligible) {
                eligiblePerks[index] = perks[i];
                index++;
            }
        }
        
        return eligiblePerks;
    }
}