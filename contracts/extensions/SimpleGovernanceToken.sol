// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleGovernanceToken is ERC20, ERC20Burnable, Ownable {
    // Total supply: 1 billion KUDO tokens
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;
    
    // Distribution allocations (basis points - total = 10000)
    uint256 public constant COMMUNITY_ALLOCATION = 4000; // 40%
    uint256 public constant CREATOR_ALLOCATION = 2500;   // 25%
    uint256 public constant DAO_TREASURY = 2000;         // 20%
    uint256 public constant TEAM_ALLOCATION = 1000;      // 10%
    uint256 public constant LIQUIDITY_ALLOCATION = 500;  // 5%
    
    // Distribution addresses
    address public communityTreasury;
    address public creatorRewards;
    address public daoTreasury;
    address public teamMultisig;
    address public liquidityManager;
    
    // Distribution state
    bool public distributionCompleted;
    uint256 public totalMinted;
    
    event DistributionCompleted(uint256 totalDistributed);
    event TokensMinted(address indexed to, uint256 amount, string allocation);
    
    constructor(
        address _communityTreasury,
        address _creatorRewards,
        address _daoTreasury,
        address _teamMultisig,
        address _liquidityManager
    ) 
    ERC20("KudoBit Governance Token", "KUDO") 
    Ownable(msg.sender) 
    {
        require(_communityTreasury != address(0), "Invalid community treasury");
        require(_creatorRewards != address(0), "Invalid creator rewards address");
        require(_daoTreasury != address(0), "Invalid DAO treasury");
        require(_teamMultisig != address(0), "Invalid team multisig");
        require(_liquidityManager != address(0), "Invalid liquidity manager");
        
        communityTreasury = _communityTreasury;
        creatorRewards = _creatorRewards;
        daoTreasury = _daoTreasury;
        teamMultisig = _teamMultisig;
        liquidityManager = _liquidityManager;
    }
    
    /**
     * @dev Execute initial token distribution
     * Can only be called once by the owner
     */
    function executeInitialDistribution() external onlyOwner {
        require(!distributionCompleted, "Distribution already completed");
        
        // Calculate distribution amounts
        uint256 communityAmount = (MAX_SUPPLY * COMMUNITY_ALLOCATION) / 10000;
        uint256 creatorAmount = (MAX_SUPPLY * CREATOR_ALLOCATION) / 10000;
        uint256 daoAmount = (MAX_SUPPLY * DAO_TREASURY) / 10000;
        uint256 teamAmount = (MAX_SUPPLY * TEAM_ALLOCATION) / 10000;
        uint256 liquidityAmount = (MAX_SUPPLY * LIQUIDITY_ALLOCATION) / 10000;
        
        // Mint tokens to respective addresses
        _mint(communityTreasury, communityAmount);
        emit TokensMinted(communityTreasury, communityAmount, "Community");
        
        _mint(creatorRewards, creatorAmount);
        emit TokensMinted(creatorRewards, creatorAmount, "Creator");
        
        _mint(daoTreasury, daoAmount);
        emit TokensMinted(daoTreasury, daoAmount, "DAO Treasury");
        
        _mint(teamMultisig, teamAmount);
        emit TokensMinted(teamMultisig, teamAmount, "Team");
        
        _mint(liquidityManager, liquidityAmount);
        emit TokensMinted(liquidityManager, liquidityAmount, "Liquidity");
        
        totalMinted = communityAmount + creatorAmount + daoAmount + teamAmount + liquidityAmount;
        distributionCompleted = true;
        
        emit DistributionCompleted(totalMinted);
    }
    
    /**
     * @dev Mint additional tokens for governance rewards (only owner/DAO)
     */
    function mintGovernanceRewards(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        
        _mint(to, amount);
        emit TokensMinted(to, amount, "Governance Reward");
    }
    
    /**
     * @dev Update distribution addresses (only owner)
     */
    function updateDistributionAddresses(
        address _communityTreasury,
        address _creatorRewards,
        address _daoTreasury,
        address _teamMultisig,
        address _liquidityManager
    ) external onlyOwner {
        if (_communityTreasury != address(0)) {
            communityTreasury = _communityTreasury;
        }
        if (_creatorRewards != address(0)) {
            creatorRewards = _creatorRewards;
        }
        if (_daoTreasury != address(0)) {
            daoTreasury = _daoTreasury;
        }
        if (_teamMultisig != address(0)) {
            teamMultisig = _teamMultisig;
        }
        if (_liquidityManager != address(0)) {
            liquidityManager = _liquidityManager;
        }
    }
    
    /**
     * @dev Get distribution info
     */
    function getDistributionInfo() external view returns (
        uint256 maxSupply,
        uint256 currentSupply,
        uint256 mintedAmount,
        bool completed,
        address community,
        address creator,
        address dao,
        address team,
        address liquidity
    ) {
        return (
            MAX_SUPPLY,
            totalSupply(),
            totalMinted,
            distributionCompleted,
            communityTreasury,
            creatorRewards,
            daoTreasury,
            teamMultisig,
            liquidityManager
        );
    }
    
    /**
     * @dev Get allocation percentages
     */
    function getAllocationPercentages() external pure returns (
        uint256 community,
        uint256 creator,
        uint256 dao,
        uint256 team,
        uint256 liquidity
    ) {
        return (
            COMMUNITY_ALLOCATION / 100, // Convert basis points to percentage
            CREATOR_ALLOCATION / 100,
            DAO_TREASURY / 100,
            TEAM_ALLOCATION / 100,
            LIQUIDITY_ALLOCATION / 100
        );
    }
}