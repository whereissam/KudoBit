// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../contracts/RoyaltyManager.sol";
import "../contracts/MockUSDC.sol";

contract RoyaltyManagerTest is Test {
    RoyaltyManager public royaltyManager;
    MockUSDC public usdc;
    
    address public treasury = address(0x1);
    address public creator = address(0x2);
    address public admin = address(0x3);
    
    event RevenueDistributed(address indexed creator, address token, uint256 amount);
    event EarningsClaimed(address indexed creator, address token, uint256 amount);
    
    function setUp() public {
        vm.startPrank(admin);
        usdc = new MockUSDC();
        royaltyManager = new RoyaltyManager(treasury);
        vm.stopPrank();
    }
    
    function testDistributeRevenue() public {
        uint256 totalAmount = 1000 ether;
        uint256 expectedPlatformFee = (totalAmount * 250) / 10000; // 2.5%
        uint256 expectedCreatorAmount = totalAmount - expectedPlatformFee;
        
        vm.startPrank(admin);
        
        vm.expectEmit(true, true, false, true);
        emit RevenueDistributed(creator, address(usdc), expectedCreatorAmount);
        
        royaltyManager.distributeRevenue(creator, address(usdc), totalAmount);
        
        assertEq(royaltyManager.earnings(treasury, address(usdc)), expectedPlatformFee);
        assertEq(royaltyManager.earnings(creator, address(usdc)), expectedCreatorAmount);
        
        vm.stopPrank();
    }
    
    function testDistributeRevenueRequiresAdmin() public {
        vm.startPrank(creator);
        
        vm.expectRevert();
        royaltyManager.distributeRevenue(creator, address(usdc), 1000 ether);
        
        vm.stopPrank();
    }
    
    function testClaimEarnings() public {
        uint256 totalAmount = 1000 ether;
        uint256 expectedCreatorAmount = totalAmount - (totalAmount * 250 / 10000);
        
        // Setup: distribute revenue first
        vm.startPrank(admin);
        royaltyManager.distributeRevenue(creator, address(usdc), totalAmount);
        vm.stopPrank();
        
        // Mint USDC to royalty manager for payout
        vm.startPrank(admin);
        usdc.mint(address(royaltyManager), expectedCreatorAmount);
        vm.stopPrank();
        
        // Claim earnings
        vm.startPrank(creator);
        
        vm.expectEmit(true, true, false, true);
        emit EarningsClaimed(creator, address(usdc), expectedCreatorAmount);
        
        royaltyManager.claimEarnings(address(usdc));
        
        assertEq(royaltyManager.earnings(creator, address(usdc)), 0);
        assertEq(usdc.balanceOf(creator), expectedCreatorAmount);
        
        vm.stopPrank();
    }
    
    function testClaimEarningsWithoutBalance() public {
        vm.startPrank(creator);
        
        vm.expectRevert("No earnings");
        royaltyManager.claimEarnings(address(usdc));
        
        vm.stopPrank();
    }
    
    function testClaimEarningsWithInsufficientContractBalance() public {
        uint256 totalAmount = 1000 ether;
        
        // Setup: distribute revenue but don't fund the contract
        vm.startPrank(admin);
        royaltyManager.distributeRevenue(creator, address(usdc), totalAmount);
        vm.stopPrank();
        
        vm.startPrank(creator);
        
        // Should revert when trying to transfer tokens that don't exist
        vm.expectRevert();
        royaltyManager.claimEarnings(address(usdc));
        
        vm.stopPrank();
    }
    
    function testMultipleCreatorEarnings() public {
        address creator1 = address(0x10);
        address creator2 = address(0x11);
        
        uint256 amount1 = 1000 ether;
        uint256 amount2 = 500 ether;
        
        vm.startPrank(admin);
        royaltyManager.distributeRevenue(creator1, address(usdc), amount1);
        royaltyManager.distributeRevenue(creator2, address(usdc), amount2);
        vm.stopPrank();
        
        uint256 expectedCreator1 = amount1 - (amount1 * 250 / 10000);
        uint256 expectedCreator2 = amount2 - (amount2 * 250 / 10000);
        
        assertEq(royaltyManager.earnings(creator1, address(usdc)), expectedCreator1);
        assertEq(royaltyManager.earnings(creator2, address(usdc)), expectedCreator2);
    }
    
    function testAccumulatingEarnings() public {
        vm.startPrank(admin);
        
        royaltyManager.distributeRevenue(creator, address(usdc), 1000 ether);
        royaltyManager.distributeRevenue(creator, address(usdc), 500 ether);
        
        vm.stopPrank();
        
        uint256 total = 1500 ether;
        uint256 expectedCreatorAmount = total - (total * 250 / 10000);
        
        assertEq(royaltyManager.earnings(creator, address(usdc)), expectedCreatorAmount);
    }
    
    function testPlatformFeeConstant() public {
        assertEq(royaltyManager.PLATFORM_FEE(), 250); // 2.5%
        assertEq(royaltyManager.PERCENTAGE_SCALE(), 10000);
    }
    
    function testPlatformTreasuryAddress() public {
        assertEq(royaltyManager.platformTreasury(), treasury);
    }
    
    function testZeroAmountDistribution() public {
        vm.startPrank(admin);
        
        royaltyManager.distributeRevenue(creator, address(usdc), 0);
        
        assertEq(royaltyManager.earnings(creator, address(usdc)), 0);
        assertEq(royaltyManager.earnings(treasury, address(usdc)), 0);
        
        vm.stopPrank();
    }
    
    function testMultipleTokenTypes() public {
        MockUSDC weth = new MockUSDC(); // Using MockUSDC as a stand-in for WETH
        
        vm.startPrank(admin);
        royaltyManager.distributeRevenue(creator, address(usdc), 1000 ether);
        royaltyManager.distributeRevenue(creator, address(weth), 2000 ether);
        vm.stopPrank();
        
        uint256 expectedUSDC = 1000 ether - (1000 ether * 250 / 10000);
        uint256 expectedWETH = 2000 ether - (2000 ether * 250 / 10000);
        
        assertEq(royaltyManager.earnings(creator, address(usdc)), expectedUSDC);
        assertEq(royaltyManager.earnings(creator, address(weth)), expectedWETH);
    }
}