// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../contracts/CreatorRegistry.sol";

contract CreatorRegistryTest is Test {
    CreatorRegistry public registry;
    
    address public admin = address(0x1);
    address public creator1 = address(0x2);
    address public creator2 = address(0x3);
    address public verifier = address(0x4);
    
    event CreatorRegistered(address indexed creator);
    event CreatorVerified(address indexed creator);
    event ProductAdded(address indexed creator, uint256 indexed productId);
    
    function setUp() public {
        vm.startPrank(admin);
        registry = new CreatorRegistry();
        registry.grantRole(registry.VERIFIER_ROLE(), verifier);
        vm.stopPrank();
    }
    
    function testRegisterCreator() public {
        vm.startPrank(creator1);
        
        vm.expectEmit(true, false, false, true);
        emit CreatorRegistered(creator1);
        
        registry.registerCreator("John Doe", "Digital Artist", "https://example.com/avatar.jpg");
        
        assertTrue(registry.isRegistered(creator1));
        
        (string memory name, string memory bio, string memory avatar, bool verified, , ) = 
            registry.creators(creator1);
        
        assertEq(name, "John Doe");
        assertEq(bio, "Digital Artist");
        assertEq(avatar, "https://example.com/avatar.jpg");
        assertFalse(verified);
        
        vm.stopPrank();
    }
    
    function testCannotRegisterTwice() public {
        vm.startPrank(creator1);
        registry.registerCreator("John Doe", "Digital Artist", "https://example.com/avatar.jpg");
        
        vm.expectRevert("Already registered");
        registry.registerCreator("John Doe Updated", "Updated Bio", "https://example.com/new-avatar.jpg");
        
        vm.stopPrank();
    }
    
    function testUpdateCreatorProfile() public {
        vm.startPrank(creator1);
        registry.registerCreator("John Doe", "Digital Artist", "https://example.com/avatar.jpg");
        
        registry.updateCreatorProfile("John Smith", "3D Artist", "https://example.com/new-avatar.jpg");
        
        (string memory name, string memory bio, string memory avatar, , , ) = 
            registry.creators(creator1);
        
        assertEq(name, "John Smith");
        assertEq(bio, "3D Artist");
        assertEq(avatar, "https://example.com/new-avatar.jpg");
        
        vm.stopPrank();
    }
    
    function testUpdateProfileRequiresRegistration() public {
        vm.startPrank(creator1);
        
        vm.expectRevert("Not registered");
        registry.updateCreatorProfile("John Doe", "Digital Artist", "https://example.com/avatar.jpg");
        
        vm.stopPrank();
    }
    
    function testVerifyCreator() public {
        vm.startPrank(creator1);
        registry.registerCreator("John Doe", "Digital Artist", "https://example.com/avatar.jpg");
        vm.stopPrank();
        
        vm.startPrank(verifier);
        
        vm.expectEmit(true, false, false, true);
        emit CreatorVerified(creator1);
        
        registry.verifyCreator(creator1);
        
        (, , , bool verified, , ) = registry.creators(creator1);
        assertTrue(verified);
        
        vm.stopPrank();
    }
    
    function testVerifyCreatorRequiresVerifierRole() public {
        vm.startPrank(creator1);
        registry.registerCreator("John Doe", "Digital Artist", "https://example.com/avatar.jpg");
        vm.stopPrank();
        
        vm.startPrank(creator2);
        
        vm.expectRevert();
        registry.verifyCreator(creator1);
        
        vm.stopPrank();
    }
    
    function testAddProduct() public {
        vm.startPrank(creator1);
        registry.registerCreator("John Doe", "Digital Artist", "https://example.com/avatar.jpg");
        
        vm.expectEmit(true, true, false, true);
        emit ProductAdded(creator1, 1);
        
        registry.addProduct(1);
        
        uint256[] memory products = registry.getCreatorProducts(creator1);
        assertEq(products.length, 1);
        assertEq(products[0], 1);
        
        (, , , , uint256 productCount, ) = registry.creators(creator1);
        assertEq(productCount, 1);
        
        vm.stopPrank();
    }
    
    function testAddMultipleProducts() public {
        vm.startPrank(creator1);
        registry.registerCreator("John Doe", "Digital Artist", "https://example.com/avatar.jpg");
        
        registry.addProduct(1);
        registry.addProduct(2);
        registry.addProduct(3);
        
        uint256[] memory products = registry.getCreatorProducts(creator1);
        assertEq(products.length, 3);
        assertEq(products[0], 1);
        assertEq(products[1], 2);
        assertEq(products[2], 3);
        
        (, , , , uint256 productCount, ) = registry.creators(creator1);
        assertEq(productCount, 3);
        
        vm.stopPrank();
    }
    
    function testAddProductRequiresRegistration() public {
        vm.startPrank(creator1);
        
        vm.expectRevert("Not registered");
        registry.addProduct(1);
        
        vm.stopPrank();
    }
    
    function testRecordSale() public {
        vm.startPrank(creator1);
        registry.registerCreator("John Doe", "Digital Artist", "https://example.com/avatar.jpg");
        vm.stopPrank();
        
        vm.startPrank(admin);
        registry.grantRole(registry.ADMIN_ROLE(), admin);
        
        registry.recordSale(creator1, 100 ether);
        
        (, , , , , uint256 totalSales) = registry.creators(creator1);
        assertEq(totalSales, 100 ether);
        
        registry.recordSale(creator1, 50 ether);
        (, , , , , uint256 updatedSales) = registry.creators(creator1);
        assertEq(updatedSales, 150 ether);
        
        vm.stopPrank();
    }
    
    function testRecordSaleRequiresAdminRole() public {
        vm.startPrank(creator1);
        registry.registerCreator("John Doe", "Digital Artist", "https://example.com/avatar.jpg");
        
        vm.expectRevert();
        registry.recordSale(creator1, 100 ether);
        
        vm.stopPrank();
    }
    
    function testGetAllCreators() public {
        vm.startPrank(creator1);
        registry.registerCreator("John Doe", "Digital Artist", "https://example.com/avatar.jpg");
        vm.stopPrank();
        
        vm.startPrank(creator2);
        registry.registerCreator("Jane Smith", "Music Producer", "https://example.com/avatar2.jpg");
        vm.stopPrank();
        
        address[] memory allCreators = registry.getAllCreators();
        assertEq(allCreators.length, 2);
        
        // Order might vary, so check both creators are included
        bool foundCreator1 = false;
        bool foundCreator2 = false;
        
        for (uint i = 0; i < allCreators.length; i++) {
            if (allCreators[i] == creator1) foundCreator1 = true;
            if (allCreators[i] == creator2) foundCreator2 = true;
        }
        
        assertTrue(foundCreator1);
        assertTrue(foundCreator2);
    }
    
    function testCreatorCounter() public {
        assertEq(registry.creatorCounter(), 0);
        
        vm.startPrank(creator1);
        registry.registerCreator("John Doe", "Digital Artist", "https://example.com/avatar.jpg");
        vm.stopPrank();
        
        assertEq(registry.creatorCounter(), 1);
        
        vm.startPrank(creator2);
        registry.registerCreator("Jane Smith", "Music Producer", "https://example.com/avatar2.jpg");
        vm.stopPrank();
        
        assertEq(registry.creatorCounter(), 2);
    }
}