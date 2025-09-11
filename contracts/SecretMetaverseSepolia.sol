// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SecretMetaverse - Sepolia Deployment
 * @dev Privacy-First Virtual World for Sepolia testnet
 * @notice Real blockchain implementation without FHE dependencies
 */
contract SecretMetaverse {

    // ========== STATE VARIABLES ==========

    address public owner;
    uint256 public totalVoteCount;
    uint256 public activeUserCount;

    // Virtual World data structure
    struct VirtualWorld {
        string name;
        string description;
        uint256 userCount;
        bool isActive;
    }

    // Governance proposal structure
    struct GovernanceProposal {
        string title;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        uint256 endTime;
        bool active;
        address[] voters;
    }

    // User vote tracking
    struct UserVote {
        bool vote;
        bool hasVoted;
        uint256 timestamp;
    }

    // ========== MAPPINGS ==========

    mapping(uint256 => VirtualWorld) public virtualWorlds;
    mapping(uint256 => GovernanceProposal) public proposals;
    mapping(uint256 => mapping(address => UserVote)) public userProposalVotes;
    mapping(address => bool) public hasVotedGlobal;
    mapping(address => bool) public metaverseUsers;

    // ========== COUNTERS ==========

    uint256 public virtualWorldCount;
    uint256 public proposalCount;

    // ========== EVENTS ==========

    event VoteSubmitted(address indexed voter, uint256 indexed proposalId);
    event VirtualWorldCreated(uint256 indexed worldId, string name);
    event ProposalCreated(uint256 indexed proposalId, string title);
    event UserJoinedMetaverse(address indexed user);

    // ========== MODIFIERS ==========

    modifier onlyOwner() {
        require(msg.sender == owner, "SecretMetaverse: caller is not the owner");
        _;
    }

    modifier validProposal(uint256 _proposalId) {
        require(_proposalId < proposalCount, "SecretMetaverse: invalid proposal ID");
        require(proposals[_proposalId].active, "SecretMetaverse: proposal is not active");
        require(block.timestamp <= proposals[_proposalId].endTime, "SecretMetaverse: voting period ended");
        _;
    }

    // ========== CONSTRUCTOR ==========

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

    // ========== MAIN VOTING FUNCTIONS ==========

    /**
     * @dev Submit a vote for governance proposal
     * @param _proposalId The ID of the proposal to vote on
     * @param _vote Boolean vote (true = for, false = against)
     */
    function voteOnProposal(uint256 _proposalId, bool _vote) external validProposal(_proposalId) {
        require(!userProposalVotes[_proposalId][msg.sender].hasVoted, "SecretMetaverse: already voted on this proposal");

        // Store vote
        userProposalVotes[_proposalId][msg.sender] = UserVote({
            vote: _vote,
            hasVoted: true,
            timestamp: block.timestamp
        });

        GovernanceProposal storage proposal = proposals[_proposalId];
        proposal.voters.push(msg.sender);

        // Update vote counts
        if (_vote) {
            proposal.forVotes++;
        } else {
            proposal.againstVotes++;
        }

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

    // ========== VIEW FUNCTIONS ==========

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
        require(_worldId < virtualWorldCount, "SecretMetaverse: invalid world ID");
        VirtualWorld storage world = virtualWorlds[_worldId];
        return (world.name, world.description, world.userCount, world.isActive);
    }

    /**
     * @dev Get governance proposal information
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
        require(_proposalId < proposalCount, "SecretMetaverse: invalid proposal ID");
        GovernanceProposal storage proposal = proposals[_proposalId];
        return (
            proposal.title,
            proposal.description,
            proposal.forVotes,
            proposal.againstVotes,
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
     * @dev Get user vote for specific proposal
     */
    function getUserVote(uint256 _proposalId, address _user) external view returns (
        bool userVote,
        bool voted,
        uint256 timestamp
    ) {
        UserVote storage uv = userProposalVotes[_proposalId][_user];
        return (uv.vote, uv.hasVoted, uv.timestamp);
    }

    // ========== ADMIN FUNCTIONS ==========

    /**
     * @dev Create a new virtual world (only owner)
     */
    function createVirtualWorld(string memory _name, string memory _description) external onlyOwner {
        require(virtualWorldCount < 10, "SecretMetaverse: maximum worlds reached");
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
        require(_worldId < virtualWorldCount, "SecretMetaverse: invalid world ID");
        virtualWorlds[_worldId].userCount = _userCount;
    }

    // ========== INTERNAL FUNCTIONS ==========

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
        newProposal.forVotes = 0;
        newProposal.againstVotes = 0;
        newProposal.startTime = block.timestamp;
        newProposal.endTime = block.timestamp + _duration;
        newProposal.active = true;

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
        require(_newOwner != address(0), "SecretMetaverse: new owner is the zero address");
        owner = _newOwner;
    }
}