// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../contracts/ProductNFT.sol";

contract ProductNFTTest is Test {
    ProductNFT public productNFT;
    
    address public owner = address(0x1);
    address public creator = address(0x2);
    address public buyer = address(0x3);
    
    event ProductCreated(uint256 indexed productId, address indexed creator, uint256 price);
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    
    function setUp() public {
        vm.startPrank(owner);
        productNFT = new ProductNFT();
        vm.stopPrank();
    }
    
    function testMintProduct() public {
        vm.startPrank(owner);
        productNFT.grantRole(productNFT.CREATOR_ROLE(), creator);
        vm.stopPrank();
        
        vm.startPrank(creator);
        
        vm.expectEmit(true, true, false, true);
        emit ProductCreated(1, creator, 100 ether);
        
        uint256 productId = productNFT.mintProduct(
            "Test Product",
            "Test Description",
            "https://ipfs.io/test",
            100 ether,
            "ipfs://content-hash"
        );
        
        assertEq(productId, 1);
        assertEq(productNFT.ownerOf(1), creator);
        assertEq(productNFT.tokenURI(1), "https://ipfs.io/test");
        
        (string memory name, string memory description, uint256 price, bool active, address productCreator) = 
            productNFT.products(1);
        
        assertEq(name, "Test Product");
        assertEq(description, "Test Description");
        assertEq(price, 100 ether);
        assertTrue(active);
        assertEq(productCreator, creator);
        
        vm.stopPrank();
    }
    
    function testMintProductRequiresCreatorRole() public {
        vm.startPrank(buyer);
        
        vm.expectRevert();
        productNFT.mintProduct(
            "Test Product",
            "Test Description",
            "https://ipfs.io/test",
            100 ether,
            "ipfs://content-hash"
        );
        
        vm.stopPrank();
    }
    
    function testUpdateProductPrice() public {
        vm.startPrank(owner);
        productNFT.grantRole(productNFT.CREATOR_ROLE(), creator);
        vm.stopPrank();
        
        vm.startPrank(creator);
        uint256 productId = productNFT.mintProduct(
            "Test Product",
            "Test Description",
            "https://ipfs.io/test",
            100 ether,
            "ipfs://content-hash"
        );
        
        productNFT.updateProductPrice(productId, 200 ether);
        
        (, , uint256 price, , ) = productNFT.products(productId);
        assertEq(price, 200 ether);
        
        vm.stopPrank();
    }
    
    function testUpdateProductPriceOnlyOwner() public {
        vm.startPrank(owner);
        productNFT.grantRole(productNFT.CREATOR_ROLE(), creator);
        vm.stopPrank();
        
        vm.startPrank(creator);
        uint256 productId = productNFT.mintProduct(
            "Test Product",
            "Test Description",
            "https://ipfs.io/test",
            100 ether,
            "ipfs://content-hash"
        );
        vm.stopPrank();
        
        vm.startPrank(buyer);
        vm.expectRevert("Not product owner");
        productNFT.updateProductPrice(productId, 200 ether);
        vm.stopPrank();
    }
    
    function testToggleProductStatus() public {
        vm.startPrank(owner);
        productNFT.grantRole(productNFT.CREATOR_ROLE(), creator);
        vm.stopPrank();
        
        vm.startPrank(creator);
        uint256 productId = productNFT.mintProduct(
            "Test Product",
            "Test Description",
            "https://ipfs.io/test",
            100 ether,
            "ipfs://content-hash"
        );
        
        productNFT.toggleProductStatus(productId);
        
        (, , , bool active, ) = productNFT.products(productId);
        assertFalse(active);
        
        productNFT.toggleProductStatus(productId);
        (, , , bool activeAgain, ) = productNFT.products(productId);
        assertTrue(activeAgain);
        
        vm.stopPrank();
    }
    
    function testRoyaltyInfo() public {
        vm.startPrank(owner);
        productNFT.grantRole(productNFT.CREATOR_ROLE(), creator);
        vm.stopPrank();
        
        vm.startPrank(creator);
        uint256 productId = productNFT.mintProduct(
            "Test Product",
            "Test Description",
            "https://ipfs.io/test",
            100 ether,
            "ipfs://content-hash"
        );
        vm.stopPrank();
        
        uint256 salePrice = 1000 ether;
        (address receiver, uint256 royaltyAmount) = productNFT.royaltyInfo(productId, salePrice);
        
        assertEq(receiver, creator);
        assertEq(royaltyAmount, salePrice * 500 / 10000); // 5% royalty
    }
    
    function testGetCreatorProducts() public {
        vm.startPrank(owner);
        productNFT.grantRole(productNFT.CREATOR_ROLE(), creator);
        vm.stopPrank();
        
        vm.startPrank(creator);
        uint256 productId1 = productNFT.mintProduct(
            "Product 1",
            "Description 1",
            "https://ipfs.io/test1",
            100 ether,
            "ipfs://content-hash1"
        );
        
        uint256 productId2 = productNFT.mintProduct(
            "Product 2",
            "Description 2",
            "https://ipfs.io/test2",
            200 ether,
            "ipfs://content-hash2"
        );
        vm.stopPrank();
        
        uint256[] memory creatorProducts = productNFT.getCreatorProducts(creator);
        assertEq(creatorProducts.length, 2);
        assertEq(creatorProducts[0], productId1);
        assertEq(creatorProducts[1], productId2);
    }
    
    function testProductCounter() public {
        vm.startPrank(owner);
        productNFT.grantRole(productNFT.CREATOR_ROLE(), creator);
        vm.stopPrank();
        
        assertEq(productNFT.productCounter(), 0);
        
        vm.startPrank(creator);
        productNFT.mintProduct(
            "Product 1",
            "Description 1",
            "https://ipfs.io/test1",
            100 ether,
            "ipfs://content-hash1"
        );
        
        assertEq(productNFT.productCounter(), 1);
        
        productNFT.mintProduct(
            "Product 2",
            "Description 2",
            "https://ipfs.io/test2",
            200 ether,
            "ipfs://content-hash2"
        );
        
        assertEq(productNFT.productCounter(), 2);
        vm.stopPrank();
    }
}