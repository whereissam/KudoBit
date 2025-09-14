// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract LoyaltyToken is ERC1155, Ownable {
    using Strings for uint256;
    
    string public name = "Loyalty Badges";
    string public symbol = "LB";
    
    mapping(uint256 => string) private _tokenURIs;
    mapping(address => bool) public authorizedMinters;
    
    uint256 public constant BRONZE_BADGE = 1;
    uint256 public constant SILVER_BADGE = 2;
    uint256 public constant GOLD_BADGE = 3;
    uint256 public constant DIAMOND_BADGE = 4;
    
    constructor() ERC1155("") Ownable(msg.sender) {
        _setTokenURI(BRONZE_BADGE, "https://ipfs.io/bronze-badge.json");
        _setTokenURI(SILVER_BADGE, "https://ipfs.io/silver-badge.json");
        _setTokenURI(GOLD_BADGE, "https://ipfs.io/gold-badge.json");
        _setTokenURI(DIAMOND_BADGE, "https://ipfs.io/diamond-badge.json");
    }
    
    function setAuthorizedMinter(address minter, bool authorized) public onlyOwner {
        authorizedMinters[minter] = authorized;
    }
    
    function mintBadge(address recipient, uint256 badgeId, uint256 amount) public {
        require(
            authorizedMinters[msg.sender] || msg.sender == owner(),
            "Not authorized to mint"
        );
        _mint(recipient, badgeId, amount, "");
    }
    
    function mintBadgeBatch(
        address recipient,
        uint256[] memory badgeIds,
        uint256[] memory amounts
    ) public {
        require(
            authorizedMinters[msg.sender] || msg.sender == owner(),
            "Not authorized to mint"
        );
        _mintBatch(recipient, badgeIds, amounts, "");
    }
    
    function uri(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }
    
    function _setTokenURI(uint256 tokenId, string memory tokenURI) internal {
        _tokenURIs[tokenId] = tokenURI;
    }
    
    function setTokenURI(uint256 tokenId, string memory tokenURI) public onlyOwner {
        _setTokenURI(tokenId, tokenURI);
    }
}