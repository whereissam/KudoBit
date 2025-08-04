// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../core/LoyaltyToken.sol";

contract AffiliateProgram is Ownable, ReentrancyGuard {
    IERC20 public paymentToken;
    LoyaltyToken public loyaltyToken;
    
    struct AffiliateProfile {
        address affiliateAddress;
        bytes32 referralCode; // Unique referral code
        string displayName;
        string bio;
        uint256 joinedAt;
        uint256 totalReferrals;
        uint256 totalEarnings;
        uint256 pendingEarnings;
        bool isActive;
        bool isVerified;
        
        // Performance metrics
        uint256 creatorReferrals;
        uint256 buyerReferrals;
        uint256 subscriptionReferrals;
        uint256 totalSalesGenerated;
    }
    
    struct ReferralRecord {
        address referrer;
        address referee;
        bytes32 referralCode;
        uint256 timestamp;
        ReferralType referralType;
        uint256 purchaseAmount; // For purchase referrals
        bool hasReceivedBonus;
    }
    
    struct CommissionTier {
        string tierName;
        uint256 minReferrals;
        uint256 purchaseCommission; // Basis points (1% = 100)
        uint256 subscriptionCommission;
        uint256 creatorSignupBonus; // Fixed bonus for creator referrals
        uint256 buyerSignupBonus; // Fixed bonus for buyer referrals
    }
    
    enum ReferralType { BUYER_SIGNUP, CREATOR_SIGNUP, PURCHASE, SUBSCRIPTION }
    
    mapping(address => AffiliateProfile) public affiliates;
    mapping(bytes32 => address) public referralCodeToAffiliate;
    mapping(address => bytes32) public userReferralSource; // Track who referred each user
    mapping(address => ReferralRecord[]) public affiliateReferrals;
    mapping(uint256 => CommissionTier) public commissionTiers;
    
    address[] public activeAffiliates;
    uint256 public totalAffiliates;
    uint256 public totalReferrals;
    uint256 public totalCommissionsPaid;
    uint256 public tierCount;
    
    // Platform settings
    uint256 public minimumWithdrawal = 1000000; // $1.00 minimum withdrawal
    uint256 public cookieValidityPeriod = 2592000; // 30 days
    bool public programEnabled = true;
    
    event AffiliateRegistered(
        address indexed affiliate,
        bytes32 indexed referralCode,
        string displayName
    );
    
    event ReferralMade(
        address indexed referrer,
        address indexed referee,
        bytes32 indexed referralCode,
        ReferralType referralType,
        uint256 bonusAmount
    );
    
    event CommissionEarned(
        address indexed affiliate,
        uint256 amount,
        ReferralType referralType,
        address indexed referee
    );
    
    event CommissionWithdrawn(
        address indexed affiliate,
        uint256 amount
    );
    
    event TierUpdated(
        address indexed affiliate,
        uint256 newTier,
        string tierName
    );
    
    constructor(
        address _paymentToken,
        address _loyaltyToken
    ) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
        loyaltyToken = LoyaltyToken(_loyaltyToken);
        
        _createCommissionTiers();
    }
    
    function _createCommissionTiers() internal {
        // Bronze Tier - Entry level
        createCommissionTier(
            "Bronze Affiliate",
            0, // Min referrals
            200, // 2% purchase commission
            300, // 3% subscription commission
            500000, // $0.50 creator signup bonus
            100000  // $0.10 buyer signup bonus
        );
        
        // Silver Tier - 10+ referrals
        createCommissionTier(
            "Silver Affiliate",
            10,
            250, // 2.5% purchase commission
            350, // 3.5% subscription commission
            750000, // $0.75 creator signup bonus
            150000  // $0.15 buyer signup bonus
        );
        
        // Gold Tier - 50+ referrals
        createCommissionTier(
            "Gold Affiliate",
            50,
            300, // 3% purchase commission
            400, // 4% subscription commission
            1000000, // $1.00 creator signup bonus
            200000   // $0.20 buyer signup bonus
        );
        
        // Diamond Tier - 200+ referrals
        createCommissionTier(
            "Diamond Affiliate",
            200,
            400, // 4% purchase commission
            500, // 5% subscription commission
            2000000, // $2.00 creator signup bonus
            400000   // $0.40 buyer signup bonus
        );
    }
    
    function createCommissionTier(
        string memory tierName,
        uint256 minReferrals,
        uint256 purchaseCommission,
        uint256 subscriptionCommission,
        uint256 creatorSignupBonus,
        uint256 buyerSignupBonus
    ) public onlyOwner returns (uint256) {
        tierCount++;
        
        CommissionTier storage tier = commissionTiers[tierCount];
        tier.tierName = tierName;
        tier.minReferrals = minReferrals;
        tier.purchaseCommission = purchaseCommission;
        tier.subscriptionCommission = subscriptionCommission;
        tier.creatorSignupBonus = creatorSignupBonus;
        tier.buyerSignupBonus = buyerSignupBonus;
        
        return tierCount;
    }
    
    function registerAffiliate(
        string memory displayName,
        string memory bio
    ) external returns (bytes32) {
        require(!isAffiliate(msg.sender), "Already registered as affiliate");
        require(bytes(displayName).length > 0, "Display name required");
        require(programEnabled, "Affiliate program is disabled");
        
        // Generate unique referral code
        bytes32 referralCode = _generateReferralCode(msg.sender, displayName);
        require(referralCodeToAffiliate[referralCode] == address(0), "Code collision, try again");
        
        // Create affiliate profile
        AffiliateProfile storage affiliate = affiliates[msg.sender];
        affiliate.affiliateAddress = msg.sender;
        affiliate.referralCode = referralCode;
        affiliate.displayName = displayName;
        affiliate.bio = bio;
        affiliate.joinedAt = block.timestamp;
        affiliate.isActive = true;
        affiliate.isVerified = false;
        
        // Register referral code
        referralCodeToAffiliate[referralCode] = msg.sender;
        activeAffiliates.push(msg.sender);
        totalAffiliates++;
        
        emit AffiliateRegistered(msg.sender, referralCode, displayName);
        return referralCode;
    }
    
    function _generateReferralCode(address user, string memory displayName) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(
            user,
            displayName,
            block.timestamp,
            block.difficulty
        ));
    }
    
    function trackReferral(
        bytes32 referralCode,
        address newUser,
        ReferralType referralType,
        uint256 purchaseAmount
    ) external onlyOwner nonReentrant {
        require(referralCode != bytes32(0), "Invalid referral code");
        
        address referrer = referralCodeToAffiliate[referralCode];
        require(referrer != address(0), "Referral code not found");
        require(affiliates[referrer].isActive, "Affiliate not active");
        require(newUser != referrer, "Cannot refer yourself");
        
        // Check if user already has a referral source (prevent double attribution)
        if (userReferralSource[newUser] != bytes32(0)) {
            return; // Already referred by someone else
        }
        
        // Record referral source
        userReferralSource[newUser] = referralCode;
        
        // Create referral record
        ReferralRecord memory record = ReferralRecord({
            referrer: referrer,
            referee: newUser,
            referralCode: referralCode,
            timestamp: block.timestamp,
            referralType: referralType,
            purchaseAmount: purchaseAmount,
            hasReceivedBonus: false
        });
        
        affiliateReferrals[referrer].push(record);
        
        // Update affiliate stats
        AffiliateProfile storage affiliate = affiliates[referrer];
        affiliate.totalReferrals++;
        
        if (referralType == ReferralType.CREATOR_SIGNUP) {
            affiliate.creatorReferrals++;
        } else if (referralType == ReferralType.BUYER_SIGNUP) {
            affiliate.buyerReferrals++;
        } else if (referralType == ReferralType.SUBSCRIPTION) {
            affiliate.subscriptionReferrals++;
        }
        
        if (purchaseAmount > 0) {
            affiliate.totalSalesGenerated += purchaseAmount;
        }
        
        // Calculate and award commission
        uint256 commission = _calculateCommission(referrer, referralType, purchaseAmount);
        if (commission > 0) {
            affiliate.pendingEarnings += commission;
            affiliate.totalEarnings += commission;
            
            emit CommissionEarned(referrer, commission, referralType, newUser);
        }
        
        // Check for tier upgrade
        _checkTierUpgrade(referrer);
        
        totalReferrals++;
        
        emit ReferralMade(referrer, newUser, referralCode, referralType, commission);
    }
    
    function _calculateCommission(
        address referrer,
        ReferralType referralType,
        uint256 purchaseAmount
    ) internal view returns (uint256) {
        uint256 tierIndex = _getAffiliateTier(referrer);
        CommissionTier memory tier = commissionTiers[tierIndex];
        
        if (referralType == ReferralType.BUYER_SIGNUP) {
            return tier.buyerSignupBonus;
        } else if (referralType == ReferralType.CREATOR_SIGNUP) {
            return tier.creatorSignupBonus;
        } else if (referralType == ReferralType.PURCHASE) {
            return (purchaseAmount * tier.purchaseCommission) / 10000;
        } else if (referralType == ReferralType.SUBSCRIPTION) {
            return (purchaseAmount * tier.subscriptionCommission) / 10000;
        }
        
        return 0;
    }
    
    function _getAffiliateTier(address affiliate) internal view returns (uint256) {
        uint256 totalRefs = affiliates[affiliate].totalReferrals;
        
        // Find the highest tier the affiliate qualifies for
        uint256 qualifiedTier = 1; // Default to tier 1 (Bronze)
        
        for (uint256 i = 1; i <= tierCount; i++) {
            if (totalRefs >= commissionTiers[i].minReferrals) {
                qualifiedTier = i;
            }
        }
        
        return qualifiedTier;
    }
    
    function _checkTierUpgrade(address affiliate) internal {
        uint256 currentTier = _getAffiliateTier(affiliate);
        
        // Award loyalty badge for tier achievements
        if (currentTier >= 2) { // Silver tier or higher
            loyaltyToken.mintBadge(affiliate, currentTier, 1);
        }
        
        emit TierUpdated(affiliate, currentTier, commissionTiers[currentTier].tierName);
    }
    
    function withdrawCommissions() external nonReentrant {
        require(isAffiliate(msg.sender), "Not an affiliate");
        
        AffiliateProfile storage affiliate = affiliates[msg.sender];
        require(affiliate.pendingEarnings >= minimumWithdrawal, "Below minimum withdrawal amount");
        
        uint256 amount = affiliate.pendingEarnings;
        affiliate.pendingEarnings = 0;
        
        require(
            paymentToken.transfer(msg.sender, amount),
            "Commission withdrawal failed"
        );
        
        totalCommissionsPaid += amount;
        
        emit CommissionWithdrawn(msg.sender, amount);
    }
    
    function updateAffiliateProfile(
        string memory newDisplayName,
        string memory newBio
    ) external {
        require(isAffiliate(msg.sender), "Not an affiliate");
        require(bytes(newDisplayName).length > 0, "Display name required");
        
        AffiliateProfile storage affiliate = affiliates[msg.sender];
        affiliate.displayName = newDisplayName;
        affiliate.bio = newBio;
    }
    
    function verifyAffiliate(address affiliate) external onlyOwner {
        require(isAffiliate(affiliate), "Not an affiliate");
        affiliates[affiliate].isVerified = true;
        
        // Award verification badge
        loyaltyToken.mintBadge(affiliate, 4, 1); // Diamond badge for verification
    }
    
    function deactivateAffiliate(address affiliate) external onlyOwner {
        require(isAffiliate(affiliate), "Not an affiliate");
        affiliates[affiliate].isActive = false;
    }
    
    function isAffiliate(address user) public view returns (bool) {
        return affiliates[user].affiliateAddress != address(0);
    }
    
    function getAffiliateByCode(bytes32 referralCode) external view returns (
        address affiliateAddress,
        string memory displayName,
        bool isActive,
        bool isVerified
    ) {
        address affiliate = referralCodeToAffiliate[referralCode];
        require(affiliate != address(0), "Referral code not found");
        
        AffiliateProfile memory profile = affiliates[affiliate];
        return (
            profile.affiliateAddress,
            profile.displayName,
            profile.isActive,
            profile.isVerified
        );
    }
    
    function getAffiliateStats(address affiliate) external view returns (
        uint256 totalReferrals,
        uint256 totalEarnings,
        uint256 pendingEarnings,
        uint256 currentTier,
        string memory tierName,
        uint256 creatorReferrals,
        uint256 buyerReferrals,
        uint256 subscriptionReferrals,
        uint256 totalSalesGenerated
    ) {
        require(isAffiliate(affiliate), "Not an affiliate");
        
        AffiliateProfile memory profile = affiliates[affiliate];
        uint256 tier = _getAffiliateTier(affiliate);
        
        return (
            profile.totalReferrals,
            profile.totalEarnings,
            profile.pendingEarnings,
            tier,
            commissionTiers[tier].tierName,
            profile.creatorReferrals,
            profile.buyerReferrals,
            profile.subscriptionReferrals,
            profile.totalSalesGenerated
        );
    }
    
    function getAffiliateReferrals(address affiliate, uint256 limit) external view returns (
        address[] memory referees,
        ReferralType[] memory referralTypes,
        uint256[] memory timestamps,
        uint256[] memory purchaseAmounts
    ) {
        require(isAffiliate(affiliate), "Not an affiliate");
        
        ReferralRecord[] memory records = affiliateReferrals[affiliate];
        uint256 returnCount = records.length > limit ? limit : records.length;
        
        referees = new address[](returnCount);
        referralTypes = new ReferralType[](returnCount);
        timestamps = new uint256[](returnCount);
        purchaseAmounts = new uint256[](returnCount);
        
        // Return most recent referrals first
        for (uint256 i = 0; i < returnCount; i++) {
            uint256 index = records.length - 1 - i;
            referees[i] = records[index].referee;
            referralTypes[i] = records[index].referralType;
            timestamps[i] = records[index].timestamp;
            purchaseAmounts[i] = records[index].purchaseAmount;
        }
    }
    
    function getTopAffiliates(uint256 limit) external view returns (
        address[] memory affiliateAddresses,
        string[] memory displayNames,
        uint256[] memory totalReferrals,
        uint256[] memory totalEarnings
    ) {
        uint256 returnCount = activeAffiliates.length > limit ? limit : activeAffiliates.length;
        
        // Create temporary array for sorting
        address[] memory sortedAffiliates = new address[](activeAffiliates.length);
        for (uint256 i = 0; i < activeAffiliates.length; i++) {
            sortedAffiliates[i] = activeAffiliates[i];
        }
        
        // Simple bubble sort by total referrals (use more efficient algorithm in production)
        for (uint256 i = 0; i < sortedAffiliates.length; i++) {
            for (uint256 j = 0; j < sortedAffiliates.length - 1 - i; j++) {
                if (affiliates[sortedAffiliates[j]].totalReferrals < affiliates[sortedAffiliates[j + 1]].totalReferrals) {
                    address temp = sortedAffiliates[j];
                    sortedAffiliates[j] = sortedAffiliates[j + 1];
                    sortedAffiliates[j + 1] = temp;
                }
            }
        }
        
        affiliateAddresses = new address[](returnCount);
        displayNames = new string[](returnCount);
        totalReferrals = new uint256[](returnCount);
        totalEarnings = new uint256[](returnCount);
        
        for (uint256 i = 0; i < returnCount; i++) {
            address affiliate = sortedAffiliates[i];
            AffiliateProfile memory profile = affiliates[affiliate];
            
            affiliateAddresses[i] = affiliate;
            displayNames[i] = profile.displayName;
            totalReferrals[i] = profile.totalReferrals;
            totalEarnings[i] = profile.totalEarnings;
        }
    }
    
    function getReferralSource(address user) external view returns (bytes32) {
        return userReferralSource[user];
    }
    
    function getPlatformStats() external view returns (
        uint256 totalAffiliatesCount,
        uint256 totalReferralsCount,
        uint256 totalCommissionsPaidAmount,
        uint256 activeAffiliatesCount
    ) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < activeAffiliates.length; i++) {
            if (affiliates[activeAffiliates[i]].isActive) {
                activeCount++;
            }
        }
        
        return (
            totalAffiliates,
            totalReferrals,
            totalCommissionsPaid,
            activeCount
        );
    }
    
    // Admin functions
    function setProgramStatus(bool enabled) external onlyOwner {
        programEnabled = enabled;
    }
    
    function setMinimumWithdrawal(uint256 newMinimum) external onlyOwner {
        minimumWithdrawal = newMinimum;
    }
    
    function updateCommissionTier(
        uint256 tierId,
        uint256 minReferrals,
        uint256 purchaseCommission,
        uint256 subscriptionCommission,
        uint256 creatorSignupBonus,
        uint256 buyerSignupBonus
    ) external onlyOwner {
        require(tierId <= tierCount && tierId > 0, "Invalid tier ID");
        
        CommissionTier storage tier = commissionTiers[tierId];
        tier.minReferrals = minReferrals;
        tier.purchaseCommission = purchaseCommission;
        tier.subscriptionCommission = subscriptionCommission;
        tier.creatorSignupBonus = creatorSignupBonus;
        tier.buyerSignupBonus = buyerSignupBonus;
    }
    
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = paymentToken.balanceOf(address(this));
        require(balance > 0, "No funds to withdraw");
        require(paymentToken.transfer(owner(), balance), "Emergency withdrawal failed");
    }
}