// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ProductNFT.sol";
import "./RoyaltyManager.sol";
import "./ContentAccess.sol";

contract GumroadCore is AccessControl, ReentrancyGuard {
    ProductNFT public productNFT;
    RoyaltyManager public royaltyManager;
    ContentAccess public contentAccess;
    
    mapping(uint256 => mapping(address => bool)) public hasPurchased;
    
    event ProductPurchased(uint256 indexed productId, address indexed buyer, uint256 amount);
    
    constructor(address _productNFT, address _royaltyManager, address _contentAccess) {
        productNFT = ProductNFT(_productNFT);
        royaltyManager = RoyaltyManager(_royaltyManager);
        contentAccess = ContentAccess(_contentAccess);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    function purchaseProduct(uint256 productId, address paymentToken) external payable nonReentrant {
        (,, uint256 price, bool active, address creator) = productNFT.products(productId);
        
        require(active, "Product not active");
        require(creator != msg.sender, "Cannot buy own product");
        require(!hasPurchased[productId][msg.sender], "Already purchased");
        
        if (paymentToken == address(0)) {
            require(msg.value >= price, "Insufficient payment");
            // ETH payments - just keep the ETH in this contract for now
        } else {
            IERC20(paymentToken).transferFrom(msg.sender, address(this), price);
        }
        
        royaltyManager.distributeRevenue(creator, paymentToken, price);
        
        // Grant access to all content for this product
        uint256[] memory contentIds = contentAccess.getProductContent(productId);
        for (uint256 i = 0; i < contentIds.length; i++) {
            contentAccess.grantAccess(msg.sender, contentIds[i]);
        }
        
        hasPurchased[productId][msg.sender] = true;
        
        emit ProductPurchased(productId, msg.sender, price);
    }
}