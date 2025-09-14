// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../contracts/CreatorToken.sol";

contract CreatorTokenTest is Test {
    CreatorToken public creatorToken;
    address public creator = address(0x10);
    address public buyer = address(0x11);
    
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);
    
    function setUp() public {
        creatorToken = new CreatorToken("CreatorCoin", "CC", creator, 0.01 ether);
    }
    
    function testInitialSetup() public {
        assertEq(creatorToken.name(), "CreatorCoin");
        assertEq(creatorToken.symbol(), "CC");
        assertEq(creatorToken.creator(), creator);
        assertEq(creatorToken.price(), 0.01 ether);
    }
    
    function testMint() public {
        vm.startPrank(creator);
        
        creatorToken.mint(1000 ether);
        
        assertEq(creatorToken.balanceOf(creator), 1000 ether);
        assertEq(creatorToken.totalSupply(), 1000 ether);
        
        vm.stopPrank();
    }
    
    function testMintRequiresCreatorRole() public {
        vm.startPrank(buyer);
        
        vm.expectRevert();
        creatorToken.mint(1000 ether);
        
        vm.stopPrank();
    }
    
    function testPurchase() public {
        vm.deal(buyer, 1 ether);
        vm.startPrank(buyer);
        
        uint256 amount = 10; // 10 tokens, not 10 ether worth
        uint256 cost = amount * 0.01 ether; // 0.1 ether total
        
        vm.expectEmit(true, false, false, true);
        emit TokensPurchased(buyer, amount, cost); // amount stays as is
        
        creatorToken.purchase{value: cost}(amount);
        
        assertEq(creatorToken.balanceOf(buyer), amount);
        assertEq(address(creatorToken).balance, cost);
        
        vm.stopPrank();
    }
    
    function testPurchaseInsufficientPayment() public {
        vm.deal(buyer, 0.005 ether);
        vm.startPrank(buyer);
        
        uint256 amount = 1 ether;
        
        vm.expectRevert("Insufficient payment");
        creatorToken.purchase{value: 0.005 ether}(amount);
        
        vm.stopPrank();
    }
    
    function testWithdraw() public {
        vm.deal(buyer, 1 ether);
        
        vm.startPrank(buyer);
        uint256 amount = 10; // 10 tokens
        uint256 cost = amount * 0.01 ether; // 0.1 ether
        creatorToken.purchase{value: cost}(amount);
        vm.stopPrank();
        
        uint256 creatorBalanceBefore = creator.balance;
        
        vm.startPrank(creator);
        creatorToken.withdraw();
        vm.stopPrank();
        
        assertEq(creator.balance, creatorBalanceBefore + cost);
        assertEq(address(creatorToken).balance, 0);
    }
    
    function testWithdrawRequiresCreatorRole() public {
        vm.startPrank(buyer);
        
        vm.expectRevert();
        creatorToken.withdraw();
        
        vm.stopPrank();
    }
}