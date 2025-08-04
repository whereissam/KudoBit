// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../core/LoyaltyToken.sol";

contract CollaborativeProductFactory is Ownable, ReentrancyGuard {
    IERC20 public paymentToken;
    LoyaltyToken public loyaltyToken;
    
    struct Collaborator {
        address collaboratorAddress;
        uint256 royaltyPercentage; // Basis points (1% = 100, 100% = 10000)
        string role; // "creator", "artist", "promoter", "contributor", etc.
        bool isActive;
    }
    
    struct CollaborativeProduct {
        uint256 id;
        string name;
        string description;
        string ipfsContentHash;
        uint256 priceInUSDC;
        bool isActive;
        uint256 loyaltyBadgeId;
        address primaryCreator;
        uint256 createdAt;
        uint256 totalSales;
        uint256 totalRevenue;
    }
    
    mapping(uint256 => CollaborativeProduct) public collaborativeProducts;
    mapping(uint256 => Collaborator[]) public productCollaborators;
    mapping(uint256 => mapping(address => bool)) public collaboratorExists;
    mapping(address => uint256[]) public creatorProducts;
    mapping(address => uint256) public collaboratorEarnings;
    
    uint256 public productCount;
    
    event CollaborativeProductCreated(
        uint256 indexed productId,
        address indexed primaryCreator,
        string name,
        uint256 price,
        uint256 collaboratorCount
    );
    
    event CollaborativeProductPurchased(
        address indexed buyer,
        uint256 indexed productId,
        uint256 price,
        uint256 loyaltyBadgeAwarded
    );
    
    event CollaboratorRoyaltyPaid(
        uint256 indexed productId,
        address indexed collaborator,
        uint256 amount,
        string role
    );
    
    event CollaboratorAdded(
        uint256 indexed productId,
        address indexed collaborator,
        uint256 royaltyPercentage,
        string role
    );
    
    constructor(
        address _paymentToken,
        address _loyaltyToken
    ) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
        loyaltyToken = LoyaltyToken(_loyaltyToken);
    }
    
    function createCollaborativeProduct(
        string memory name,
        string memory description,
        string memory ipfsContentHash,
        uint256 priceInUSDC,
        uint256 loyaltyBadgeId,
        address[] memory collaboratorAddresses,
        uint256[] memory royaltyPercentages,
        string[] memory roles
    ) public returns (uint256) {
        require(bytes(name).length > 0, "Product name cannot be empty");
        require(priceInUSDC > 0, "Price must be greater than 0");
        require(collaboratorAddresses.length == royaltyPercentages.length, "Collaborator arrays length mismatch");
        require(collaboratorAddresses.length == roles.length, "Role arrays length mismatch");
        require(collaboratorAddresses.length > 0, "Must have at least one collaborator");
        
        // Validate royalty percentages
        uint256 totalRoyalty = 0;
        for (uint256 i = 0; i < royaltyPercentages.length; i++) {
            require(collaboratorAddresses[i] != address(0), "Invalid collaborator address");
            require(royaltyPercentages[i] > 0, "Royalty percentage must be greater than 0");
            require(bytes(roles[i]).length > 0, "Role cannot be empty");
            totalRoyalty += royaltyPercentages[i];
        }
        require(totalRoyalty <= 10000, "Total royalties cannot exceed 100%");
        
        productCount++;
        
        collaborativeProducts[productCount] = CollaborativeProduct({
            id: productCount,
            name: name,
            description: description,
            ipfsContentHash: ipfsContentHash,
            priceInUSDC: priceInUSDC,
            isActive: true,
            loyaltyBadgeId: loyaltyBadgeId,
            primaryCreator: msg.sender,
            createdAt: block.timestamp,
            totalSales: 0,
            totalRevenue: 0
        });
        
        // Add collaborators
        for (uint256 i = 0; i < collaboratorAddresses.length; i++) {
            productCollaborators[productCount].push(Collaborator({
                collaboratorAddress: collaboratorAddresses[i],
                royaltyPercentage: royaltyPercentages[i],
                role: roles[i],
                isActive: true
            }));
            
            collaboratorExists[productCount][collaboratorAddresses[i]] = true;
            creatorProducts[collaboratorAddresses[i]].push(productCount);
            
            emit CollaboratorAdded(productCount, collaboratorAddresses[i], royaltyPercentages[i], roles[i]);
        }
        
        creatorProducts[msg.sender].push(productCount);
        
        emit CollaborativeProductCreated(productCount, msg.sender, name, priceInUSDC, collaboratorAddresses.length);
        
        return productCount;
    }
    
    function addCollaborator(
        uint256 productId,
        address collaboratorAddress,
        uint256 royaltyPercentage,
        string memory role
    ) public {
        require(productId <= productCount && productId > 0, "Product does not exist");
        require(msg.sender == collaborativeProducts[productId].primaryCreator, "Only primary creator can add collaborators");
        require(collaboratorAddress != address(0), "Invalid collaborator address");
        require(royaltyPercentage > 0, "Royalty percentage must be greater than 0");
        require(!collaboratorExists[productId][collaboratorAddress], "Collaborator already exists");
        require(bytes(role).length > 0, "Role cannot be empty");
        
        // Check total royalty doesn't exceed 100%
        uint256 totalRoyalty = royaltyPercentage;
        Collaborator[] memory collaborators = productCollaborators[productId];
        for (uint256 i = 0; i < collaborators.length; i++) {
            if (collaborators[i].isActive) {
                totalRoyalty += collaborators[i].royaltyPercentage;
            }
        }
        require(totalRoyalty <= 10000, "Total royalties would exceed 100%");
        
        productCollaborators[productId].push(Collaborator({
            collaboratorAddress: collaboratorAddress,
            royaltyPercentage: royaltyPercentage,
            role: role,
            isActive: true
        }));
        
        collaboratorExists[productId][collaboratorAddress] = true;
        creatorProducts[collaboratorAddress].push(productId);
        
        emit CollaboratorAdded(productId, collaboratorAddress, royaltyPercentage, role);
    }
    
    function updateCollaboratorStatus(
        uint256 productId,
        address collaboratorAddress,
        bool isActive
    ) public {
        require(productId <= productCount && productId > 0, "Product does not exist");
        require(msg.sender == collaborativeProducts[productId].primaryCreator, "Only primary creator can update collaborator status");
        require(collaboratorExists[productId][collaboratorAddress], "Collaborator does not exist");
        
        Collaborator[] storage collaborators = productCollaborators[productId];
        for (uint256 i = 0; i < collaborators.length; i++) {
            if (collaborators[i].collaboratorAddress == collaboratorAddress) {
                collaborators[i].isActive = isActive;
                break;
            }
        }
    }
    
    function buyCollaborativeProduct(uint256 productId) public nonReentrant {
        require(productId <= productCount && productId > 0, "Product does not exist");
        require(collaborativeProducts[productId].isActive, "Product is not active");
        
        CollaborativeProduct storage product = collaborativeProducts[productId];
        
        // Transfer USDC from buyer to contract for distribution
        require(
            paymentToken.transferFrom(msg.sender, address(this), product.priceInUSDC),
            "Payment failed"
        );
        
        // Distribute royalties to active collaborators
        Collaborator[] memory collaborators = productCollaborators[productId];
        uint256 totalRoyaltyPaid = 0;
        
        for (uint256 i = 0; i < collaborators.length; i++) {
            if (collaborators[i].isActive) {
                uint256 royaltyAmount = (product.priceInUSDC * collaborators[i].royaltyPercentage) / 10000;
                totalRoyaltyPaid += royaltyAmount;
                
                // Transfer to collaborator
                require(
                    paymentToken.transfer(collaborators[i].collaboratorAddress, royaltyAmount),
                    "Collaborator payment failed"
                );
                
                // Update collaborator earnings
                collaboratorEarnings[collaborators[i].collaboratorAddress] += royaltyAmount;
                
                emit CollaboratorRoyaltyPaid(productId, collaborators[i].collaboratorAddress, royaltyAmount, collaborators[i].role);
            }
        }
        
        // Transfer remaining amount to contract owner (platform fee can be deducted here)
        uint256 remainingAmount = product.priceInUSDC - totalRoyaltyPaid;
        if (remainingAmount > 0) {
            require(
                paymentToken.transfer(owner(), remainingAmount),
                "Platform payment failed"
            );
        }
        
        // Update product stats
        product.totalSales += 1;
        product.totalRevenue += product.priceInUSDC;
        
        // Award loyalty badge
        loyaltyToken.mintBadge(msg.sender, product.loyaltyBadgeId, 1);
        
        emit CollaborativeProductPurchased(msg.sender, productId, product.priceInUSDC, product.loyaltyBadgeId);
    }
    
    function updateProductStatus(uint256 productId, bool isActive) public {
        require(productId <= productCount && productId > 0, "Product does not exist");
        require(msg.sender == collaborativeProducts[productId].primaryCreator, "Only primary creator can update product status");
        
        collaborativeProducts[productId].isActive = isActive;
    }
    
    function getCollaborativeProduct(uint256 productId) public view returns (CollaborativeProduct memory) {
        require(productId <= productCount && productId > 0, "Product does not exist");
        return collaborativeProducts[productId];
    }
    
    function getProductCollaborators(uint256 productId) public view returns (Collaborator[] memory) {
        require(productId <= productCount && productId > 0, "Product does not exist");
        return productCollaborators[productId];
    }
    
    function getCreatorProducts(address creator) public view returns (uint256[] memory) {
        return creatorProducts[creator];
    }
    
    function getCollaboratorEarnings(address collaborator) public view returns (uint256) {
        return collaboratorEarnings[collaborator];
    }
    
    function getAllCollaborativeProducts() public view returns (CollaborativeProduct[] memory) {
        CollaborativeProduct[] memory allProducts = new CollaborativeProduct[](productCount);
        for (uint256 i = 1; i <= productCount; i++) {
            allProducts[i-1] = collaborativeProducts[i];
        }
        return allProducts;
    }
    
    function calculateCollaboratorShare(uint256 productId, address collaboratorAddress) public view returns (uint256) {
        require(productId <= productCount && productId > 0, "Product does not exist");
        require(collaboratorExists[productId][collaboratorAddress], "Collaborator does not exist");
        
        Collaborator[] memory collaborators = productCollaborators[productId];
        for (uint256 i = 0; i < collaborators.length; i++) {
            if (collaborators[i].collaboratorAddress == collaboratorAddress && collaborators[i].isActive) {
                uint256 productPrice = collaborativeProducts[productId].priceInUSDC;
                return (productPrice * collaborators[i].royaltyPercentage) / 10000;
            }
        }
        
        return 0;
    }
}