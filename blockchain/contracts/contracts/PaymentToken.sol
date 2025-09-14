// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract PaymentToken is AccessControl {
    mapping(address => bool) public acceptedTokens;
    
    event TokenAccepted(address indexed token);
    event TokenRemoved(address indexed token);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    function acceptToken(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        acceptedTokens[token] = true;
        emit TokenAccepted(token);
    }
    
    function removeToken(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        acceptedTokens[token] = false;
        emit TokenRemoved(token);
    }
    
    function isAccepted(address token) external view returns (bool) {
        return acceptedTokens[token];
    }
}