// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract CreatorToken is ERC20, AccessControl {
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");
    
    address public creator;
    uint256 public price;
    
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);
    
    constructor(
        string memory name,
        string memory symbol,
        address _creator,
        uint256 _price
    ) ERC20(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, _creator);
        _grantRole(CREATOR_ROLE, _creator);
        creator = _creator;
        price = _price;
    }
    
    function mint(uint256 amount) external onlyRole(CREATOR_ROLE) {
        _mint(creator, amount);
    }
    
    function purchase(uint256 amount) external payable {
        require(msg.value >= amount * price, "Insufficient payment");
        _mint(msg.sender, amount);
        
        emit TokensPurchased(msg.sender, amount, msg.value);
    }
    
    function withdraw() external onlyRole(CREATOR_ROLE) {
        payable(creator).transfer(address(this).balance);
    }
}