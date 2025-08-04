// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./LoyaltyToken.sol";

contract SecondaryMarketplace is Ownable, ReentrancyGuard {
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
        address creator; // Original creator for royalty purposes
        uint256 creatorRoyaltyPercentage; // Creator's royalty on resales (basis points)
    }
    
    struct ResaleListing {
        uint256 id;
        uint256 productId;
        address seller;
        uint256 resalePrice;
        bool isActive;
        uint256 listedAt;
    }
    
    struct Purchase {
        uint256 productId;
        address buyer;
        uint256 pricePaid;
        uint256 purchasedAt;
        bool isResold; // Track if this purchase has been resold
    }
    
    // Core mappings
    mapping(uint256 => Product) public products;
    mapping(uint256 => RoyaltySplit[]) public productRoyalties;
    mapping(address => uint256[]) public userPurchases;
    mapping(address => uint256) public userTotalSpent;
    mapping(address => uint256) public userPurchaseCount;
    
    // Secondary market mappings
    mapping(uint256 => ResaleListing) public resaleListings;
    mapping(address => uint256[]) public userResaleListings;
    mapping(uint256 => Purchase[]) public productPurchaseHistory; // Track all purchases of a product
    mapping(address => mapping(uint256 => bool)) public userOwnsProduct; // user => productId => owns
    mapping(address => mapping(uint256 => uint256)) public userProductPurchaseCount; // user => productId => count
    
    uint256 public productCount;
    uint256 public resaleListingCount;
    
    // Default royalty percentage for creators on resales (5% = 500 basis points)
    uint256 public constant DEFAULT_CREATOR_ROYALTY = 500; // 5%
    uint256 public constant PLATFORM_FEE = 250; // 2.5% platform fee on resales
    
    // Loyalty tier thresholds (in USDC with 6 decimals)
    uint256 public constant BRONZE_THRESHOLD = 100000; // 0.1 USDC
    uint256 public constant SILVER_THRESHOLD = 1000000; // 1.0 USDC  
    uint256 public constant GOLD_THRESHOLD = 5000000; // 5.0 USDC
    uint256 public constant DIAMOND_THRESHOLD = 10000000; // 10.0 USDC
    
    // Events
    event ProductPurchased(
        address indexed buyer,
        uint256 indexed productId,
        uint256 price,
        uint256 loyaltyBadgeAwarded,
        bool isResale
    );
    
    event ProductListed(uint256 indexed productId, string name, uint256 price, address creator);
    
    event ResaleListed(
        uint256 indexed resaleId,
        uint256 indexed productId,
        address indexed seller,
        uint256 resalePrice
    );
    
    event ResaleCancelled(uint256 indexed resaleId, address indexed seller);
    
    event RoyaltyPaid(
        uint256 indexed productId,
        address indexed recipient,
        uint256 amount,
        string royaltyType
    );
    
    event CreatorNotified(
        uint256 indexed productId,
        address indexed seller,
        address indexed creator,
        uint256 resalePrice
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
            1, // Bronze badge
            msg.sender, // creator
            DEFAULT_CREATOR_ROYALTY // 5% creator royalty
        );
        
        listProduct(
            "1-Month Premium Content Pass",
            "Access to premium content for 30 days",
            "QmPremiumPassHash456",
            500000, // 0.5 USDC
            2, // Silver badge
            msg.sender, // creator
            DEFAULT_CREATOR_ROYALTY // 5% creator royalty
        );
        
        listProduct(
            "Digital Sticker Pack",
            "Collection of unique digital stickers",
            "QmStickersHash789",
            50000, // 0.05 USDC - demonstrating micro-transactions
            1, // Bronze badge
            msg.sender, // creator
            DEFAULT_CREATOR_ROYALTY // 5% creator royalty
        );
    }
    
    function listProduct(
        string memory name,
        string memory description,
        string memory ipfsContentHash,
        uint256 priceInUSDC,
        uint256 loyaltyBadgeId,
        address creator,
        uint256 creatorRoyaltyPercentage
    ) public onlyOwner {
        require(creatorRoyaltyPercentage <= 1000, "Creator royalty cannot exceed 10%");
        
        productCount++;
        
        products[productCount] = Product({
            id: productCount,
            name: name,
            description: description,
            ipfsContentHash: ipfsContentHash,
            priceInUSDC: priceInUSDC,
            isActive: true,
            loyaltyBadgeId: loyaltyBadgeId,
            creator: creator,
            creatorRoyaltyPercentage: creatorRoyaltyPercentage
        });
        
        emit ProductListed(productCount, name, priceInUSDC, creator);
    }
    
    function listProductWithRoyalties(
        string memory name,
        string memory description,
        string memory ipfsContentHash,
        uint256 priceInUSDC,
        uint256 loyaltyBadgeId,
        address creator,
        uint256 creatorRoyaltyPercentage,
        address[] memory royaltyRecipients,
        uint256[] memory royaltyPercentages
    ) public onlyOwner {
        require(royaltyRecipients.length == royaltyPercentages.length, "Royalty arrays length mismatch");
        require(creatorRoyaltyPercentage <= 1000, "Creator royalty cannot exceed 10%");
        
        listProduct(name, description, ipfsContentHash, priceInUSDC, loyaltyBadgeId, creator, creatorRoyaltyPercentage);
        
        // Add additional royalty recipients
        uint256 totalRoyaltyPercentage = 0;
        for (uint256 i = 0; i < royaltyRecipients.length; i++) {
            require(royaltyPercentages[i] > 0, "Royalty percentage must be greater than 0");
            totalRoyaltyPercentage += royaltyPercentages[i];
            
            productRoyalties[productCount].push(RoyaltySplit({
                recipient: royaltyRecipients[i],
                percentage: royaltyPercentages[i]
            }));
        }
        
        // Ensure total royalties + creator royalty + platform fee don't exceed 100%
        require(
            totalRoyaltyPercentage + creatorRoyaltyPercentage + PLATFORM_FEE <= 10000,
            "Total royalties exceed 100%"
        );
    }
    
    // Primary purchase function
    function buyItem(uint256 productId) public nonReentrant {
        require(productId <= productCount && productId > 0, "Product does not exist");
        require(products[productId].isActive, "Product is not active");
        
        Product memory product = products[productId];
        
        // Transfer USDC from buyer to contract
        require(
            paymentToken.transferFrom(msg.sender, address(this), product.priceInUSDC),
            "Payment failed"
        );
        
        // Distribute primary royalties if any exist
        uint256 totalRoyaltyPaid = 0;
        RoyaltySplit[] memory royalties = productRoyalties[productId];
        
        for (uint256 i = 0; i < royalties.length; i++) {
            uint256 royaltyAmount = (product.priceInUSDC * royalties[i].percentage) / 10000;
            totalRoyaltyPaid += royaltyAmount;
            
            require(
                paymentToken.transfer(royalties[i].recipient, royaltyAmount),
                "Royalty payment failed"
            );
            
            emit RoyaltyPaid(productId, royalties[i].recipient, royaltyAmount, "primary");
        }
        
        // Transfer remaining amount to creator
        uint256 creatorAmount = product.priceInUSDC - totalRoyaltyPaid;
        if (creatorAmount > 0) {
            require(
                paymentToken.transfer(product.creator, creatorAmount),
                "Creator payment failed"
            );
        }
        
        _processPurchase(msg.sender, productId, product.priceInUSDC, false);
    }
    
    // List item for resale
    function listForResale(uint256 productId, uint256 resalePrice) public {
        require(productId <= productCount && productId > 0, "Product does not exist");
        require(userOwnsProduct[msg.sender][productId], "You don't own this product");
        require(resalePrice > 0, "Resale price must be greater than 0");
        
        resaleListingCount++;
        
        resaleListings[resaleListingCount] = ResaleListing({
            id: resaleListingCount,
            productId: productId,
            seller: msg.sender,
            resalePrice: resalePrice,
            isActive: true,
            listedAt: block.timestamp
        });
        
        userResaleListings[msg.sender].push(resaleListingCount);
        
        // Notify creator about the resale listing
        Product memory product = products[productId];
        emit CreatorNotified(productId, msg.sender, product.creator, resalePrice);
        emit ResaleListed(resaleListingCount, productId, msg.sender, resalePrice);
    }
    
    // Buy from resale market
    function buyResaleItem(uint256 resaleId) public nonReentrant {
        require(resaleId <= resaleListingCount && resaleId > 0, "Resale listing does not exist");
        require(resaleListings[resaleId].isActive, "Resale listing is not active");
        require(resaleListings[resaleId].seller != msg.sender, "Cannot buy your own listing");
        
        ResaleListing memory listing = resaleListings[resaleId];
        Product memory product = products[listing.productId];
        
        // Transfer USDC from buyer to contract
        require(
            paymentToken.transferFrom(msg.sender, address(this), listing.resalePrice),
            "Payment failed"
        );
        
        // Calculate and distribute fees
        uint256 platformFeeAmount = (listing.resalePrice * PLATFORM_FEE) / 10000;
        uint256 creatorRoyaltyAmount = (listing.resalePrice * product.creatorRoyaltyPercentage) / 10000;
        uint256 sellerAmount = listing.resalePrice - platformFeeAmount - creatorRoyaltyAmount;
        
        // Pay platform fee to contract owner
        if (platformFeeAmount > 0) {
            require(
                paymentToken.transfer(owner(), platformFeeAmount),
                "Platform fee payment failed"
            );
            emit RoyaltyPaid(listing.productId, owner(), platformFeeAmount, "platform");
        }
        
        // Pay creator royalty
        if (creatorRoyaltyAmount > 0) {
            require(
                paymentToken.transfer(product.creator, creatorRoyaltyAmount),
                "Creator royalty payment failed"
            );
            emit RoyaltyPaid(listing.productId, product.creator, creatorRoyaltyAmount, "creator");
        }
        
        // Pay seller
        require(
            paymentToken.transfer(listing.seller, sellerAmount),
            "Seller payment failed"
        );
        
        // Update ownership
        userOwnsProduct[listing.seller][listing.productId] = false;
        
        // Deactivate the listing
        resaleListings[resaleId].isActive = false;
        
        _processPurchase(msg.sender, listing.productId, listing.resalePrice, true);
    }
    
    // Cancel resale listing
    function cancelResaleListing(uint256 resaleId) public {
        require(resaleId <= resaleListingCount && resaleId > 0, "Resale listing does not exist");
        require(resaleListings[resaleId].seller == msg.sender, "Only seller can cancel listing");
        require(resaleListings[resaleId].isActive, "Listing is already inactive");
        
        resaleListings[resaleId].isActive = false;
        emit ResaleCancelled(resaleId, msg.sender);
    }
    
    // Internal function to process purchases (primary and resale)
    function _processPurchase(address buyer, uint256 productId, uint256 pricePaid, bool isResale) internal {
        Product memory product = products[productId];
        
        // Update user spending and purchase count
        userTotalSpent[buyer] += pricePaid;
        userPurchaseCount[buyer] += 1;
        
        // Record purchase
        userPurchases[buyer].push(productId);
        productPurchaseHistory[productId].push(Purchase({
            productId: productId,
            buyer: buyer,
            pricePaid: pricePaid,
            purchasedAt: block.timestamp,
            isResold: false
        }));
        
        // Update ownership
        userOwnsProduct[buyer][productId] = true;
        userProductPurchaseCount[buyer][productId] += 1;
        
        // Determine appropriate loyalty tier based on total spending
        uint256 appropriateBadgeId = getAppropriateLoyaltyTier(buyer, 0);
        
        // Award loyalty badge
        uint256 awardedBadgeId = product.loyaltyBadgeId;
        if (appropriateBadgeId > 0) {
            awardedBadgeId = appropriateBadgeId > product.loyaltyBadgeId ? appropriateBadgeId : product.loyaltyBadgeId;
            loyaltyToken.mintBadge(buyer, awardedBadgeId, 1);
        } else {
            loyaltyToken.mintBadge(buyer, product.loyaltyBadgeId, 1);
        }
        
        emit ProductPurchased(buyer, productId, pricePaid, awardedBadgeId, isResale);
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
    
    // View functions
    function getProduct(uint256 productId) public view returns (Product memory) {
        require(productId <= productCount && productId > 0, "Product does not exist");
        return products[productId];
    }
    
    function getResaleListing(uint256 resaleId) public view returns (ResaleListing memory) {
        require(resaleId <= resaleListingCount && resaleId > 0, "Resale listing does not exist");
        return resaleListings[resaleId];
    }
    
    function getAllActiveResaleListings() public view returns (ResaleListing[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= resaleListingCount; i++) {
            if (resaleListings[i].isActive) {
                activeCount++;
            }
        }
        
        ResaleListing[] memory activeListings = new ResaleListing[](activeCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= resaleListingCount; i++) {
            if (resaleListings[i].isActive) {
                activeListings[index] = resaleListings[i];
                index++;
            }
        }
        
        return activeListings;
    }
    
    function getUserResaleListings(address user) public view returns (uint256[] memory) {
        return userResaleListings[user];
    }
    
    function getProductPurchaseHistory(uint256 productId) public view returns (Purchase[] memory) {
        require(productId <= productCount && productId > 0, "Product does not exist");
        return productPurchaseHistory[productId];
    }
    
    function userCanResell(address user, uint256 productId) public view returns (bool) {
        return userOwnsProduct[user][productId];
    }
    
    function calculateResaleFees(uint256 resalePrice, uint256 productId) public view returns (
        uint256 platformFee,
        uint256 creatorRoyalty,
        uint256 sellerAmount
    ) {
        require(productId <= productCount && productId > 0, "Product does not exist");
        
        Product memory product = products[productId];
        platformFee = (resalePrice * PLATFORM_FEE) / 10000;
        creatorRoyalty = (resalePrice * product.creatorRoyaltyPercentage) / 10000;
        sellerAmount = resalePrice - platformFee - creatorRoyalty;
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
    
    function getUserOwnedProducts(address user) public view returns (uint256[] memory) {
        uint256 ownedCount = 0;
        for (uint256 i = 1; i <= productCount; i++) {
            if (userOwnsProduct[user][i]) {
                ownedCount++;
            }
        }
        
        uint256[] memory ownedProducts = new uint256[](ownedCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= productCount; i++) {
            if (userOwnsProduct[user][i]) {
                ownedProducts[index] = i;
                index++;
            }
        }
        
        return ownedProducts;
    }
}