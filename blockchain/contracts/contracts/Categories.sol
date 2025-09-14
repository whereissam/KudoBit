// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract Categories is AccessControl {
    struct Category {
        string name;
        string description;
        bool active;
    }
    
    uint256 public categoryCounter;
    
    mapping(uint256 => Category) public categories;
    mapping(uint256 => uint256) public productCategory; // productId => categoryId
    mapping(uint256 => uint256[]) public categoryProducts; // categoryId => productIds
    mapping(string => uint256) public categoryByName; // name => categoryId
    
    event CategoryCreated(uint256 indexed categoryId, string name);
    event ProductCategorized(uint256 indexed productId, uint256 indexed categoryId);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    function createCategory(string calldata name, string calldata description) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
        returns (uint256) 
    {
        require(categoryByName[name] == 0, "Category exists");
        
        categoryCounter++;
        uint256 categoryId = categoryCounter;
        
        categories[categoryId] = Category({
            name: name,
            description: description,
            active: true
        });
        
        categoryByName[name] = categoryId;
        
        emit CategoryCreated(categoryId, name);
        return categoryId;
    }
    
    function setProductCategory(uint256 productId, uint256 categoryId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(categories[categoryId].active, "Category not active");
        
        productCategory[productId] = categoryId;
        categoryProducts[categoryId].push(productId);
        
        emit ProductCategorized(productId, categoryId);
    }
    
    function getCategoryProducts(uint256 categoryId) external view returns (uint256[] memory) {
        return categoryProducts[categoryId];
    }
}