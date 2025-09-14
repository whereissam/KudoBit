// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract CreatorRegistry is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    struct Creator {
        string name;
        string bio;
        string avatar;
        bool verified;
        uint256 productCount;
        uint256 totalSales;
    }
    
    mapping(address => Creator) public creators;
    mapping(address => uint256[]) public creatorProducts;
    mapping(address => bool) public isRegistered;
    
    address[] public allCreators;
    uint256 public creatorCounter;
    
    event CreatorRegistered(address indexed creator);
    event CreatorVerified(address indexed creator);
    event ProductAdded(address indexed creator, uint256 indexed productId);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }
    
    function registerCreator(string memory name, string memory bio, string memory avatar) external {
        require(!isRegistered[msg.sender], "Already registered");
        
        creators[msg.sender] = Creator({
            name: name,
            bio: bio,
            avatar: avatar,
            verified: false,
            productCount: 0,
            totalSales: 0
        });
        
        isRegistered[msg.sender] = true;
        allCreators.push(msg.sender);
        creatorCounter++;
        
        emit CreatorRegistered(msg.sender);
    }
    
    function updateCreatorProfile(string memory name, string memory bio, string memory avatar) external {
        require(isRegistered[msg.sender], "Not registered");
        
        creators[msg.sender].name = name;
        creators[msg.sender].bio = bio;
        creators[msg.sender].avatar = avatar;
    }
    
    function verifyCreator(address creator) external onlyRole(VERIFIER_ROLE) {
        creators[creator].verified = true;
        emit CreatorVerified(creator);
    }
    
    function addProduct(uint256 productId) external {
        require(isRegistered[msg.sender], "Not registered");
        
        creatorProducts[msg.sender].push(productId);
        creators[msg.sender].productCount++;
        
        emit ProductAdded(msg.sender, productId);
    }
    
    function recordSale(address creator, uint256 amount) external onlyRole(ADMIN_ROLE) {
        creators[creator].totalSales += amount;
    }
    
    function getCreatorProducts(address creator) external view returns (uint256[] memory) {
        return creatorProducts[creator];
    }
    
    function getAllCreators() external view returns (address[] memory) {
        return allCreators;
    }
}