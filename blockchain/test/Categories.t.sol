// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../contracts/Categories.sol";

contract CategoriesTest is Test {
    Categories public categories;
    address public admin = address(0x1);
    
    event CategoryCreated(uint256 indexed categoryId, string name);
    event ProductCategorized(uint256 indexed productId, uint256 indexed categoryId);
    
    function setUp() public {
        vm.startPrank(admin);
        categories = new Categories();
        vm.stopPrank();
    }
    
    function testCreateCategory() public {
        vm.startPrank(admin);
        
        vm.expectEmit(true, false, false, true);
        emit CategoryCreated(1, "Digital Art");
        
        uint256 categoryId = categories.createCategory("Digital Art", "Digital artwork and NFTs");
        
        assertEq(categoryId, 1);
        assertEq(categories.categoryCounter(), 1);
        assertEq(categories.categoryByName("Digital Art"), 1);
        
        (string memory name, string memory description, bool active) = categories.categories(categoryId);
        assertEq(name, "Digital Art");
        assertEq(description, "Digital artwork and NFTs");
        assertTrue(active);
        
        vm.stopPrank();
    }
    
    function testCannotCreateDuplicateCategory() public {
        vm.startPrank(admin);
        categories.createCategory("Digital Art", "Digital artwork and NFTs");
        
        vm.expectRevert("Category exists");
        categories.createCategory("Digital Art", "Another description");
        
        vm.stopPrank();
    }
    
    function testSetProductCategory() public {
        vm.startPrank(admin);
        uint256 categoryId = categories.createCategory("Music", "Audio files and music");
        
        vm.expectEmit(true, true, false, true);
        emit ProductCategorized(1, categoryId);
        
        categories.setProductCategory(1, categoryId);
        
        assertEq(categories.productCategory(1), categoryId);
        
        uint256[] memory categoryProducts = categories.getCategoryProducts(categoryId);
        assertEq(categoryProducts.length, 1);
        assertEq(categoryProducts[0], 1);
        
        vm.stopPrank();
    }
    
    function testSetProductCategoryRequiresAdmin() public {
        vm.startPrank(admin);
        uint256 categoryId = categories.createCategory("Music", "Audio files and music");
        vm.stopPrank();
        
        vm.startPrank(address(0x2));
        vm.expectRevert();
        categories.setProductCategory(1, categoryId);
        vm.stopPrank();
    }
}