// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../core/LoyaltyToken.sol";

contract SubscriptionTiers is Ownable, ReentrancyGuard {
    IERC20 public paymentToken;
    LoyaltyToken public loyaltyToken;
    
    struct SubscriptionTier {
        uint256 id;
        string name;
        string description;
        uint256 monthlyPrice; // In USDC (6 decimals)
        uint256 annualPrice; // In USDC (6 decimals) - typically discounted
        bool isActive;
        string[] perks; // Array of perk descriptions
        uint256 loyaltyBadgeId; // Badge awarded to subscribers
        string contentIpfsHash; // IPFS hash for exclusive content
    }
    
    struct Subscription {
        uint256 tierId;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool isAnnual;
        uint256 amountPaid;
    }
    
    mapping(uint256 => SubscriptionTier) public subscriptionTiers;
    mapping(address => mapping(uint256 => Subscription)) public userSubscriptions; // user => tierId => subscription
    mapping(address => uint256[]) public userActiveTiers; // user => array of active tier IDs
    mapping(address => uint256) public userTotalSubscriptionSpent;
    
    uint256 public tierCount;
    uint256 private constant SECONDS_IN_MONTH = 30 days;
    uint256 private constant SECONDS_IN_YEAR = 365 days;
    
    event SubscriptionTierCreated(
        uint256 indexed tierId,
        string name,
        uint256 monthlyPrice,
        uint256 annualPrice
    );
    
    event SubscriptionPurchased(
        address indexed subscriber,
        uint256 indexed tierId,
        uint256 duration, // in seconds
        uint256 amountPaid,
        bool isAnnual
    );
    
    event SubscriptionRenewed(
        address indexed subscriber,
        uint256 indexed tierId,
        uint256 newEndTime,
        uint256 amountPaid
    );
    
    event SubscriptionCancelled(
        address indexed subscriber,
        uint256 indexed tierId
    );
    
    constructor(
        address _paymentToken,
        address _loyaltyToken
    ) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
        loyaltyToken = LoyaltyToken(_loyaltyToken);
        
        _createInitialTiers();
    }
    
    function _createInitialTiers() internal {
        // Basic Tier
        string[] memory basicPerks = new string[](3);
        basicPerks[0] = "Access to exclusive content feed";
        basicPerks[1] = "Monthly creator Q&A sessions";
        basicPerks[2] = "Subscriber-only Discord channel";
        
        createSubscriptionTier(
            "Basic Supporter",
            "Get access to exclusive content and community",
            2000000, // $2.00 monthly
            20000000, // $20.00 annually (2 months free)
            basicPerks,
            2, // Silver badge
            "QmBasicContentHash123"
        );
        
        // Premium Tier
        string[] memory premiumPerks = new string[](5);
        premiumPerks[0] = "All Basic tier benefits";
        premiumPerks[1] = "Early access to new products (24h before public)";
        premiumPerks[2] = "Monthly 1-on-1 video call (15 min)";
        premiumPerks[3] = "Exclusive NFT drops";
        premiumPerks[4] = "Input on future content direction";
        
        createSubscriptionTier(
            "Premium Supporter",
            "Premium access with direct creator interaction",
            5000000, // $5.00 monthly
            50000000, // $50.00 annually (2 months free)
            premiumPerks,
            3, // Gold badge
            "QmPremiumContentHash456"
        );
        
        // VIP Tier
        string[] memory vipPerks = new string[](6);
        vipPerks[0] = "All Premium tier benefits";
        vipPerks[1] = "Monthly exclusive physical merchandise";
        vipPerks[2] = "Quarterly 30-min private consulting session";
        vipPerks[3] = "Co-creation opportunities";
        vipPerks[4] = "VIP event invitations";
        vipPerks[5] = "Personal thank you message";
        
        createSubscriptionTier(
            "VIP Supporter",
            "Ultimate supporter experience with personal touch",
            15000000, // $15.00 monthly
            150000000, // $150.00 annually (2 months free)
            vipPerks,
            4, // Diamond badge
            "QmVIPContentHash789"
        );
    }
    
    function createSubscriptionTier(
        string memory name,
        string memory description,
        uint256 monthlyPrice,
        uint256 annualPrice,
        string[] memory perks,
        uint256 loyaltyBadgeId,
        string memory contentIpfsHash
    ) public onlyOwner {
        require(monthlyPrice > 0, "Monthly price must be greater than 0");
        require(annualPrice > 0, "Annual price must be greater than 0");
        require(bytes(name).length > 0, "Name cannot be empty");
        
        tierCount++;
        
        SubscriptionTier storage tier = subscriptionTiers[tierCount];
        tier.id = tierCount;
        tier.name = name;
        tier.description = description;
        tier.monthlyPrice = monthlyPrice;
        tier.annualPrice = annualPrice;
        tier.isActive = true;
        tier.loyaltyBadgeId = loyaltyBadgeId;
        tier.contentIpfsHash = contentIpfsHash;
        
        // Store perks
        for (uint256 i = 0; i < perks.length; i++) {
            tier.perks.push(perks[i]);
        }
        
        emit SubscriptionTierCreated(tierCount, name, monthlyPrice, annualPrice);
    }
    
    function subscribeToTier(uint256 tierId, bool isAnnual) external nonReentrant {
        require(tierId <= tierCount && tierId > 0, "Invalid tier ID");
        require(subscriptionTiers[tierId].isActive, "Tier is not active");
        
        SubscriptionTier memory tier = subscriptionTiers[tierId];
        uint256 price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
        uint256 duration = isAnnual ? SECONDS_IN_YEAR : SECONDS_IN_MONTH;
        
        // Check if user already has an active subscription to this tier
        Subscription storage existingSub = userSubscriptions[msg.sender][tierId];
        
        if (existingSub.isActive && existingSub.endTime > block.timestamp) {
            // Extend existing subscription
            existingSub.endTime += duration;
            existingSub.amountPaid += price;
            
            emit SubscriptionRenewed(msg.sender, tierId, existingSub.endTime, price);
        } else {
            // Create new subscription
            userSubscriptions[msg.sender][tierId] = Subscription({
                tierId: tierId,
                startTime: block.timestamp,
                endTime: block.timestamp + duration,
                isActive: true,
                isAnnual: isAnnual,
                amountPaid: price
            });
            
            // Add to user's active tiers if not already present
            bool tierExists = false;
            for (uint256 i = 0; i < userActiveTiers[msg.sender].length; i++) {
                if (userActiveTiers[msg.sender][i] == tierId) {
                    tierExists = true;
                    break;
                }
            }
            if (!tierExists) {
                userActiveTiers[msg.sender].push(tierId);
            }
            
            // Award loyalty badge
            loyaltyToken.mintBadge(msg.sender, tier.loyaltyBadgeId, 1);
            
            emit SubscriptionPurchased(msg.sender, tierId, duration, price, isAnnual);
        }
        
        // Transfer payment
        require(
            paymentToken.transferFrom(msg.sender, owner(), price),
            "Payment failed"
        );
        
        // Update user's total subscription spending
        userTotalSubscriptionSpent[msg.sender] += price;
    }
    
    function cancelSubscription(uint256 tierId) external {
        require(tierId <= tierCount && tierId > 0, "Invalid tier ID");
        
        Subscription storage sub = userSubscriptions[msg.sender][tierId];
        require(sub.isActive, "No active subscription found");
        
        sub.isActive = false;
        
        // Remove from active tiers array
        uint256[] storage activeTiers = userActiveTiers[msg.sender];
        for (uint256 i = 0; i < activeTiers.length; i++) {
            if (activeTiers[i] == tierId) {
                activeTiers[i] = activeTiers[activeTiers.length - 1];
                activeTiers.pop();
                break;
            }
        }
        
        emit SubscriptionCancelled(msg.sender, tierId);
    }
    
    function isSubscriptionActive(address user, uint256 tierId) public view returns (bool) {
        Subscription memory sub = userSubscriptions[user][tierId];
        return sub.isActive && sub.endTime > block.timestamp;
    }
    
    function hasAccessToTier(address user, uint256 tierId) public view returns (bool) {
        // Check direct subscription
        if (isSubscriptionActive(user, tierId)) {
            return true;
        }
        
        // Check if user has higher tier subscription (higher tier includes lower tier benefits)
        for (uint256 i = tierId + 1; i <= tierCount; i++) {
            if (isSubscriptionActive(user, i)) {
                return true;
            }
        }
        
        return false;
    }
    
    function getUserSubscriptionInfo(address user, uint256 tierId) external view returns (
        bool isActive,
        uint256 startTime,
        uint256 endTime,
        uint256 timeRemaining,
        bool isAnnual,
        uint256 amountPaid
    ) {
        Subscription memory sub = userSubscriptions[user][tierId];
        isActive = sub.isActive && sub.endTime > block.timestamp;
        startTime = sub.startTime;
        endTime = sub.endTime;
        timeRemaining = isActive ? sub.endTime - block.timestamp : 0;
        isAnnual = sub.isAnnual;
        amountPaid = sub.amountPaid;
    }
    
    function getUserActiveTiers(address user) external view returns (uint256[] memory activeTierIds, string[] memory tierNames) {
        uint256[] memory allUserTiers = userActiveTiers[user];
        uint256 activeCount = 0;
        
        // Count actually active subscriptions
        for (uint256 i = 0; i < allUserTiers.length; i++) {
            if (isSubscriptionActive(user, allUserTiers[i])) {
                activeCount++;
            }
        }
        
        activeTierIds = new uint256[](activeCount);
        tierNames = new string[](activeCount);
        
        uint256 index = 0;
        for (uint256 i = 0; i < allUserTiers.length; i++) {
            if (isSubscriptionActive(user, allUserTiers[i])) {
                activeTierIds[index] = allUserTiers[i];
                tierNames[index] = subscriptionTiers[allUserTiers[i]].name;
                index++;
            }
        }
    }
    
    function getSubscriptionTier(uint256 tierId) external view returns (
        string memory name,
        string memory description,
        uint256 monthlyPrice,
        uint256 annualPrice,
        bool isActive,
        string[] memory perks,
        uint256 loyaltyBadgeId,
        string memory contentIpfsHash
    ) {
        require(tierId <= tierCount && tierId > 0, "Invalid tier ID");
        
        SubscriptionTier memory tier = subscriptionTiers[tierId];
        return (
            tier.name,
            tier.description,
            tier.monthlyPrice,
            tier.annualPrice,
            tier.isActive,
            tier.perks,
            tier.loyaltyBadgeId,
            tier.contentIpfsHash
        );
    }
    
    function getAllSubscriptionTiers() external view returns (
        uint256[] memory tierIds,
        string[] memory names,
        uint256[] memory monthlyPrices,
        uint256[] memory annualPrices,
        bool[] memory activeStatus
    ) {
        tierIds = new uint256[](tierCount);
        names = new string[](tierCount);
        monthlyPrices = new uint256[](tierCount);
        annualPrices = new uint256[](tierCount);
        activeStatus = new bool[](tierCount);
        
        for (uint256 i = 1; i <= tierCount; i++) {
            SubscriptionTier memory tier = subscriptionTiers[i];
            tierIds[i-1] = tier.id;
            names[i-1] = tier.name;
            monthlyPrices[i-1] = tier.monthlyPrice;
            annualPrices[i-1] = tier.annualPrice;
            activeStatus[i-1] = tier.isActive;
        }
    }
    
    function updateTierStatus(uint256 tierId, bool isActive) external onlyOwner {
        require(tierId <= tierCount && tierId > 0, "Invalid tier ID");
        subscriptionTiers[tierId].isActive = isActive;
    }
    
    function updateTierPricing(uint256 tierId, uint256 newMonthlyPrice, uint256 newAnnualPrice) external onlyOwner {
        require(tierId <= tierCount && tierId > 0, "Invalid tier ID");
        require(newMonthlyPrice > 0 && newAnnualPrice > 0, "Prices must be greater than 0");
        
        subscriptionTiers[tierId].monthlyPrice = newMonthlyPrice;
        subscriptionTiers[tierId].annualPrice = newAnnualPrice;
    }
    
    function updateTierContent(uint256 tierId, string memory newContentHash) external onlyOwner {
        require(tierId <= tierCount && tierId > 0, "Invalid tier ID");
        subscriptionTiers[tierId].contentIpfsHash = newContentHash;
    }
    
    // Emergency function to clean up inactive subscriptions from user's active list
    function cleanupInactiveSubscriptions(address user) external {
        uint256[] storage activeTiers = userActiveTiers[user];
        
        for (uint256 i = activeTiers.length; i > 0; i--) {
            uint256 index = i - 1;
            if (!isSubscriptionActive(user, activeTiers[index])) {
                activeTiers[index] = activeTiers[activeTiers.length - 1];
                activeTiers.pop();
            }
        }
    }
    
    function getTotalSubscriptionRevenue() external view returns (uint256) {
        return paymentToken.balanceOf(owner());
    }
    
    function getSubscriptionStats() external view returns (
        uint256 totalTiers,
        uint256 totalRevenue
    ) {
        totalTiers = tierCount;
        totalRevenue = paymentToken.balanceOf(owner());
    }
}