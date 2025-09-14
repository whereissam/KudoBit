// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../contracts/Wishlist.sol";

contract WishlistTest is Test {
    Wishlist public wishlist;
    address public user = address(0x1);
    
    event ProductAddedToWishlist(address indexed user, uint256 indexed productId);
    event ProductRemovedFromWishlist(address indexed user, uint256 indexed productId);
    
    function setUp() public {
        wishlist = new Wishlist();
    }
    
    function testAddToWishlist() public {
        vm.startPrank(user);
        
        vm.expectEmit(true, true, false, true);
        emit ProductAddedToWishlist(user, 1);
        
        wishlist.addToWishlist(1);
        
        assertTrue(wishlist.isInWishlist(user, 1));
        
        uint256[] memory userWishlist = wishlist.getUserWishlist(user);
        assertEq(userWishlist.length, 1);
        assertEq(userWishlist[0], 1);
        
        vm.stopPrank();
    }
    
    function testCannotAddSameProductTwice() public {
        vm.startPrank(user);
        wishlist.addToWishlist(1);
        
        vm.expectRevert("Already in wishlist");
        wishlist.addToWishlist(1);
        
        vm.stopPrank();
    }
    
    function testRemoveFromWishlist() public {
        vm.startPrank(user);
        wishlist.addToWishlist(1);
        wishlist.addToWishlist(2);
        wishlist.addToWishlist(3);
        
        vm.expectEmit(true, true, false, true);
        emit ProductRemovedFromWishlist(user, 2);
        
        wishlist.removeFromWishlist(2);
        
        assertFalse(wishlist.isInWishlist(user, 2));
        
        uint256[] memory userWishlist = wishlist.getUserWishlist(user);
        assertEq(userWishlist.length, 2);
        
        // Check that remaining items are still there (order might change due to swap-and-pop)
        bool found1 = false;
        bool found3 = false;
        for (uint256 i = 0; i < userWishlist.length; i++) {
            if (userWishlist[i] == 1) found1 = true;
            if (userWishlist[i] == 3) found3 = true;
        }
        assertTrue(found1);
        assertTrue(found3);
        
        vm.stopPrank();
    }
    
    function testCannotRemoveNonExistentProduct() public {
        vm.startPrank(user);
        
        vm.expectRevert("Not in wishlist");
        wishlist.removeFromWishlist(1);
        
        vm.stopPrank();
    }
}