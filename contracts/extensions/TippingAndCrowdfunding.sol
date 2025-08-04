// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../core/LoyaltyToken.sol";

contract TippingAndCrowdfunding is Ownable, ReentrancyGuard {
    IERC20 public paymentToken;
    LoyaltyToken public loyaltyToken;
    
    enum CampaignStatus { ACTIVE, COMPLETED, CANCELLED, EXPIRED }
    
    struct Tip {
        address tipper;
        address recipient;
        uint256 amount;
        string message;
        uint256 timestamp;
        bool isAnonymous;
    }
    
    struct CrowdfundingCampaign {
        uint256 id;
        address creator;
        string title;
        string description;
        string mediaIpfsHash; // Image/video for campaign
        uint256 goalAmount;
        uint256 raisedAmount;
        uint256 startTime;
        uint256 endTime;
        CampaignStatus status;
        string[] milestones; // Array of milestone descriptions
        uint256 minimumContribution;
        uint256 maxContributors; // 0 for unlimited
        uint256 contributorCount;
    }
    
    struct Contribution {
        address contributor;
        uint256 campaignId;
        uint256 amount;
        string message;
        uint256 timestamp;
        bool isAnonymous;
        bool refunded;
    }
    
    struct CreatorProfile {
        address creator;
        string name;
        string bio;
        string profileImageHash;
        uint256 totalTipsReceived;
        uint256 totalTipCount;
        uint256 totalCrowdfundingRaised;
        uint256 activeCampaignsCount;
        bool isVerified;
    }
    
    mapping(address => Tip[]) public creatorTips; // creator => tips received
    mapping(address => uint256) public creatorTotalTips;
    mapping(address => mapping(address => uint256)) public tipperToCreatorTotal; // tipper => creator => total tipped
    
    mapping(uint256 => CrowdfundingCampaign) public campaigns;
    mapping(uint256 => Contribution[]) public campaignContributions;
    mapping(address => uint256[]) public creatorCampaigns; // creator => campaign IDs
    mapping(address => uint256[]) public userContributions; // user => campaign IDs contributed to
    
    mapping(address => CreatorProfile) public creatorProfiles;
    address[] public verifiedCreators;
    
    uint256 public campaignCount;
    uint256 public totalTipsAmount;
    uint256 public totalCrowdfundingAmount;
    uint256 public platformFeePercentage = 250; // 2.5% in basis points
    
    // Tip thresholds for loyalty badges (in USDC with 6 decimals)
    uint256 public constant TIP_BRONZE_THRESHOLD = 1000000; // $1.00
    uint256 public constant TIP_SILVER_THRESHOLD = 5000000; // $5.00
    uint256 public constant TIP_GOLD_THRESHOLD = 20000000; // $20.00
    uint256 public constant TIP_DIAMOND_THRESHOLD = 50000000; // $50.00
    
    event TipSent(
        address indexed tipper,
        address indexed recipient,
        uint256 amount,
        string message,
        bool isAnonymous,
        uint256 timestamp
    );
    
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        string title,
        uint256 goalAmount,
        uint256 endTime
    );
    
    event ContributionMade(
        uint256 indexed campaignId,
        address indexed contributor,
        uint256 amount,
        string message,
        bool isAnonymous
    );
    
    event CampaignCompleted(
        uint256 indexed campaignId,
        uint256 totalRaised,
        uint256 contributorCount
    );
    
    event CampaignCancelled(
        uint256 indexed campaignId,
        uint256 refundAmount
    );
    
    event CreatorVerified(
        address indexed creator,
        string name
    );
    
    constructor(
        address _paymentToken,
        address _loyaltyToken
    ) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
        loyaltyToken = LoyaltyToken(_loyaltyToken);
    }
    
    function createCreatorProfile(
        string memory name,
        string memory bio,
        string memory profileImageHash
    ) external {
        require(bytes(name).length > 0, "Name cannot be empty");
        
        CreatorProfile storage profile = creatorProfiles[msg.sender];
        profile.creator = msg.sender;
        profile.name = name;
        profile.bio = bio;
        profile.profileImageHash = profileImageHash;
        
        // Initialize other fields if this is a new profile
        if (profile.totalTipsReceived == 0) {
            profile.totalTipCount = 0;
            profile.totalCrowdfundingRaised = 0;
            profile.activeCampaignsCount = 0;
            profile.isVerified = false;
        }
    }
    
    function tipCreator(
        address creator,
        uint256 amount,
        string memory message,
        bool isAnonymous
    ) external nonReentrant {
        require(creator != address(0), "Invalid creator address");
        require(creator != msg.sender, "Cannot tip yourself");
        require(amount > 0, "Tip amount must be greater than 0");
        require(bytes(creatorProfiles[creator].name).length > 0, "Creator profile not found");
        
        // Calculate platform fee and creator amount
        uint256 platformFee = (amount * platformFeePercentage) / 10000;
        uint256 creatorAmount = amount - platformFee;
        
        // Transfer payment
        require(
            paymentToken.transferFrom(msg.sender, address(this), amount),
            "Payment transfer failed"
        );
        
        // Transfer to creator
        require(
            paymentToken.transfer(creator, creatorAmount),
            "Creator payment failed"
        );
        
        // Keep platform fee in contract
        
        // Record tip
        Tip memory newTip = Tip({
            tipper: isAnonymous ? address(0) : msg.sender,
            recipient: creator,
            amount: creatorAmount,
            message: message,
            timestamp: block.timestamp,
            isAnonymous: isAnonymous
        });
        
        creatorTips[creator].push(newTip);
        creatorTotalTips[creator] += creatorAmount;
        tipperToCreatorTotal[msg.sender][creator] += creatorAmount;
        totalTipsAmount += creatorAmount;
        
        // Update creator profile
        creatorProfiles[creator].totalTipsReceived += creatorAmount;
        creatorProfiles[creator].totalTipCount += 1;
        
        // Award loyalty badge to tipper based on total tips given to this creator
        uint256 totalTippedToCreator = tipperToCreatorTotal[msg.sender][creator];
        uint256 badgeToAward = _getTipLoyaltyBadge(totalTippedToCreator);
        
        if (badgeToAward > 0) {
            loyaltyToken.mintBadge(msg.sender, badgeToAward, 1);
        }
        
        emit TipSent(msg.sender, creator, creatorAmount, message, isAnonymous, block.timestamp);
    }
    
    function createCrowdfundingCampaign(
        string memory title,
        string memory description,
        string memory mediaIpfsHash,
        uint256 goalAmount,
        uint256 durationInDays,
        string[] memory milestones,
        uint256 minimumContribution,
        uint256 maxContributors
    ) external returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(goalAmount > 0, "Goal amount must be greater than 0");
        require(durationInDays > 0 && durationInDays <= 365, "Duration must be between 1-365 days");
        require(bytes(creatorProfiles[msg.sender].name).length > 0, "Creator profile required");
        
        campaignCount++;
        uint256 endTime = block.timestamp + (durationInDays * 1 days);
        
        CrowdfundingCampaign storage campaign = campaigns[campaignCount];
        campaign.id = campaignCount;
        campaign.creator = msg.sender;
        campaign.title = title;
        campaign.description = description;
        campaign.mediaIpfsHash = mediaIpfsHash;
        campaign.goalAmount = goalAmount;
        campaign.raisedAmount = 0;
        campaign.startTime = block.timestamp;
        campaign.endTime = endTime;
        campaign.status = CampaignStatus.ACTIVE;
        campaign.minimumContribution = minimumContribution;
        campaign.maxContributors = maxContributors;
        campaign.contributorCount = 0;
        
        // Store milestones
        for (uint256 i = 0; i < milestones.length; i++) {
            campaign.milestones.push(milestones[i]);
        }
        
        // Add to creator's campaigns
        creatorCampaigns[msg.sender].push(campaignCount);
        creatorProfiles[msg.sender].activeCampaignsCount += 1;
        
        emit CampaignCreated(campaignCount, msg.sender, title, goalAmount, endTime);
        return campaignCount;
    }
    
    function contributeToCompaign(
        uint256 campaignId,
        uint256 amount,
        string memory message,
        bool isAnonymous
    ) external nonReentrant {
        require(campaignId <= campaignCount && campaignId > 0, "Campaign does not exist");
        require(amount > 0, "Contribution must be greater than 0");
        
        CrowdfundingCampaign storage campaign = campaigns[campaignId];
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign is not active");
        require(block.timestamp <= campaign.endTime, "Campaign has ended");
        require(amount >= campaign.minimumContribution, "Below minimum contribution");
        
        // Check contributor limit
        if (campaign.maxContributors > 0) {
            require(campaign.contributorCount < campaign.maxContributors, "Campaign is full");
        }
        
        // Calculate platform fee and campaign amount
        uint256 platformFee = (amount * platformFeePercentage) / 10000;
        uint256 campaignAmount = amount - platformFee;
        
        // Transfer payment to contract (funds held until campaign completion/cancellation)
        require(
            paymentToken.transferFrom(msg.sender, address(this), amount),
            "Payment transfer failed"
        );
        
        // Record contribution
        Contribution memory contribution = Contribution({
            contributor: isAnonymous ? address(0) : msg.sender,
            campaignId: campaignId,
            amount: campaignAmount,
            message: message,
            timestamp: block.timestamp,
            isAnonymous: isAnonymous,
            refunded: false
        });
        
        campaignContributions[campaignId].push(contribution);
        campaign.raisedAmount += campaignAmount;
        
        // Check if this is a new contributor
        bool isNewContributor = true;
        uint256[] storage userContribs = userContributions[msg.sender];
        for (uint256 i = 0; i < userContribs.length; i++) {
            if (userContribs[i] == campaignId) {
                isNewContributor = false;
                break;
            }
        }
        
        if (isNewContributor) {
            userContributions[msg.sender].push(campaignId);
            campaign.contributorCount += 1;
        }
        
        totalCrowdfundingAmount += campaignAmount;
        
        // Check if campaign reached its goal
        if (campaign.raisedAmount >= campaign.goalAmount) {
            _completeCampaign(campaignId);
        }
        
        emit ContributionMade(campaignId, msg.sender, campaignAmount, message, isAnonymous);
    }
    
    function _completeCampaign(uint256 campaignId) internal {
        CrowdfundingCampaign storage campaign = campaigns[campaignId];
        campaign.status = CampaignStatus.COMPLETED;
        
        // Transfer raised funds to creator
        require(
            paymentToken.transfer(campaign.creator, campaign.raisedAmount),
            "Transfer to creator failed"
        );
        
        // Update creator profile
        creatorProfiles[campaign.creator].totalCrowdfundingRaised += campaign.raisedAmount;
        creatorProfiles[campaign.creator].activeCampaignsCount -= 1;
        
        // Award special badge to creator for successful crowdfunding
        loyaltyToken.mintBadge(campaign.creator, 3, 1); // Gold badge for successful campaign
        
        emit CampaignCompleted(campaignId, campaign.raisedAmount, campaign.contributorCount);
    }
    
    function cancelCampaign(uint256 campaignId) external {
        require(campaignId <= campaignCount && campaignId > 0, "Campaign does not exist");
        
        CrowdfundingCampaign storage campaign = campaigns[campaignId];
        require(campaign.creator == msg.sender, "Only creator can cancel campaign");
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign is not active");
        
        campaign.status = CampaignStatus.CANCELLED;
        
        // Refund all contributions
        Contribution[] storage contributions = campaignContributions[campaignId];
        for (uint256 i = 0; i < contributions.length; i++) {
            if (!contributions[i].refunded && contributions[i].contributor != address(0)) {
                contributions[i].refunded = true;
                require(
                    paymentToken.transfer(contributions[i].contributor, contributions[i].amount),
                    "Refund failed"
                );
            }
        }
        
        // Update creator profile
        creatorProfiles[campaign.creator].activeCampaignsCount -= 1;
        
        emit CampaignCancelled(campaignId, campaign.raisedAmount);
    }
    
    function expireCampaign(uint256 campaignId) external {
        require(campaignId <= campaignCount && campaignId > 0, "Campaign does not exist");
        
        CrowdfundingCampaign storage campaign = campaigns[campaignId];
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign is not active");
        require(block.timestamp > campaign.endTime, "Campaign has not ended yet");
        
        if (campaign.raisedAmount >= campaign.goalAmount) {
            // Campaign was successful, complete it
            _completeCampaign(campaignId);
        } else {
            // Campaign failed, mark as expired and refund
            campaign.status = CampaignStatus.EXPIRED;
            
            // Refund all contributions
            Contribution[] storage contributions = campaignContributions[campaignId];
            for (uint256 i = 0; i < contributions.length; i++) {
                if (!contributions[i].refunded && contributions[i].contributor != address(0)) {
                    contributions[i].refunded = true;
                    require(
                        paymentToken.transfer(contributions[i].contributor, contributions[i].amount),
                        "Refund failed"
                    );
                }
            }
            
            // Update creator profile
            creatorProfiles[campaign.creator].activeCampaignsCount -= 1;
        }
    }
    
    function verifyCreator(address creator) external onlyOwner {
        require(bytes(creatorProfiles[creator].name).length > 0, "Creator profile not found");
        require(!creatorProfiles[creator].isVerified, "Creator already verified");
        
        creatorProfiles[creator].isVerified = true;
        verifiedCreators.push(creator);
        
        // Award verification badge
        loyaltyToken.mintBadge(creator, 4, 1); // Diamond badge for verification
        
        emit CreatorVerified(creator, creatorProfiles[creator].name);
    }
    
    function _getTipLoyaltyBadge(uint256 totalTipped) internal pure returns (uint256) {
        if (totalTipped >= TIP_DIAMOND_THRESHOLD) return 4; // Diamond
        if (totalTipped >= TIP_GOLD_THRESHOLD) return 3; // Gold
        if (totalTipped >= TIP_SILVER_THRESHOLD) return 2; // Silver
        if (totalTipped >= TIP_BRONZE_THRESHOLD) return 1; // Bronze
        return 0; // No badge
    }
    
    function getCreatorTips(address creator, uint256 limit) external view returns (
        address[] memory tippers,
        uint256[] memory amounts,
        string[] memory messages,
        uint256[] memory timestamps,
        bool[] memory isAnonymousArray
    ) {
        Tip[] memory tips = creatorTips[creator];
        uint256 returnCount = tips.length > limit ? limit : tips.length;
        
        tippers = new address[](returnCount);
        amounts = new uint256[](returnCount);
        messages = new string[](returnCount);
        timestamps = new uint256[](returnCount);
        isAnonymousArray = new bool[](returnCount);
        
        // Return most recent tips first
        for (uint256 i = 0; i < returnCount; i++) {
            uint256 tipIndex = tips.length - 1 - i;
            tippers[i] = tips[tipIndex].tipper;
            amounts[i] = tips[tipIndex].amount;
            messages[i] = tips[tipIndex].message;
            timestamps[i] = tips[tipIndex].timestamp;
            isAnonymousArray[i] = tips[tipIndex].isAnonymous;
        }
    }
    
    function getCampaignContributions(uint256 campaignId, uint256 limit) external view returns (
        address[] memory contributors,
        uint256[] memory amounts,
        string[] memory messages,
        uint256[] memory timestamps,
        bool[] memory isAnonymousArray
    ) {
        require(campaignId <= campaignCount && campaignId > 0, "Campaign does not exist");
        
        Contribution[] memory contributions = campaignContributions[campaignId];
        uint256 returnCount = contributions.length > limit ? limit : contributions.length;
        
        contributors = new address[](returnCount);
        amounts = new uint256[](returnCount);
        messages = new string[](returnCount);
        timestamps = new uint256[](returnCount);
        isAnonymousArray = new bool[](returnCount);
        
        // Return most recent contributions first
        for (uint256 i = 0; i < returnCount; i++) {
            uint256 contribIndex = contributions.length - 1 - i;
            contributors[i] = contributions[contribIndex].contributor;
            amounts[i] = contributions[contribIndex].amount;
            messages[i] = contributions[contribIndex].message;
            timestamps[i] = contributions[contribIndex].timestamp;
            isAnonymousArray[i] = contributions[contribIndex].isAnonymous;
        }
    }
    
    function getCreatorCampaigns(address creator) external view returns (uint256[] memory) {
        return creatorCampaigns[creator];
    }
    
    function getUserContributions(address user) external view returns (uint256[] memory) {
        return userContributions[user];
    }
    
    function getVerifiedCreators() external view returns (address[] memory) {
        return verifiedCreators;
    }
    
    function getPlatformStats() external view returns (
        uint256 totalTips,
        uint256 totalCrowdfunding,
        uint256 activeCampaigns,
        uint256 totalCreators,
        uint256 verifiedCreatorCount
    ) {
        uint256 activeCount = 0;
        uint256 creatorCount = 0;
        
        for (uint256 i = 1; i <= campaignCount; i++) {
            if (campaigns[i].status == CampaignStatus.ACTIVE) {
                activeCount++;
            }
        }
        
        // This is a simplified count - in practice you'd want to track this more efficiently
        totalTips = totalTipsAmount;
        totalCrowdfunding = totalCrowdfundingAmount;
        activeCampaigns = activeCount;
        totalCreators = creatorCount; // Would need proper tracking
        verifiedCreatorCount = verifiedCreators.length;
    }
    
    function setPlatformFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 1000, "Fee cannot exceed 10%"); // 10% max
        platformFeePercentage = newFeePercentage;
    }
    
    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = paymentToken.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        
        // Calculate platform fees held (this is simplified - ideally track separately)
        require(paymentToken.transfer(owner(), balance), "Withdrawal failed");
    }
}