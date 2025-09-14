// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../core/LoyaltyToken.sol";

contract Shopfront is Ownable, ReentrancyGuard {
    IERC20 public paymentToken;
    LoyaltyToken public loyaltyToken;
    
    struct Item {
        uint256 id;
        string name;
        string description;
        string imageUrl;
        uint256 priceInUSDC;
        bool isActive;
        uint256 loyaltyBadgeId;
    }
    
    mapping(uint256 => Item) public items;
    mapping(address => uint256[]) public userPurchases;
    
    uint256 public itemCount;
    
    event ItemPurchased(
        address indexed buyer,
        uint256 indexed itemId,
        uint256 price,
        uint256 loyaltyBadgeAwarded
    );
    
    event ItemAdded(uint256 indexed itemId, string name, uint256 price);
    
    constructor(
        address _paymentToken,
        address _loyaltyToken
    ) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
        loyaltyToken = LoyaltyToken(_loyaltyToken);
        
        _addInitialItems();
    }
    
    function _addInitialItems() internal {
        addItem(
            "Exclusive Wallpaper NFT",
            "High-quality digital wallpaper collection",
            "https://ipfs.io/wallpaper.jpg",
            10 * 10**6, // 10 USDC
            1 // Bronze badge
        );
        
        addItem(
            "1-Month Premium Content Pass",
            "Access to premium content for 30 days",
            "https://ipfs.io/premium-pass.jpg",
            25 * 10**6, // 25 USDC
            2 // Silver badge
        );
        
        addItem(
            "Digital Sticker Pack",
            "Collection of unique digital stickers",
            "https://ipfs.io/stickers.jpg",
            5 * 10**6, // 5 USDC
            1 // Bronze badge
        );
    }
    
    function addItem(
        string memory name,
        string memory description,
        string memory imageUrl,
        uint256 priceInUSDC,
        uint256 loyaltyBadgeId
    ) public onlyOwner {
        itemCount++;
        items[itemCount] = Item({
            id: itemCount,
            name: name,
            description: description,
            imageUrl: imageUrl,
            priceInUSDC: priceInUSDC,
            isActive: true,
            loyaltyBadgeId: loyaltyBadgeId
        });
        
        emit ItemAdded(itemCount, name, priceInUSDC);
    }
    
    function updateItem(
        uint256 itemId,
        string memory name,
        string memory description,
        string memory imageUrl,
        uint256 priceInUSDC,
        bool isActive,
        uint256 loyaltyBadgeId
    ) public onlyOwner {
        require(itemId <= itemCount && itemId > 0, "Item does not exist");
        
        Item storage item = items[itemId];
        item.name = name;
        item.description = description;
        item.imageUrl = imageUrl;
        item.priceInUSDC = priceInUSDC;
        item.isActive = isActive;
        item.loyaltyBadgeId = loyaltyBadgeId;
    }
    
    function buyItem(uint256 itemId) public nonReentrant {
        require(itemId <= itemCount && itemId > 0, "Item does not exist");
        require(items[itemId].isActive, "Item is not active");
        
        Item memory item = items[itemId];
        
        require(
            paymentToken.transferFrom(msg.sender, owner(), item.priceInUSDC),
            "Payment failed"
        );
        
        userPurchases[msg.sender].push(itemId);
        
        loyaltyToken.mintBadge(msg.sender, item.loyaltyBadgeId, 1);
        
        emit ItemPurchased(msg.sender, itemId, item.priceInUSDC, item.loyaltyBadgeId);
    }
    
    function getItem(uint256 itemId) public view returns (Item memory) {
        require(itemId <= itemCount && itemId > 0, "Item does not exist");
        return items[itemId];
    }
    
    function getAllItems() public view returns (Item[] memory) {
        Item[] memory allItems = new Item[](itemCount);
        for (uint256 i = 1; i <= itemCount; i++) {
            allItems[i-1] = items[i];
        }
        return allItems;
    }
    
    function getUserPurchases(address user) public view returns (uint256[] memory) {
        return userPurchases[user];
    }
    
    function setPaymentToken(address _paymentToken) public onlyOwner {
        paymentToken = IERC20(_paymentToken);
    }
    
    function setLoyaltyToken(address _loyaltyToken) public onlyOwner {
        loyaltyToken = LoyaltyToken(_loyaltyToken);
    }
}