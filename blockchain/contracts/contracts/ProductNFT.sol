// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract ProductNFT is ERC721, ERC721URIStorage, AccessControl, IERC2981 {
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");
    
    struct Product {
        string name;
        string description;
        uint256 price;
        bool active;
        address creator;
    }
    
    mapping(uint256 => Product) public products;
    mapping(address => uint256[]) public creatorProducts;
    mapping(uint256 => string) public contentHashes;
    
    uint256 public productCounter;
    
    event ProductCreated(uint256 indexed productId, address indexed creator, uint256 price);
    
    constructor() ERC721("KudoBit Products", "KUDO") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    function mintProduct(
        string memory name,
        string memory description,
        string memory uri,
        uint256 price,
        string memory contentHash
    ) external onlyRole(CREATOR_ROLE) returns (uint256) {
        productCounter++;
        uint256 productId = productCounter;
        
        _mint(msg.sender, productId);
        _setTokenURI(productId, uri);
        
        products[productId] = Product({
            name: name,
            description: description,
            price: price,
            active: true,
            creator: msg.sender
        });
        
        contentHashes[productId] = contentHash;
        creatorProducts[msg.sender].push(productId);
        
        emit ProductCreated(productId, msg.sender, price);
        return productId;
    }
    
    function updateProductPrice(uint256 productId, uint256 newPrice) external {
        require(ownerOf(productId) == msg.sender, "Not product owner");
        products[productId].price = newPrice;
    }
    
    function toggleProductStatus(uint256 productId) external {
        require(ownerOf(productId) == msg.sender, "Not product owner");
        products[productId].active = !products[productId].active;
    }
    
    function getCreatorProducts(address creator) external view returns (uint256[] memory) {
        return creatorProducts[creator];
    }
    
    function royaltyInfo(uint256 tokenId, uint256 salePrice) 
        external 
        view 
        override 
        returns (address, uint256) 
    {
        address creator = products[tokenId].creator;
        uint256 royaltyAmount = (salePrice * 500) / 10000; // 5% royalty
        return (creator, royaltyAmount);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl, IERC165)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
}