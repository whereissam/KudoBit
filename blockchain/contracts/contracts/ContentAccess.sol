// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ContentAccess is AccessControl, ReentrancyGuard {
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");
    
    struct Content {
        uint256 productId;
        string contentHash;
        address creator;
        bool active;
    }
    
    uint256 public contentCounter;
    
    mapping(uint256 => Content) public contents;
    mapping(address => mapping(uint256 => bool)) public hasAccess;
    mapping(uint256 => uint256[]) public productContent;
    
    event ContentCreated(uint256 indexed contentId, uint256 indexed productId, address creator);
    event AccessGranted(address indexed user, uint256 indexed contentId);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(CREATOR_ROLE, msg.sender);
    }
    function createContent(
        uint256 productId,
        string calldata contentHash
    ) external onlyRole(CREATOR_ROLE) returns (uint256) {
        contentCounter++;
        uint256 contentId = contentCounter;
        
        contents[contentId] = Content({
            productId: productId,
            contentHash: contentHash,
            creator: msg.sender,
            active: true
        });
        
        productContent[productId].push(contentId);
        
        emit ContentCreated(contentId, productId, msg.sender);
        return contentId;
    }
    function grantAccess(address user, uint256 contentId) external {
        Content memory content = contents[contentId];
        require(content.active, "Content not active");
        require(content.creator == msg.sender || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not authorized");
        
        hasAccess[user][contentId] = true;
        emit AccessGranted(user, contentId);
    }
    
    function getProductContent(uint256 productId) external view returns (uint256[] memory) {
        return productContent[productId];
    }
}