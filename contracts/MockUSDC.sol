// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockUSDC is ERC20, Ownable {
    uint8 private _decimals = 6;
    
    constructor() ERC20("Mock USDC", "USDC") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10 ** _decimals);
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    function faucet(uint256 amount) public {
        require(amount <= 1000 * 10 ** _decimals, "Amount too large");
        _mint(msg.sender, amount);
    }
}