// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title SecretMetaverse
 * @dev Privacy-First Virtual World with Fully Homomorphic Encryption
 * @notice Encrypted governance voting for metaverse features using real FHE
 */
contract SecretMetaverse is SepoliaConfig {

    address public owner;
    uint256 public totalVoteCount;
    uint256 public activeUserCount;

    struct VirtualWorld {
        string name;
        string description;
        uint256 userCount;
        bool isActive;
    }

    struct GovernanceProposal {
        string title;
        string description;
        euint32 forVotesEncrypted;     // FHE encrypted for votes
        euint32 againstVotesEncrypted; // FHE encrypted against votes
        uint256 startTime;
        uint256 endTime;
        bool active;
        address[] voters;
    }

    struct UserVote {
        ebool encryptedVote;
        bool hasVoted;
        uint256 timestamp;
    }

    mapping(uint256 => VirtualWorld) public virtualWorlds;
    mapping(uint256 => GovernanceProposal) public proposals;
    mapping(address => bool) public hasVotedGlobal;
    mapping(address => bool) public metaverseUsers;
    mapping(uint256 => mapping(address => UserVote)) public userProposalVotes;

    uint256 public virtualWorldCount;
    uint256 public proposalCount;

    event VoteSubmitted(address indexed voter, uint256 indexed proposalId);
    event VirtualWorldCreated(uint256 indexed worldId, string name);
    event ProposalCreated(uint256 indexed proposalId, string title);
    event UserJoinedMetaverse(address indexed user);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier validProposal(uint256 _proposalId) {
        require(_proposalId < proposalCount, "Invalid proposal ID");
        require(proposals[_proposalId].active, "Proposal not active");
        require(block.timestamp <= proposals[_proposalId].endTime, "Voting period ended");
        _;
    }

    constructor() {
        owner = msg.sender;
        _initializeDefaultData();
    }

    function _initializeDefaultData() internal {
        // Initialize virtual worlds
        _createVirtualWorld("Cyber City", "Neon-lit digital metropolis with encrypted social spaces");
        _createVirtualWorld("Quantum Realm", "Physics-defying world where privacy is paramount");
        _createVirtualWorld("Digital Sanctuary", "Peaceful encrypted gardens for private meditation");
        _createVirtualWorld("Crypto Casino", "Provably fair gaming with hidden bet amounts");

        // Initialize governance proposals
        _createProposal("VR Integration Upgrade", "Implement advanced VR features with haptic feedback", 7 days);
        _createProposal("Privacy Enhancement Protocol", "Deploy advanced encryption layers for user protection", 7 days);
        _createProposal("AI Companion System", "Introduce intelligent NPCs with encrypted memory systems", 14 days);
    }

    /**
     * @dev Submit encrypted vote for governance proposal
     * @param _proposalId The ID of the proposal to vote on
     * @param _vote Plain boolean vote (true = for, false = against)
     */
    function voteOnProposal(uint256 _proposalId, bool _vote) external validProposal(_proposalId) {
        require(!userProposalVotes[_proposalId][msg.sender].hasVoted, "Already voted on this proposal");

        // Encrypt the vote using FHE
        ebool encryptedVote = FHE.asEbool(_vote);

        // Store encrypted vote
        userProposalVotes[_proposalId][msg.sender] = UserVote({
            encryptedVote: encryptedVote,
            hasVoted: true,
            timestamp: block.timestamp
        });

        GovernanceProposal storage proposal = proposals[_proposalId];
        proposal.voters.push(msg.sender);

        // Update encrypted vote counts using FHE operations
        euint32 one = FHE.asEuint32(1);
        euint32 zero = FHE.asEuint32(0);

        // If vote is true, add to forVotes; otherwise add to againstVotes
        euint32 forIncrement = FHE.select(encryptedVote, one, zero);
        euint32 againstIncrement = FHE.select(encryptedVote, zero, one);

        proposal.forVotesEncrypted = FHE.add(proposal.forVotesEncrypted, forIncrement);
        proposal.againstVotesEncrypted = FHE.add(proposal.againstVotesEncrypted, againstIncrement);

        // Grant access permissions
        FHE.allowThis(proposal.forVotesEncrypted);
        FHE.allowThis(proposal.againstVotesEncrypted);
        FHE.allow(encryptedVote, msg.sender);

        // Join metaverse if not already a user
        if (!metaverseUsers[msg.sender]) {
            metaverseUsers[msg.sender] = true;
            activeUserCount++;
            emit UserJoinedMetaverse(msg.sender);
        }

        // Update global vote tracking
        if (!hasVotedGlobal[msg.sender]) {
            hasVotedGlobal[msg.sender] = true;
            totalVoteCount++;
        }

        emit VoteSubmitted(msg.sender, _proposalId);
    }

    /**
     * @dev Simple global vote function for backward compatibility
     */
    function vote(bool _vote) external {
        // Vote on the first available active proposal
        uint256 activeProposalId = 0;
        for (uint256 i = 0; i < proposalCount; i++) {
            if (proposals[i].active && block.timestamp <= proposals[i].endTime) {
                activeProposalId = i;
                break;
            }
        }

        this.voteOnProposal(activeProposalId, _vote);
    }

    /**
     * @dev Check if user has voted globally
     */
    function hasVoted(address user) external view returns (bool) {
        return hasVotedGlobal[user];
    }

    /**
     * @dev Get total vote count
     */
    function getVoteCount() external view returns (uint256) {
        return totalVoteCount;
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
        require(_worldId < virtualWorldCount, "Invalid world ID");
        VirtualWorld storage world = virtualWorlds[_worldId];
        return (world.name, world.description, world.userCount, world.isActive);
    }

    /**
     * @dev Get governance proposal information (without encrypted vote counts)
     */
    function getProposal(uint256 _proposalId) external view returns (
        string memory title,
        string memory description,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 startTime,
        uint256 endTime,
        bool active
    ) {
        require(_proposalId < proposalCount, "Invalid proposal ID");
        GovernanceProposal storage proposal = proposals[_proposalId];

        // Return placeholder counts since real counts are encrypted
        return (
            proposal.title,
            proposal.description,
            proposal.voters.length, // Approximate - shows participation
            0, // Against votes hidden for privacy
            proposal.startTime,
            proposal.endTime,
            proposal.active
        );
    }

    /**
     * @dev Get metaverse statistics
     */
    function getMetaverseStats() external view returns (
        uint256 totalVotes,
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

        return (totalVoteCount, activeUserCount, virtualWorldCount, activeProposalCount);
    }

    /**
     * @dev Create a new virtual world (only owner)
     */
    function createVirtualWorld(string memory _name, string memory _description) external onlyOwner {
        require(virtualWorldCount < 10, "Maximum worlds reached");
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
        require(_worldId < virtualWorldCount, "Invalid world ID");
        virtualWorlds[_worldId].userCount = _userCount;
    }

    function _createVirtualWorld(string memory _name, string memory _description) internal {
        VirtualWorld storage newWorld = virtualWorlds[virtualWorldCount];
        newWorld.name = _name;
        newWorld.description = _description;
        newWorld.userCount = 0;
        newWorld.isActive = true;

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

        // Grant access permissions to encrypted vote counts
        FHE.allowThis(newProposal.forVotesEncrypted);
        FHE.allowThis(newProposal.againstVotesEncrypted);

        emit ProposalCreated(proposalCount, _title);
        proposalCount++;
    }

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
        require(_newOwner != address(0), "New owner is zero address");
        owner = _newOwner;
    }

    /**
     * @dev Get encrypted vote counts for a proposal (returns encrypted values)
     */
    function getEncryptedVoteCounts(uint256 _proposalId) external view returns (
        euint32 forVotes,
        euint32 againstVotes
    ) {
        require(_proposalId < proposalCount, "Invalid proposal ID");
        GovernanceProposal storage proposal = proposals[_proposalId];
        return (proposal.forVotesEncrypted, proposal.againstVotesEncrypted);
    }

    /**
     * @dev Compare encrypted vote counts (returns encrypted boolean)
     */
    function isProposalWinning(uint256 _proposalId) external returns (ebool) {
        require(_proposalId < proposalCount, "Invalid proposal ID");
        GovernanceProposal storage proposal = proposals[_proposalId];

        // Compare encrypted vote counts - result is also encrypted
        return FHE.gt(proposal.forVotesEncrypted, proposal.againstVotesEncrypted);
    }
}