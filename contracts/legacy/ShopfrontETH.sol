// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../core/LoyaltyToken.sol";

contract ShopfrontETH is Ownable, ReentrancyGuard {
    LoyaltyToken public loyaltyToken;
    
    struct Item {
        uint256 id;
        string name;
        string description;
        string imageUrl;
        uint256 priceInETH;
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
    
    constructor(address _loyaltyToken) Ownable(msg.sender) {
        loyaltyToken = LoyaltyToken(_loyaltyToken);
        _addInitialItems();
    }
    
    function _addInitialItems() internal {
        addItem(
            "Premium Digital Art Pack",
            "Exclusive collection of high-resolution digital artwork",
            "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
            0.001 ether, // 0.001 ETH
            2 // Silver badge
        );
        
        addItem(
            "Music Production Samples",
            "Professional-grade audio samples and loops",
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
            0.002 ether, // 0.002 ETH
            3 // Gold badge
        );
        
        addItem(
            "Stock Photo Bundle",
            "50 high-quality stock photos for commercial use",
            "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&h=300&fit=crop",
            0.0005 ether, // 0.0005 ETH
            1 // Bronze badge
        );
        
        addItem(
            "Video Editing Presets",
            "Color grading and effect presets for video editing",
            "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop",
            0.0015 ether, // 0.0015 ETH
            2 // Silver badge
        );
        
        addItem(
            "Digital Marketing Templates",
            "Social media templates and marketing materials", 
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
            0.003 ether, // 0.003 ETH
            3 // Gold badge
        );
        
        addItem(
            "3D Model Collection",
            "High-poly 3D models for game development",
            "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
            0.005 ether, // 0.005 ETH
            4 // Diamond badge
        );
    }
    
    function addItem(
        string memory name,
        string memory description,
        string memory imageUrl,
        uint256 priceInETH,
        uint256 loyaltyBadgeId
    ) public onlyOwner {
        itemCount++;
        items[itemCount] = Item({
            id: itemCount,
            name: name,
            description: description,
            imageUrl: imageUrl,
            priceInETH: priceInETH,
            isActive: true,
            loyaltyBadgeId: loyaltyBadgeId
        });
        
        emit ItemAdded(itemCount, name, priceInETH);
    }
    
    function updateItem(
        uint256 itemId,
        string memory name,
        string memory description,
        string memory imageUrl,
        uint256 priceInETH,
        bool isActive,
        uint256 loyaltyBadgeId
    ) public onlyOwner {
        require(itemId <= itemCount && itemId > 0, "Item does not exist");
        
        Item storage item = items[itemId];
        item.name = name;
        item.description = description;
        item.imageUrl = imageUrl;
        item.priceInETH = priceInETH;
        item.isActive = isActive;
        item.loyaltyBadgeId = loyaltyBadgeId;
    }
    
    function buyItem(uint256 itemId) public payable nonReentrant {
        require(itemId <= itemCount && itemId > 0, "Item does not exist");
        require(items[itemId].isActive, "Item is not active");
        
        Item memory item = items[itemId];
        require(msg.value >= item.priceInETH, "Insufficient ETH sent");
        
        // Refund excess ETH
        if (msg.value > item.priceInETH) {
            payable(msg.sender).transfer(msg.value - item.priceInETH);
        }
        
        userPurchases[msg.sender].push(itemId);
        
        // Mint loyalty badge
        loyaltyToken.mintBadge(msg.sender, item.loyaltyBadgeId, 1);
        
        emit ItemPurchased(msg.sender, itemId, item.priceInETH, item.loyaltyBadgeId);
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
    
    function withdrawFunds() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
    
    function setLoyaltyToken(address _loyaltyToken) public onlyOwner {
        loyaltyToken = LoyaltyToken(_loyaltyToken);
    }
    
    // Function to receive ETH
    receive() external payable {}
}