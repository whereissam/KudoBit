// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract RoyaltyManager is AccessControl, ReentrancyGuard {
    uint256 public constant PLATFORM_FEE = 250; // 2.5%
    uint256 public constant PERCENTAGE_SCALE = 10000;
    address public platformTreasury;
    
    mapping(address => mapping(address => uint256)) public earnings; // creator => token => amount
    event RevenueDistributed(address indexed creator, address token, uint256 amount);
    event EarningsClaimed(address indexed creator, address token, uint256 amount);
    
    constructor(address _platformTreasury) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        platformTreasury = _platformTreasury;
    }
    function distributeRevenue(address creator, address token, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 platformFee = (amount * PLATFORM_FEE) / PERCENTAGE_SCALE;
        uint256 creatorAmount = amount - platformFee;
        
        earnings[platformTreasury][token] += platformFee;
        earnings[creator][token] += creatorAmount;
        
        emit RevenueDistributed(creator, token, creatorAmount);
    }
    
    function claimEarnings(address token) external nonReentrant {
        uint256 amount = earnings[msg.sender][token];
        require(amount > 0, "No earnings");
        
        earnings[msg.sender][token] = 0;
        IERC20(token).transfer(msg.sender, amount);
        
        emit EarningsClaimed(msg.sender, token, amount);
    }
}