// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./BadgeChecker.sol";

contract SimpleKudoBitDAO is Ownable, ReentrancyGuard {
    IERC20 public governanceToken;
    BadgeChecker public badgeChecker;
    
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 proposalType; // 1 = fee change, 2 = treasury spend, 3 = protocol upgrade
        bytes callData;
        address target;
        uint256 value;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        bool executed;
        bool cancelled;
    }
    
    struct Vote {
        bool hasVoted;
        uint8 support; // 0 = against, 1 = for, 2 = abstain
        uint256 weight;
        string reason;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(address => uint256) public delegatedVotes;
    mapping(address => address) public delegates;
    
    uint256 public proposalCount;
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant PROPOSAL_THRESHOLD = 100_000 * 10**18; // 100k tokens
    uint256 public constant QUORUM_THRESHOLD = 4; // 4% of total supply
    uint256 public treasuryBalance;
    
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        uint256 startTime,
        uint256 endTime
    );
    
    event VoteCast(
        address indexed voter,
        uint256 indexed proposalId,
        uint8 support,
        uint256 weight,
        string reason
    );
    
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);
    event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate);
    event TreasuryFunded(address indexed funder, uint256 amount);
    
    constructor(
        address _governanceToken,
        address _badgeChecker
    ) Ownable(msg.sender) {
        governanceToken = IERC20(_governanceToken);
        badgeChecker = BadgeChecker(_badgeChecker);
    }
    
    // Fund the DAO treasury
    function fundTreasury() external payable {
        treasuryBalance += msg.value;
        emit TreasuryFunded(msg.sender, msg.value);
    }
    
    // Create a new proposal
    function propose(
        string memory title,
        string memory description,
        uint256 proposalType,
        address target,
        uint256 value,
        bytes memory callData
    ) external returns (uint256) {
        require(getVotingPower(msg.sender) >= PROPOSAL_THRESHOLD, "Insufficient voting power");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(proposalType >= 1 && proposalType <= 3, "Invalid proposal type");
        
        proposalCount++;
        
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            proposer: msg.sender,
            title: title,
            description: description,
            proposalType: proposalType,
            target: target,
            value: value,
            callData: callData,
            startTime: block.timestamp,
            endTime: block.timestamp + VOTING_PERIOD,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            executed: false,
            cancelled: false
        });
        
        emit ProposalCreated(proposalCount, msg.sender, title, block.timestamp, block.timestamp + VOTING_PERIOD);
        
        return proposalCount;
    }
    
    // Vote on a proposal
    function castVote(uint256 proposalId, uint8 support) external {
        castVoteWithReason(proposalId, support, "");
    }
    
    function castVoteWithReason(uint256 proposalId, uint8 support, string memory reason) public {
        require(proposalId <= proposalCount && proposalId > 0, "Invalid proposal");
        require(support <= 2, "Invalid vote type");
        
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.cancelled, "Proposal cancelled");
        require(!votes[proposalId][msg.sender].hasVoted, "Already voted");
        
        uint256 weight = getVotingPower(msg.sender);
        require(weight > 0, "No voting power");
        
        votes[proposalId][msg.sender] = Vote({
            hasVoted: true,
            support: support,
            weight: weight,
            reason: reason
        });
        
        if (support == 0) {
            proposal.againstVotes += weight;
        } else if (support == 1) {
            proposal.forVotes += weight;
        } else {
            proposal.abstainVotes += weight;
        }
        
        emit VoteCast(msg.sender, proposalId, support, weight, reason);
    }
    
    // Execute a proposal
    function execute(uint256 proposalId) external nonReentrant {
        require(proposalId <= proposalCount && proposalId > 0, "Invalid proposal");
        
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp > proposal.endTime, "Voting still active");
        require(!proposal.executed, "Already executed");
        require(!proposal.cancelled, "Proposal cancelled");
        
        // Check quorum
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        uint256 requiredQuorum = (governanceToken.totalSupply() * QUORUM_THRESHOLD) / 100;
        require(totalVotes >= requiredQuorum, "Quorum not reached");
        
        // Check if proposal passed (more for votes than against)
        require(proposal.forVotes > proposal.againstVotes, "Proposal failed");
        
        proposal.executed = true;
        
        // Execute the proposal
        if (proposal.target != address(0) && (proposal.value > 0 || proposal.callData.length > 0)) {
            require(address(this).balance >= proposal.value, "Insufficient treasury balance");
            
            (bool success, ) = proposal.target.call{value: proposal.value}(proposal.callData);
            require(success, "Proposal execution failed");
            
            if (proposal.value > 0) {
                treasuryBalance -= proposal.value;
            }
        }
        
        emit ProposalExecuted(proposalId);
    }
    
    // Cancel a proposal (only by proposer before execution)
    function cancel(uint256 proposalId) external {
        require(proposalId <= proposalCount && proposalId > 0, "Invalid proposal");
        
        Proposal storage proposal = proposals[proposalId];
        require(msg.sender == proposal.proposer || msg.sender == owner(), "Not authorized");
        require(!proposal.executed, "Already executed");
        require(!proposal.cancelled, "Already cancelled");
        
        proposal.cancelled = true;
        emit ProposalCancelled(proposalId);
    }
    
    // Delegate voting power
    function delegate(address delegatee) external {
        address oldDelegate = delegates[msg.sender];
        delegates[msg.sender] = delegatee;
        
        uint256 userBalance = governanceToken.balanceOf(msg.sender);
        
        if (oldDelegate != address(0)) {
            delegatedVotes[oldDelegate] -= userBalance;
        }
        
        if (delegatee != address(0)) {
            delegatedVotes[delegatee] += userBalance;
        }
        
        emit DelegateChanged(msg.sender, oldDelegate, delegatee);
    }
    
    // Get voting power (token balance + delegated votes + badge multiplier)
    function getVotingPower(address account) public view returns (uint256) {
        uint256 tokenBalance = governanceToken.balanceOf(account);
        uint256 delegated = delegatedVotes[account];
        uint256 baseVotingPower = tokenBalance + delegated;
        
        // Badge multiplier (if user has badges, increase voting power)
        if (address(badgeChecker) != address(0)) {
            (uint256 highestTier, ) = badgeChecker.getUserHighestTier(account);
            if (highestTier == 4) { // Diamond
                baseVotingPower = (baseVotingPower * 120) / 100; // 20% bonus
            } else if (highestTier == 3) { // Gold
                baseVotingPower = (baseVotingPower * 115) / 100; // 15% bonus
            } else if (highestTier == 2) { // Silver
                baseVotingPower = (baseVotingPower * 110) / 100; // 10% bonus
            } else if (highestTier == 1) { // Bronze
                baseVotingPower = (baseVotingPower * 105) / 100; // 5% bonus
            }
        }
        
        return baseVotingPower;
    }
    
    // Get proposal details
    function getProposal(uint256 proposalId) external view returns (
        uint256 id,
        address proposer,
        string memory title,
        string memory description,
        uint256 proposalType,
        uint256 startTime,
        uint256 endTime,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes,
        bool executed,
        bool cancelled
    ) {
        require(proposalId <= proposalCount && proposalId > 0, "Invalid proposal");
        
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.id,
            proposal.proposer,
            proposal.title,
            proposal.description,
            proposal.proposalType,
            proposal.startTime,
            proposal.endTime,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.abstainVotes,
            proposal.executed,
            proposal.cancelled
        );
    }
    
    // Get all active proposals
    function getActiveProposals() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // Count active proposals
        for (uint256 i = 1; i <= proposalCount; i++) {
            if (block.timestamp <= proposals[i].endTime && !proposals[i].executed && !proposals[i].cancelled) {
                activeCount++;
            }
        }
        
        // Create array of active proposal IDs
        uint256[] memory activeProposals = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= proposalCount; i++) {
            if (block.timestamp <= proposals[i].endTime && !proposals[i].executed && !proposals[i].cancelled) {
                activeProposals[index] = i;
                index++;
            }
        }
        
        return activeProposals;
    }
    
    // Get user's vote on a proposal
    function getVote(uint256 proposalId, address voter) external view returns (
        bool hasVoted,
        uint8 support,
        uint256 weight,
        string memory reason
    ) {
        Vote storage vote = votes[proposalId][voter];
        return (vote.hasVoted, vote.support, vote.weight, vote.reason);
    }
    
    // Emergency functions (only owner)
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
        treasuryBalance = 0;
    }
    
    function updateGovernanceToken(address newToken) external onlyOwner {
        governanceToken = IERC20(newToken);
    }
    
    function updateBadgeChecker(address newBadgeChecker) external onlyOwner {
        badgeChecker = BadgeChecker(newBadgeChecker);
    }
    
    // Get DAO statistics
    function getDAOStats() external view returns (
        uint256 totalProposals,
        uint256 activeProposals,
        uint256 executedProposals,
        uint256 treasury,
        uint256 totalSupply,
        uint256 quorumThreshold
    ) {
        uint256 active = 0;
        uint256 executed = 0;
        
        for (uint256 i = 1; i <= proposalCount; i++) {
            if (block.timestamp <= proposals[i].endTime && !proposals[i].executed && !proposals[i].cancelled) {
                active++;
            }
            if (proposals[i].executed) {
                executed++;
            }
        }
        
        return (
            proposalCount,
            active,
            executed,
            treasuryBalance,
            governanceToken.totalSupply(),
            (governanceToken.totalSupply() * QUORUM_THRESHOLD) / 100
        );
    }
    
    receive() external payable {
        treasuryBalance += msg.value;
        emit TreasuryFunded(msg.sender, msg.value);
    }
}