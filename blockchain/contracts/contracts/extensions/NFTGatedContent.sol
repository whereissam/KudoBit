// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../core/LoyaltyToken.sol";
import "./SubscriptionTiers.sol";

contract NFTGatedContent is Ownable {
    LoyaltyToken public loyaltyToken;
    SubscriptionTiers public subscriptionTiers;
    
    enum TokenStandard { ERC721, ERC1155 }
    enum AccessLevel { PUBLIC, BRONZE, SILVER, GOLD, DIAMOND, SUBSCRIPTION_BASIC, SUBSCRIPTION_PREMIUM, SUBSCRIPTION_VIP, CUSTOM_NFT }
    
    struct ContentGate {
        uint256 id;
        string name;
        string description;
        string ipfsContentHash;
        AccessLevel accessLevel;
        bool isActive;
        uint256 createdAt;
        
        // For custom NFT gating
        address customNftContract;
        TokenStandard tokenStandard;
        uint256[] requiredTokenIds; // For specific token ID requirements
        uint256 minimumBalance; // Minimum tokens required to hold
        
        // For subscription gating
        uint256 requiredSubscriptionTier;
        
        // For loyalty badge gating
        uint256 requiredLoyaltyBadge;
        uint256 minimumLoyaltyBalance;
    }
    
    struct AccessLog {
        address user;
        uint256 contentId;
        uint256 timestamp;
        AccessLevel accessMethod;
    }
    
    mapping(uint256 => ContentGate) public contentGates;
    mapping(address => mapping(uint256 => bool)) public userContentAccess; // user => contentId => hasAccess
    mapping(uint256 => AccessLog[]) public contentAccessLogs; // contentId => access logs
    mapping(address => uint256[]) public userAccessedContent; // user => contentIds accessed
    
    uint256 public contentCount;
    uint256 private constant MAX_ACCESS_LOGS = 1000; // Prevent unbounded array growth
    
    event ContentGateCreated(
        uint256 indexed contentId,
        string name,
        AccessLevel accessLevel,
        address indexed creator
    );
    
    event ContentAccessed(
        address indexed user,
        uint256 indexed contentId,
        AccessLevel accessMethod,
        uint256 timestamp
    );
    
    event AccessGranted(
        address indexed user,
        uint256 indexed contentId,
        address indexed grantedBy
    );
    
    event AccessRevoked(
        address indexed user,
        uint256 indexed contentId,
        address indexed revokedBy
    );
    
    constructor(
        address _loyaltyToken,
        address _subscriptionTiers
    ) Ownable(msg.sender) {
        loyaltyToken = LoyaltyToken(_loyaltyToken);
        subscriptionTiers = SubscriptionTiers(_subscriptionTiers);
        
        _createInitialContent();
    }
    
    function _createInitialContent() internal {
        // Bronze tier exclusive wallpapers
        createLoyaltyGatedContent(
            "Bronze Exclusive Wallpapers",
            "High-resolution wallpaper collection for Bronze tier supporters",
            "QmBronzeWallpapersHash123",
            1, // Bronze badge
            1 // Minimum 1 badge required
        );
        
        // Gold tier behind-the-scenes content
        createLoyaltyGatedContent(
            "Gold Behind-the-Scenes Videos",
            "Exclusive behind-the-scenes content creation process",
            "QmGoldBTSHash456",
            3, // Gold badge
            1
        );
        
        // Premium subscription exclusive tutorials
        createSubscriptionGatedContent(
            "Premium Tutorial Series",
            "Step-by-step advanced tutorials for premium subscribers",
            "QmPremiumTutorialsHash789",
            2 // Premium subscription tier
        );
        
        // VIP subscription private community access
        createSubscriptionGatedContent(
            "VIP Private Community Access",
            "Access to exclusive VIP community and direct creator interaction",
            "QmVIPCommunityHash101",
            3 // VIP subscription tier
        );
    }
    
    function createLoyaltyGatedContent(
        string memory name,
        string memory description,
        string memory ipfsContentHash,
        uint256 requiredLoyaltyBadge,
        uint256 minimumLoyaltyBalance
    ) public onlyOwner returns (uint256) {
        contentCount++;
        
        ContentGate storage gate = contentGates[contentCount];
        gate.id = contentCount;
        gate.name = name;
        gate.description = description;
        gate.ipfsContentHash = ipfsContentHash;
        gate.accessLevel = _loyaltyBadgeToAccessLevel(requiredLoyaltyBadge);
        gate.isActive = true;
        gate.createdAt = block.timestamp;
        gate.requiredLoyaltyBadge = requiredLoyaltyBadge;
        gate.minimumLoyaltyBalance = minimumLoyaltyBalance;
        
        emit ContentGateCreated(contentCount, name, gate.accessLevel, msg.sender);
        return contentCount;
    }
    
    function createSubscriptionGatedContent(
        string memory name,
        string memory description,
        string memory ipfsContentHash,
        uint256 requiredSubscriptionTier
    ) public onlyOwner returns (uint256) {
        contentCount++;
        
        ContentGate storage gate = contentGates[contentCount];
        gate.id = contentCount;
        gate.name = name;
        gate.description = description;
        gate.ipfsContentHash = ipfsContentHash;
        gate.accessLevel = _subscriptionTierToAccessLevel(requiredSubscriptionTier);
        gate.isActive = true;
        gate.createdAt = block.timestamp;
        gate.requiredSubscriptionTier = requiredSubscriptionTier;
        
        emit ContentGateCreated(contentCount, name, gate.accessLevel, msg.sender);
        return contentCount;
    }
    
    function createCustomNFTGatedContent(
        string memory name,
        string memory description,
        string memory ipfsContentHash,
        address customNftContract,
        TokenStandard tokenStandard,
        uint256[] memory requiredTokenIds,
        uint256 minimumBalance
    ) public onlyOwner returns (uint256) {
        require(customNftContract != address(0), "Invalid NFT contract address");
        require(minimumBalance > 0, "Minimum balance must be greater than 0");
        
        contentCount++;
        
        ContentGate storage gate = contentGates[contentCount];
        gate.id = contentCount;
        gate.name = name;
        gate.description = description;
        gate.ipfsContentHash = ipfsContentHash;
        gate.accessLevel = AccessLevel.CUSTOM_NFT;
        gate.isActive = true;
        gate.createdAt = block.timestamp;
        gate.customNftContract = customNftContract;
        gate.tokenStandard = tokenStandard;
        gate.minimumBalance = minimumBalance;
        
        // Store required token IDs
        for (uint256 i = 0; i < requiredTokenIds.length; i++) {
            gate.requiredTokenIds.push(requiredTokenIds[i]);
        }
        
        emit ContentGateCreated(contentCount, name, AccessLevel.CUSTOM_NFT, msg.sender);
        return contentCount;
    }
    
    function checkAccess(address user, uint256 contentId) public view returns (bool hasAccess, string memory reason) {
        require(contentId <= contentCount && contentId > 0, "Content does not exist");
        
        ContentGate memory gate = contentGates[contentId];
        
        if (!gate.isActive) {
            return (false, "Content is not active");
        }
        
        // Check manual access grants first
        if (userContentAccess[user][contentId]) {
            return (true, "Manual access granted");
        }
        
        // Check based on access level
        if (gate.accessLevel == AccessLevel.PUBLIC) {
            return (true, "Public content");
        }
        
        // Check loyalty badge access
        if (gate.accessLevel >= AccessLevel.BRONZE && gate.accessLevel <= AccessLevel.DIAMOND) {
            uint256 userBalance = loyaltyToken.balanceOf(user, gate.requiredLoyaltyBadge);
            if (userBalance >= gate.minimumLoyaltyBalance) {
                return (true, "Loyalty badge requirement met");
            }
            
            // Check if user has higher tier badge
            for (uint256 badgeId = gate.requiredLoyaltyBadge + 1; badgeId <= 4; badgeId++) {
                if (loyaltyToken.balanceOf(user, badgeId) > 0) {
                    return (true, "Higher tier loyalty badge held");
                }
            }
            
            return (false, "Insufficient loyalty badge");
        }
        
        // Check subscription access
        if (gate.accessLevel >= AccessLevel.SUBSCRIPTION_BASIC && gate.accessLevel <= AccessLevel.SUBSCRIPTION_VIP) {
            if (subscriptionTiers.hasAccessToTier(user, gate.requiredSubscriptionTier)) {
                return (true, "Subscription requirement met");
            }
            return (false, "Subscription requirement not met");
        }
        
        // Check custom NFT access
        if (gate.accessLevel == AccessLevel.CUSTOM_NFT) {
            if (gate.tokenStandard == TokenStandard.ERC721) {
                IERC721 nftContract = IERC721(gate.customNftContract);
                
                if (gate.requiredTokenIds.length > 0) {
                    // Check specific token IDs
                    for (uint256 i = 0; i < gate.requiredTokenIds.length; i++) {
                        try nftContract.ownerOf(gate.requiredTokenIds[i]) returns (address tokenOwner) {
                            if (tokenOwner == user) {
                                return (true, "Required NFT owned");
                            }
                        } catch {
                            continue;
                        }
                    }
                    return (false, "Required NFT not owned");
                } else {
                    // Check minimum balance
                    uint256 balance = nftContract.balanceOf(user);
                    if (balance >= gate.minimumBalance) {
                        return (true, "NFT balance requirement met");
                    }
                    return (false, "Insufficient NFT balance");
                }
            } else if (gate.tokenStandard == TokenStandard.ERC1155) {
                IERC1155 nftContract = IERC1155(gate.customNftContract);
                
                if (gate.requiredTokenIds.length > 0) {
                    // Check specific token IDs
                    for (uint256 i = 0; i < gate.requiredTokenIds.length; i++) {
                        uint256 balance = nftContract.balanceOf(user, gate.requiredTokenIds[i]);
                        if (balance >= gate.minimumBalance) {
                            return (true, "Required ERC1155 token owned");
                        }
                    }
                    return (false, "Required ERC1155 tokens not owned");
                }
            }
        }
        
        return (false, "Access requirements not met");
    }
    
    function accessContent(uint256 contentId) external returns (bool success, string memory contentHash) {
        (bool hasAccess, string memory reason) = checkAccess(msg.sender, contentId);
        
        if (!hasAccess) {
            return (false, reason);
        }
        
        ContentGate memory gate = contentGates[contentId];
        
        // Log access
        _logAccess(msg.sender, contentId, gate.accessLevel);
        
        // Add to user's accessed content if not already there
        bool alreadyAccessed = false;
        uint256[] storage userContent = userAccessedContent[msg.sender];
        for (uint256 i = 0; i < userContent.length; i++) {
            if (userContent[i] == contentId) {
                alreadyAccessed = true;
                break;
            }
        }
        
        if (!alreadyAccessed) {
            userAccessedContent[msg.sender].push(contentId);
        }
        
        emit ContentAccessed(msg.sender, contentId, gate.accessLevel, block.timestamp);
        
        return (true, gate.ipfsContentHash);
    }
    
    function _logAccess(address user, uint256 contentId, AccessLevel accessMethod) internal {
        AccessLog[] storage logs = contentAccessLogs[contentId];
        
        // Prevent unbounded growth by removing oldest entries
        if (logs.length >= MAX_ACCESS_LOGS) {
            for (uint256 i = 0; i < logs.length - 1; i++) {
                logs[i] = logs[i + 1];
            }
            logs.pop();
        }
        
        logs.push(AccessLog({
            user: user,
            contentId: contentId,
            timestamp: block.timestamp,
            accessMethod: accessMethod
        }));
    }
    
    function grantAccess(address user, uint256 contentId) external onlyOwner {
        require(contentId <= contentCount && contentId > 0, "Content does not exist");
        
        userContentAccess[user][contentId] = true;
        
        emit AccessGranted(user, contentId, msg.sender);
    }
    
    function revokeAccess(address user, uint256 contentId) external onlyOwner {
        require(contentId <= contentCount && contentId > 0, "Content does not exist");
        
        userContentAccess[user][contentId] = false;
        
        emit AccessRevoked(user, contentId, msg.sender);
    }
    
    function getContentGate(uint256 contentId) external view returns (
        string memory name,
        string memory description,
        AccessLevel accessLevel,
        bool isActive,
        uint256 createdAt,
        address customNftContract,
        uint256[] memory requiredTokenIds,
        uint256 minimumBalance
    ) {
        require(contentId <= contentCount && contentId > 0, "Content does not exist");
        
        ContentGate memory gate = contentGates[contentId];
        return (
            gate.name,
            gate.description,
            gate.accessLevel,
            gate.isActive,
            gate.createdAt,
            gate.customNftContract,
            gate.requiredTokenIds,
            gate.minimumBalance
        );
    }
    
    function getUserAccessibleContent(address user) external view returns (
        uint256[] memory contentIds,
        string[] memory names,
        bool[] memory accessStatus
    ) {
        uint256 accessibleCount = 0;
        
        // Count accessible content
        for (uint256 i = 1; i <= contentCount; i++) {
            (bool hasAccess,) = checkAccess(user, i);
            if (hasAccess) {
                accessibleCount++;
            }
        }
        
        contentIds = new uint256[](accessibleCount);
        names = new string[](accessibleCount);
        accessStatus = new bool[](accessibleCount);
        
        uint256 index = 0;
        for (uint256 i = 1; i <= contentCount; i++) {
            (bool hasAccess,) = checkAccess(user, i);
            if (hasAccess) {
                contentIds[index] = i;
                names[index] = contentGates[i].name;
                accessStatus[index] = true;
                index++;
            }
        }
    }
    
    function getUserAccessedContent(address user) external view returns (uint256[] memory) {
        return userAccessedContent[user];
    }
    
    function getContentAccessLogs(uint256 contentId, uint256 limit) external view returns (
        address[] memory users,
        uint256[] memory timestamps,
        AccessLevel[] memory accessMethods
    ) {
        require(contentId <= contentCount && contentId > 0, "Content does not exist");
        
        AccessLog[] memory logs = contentAccessLogs[contentId];
        uint256 returnCount = logs.length > limit ? limit : logs.length;
        
        users = new address[](returnCount);
        timestamps = new uint256[](returnCount);
        accessMethods = new AccessLevel[](returnCount);
        
        // Return most recent logs first
        for (uint256 i = 0; i < returnCount; i++) {
            uint256 logIndex = logs.length - 1 - i;
            users[i] = logs[logIndex].user;
            timestamps[i] = logs[logIndex].timestamp;
            accessMethods[i] = logs[logIndex].accessMethod;
        }
    }
    
    function updateContentStatus(uint256 contentId, bool isActive) external onlyOwner {
        require(contentId <= contentCount && contentId > 0, "Content does not exist");
        contentGates[contentId].isActive = isActive;
    }
    
    function updateContentHash(uint256 contentId, string memory newIpfsHash) external onlyOwner {
        require(contentId <= contentCount && contentId > 0, "Content does not exist");
        contentGates[contentId].ipfsContentHash = newIpfsHash;
    }
    
    function _loyaltyBadgeToAccessLevel(uint256 badgeId) internal pure returns (AccessLevel) {
        if (badgeId == 1) return AccessLevel.BRONZE;
        if (badgeId == 2) return AccessLevel.SILVER;
        if (badgeId == 3) return AccessLevel.GOLD;
        if (badgeId == 4) return AccessLevel.DIAMOND;
        return AccessLevel.BRONZE; // Default
    }
    
    function _subscriptionTierToAccessLevel(uint256 tierId) internal pure returns (AccessLevel) {
        if (tierId == 1) return AccessLevel.SUBSCRIPTION_BASIC;
        if (tierId == 2) return AccessLevel.SUBSCRIPTION_PREMIUM;
        if (tierId == 3) return AccessLevel.SUBSCRIPTION_VIP;
        return AccessLevel.SUBSCRIPTION_BASIC; // Default
    }
    
    function getContentStats() external view returns (
        uint256 totalContent,
        uint256 activeContent,
        uint256 totalAccesses
    ) {
        totalContent = contentCount;
        
        uint256 activeCount = 0;
        uint256 totalAccessCount = 0;
        
        for (uint256 i = 1; i <= contentCount; i++) {
            if (contentGates[i].isActive) {
                activeCount++;
            }
            totalAccessCount += contentAccessLogs[i].length;
        }
        
        activeContent = activeCount;
        totalAccesses = totalAccessCount;
    }
}