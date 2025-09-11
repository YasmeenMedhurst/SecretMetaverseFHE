// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32, ebool, externalEbool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title SecretMetaverseFHE
 * @dev Privacy-First Virtual World with True Fully Homomorphic Encryption
 * @notice This contract implements real FHE encrypted governance voting for metaverse features
 */
contract SecretMetaverseFHE is SepoliaConfig {

    // ========== STATE VARIABLES ==========

    address public owner;
    euint32 private totalVoteCountEncrypted; // Encrypted vote count
    uint256 public constant MAX_VIRTUAL_WORLDS = 10;

    // Virtual World data structure
    struct VirtualWorld {
        string name;
        string description;
        uint256 userCount;
        bool isActive;
        euint32 encryptedPopularity; // Real FHE encrypted popularity
    }

    // Governance proposal structure
    struct GovernanceProposal {
        string title;
        string description;
        euint32 forVotesEncrypted;     // FHE encrypted for votes
        euint32 againstVotesEncrypted; // FHE encrypted against votes
        uint256 startTime;
        uint256 endTime;
        bool active;
        mapping(address => bool) hasVoted;
    }

    // ========== MAPPINGS ==========

    mapping(uint256 => VirtualWorld) public virtualWorlds;
    mapping(uint256 => GovernanceProposal) public proposals;
    mapping(address => bool) public hasVotedGlobal;
    mapping(address => bool) public metaverseUsers;

    // ========== COUNTERS ==========

    uint256 public virtualWorldCount;
    uint256 public proposalCount;
    uint256 public activeUserCount;

    // ========== EVENTS ==========

    event VoteSubmitted(address indexed voter, uint256 indexed proposalId);
    event VirtualWorldCreated(uint256 indexed worldId, string name);
    event ProposalCreated(uint256 indexed proposalId, string title);
    event UserJoinedMetaverse(address indexed user);
    event EncryptedDataUpdated(address indexed user);

    // ========== MODIFIERS ==========

    modifier onlyOwner() {
        require(msg.sender == owner, "SecretMetaverseFHE: caller is not the owner");
        _;
    }

    modifier validProposal(uint256 _proposalId) {
        require(_proposalId < proposalCount, "SecretMetaverseFHE: invalid proposal ID");
        require(proposals[_proposalId].active, "SecretMetaverseFHE: proposal is not active");
        require(block.timestamp <= proposals[_proposalId].endTime, "SecretMetaverseFHE: voting period ended");
        _;
    }

    // ========== CONSTRUCTOR ==========

    constructor() {
        owner = msg.sender;
        totalVoteCountEncrypted = FHE.asEuint32(0);

        // Allow this contract to access the encrypted value
        FHE.allowThis(totalVoteCountEncrypted);
    }

    // ========== INITIALIZATION FUNCTIONS ==========

    /**
     * @dev Initialize virtual worlds (separate from constructor)
     */
    function initializeWorlds() external onlyOwner {
        require(virtualWorldCount == 0, "SecretMetaverseFHE: worlds already initialized");

        _createVirtualWorld("Cyber City", "Neon-lit digital metropolis with encrypted social spaces");
        _createVirtualWorld("Quantum Realm", "Physics-defying world where privacy is paramount");
        _createVirtualWorld("Digital Sanctuary", "Peaceful encrypted gardens for private meditation");
        _createVirtualWorld("Crypto Casino", "Provably fair gaming with hidden bet amounts");
    }

    /**
     * @dev Initialize governance proposals (separate from constructor)
     */
    function initializeProposals() external onlyOwner {
        require(proposalCount == 0, "SecretMetaverseFHE: proposals already initialized");

        _createProposal("VR Integration Upgrade", "Implement advanced VR features with haptic feedback", 7 days);
        _createProposal("Privacy Enhancement Protocol", "Deploy advanced encryption layers for user protection", 7 days);
        _createProposal("AI Companion System", "Introduce intelligent NPCs with encrypted memory systems", 14 days);
    }

    // ========== MAIN VOTING FUNCTIONS ==========

    /**
     * @dev Submit an encrypted vote using real FHE
     * @param inputEbool External encrypted boolean vote
     * @param inputProof Proof for the encrypted input
     */
    function vote(externalEbool inputEbool, bytes calldata inputProof) external {
        require(!hasVotedGlobal[msg.sender], "SecretMetaverseFHE: user has already voted");

        // Convert external encrypted input to internal format
        ebool encryptedVote = FHE.fromExternal(inputEbool, inputProof);

        // Store encrypted vote state
        hasVotedGlobal[msg.sender] = true;

        // Increment encrypted vote count
        totalVoteCountEncrypted = FHE.add(totalVoteCountEncrypted, FHE.asEuint32(1));

        // Allow access to the updated count
        FHE.allowThis(totalVoteCountEncrypted);
        FHE.allow(totalVoteCountEncrypted, msg.sender);

        // Join metaverse if not already a user
        if (!metaverseUsers[msg.sender]) {
            metaverseUsers[msg.sender] = true;
            activeUserCount++;
            emit UserJoinedMetaverse(msg.sender);
        }

        emit VoteSubmitted(msg.sender, 0); // Default proposal ID for global voting
        emit EncryptedDataUpdated(msg.sender);
    }

    /**
     * @dev Submit encrypted vote for specific governance proposal
     * @param _proposalId The ID of the proposal to vote on
     * @param inputEbool External encrypted boolean vote (true = for, false = against)
     * @param inputProof Proof for the encrypted input
     */
    function voteOnProposal(
        uint256 _proposalId,
        externalEbool inputEbool,
        bytes calldata inputProof
    ) external validProposal(_proposalId) {
        GovernanceProposal storage proposal = proposals[_proposalId];
        require(!proposal.hasVoted[msg.sender], "SecretMetaverseFHE: user has already voted on this proposal");

        // Convert external encrypted input to internal format
        ebool encryptedVote = FHE.fromExternal(inputEbool, inputProof);

        // Mark as voted
        proposal.hasVoted[msg.sender] = true;

        // Update encrypted vote counts using FHE operations
        euint32 voteValue = FHE.asEuint32(1);
        euint32 zeroValue = FHE.asEuint32(0);
        euint32 forIncrement = FHE.select(encryptedVote, voteValue, zeroValue);
        euint32 againstIncrement = FHE.select(encryptedVote, zeroValue, voteValue);

        proposal.forVotesEncrypted = FHE.add(proposal.forVotesEncrypted, forIncrement);
        proposal.againstVotesEncrypted = FHE.add(proposal.againstVotesEncrypted, againstIncrement);

        // Allow access to updated values
        FHE.allowThis(proposal.forVotesEncrypted);
        FHE.allowThis(proposal.againstVotesEncrypted);
        FHE.allow(proposal.forVotesEncrypted, msg.sender);
        FHE.allow(proposal.againstVotesEncrypted, msg.sender);

        emit VoteSubmitted(msg.sender, _proposalId);
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @dev Check if a user has voted globally
     */
    function hasVoted(address user) external view returns (bool) {
        return hasVotedGlobal[user];
    }

    /**
     * @dev Get encrypted total vote count
     */
    function getVoteCount() external view returns (euint32) {
        return totalVoteCountEncrypted;
    }

    /**
     * @dev Get virtual world information
     */
    function getVirtualWorld(uint256 _worldId) external view returns (
        string memory name,
        string memory description,
        uint256 userCount,
        bool isActive
    ) {
        require(_worldId < virtualWorldCount, "SecretMetaverseFHE: invalid world ID");
        VirtualWorld storage world = virtualWorlds[_worldId];
        return (world.name, world.description, world.userCount, world.isActive);
    }

    /**
     * @dev Get governance proposal information
     */
    function getProposal(uint256 _proposalId) external view returns (
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        bool active
    ) {
        require(_proposalId < proposalCount, "SecretMetaverseFHE: invalid proposal ID");
        GovernanceProposal storage proposal = proposals[_proposalId];
        return (
            proposal.title,
            proposal.description,
            proposal.startTime,
            proposal.endTime,
            proposal.active
        );
    }

    /**
     * @dev Get encrypted proposal vote counts
     */
    function getProposalVoteCounts(uint256 _proposalId) external view returns (
        euint32 forVotes,
        euint32 againstVotes
    ) {
        require(_proposalId < proposalCount, "SecretMetaverseFHE: invalid proposal ID");
        GovernanceProposal storage proposal = proposals[_proposalId];
        return (proposal.forVotesEncrypted, proposal.againstVotesEncrypted);
    }

    /**
     * @dev Get metaverse statistics
     */
    function getMetaverseStats() external view returns (
        euint32 totalVotes,
        uint256 activeUsers,
        uint256 totalWorlds,
        uint256 activeProposals
    ) {
        uint256 activeProposalCount = 0;
        for (uint256 i = 0; i < proposalCount; i++) {
            if (proposals[i].active && block.timestamp <= proposals[i].endTime) {
                activeProposalCount++;
            }
        }

        return (totalVoteCountEncrypted, activeUserCount, virtualWorldCount, activeProposalCount);
    }

    // ========== ADMIN FUNCTIONS ==========

    /**
     * @dev Create a new virtual world (only owner)
     */
    function createVirtualWorld(string memory _name, string memory _description) external onlyOwner {
        require(virtualWorldCount < MAX_VIRTUAL_WORLDS, "SecretMetaverseFHE: maximum worlds reached");
        _createVirtualWorld(_name, _description);
    }

    /**
     * @dev Create a new governance proposal (only owner)
     */
    function createProposal(
        string memory _title,
        string memory _description,
        uint256 _duration
    ) external onlyOwner {
        _createProposal(_title, _description, _duration);
    }

    /**
     * @dev Update virtual world user count
     */
    function updateWorldUserCount(uint256 _worldId, uint256 _userCount) external onlyOwner {
        require(_worldId < virtualWorldCount, "SecretMetaverseFHE: invalid world ID");
        virtualWorlds[_worldId].userCount = _userCount;
    }

    // ========== INTERNAL FUNCTIONS ==========

    function _createVirtualWorld(string memory _name, string memory _description) internal {
        VirtualWorld storage newWorld = virtualWorlds[virtualWorldCount];
        newWorld.name = _name;
        newWorld.description = _description;
        newWorld.userCount = 0;
        newWorld.isActive = true;

        // Initialize encrypted popularity with FHE
        newWorld.encryptedPopularity = FHE.asEuint32(0);
        FHE.allowThis(newWorld.encryptedPopularity);

        emit VirtualWorldCreated(virtualWorldCount, _name);
        virtualWorldCount++;
    }

    function _createProposal(
        string memory _title,
        string memory _description,
        uint256 _duration
    ) internal {
        GovernanceProposal storage newProposal = proposals[proposalCount];
        newProposal.title = _title;
        newProposal.description = _description;
        newProposal.forVotesEncrypted = FHE.asEuint32(0);
        newProposal.againstVotesEncrypted = FHE.asEuint32(0);
        newProposal.startTime = block.timestamp;
        newProposal.endTime = block.timestamp + _duration;
        newProposal.active = true;

        // Allow access to encrypted vote counts
        FHE.allowThis(newProposal.forVotesEncrypted);
        FHE.allowThis(newProposal.againstVotesEncrypted);

        emit ProposalCreated(proposalCount, _title);
        proposalCount++;
    }

    // ========== EMERGENCY FUNCTIONS ==========

    /**
     * @dev Emergency pause function (only owner)
     */
    function emergencyPause() external onlyOwner {
        for (uint256 i = 0; i < proposalCount; i++) {
            if (proposals[i].active) {
                proposals[i].active = false;
            }
        }
    }

    /**
     * @dev Transfer ownership (only owner)
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "SecretMetaverseFHE: new owner is the zero address");
        owner = _newOwner;
    }

    // ========== FHE UTILITY FUNCTIONS ==========

    /**
     * @dev Compare encrypted vote counts for a proposal
     */
    function isProposalWinning(uint256 _proposalId) external returns (ebool) {
        require(_proposalId < proposalCount, "SecretMetaverseFHE: invalid proposal ID");
        GovernanceProposal storage proposal = proposals[_proposalId];

        // Compare encrypted vote counts - result is also encrypted
        ebool result = FHE.gt(proposal.forVotesEncrypted, proposal.againstVotesEncrypted);

        // Allow access to the result
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);

        return result;
    }
}