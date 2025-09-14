// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../contracts/PaymentToken.sol";

contract PaymentTokenTest is Test {
    PaymentToken public paymentToken;
    address public admin = address(0x1);
    address public token1 = address(0x2);
    address public token2 = address(0x3);
    
    event TokenAccepted(address indexed token);
    event TokenRemoved(address indexed token);
    
    function setUp() public {
        vm.startPrank(admin);
        paymentToken = new PaymentToken();
        vm.stopPrank();
    }
    
    function testAcceptToken() public {
        vm.startPrank(admin);
        
        vm.expectEmit(true, false, false, true);
        emit TokenAccepted(token1);
        
        paymentToken.acceptToken(token1);
        
        assertTrue(paymentToken.acceptedTokens(token1));
        assertTrue(paymentToken.isAccepted(token1));
        
        vm.stopPrank();
    }
    
    function testAcceptTokenRequiresAdmin() public {
        vm.startPrank(address(0x999));
        
        vm.expectRevert();
        paymentToken.acceptToken(token1);
        
        vm.stopPrank();
    }
    
    function testRemoveToken() public {
        vm.startPrank(admin);
        paymentToken.acceptToken(token1);
        
        vm.expectEmit(true, false, false, true);
        emit TokenRemoved(token1);
        
        paymentToken.removeToken(token1);
        
        assertFalse(paymentToken.acceptedTokens(token1));
        assertFalse(paymentToken.isAccepted(token1));
        
        vm.stopPrank();
    }
    
    function testRemoveTokenRequiresAdmin() public {
        vm.startPrank(admin);
        paymentToken.acceptToken(token1);
        vm.stopPrank();
        
        vm.startPrank(address(0x999));
        
        vm.expectRevert();
        paymentToken.removeToken(token1);
        
        vm.stopPrank();
    }
}