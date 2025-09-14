// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract Wishlist {
    mapping(address => uint256[]) public userWishlists;
    mapping(address => mapping(uint256 => bool)) public isInWishlist;
    
    event ProductAddedToWishlist(address indexed user, uint256 indexed productId);
    event ProductRemovedFromWishlist(address indexed user, uint256 indexed productId);
    
    function addToWishlist(uint256 productId) external {
        require(!isInWishlist[msg.sender][productId], "Already in wishlist");
        
        userWishlists[msg.sender].push(productId);
        isInWishlist[msg.sender][productId] = true;
        
        emit ProductAddedToWishlist(msg.sender, productId);
    }
    
    function removeFromWishlist(uint256 productId) external {
        require(isInWishlist[msg.sender][productId], "Not in wishlist");
        
        uint256[] storage wishlist = userWishlists[msg.sender];
        for (uint256 i = 0; i < wishlist.length; i++) {
            if (wishlist[i] == productId) {
                wishlist[i] = wishlist[wishlist.length - 1];
                wishlist.pop();
                break;
            }
        }
        
        isInWishlist[msg.sender][productId] = false;
        
        emit ProductRemovedFromWishlist(msg.sender, productId);
    }
    
    function getUserWishlist(address user) external view returns (uint256[] memory) {
        return userWishlists[user];
    }
}