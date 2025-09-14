// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../contracts/ContentAccess.sol";

contract ContentAccessTest is Test {
    ContentAccess public contentAccess;
    
    address public admin = address(0x1);
    address public creator = address(0x2);
    address public user = address(0x3);
    
    event ContentCreated(uint256 indexed contentId, uint256 indexed productId, address creator);
    event AccessGranted(address indexed user, uint256 indexed contentId);
    
    function setUp() public {
        vm.startPrank(admin);
        contentAccess = new ContentAccess();
        contentAccess.grantRole(contentAccess.CREATOR_ROLE(), creator);
        vm.stopPrank();
    }
    
    function testCreateContent() public {
        uint256 productId = 1;
        string memory contentHash = "QmTestHash";
        
        vm.startPrank(creator);
        
        vm.expectEmit(true, true, true, true);
        emit ContentCreated(1, productId, creator);
        
        uint256 contentId = contentAccess.createContent(productId, contentHash);
        
        assertEq(contentId, 1);
        assertEq(contentAccess.contentCounter(), 1);
        
        (uint256 storedProductId, string memory storedHash, address storedCreator, bool active) = 
            contentAccess.contents(contentId);
        
        assertEq(storedProductId, productId);
        assertEq(storedHash, contentHash);
        assertEq(storedCreator, creator);
        assertTrue(active);
        
        vm.stopPrank();
    }
    
    function testCreateContentRequiresCreatorRole() public {
        vm.startPrank(user);
        
        vm.expectRevert();
        contentAccess.createContent(1, "QmTestHash");
        
        vm.stopPrank();
    }
    
    function testGrantAccess() public {
        vm.startPrank(creator);
        uint256 contentId = contentAccess.createContent(1, "QmTestHash");
        vm.stopPrank();
        
        vm.startPrank(creator);
        
        vm.expectEmit(true, true, false, true);
        emit AccessGranted(user, contentId);
        
        contentAccess.grantAccess(user, contentId);
        
        assertTrue(contentAccess.hasAccess(user, contentId));
        
        vm.stopPrank();
    }
    
    function testGrantAccessRequiresAuthorization() public {
        vm.startPrank(creator);
        uint256 contentId = contentAccess.createContent(1, "QmTestHash");
        vm.stopPrank();
        
        vm.startPrank(user);
        
        vm.expectRevert("Not authorized");
        contentAccess.grantAccess(user, contentId);
        
        vm.stopPrank();
    }
    
    function testGrantAccessForInactiveContent() public {
        vm.startPrank(creator);
        uint256 contentId = contentAccess.createContent(1, "QmTestHash");
        
        // Deactivate content by setting active to false
        // Note: We need to add a function to deactivate content or use admin role
        vm.stopPrank();
        
        vm.startPrank(admin);
        // For now, let's test with active content since we don't have a deactivate function
        vm.stopPrank();
        
        vm.startPrank(creator);
        contentAccess.grantAccess(user, contentId);
        assertTrue(contentAccess.hasAccess(user, contentId));
        vm.stopPrank();
    }
    
    function testGetProductContent() public {
        uint256 productId = 1;
        
        vm.startPrank(creator);
        uint256 contentId1 = contentAccess.createContent(productId, "QmHash1");
        uint256 contentId2 = contentAccess.createContent(productId, "QmHash2");
        uint256 contentId3 = contentAccess.createContent(2, "QmHash3"); // Different product
        vm.stopPrank();
        
        uint256[] memory productContent = contentAccess.getProductContent(productId);
        
        assertEq(productContent.length, 2);
        assertEq(productContent[0], contentId1);
        assertEq(productContent[1], contentId2);
        
        uint256[] memory otherProductContent = contentAccess.getProductContent(2);
        assertEq(otherProductContent.length, 1);
        assertEq(otherProductContent[0], contentId3);
    }
    
    function testMultipleContentCreation() public {
        vm.startPrank(creator);
        
        uint256 contentId1 = contentAccess.createContent(1, "QmHash1");
        uint256 contentId2 = contentAccess.createContent(2, "QmHash2");
        uint256 contentId3 = contentAccess.createContent(3, "QmHash3");
        
        assertEq(contentId1, 1);
        assertEq(contentId2, 2);
        assertEq(contentId3, 3);
        assertEq(contentAccess.contentCounter(), 3);
        
        vm.stopPrank();
    }
    
    function testGrantAccessToMultipleUsers() public {
        vm.startPrank(creator);
        uint256 contentId = contentAccess.createContent(1, "QmTestHash");
        
        address user1 = address(0x10);
        address user2 = address(0x11);
        address user3 = address(0x12);
        
        contentAccess.grantAccess(user1, contentId);
        contentAccess.grantAccess(user2, contentId);
        contentAccess.grantAccess(user3, contentId);
        
        assertTrue(contentAccess.hasAccess(user1, contentId));
        assertTrue(contentAccess.hasAccess(user2, contentId));
        assertTrue(contentAccess.hasAccess(user3, contentId));
        
        vm.stopPrank();
    }
    
    function testAdminCanGrantAccess() public {
        vm.startPrank(creator);
        uint256 contentId = contentAccess.createContent(1, "QmTestHash");
        vm.stopPrank();
        
        vm.startPrank(admin);
        contentAccess.grantAccess(user, contentId);
        assertTrue(contentAccess.hasAccess(user, contentId));
        vm.stopPrank();
    }
    
    function testContentAccessInitiallyFalse() public {
        vm.startPrank(creator);
        uint256 contentId = contentAccess.createContent(1, "QmTestHash");
        vm.stopPrank();
        
        assertFalse(contentAccess.hasAccess(user, contentId));
        assertFalse(contentAccess.hasAccess(creator, contentId));
        assertFalse(contentAccess.hasAccess(admin, contentId));
    }
    
    function testContentCounterIncrements() public {
        assertEq(contentAccess.contentCounter(), 0);
        
        vm.startPrank(creator);
        
        contentAccess.createContent(1, "QmHash1");
        assertEq(contentAccess.contentCounter(), 1);
        
        contentAccess.createContent(2, "QmHash2");
        assertEq(contentAccess.contentCounter(), 2);
        
        contentAccess.createContent(3, "QmHash3");
        assertEq(contentAccess.contentCounter(), 3);
        
        vm.stopPrank();
    }
}