// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../contracts/GumroadCore.sol";
import "../contracts/ProductNFT.sol";
import "../contracts/RoyaltyManager.sol";
import "../contracts/ContentAccess.sol";
import "../contracts/MockUSDC.sol";

contract GumroadCoreTest is Test {
    GumroadCore public gumroadCore;
    ProductNFT public productNFT;
    RoyaltyManager public royaltyManager;
    ContentAccess public contentAccess;
    MockUSDC public usdc;
    
    address public admin = address(0x1);
    address public creator = address(0x2);
    address public buyer = address(0x3);
    address public treasury = address(0x4);
    
    event ProductPurchased(uint256 indexed productId, address indexed buyer, uint256 amount);
    
    function setUp() public {
        vm.startPrank(admin);
        
        usdc = new MockUSDC();
        productNFT = new ProductNFT();
        royaltyManager = new RoyaltyManager(treasury);
        contentAccess = new ContentAccess();
        
        gumroadCore = new GumroadCore(
            address(productNFT), 
            address(royaltyManager), 
            address(contentAccess)
        );
        
        // Setup roles
        productNFT.grantRole(productNFT.CREATOR_ROLE(), creator);
        contentAccess.grantRole(contentAccess.CREATOR_ROLE(), creator);
        royaltyManager.grantRole(royaltyManager.DEFAULT_ADMIN_ROLE(), address(gumroadCore));
        contentAccess.grantRole(contentAccess.DEFAULT_ADMIN_ROLE(), address(gumroadCore));
        
        vm.stopPrank();
    }
    
    function testPurchaseProductWithEther() public {
        // Setup: Creator creates a product
        vm.startPrank(creator);
        uint256 productId = productNFT.mintProduct(
            "Test Product",
            "Test Description", 
            "https://ipfs.io/test",
            1 ether,
            "ipfs://content-hash"
        );
        contentAccess.createContent(productId, "ipfs://content-hash");
        vm.stopPrank();
        
        // Setup: Fund buyer
        vm.deal(buyer, 2 ether);
        
        // Test: Buyer purchases product
        vm.startPrank(buyer);
        
        vm.expectEmit(true, true, false, true);
        emit ProductPurchased(productId, buyer, 1 ether);
        
        gumroadCore.purchaseProduct{value: 1 ether}(productId, address(0));
        
        // Verify purchase
        assertTrue(gumroadCore.hasPurchased(productId, buyer));
        assertTrue(contentAccess.hasAccess(buyer, productId));
        
        vm.stopPrank();
    }
    
    function testPurchaseProductWithToken() public {
        // Setup: Creator creates a product
        vm.startPrank(creator);
        uint256 productId = productNFT.mintProduct(
            "Test Product",
            "Test Description", 
            "https://ipfs.io/test",
            100 * 10**6, // 100 USDC (6 decimals)
            "ipfs://content-hash"
        );
        contentAccess.createContent(productId, "ipfs://content-hash");
        vm.stopPrank();
        
        // Setup: Fund buyer with USDC
        vm.startPrank(admin);
        usdc.mint(buyer, 1000 * 10**6);
        vm.stopPrank();
        
        // Test: Buyer purchases product with USDC
        vm.startPrank(buyer);
        usdc.approve(address(gumroadCore), 100 * 10**6);
        
        gumroadCore.purchaseProduct(productId, address(usdc));
        
        // Verify purchase
        assertTrue(gumroadCore.hasPurchased(productId, buyer));
        assertTrue(contentAccess.hasAccess(buyer, productId));
        
        vm.stopPrank();
    }
    
    function testCannotPurchaseInactiveProduct() public {
        // Setup: Creator creates and deactivates a product
        vm.startPrank(creator);
        uint256 productId = productNFT.mintProduct(
            "Test Product",
            "Test Description", 
            "https://ipfs.io/test",
            1 ether,
            "ipfs://content-hash"
        );
        productNFT.toggleProductStatus(productId); // Deactivate
        vm.stopPrank();
        
        // Setup: Fund buyer
        vm.deal(buyer, 2 ether);
        
        // Test: Should revert when trying to buy inactive product
        vm.startPrank(buyer);
        
        vm.expectRevert("Product not active");
        gumroadCore.purchaseProduct{value: 1 ether}(productId, address(0));
        
        vm.stopPrank();
    }
    
    function testCannotPurchaseOwnProduct() public {
        // Setup: Creator creates a product
        vm.startPrank(creator);
        uint256 productId = productNFT.mintProduct(
            "Test Product",
            "Test Description", 
            "https://ipfs.io/test",
            1 ether,
            "ipfs://content-hash"
        );
        vm.stopPrank();
        
        // Setup: Fund creator
        vm.deal(creator, 2 ether);
        
        // Test: Creator cannot buy their own product
        vm.startPrank(creator);
        
        vm.expectRevert("Cannot buy own product");
        gumroadCore.purchaseProduct{value: 1 ether}(productId, address(0));
        
        vm.stopPrank();
    }
    
    function testCannotPurchaseTwice() public {
        // Setup: Creator creates a product
        vm.startPrank(creator);
        uint256 productId = productNFT.mintProduct(
            "Test Product",
            "Test Description", 
            "https://ipfs.io/test",
            1 ether,
            "ipfs://content-hash"
        );
        contentAccess.createContent(productId, "ipfs://content-hash");
        vm.stopPrank();
        
        // Setup: Fund buyer
        vm.deal(buyer, 3 ether);
        
        // Test: Buy once
        vm.startPrank(buyer);
        gumroadCore.purchaseProduct{value: 1 ether}(productId, address(0));
        
        // Test: Cannot buy again
        vm.expectRevert("Already purchased");
        gumroadCore.purchaseProduct{value: 1 ether}(productId, address(0));
        
        vm.stopPrank();
    }
}