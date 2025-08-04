// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./LoyaltyToken.sol";

contract CreatorStore is Ownable, ReentrancyGuard {
    IERC20 public paymentToken;
    LoyaltyToken public loyaltyToken;
    
    struct RoyaltySplit {
        address recipient;
        uint256 percentage; // Basis points (1% = 100, 100% = 10000)
    }
    
    struct Product {
        uint256 id;
        string name;
        string description;
        string ipfsContentHash;
        uint256 priceInUSDC;
        bool isActive;
        uint256 loyaltyBadgeId;
    }
    
    mapping(uint256 => Product) public products;
    mapping(uint256 => RoyaltySplit[]) public productRoyalties;
    mapping(address => uint256[]) public userPurchases;
    mapping(address => uint256) public userTotalSpent;
    mapping(address => uint256) public userPurchaseCount;
    
    uint256 public productCount;
    
    // Loyalty tier thresholds (in USDC with 6 decimals)
    uint256 public constant BRONZE_THRESHOLD = 100000; // 0.1 USDC
    uint256 public constant SILVER_THRESHOLD = 1000000; // 1.0 USDC  
    uint256 public constant GOLD_THRESHOLD = 5000000; // 5.0 USDC
    uint256 public constant DIAMOND_THRESHOLD = 10000000; // 10.0 USDC
    
    event ProductPurchased(
        address indexed buyer,
        uint256 indexed productId,
        uint256 price,
        uint256 loyaltyBadgeAwarded
    );
    
    event ProductListed(uint256 indexed productId, string name, uint256 price);
    
    event RoyaltyPaid(
        uint256 indexed productId,
        address indexed recipient,
        uint256 amount
    );
    
    constructor(
        address _paymentToken,
        address _loyaltyToken
    ) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
        loyaltyToken = LoyaltyToken(_loyaltyToken);
        
        _addInitialProducts();
    }
    
    function _addInitialProducts() internal {
        listProduct(
            "Exclusive Wallpaper NFT",
            "High-quality digital wallpaper collection",
            "QmWallpaperHash123",
            200000, // 0.2 USDC (6 decimals)
            1 // Bronze badge
        );
        
        listProduct(
            "1-Month Premium Content Pass",
            "Access to premium content for 30 days",
            "QmPremiumPassHash456",
            500000, // 0.5 USDC
            2 // Silver badge
        );
        
        listProduct(
            "Digital Sticker Pack",
            "Collection of unique digital stickers",
            "QmStickersHash789",
            50000, // 0.05 USDC - demonstrating micro-transactions
            1 // Bronze badge
        );
    }
    
    function listProduct(
        string memory name,
        string memory description,
        string memory ipfsContentHash,
        uint256 priceInUSDC,
        uint256 loyaltyBadgeId
    ) public onlyOwner {
        productCount++;
        products[productCount] = Product({
            id: productCount,
            name: name,
            description: description,
            ipfsContentHash: ipfsContentHash,
            priceInUSDC: priceInUSDC,
            isActive: true,
            loyaltyBadgeId: loyaltyBadgeId
        });
        
        emit ProductListed(productCount, name, priceInUSDC);
    }
    
    function listProductWithRoyalties(
        string memory name,
        string memory description,
        string memory ipfsContentHash,
        uint256 priceInUSDC,
        uint256 loyaltyBadgeId,
        address[] memory royaltyRecipients,
        uint256[] memory royaltyPercentages
    ) public onlyOwner {
        require(royaltyRecipients.length == royaltyPercentages.length, "Royalty arrays length mismatch");
        
        // Validate royalty percentages don't exceed 100%
        uint256 totalRoyalty = 0;
        for (uint256 i = 0; i < royaltyPercentages.length; i++) {
            require(royaltyRecipients[i] != address(0), "Invalid royalty recipient");
            require(royaltyPercentages[i] > 0, "Royalty percentage must be greater than 0");
            totalRoyalty += royaltyPercentages[i];
        }
        require(totalRoyalty <= 10000, "Total royalties cannot exceed 100%");
        
        productCount++;
        products[productCount] = Product({
            id: productCount,
            name: name,
            description: description,
            ipfsContentHash: ipfsContentHash,
            priceInUSDC: priceInUSDC,
            isActive: true,
            loyaltyBadgeId: loyaltyBadgeId
        });
        
        // Set royalty splits
        for (uint256 i = 0; i < royaltyRecipients.length; i++) {
            productRoyalties[productCount].push(RoyaltySplit({
                recipient: royaltyRecipients[i],
                percentage: royaltyPercentages[i]
            }));
        }
        
        emit ProductListed(productCount, name, priceInUSDC);
    }
    
    function updateProduct(
        uint256 productId,
        bool isActive
    ) public onlyOwner {
        require(productId <= productCount && productId > 0, "Product does not exist");
        products[productId].isActive = isActive;
    }
    
    function getAppropriateLoyaltyTier(address user, uint256 newSpendAmount) internal view returns (uint256) {
        uint256 totalSpent = userTotalSpent[user] + newSpendAmount;
        
        if (totalSpent >= DIAMOND_THRESHOLD) {
            return 4; // Diamond badge
        } else if (totalSpent >= GOLD_THRESHOLD) {
            return 3; // Gold badge
        } else if (totalSpent >= SILVER_THRESHOLD) {
            return 2; // Silver badge
        } else if (totalSpent >= BRONZE_THRESHOLD) {
            return 1; // Bronze badge
        }
        
        return 0; // No badge yet
    }
    
    function buyItem(uint256 productId) public nonReentrant {
        require(productId <= productCount && productId > 0, "Product does not exist");
        require(products[productId].isActive, "Product is not active");
        
        Product memory product = products[productId];
        
        // Transfer USDC from buyer to contract first for distribution
        require(
            paymentToken.transferFrom(msg.sender, address(this), product.priceInUSDC),
            "Payment failed"
        );
        
        // Distribute royalties if any exist
        uint256 totalRoyaltyPaid = 0;
        RoyaltySplit[] memory royalties = productRoyalties[productId];
        
        for (uint256 i = 0; i < royalties.length; i++) {
            uint256 royaltyAmount = (product.priceInUSDC * royalties[i].percentage) / 10000;
            totalRoyaltyPaid += royaltyAmount;
            
            require(
                paymentToken.transfer(royalties[i].recipient, royaltyAmount),
                "Royalty payment failed"
            );
            
            emit RoyaltyPaid(productId, royalties[i].recipient, royaltyAmount);
        }
        
        // Transfer remaining amount to creator (contract owner)
        uint256 creatorAmount = product.priceInUSDC - totalRoyaltyPaid;
        if (creatorAmount > 0) {
            require(
                paymentToken.transfer(owner(), creatorAmount),
                "Creator payment failed"
            );
        }
        
        // Update user spending and purchase count
        userTotalSpent[msg.sender] += product.priceInUSDC;
        userPurchaseCount[msg.sender] += 1;
        
        // Record purchase
        userPurchases[msg.sender].push(productId);
        
        // Determine appropriate loyalty tier based on total spending
        uint256 appropriateBadgeId = getAppropriateLoyaltyTier(msg.sender, 0); // 0 since we already added the amount above
        
        // Award loyalty badge automatically if user qualifies for a tier
        uint256 awardedBadgeId = product.loyaltyBadgeId; // Default to product's badge
        if (appropriateBadgeId > 0) {
            // Award the higher tier badge if user qualifies
            awardedBadgeId = appropriateBadgeId > product.loyaltyBadgeId ? appropriateBadgeId : product.loyaltyBadgeId;
            loyaltyToken.mintBadge(msg.sender, awardedBadgeId, 1);
        } else {
            // Award the product's default badge
            loyaltyToken.mintBadge(msg.sender, product.loyaltyBadgeId, 1);
        }
        
        emit ProductPurchased(msg.sender, productId, product.priceInUSDC, awardedBadgeId);
    }
    
    function getProduct(uint256 productId) public view returns (Product memory) {
        require(productId <= productCount && productId > 0, "Product does not exist");
        return products[productId];
    }
    
    function getAllProducts() public view returns (Product[] memory) {
        Product[] memory allProducts = new Product[](productCount);
        for (uint256 i = 1; i <= productCount; i++) {
            allProducts[i-1] = products[i];
        }
        return allProducts;
    }
    
    function getUserPurchases(address user) public view returns (uint256[] memory) {
        return userPurchases[user];
    }
    
    function getUserSpendingInfo(address user) public view returns (
        uint256 totalSpent,
        uint256 purchaseCount,
        uint256 currentLoyaltyTier
    ) {
        totalSpent = userTotalSpent[user];
        purchaseCount = userPurchaseCount[user];
        currentLoyaltyTier = getAppropriateLoyaltyTier(user, 0);
    }
    
    function getLoyaltyThresholds() public pure returns (
        uint256 bronze,
        uint256 silver,
        uint256 gold,
        uint256 diamond
    ) {
        return (BRONZE_THRESHOLD, SILVER_THRESHOLD, GOLD_THRESHOLD, DIAMOND_THRESHOLD);
    }
    
    function getProductRoyalties(uint256 productId) public view returns (RoyaltySplit[] memory) {
        require(productId <= productCount && productId > 0, "Product does not exist");
        return productRoyalties[productId];
    }
    
    function calculateRoyaltyDistribution(uint256 productId) public view returns (
        address[] memory recipients,
        uint256[] memory amounts,
        uint256 creatorAmount
    ) {
        require(productId <= productCount && productId > 0, "Product does not exist");
        
        Product memory product = products[productId];
        RoyaltySplit[] memory royalties = productRoyalties[productId];
        
        recipients = new address[](royalties.length);
        amounts = new uint256[](royalties.length);
        
        uint256 totalRoyaltyAmount = 0;
        for (uint256 i = 0; i < royalties.length; i++) {
            recipients[i] = royalties[i].recipient;
            amounts[i] = (product.priceInUSDC * royalties[i].percentage) / 10000;
            totalRoyaltyAmount += amounts[i];
        }
        
        creatorAmount = product.priceInUSDC - totalRoyaltyAmount;
    }
    
    function withdrawFunds() public onlyOwner {
        uint256 balance = paymentToken.balanceOf(address(this));
        require(balance > 0, "No funds to withdraw");
        require(paymentToken.transfer(owner(), balance), "Withdrawal failed");
    }
    
    function setPaymentToken(address _paymentToken) public onlyOwner {
        paymentToken = IERC20(_paymentToken);
    }
    
    function setLoyaltyToken(address _loyaltyToken) public onlyOwner {
        loyaltyToken = LoyaltyToken(_loyaltyToken);
    }
}