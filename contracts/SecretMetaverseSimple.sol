// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SecretMetaverse
 * @dev Privacy-First Virtual World with Fully Homomorphic Encryption
 * @notice This contract implements encrypted governance voting for metaverse features
 * @dev Simplified version for testing without FHE dependencies
 */
contract SecretMetaverse {

    // ========== STATE VARIABLES ==========

    address public owner;
    uint256 public totalVoteCount;
    uint256 public constant MAX_VIRTUAL_WORLDS = 10;

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
        mapping(address => bool) hasVoted;
        mapping(address => bool) userVotes; // Simplified votes
    }

    // ========== MAPPINGS ==========

    mapping(uint256 => VirtualWorld) public virtualWorlds;
    mapping(uint256 => GovernanceProposal) public proposals;
    mapping(address => bool) public hasVotedGlobal;
    mapping(address => bool) private userVotes; // Simplified encrypted votes
    mapping(address => uint256) public userVoteCount;
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
        require(msg.sender == owner, "SecretMetaverse: caller is not the owner");
        _;
    }

    modifier onlyMetaverseUser() {
        require(metaverseUsers[msg.sender], "SecretMetaverse: caller is not a metaverse user");
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

        // Initialize default virtual worlds
        _createVirtualWorld("Cyber City", "Neon-lit digital metropolis with encrypted social spaces");
        _createVirtualWorld("Quantum Realm", "Physics-defying world where privacy is paramount");
        _createVirtualWorld("Digital Sanctuary", "Peaceful encrypted gardens for private meditation");
        _createVirtualWorld("Crypto Casino", "Provably fair gaming with hidden bet amounts");

        // Create initial governance proposals
        _createProposal("VR Integration Upgrade", "Implement advanced VR features with haptic feedback", 7 days);
        _createProposal("Privacy Enhancement Protocol", "Deploy advanced encryption layers for user protection", 7 days);
        _createProposal("AI Companion System", "Introduce intelligent NPCs with encrypted memory systems", 14 days);
    }

    // ========== MAIN VOTING FUNCTIONS ==========

    /**
     * @dev Submit a vote (simplified without FHE for testing)
     * @param _vote Plain boolean vote
     */
    function vote(bool _vote) external {
        require(!hasVotedGlobal[msg.sender], "SecretMetaverse: user has already voted");

        // Store simplified vote
        userVotes[msg.sender] = _vote;
        hasVotedGlobal[msg.sender] = true;
        userVoteCount[msg.sender]++;
        totalVoteCount++;

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
     * @dev Submit vote for specific governance proposal
     * @param _proposalId The ID of the proposal to vote on
     * @param _vote Plain boolean vote (true = for, false = against)
     */
    function voteOnProposal(uint256 _proposalId, bool _vote)
        external
        validProposal(_proposalId)
    {
        GovernanceProposal storage proposal = proposals[_proposalId];
        require(!proposal.hasVoted[msg.sender], "SecretMetaverse: user has already voted on this proposal");

        proposal.userVotes[msg.sender] = _vote;
        proposal.hasVoted[msg.sender] = true;

        // Update vote counts
        if (_vote) {
            proposal.forVotes++;
        } else {
            proposal.againstVotes++;
        }

        userVoteCount[msg.sender]++;

        emit VoteSubmitted(msg.sender, _proposalId);
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @dev Check if a user has voted globally
     * @param user The address to check
     * @return bool indicating if user has voted
     */
    function hasVoted(address user) external view returns (bool) {
        return hasVotedGlobal[user];
    }

    /**
     * @dev Get total vote count
     * @return uint256 total number of votes
     */
    function getVoteCount() external view returns (uint256) {
        return totalVoteCount;
    }

    /**
     * @dev Get user's vote (simplified)
     * @param user The user's address
     * @return bool user's vote
     */
    function getUserVote(address user) external view returns (bool) {
        require(hasVotedGlobal[user], "SecretMetaverse: user has not voted");
        return userVotes[user];
    }

    /**
     * @dev Get virtual world information
     * @param _worldId The ID of the virtual world
     * @return name The name of the virtual world
     * @return description The description of the virtual world
     * @return userCount The number of users in the world
     * @return isActive Whether the world is active
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
     * @param _proposalId The ID of the proposal
     * @return title The title of the proposal
     * @return description The description of the proposal
     * @return forVotes Number of votes in favor
     * @return againstVotes Number of votes against
     * @return startTime Start time of the proposal
     * @return endTime End time of the proposal
     * @return active Whether the proposal is active
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
     * @return totalVotes Total number of votes cast
     * @return activeUsers Number of active users
     * @return totalWorlds Total number of virtual worlds
     * @return activeProposals Number of active proposals
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

    // ========== ADMIN FUNCTIONS ==========

    /**
     * @dev Create a new virtual world (only owner)
     * @param _name Name of the virtual world
     * @param _description Description of the virtual world
     */
    function createVirtualWorld(string memory _name, string memory _description) external onlyOwner {
        require(virtualWorldCount < MAX_VIRTUAL_WORLDS, "SecretMetaverse: maximum worlds reached");
        _createVirtualWorld(_name, _description);
    }

    /**
     * @dev Create a new governance proposal (only owner)
     * @param _title Title of the proposal
     * @param _description Description of the proposal
     * @param _duration Duration of voting period in seconds
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
     * @param _worldId ID of the virtual world
     * @param _userCount New user count
     */
    function updateWorldUserCount(uint256 _worldId, uint256 _userCount) external onlyOwner {
        require(_worldId < virtualWorldCount, "SecretMetaverse: invalid world ID");
        virtualWorlds[_worldId].userCount = _userCount;
    }

    /**
     * @dev Deactivate a proposal
     * @param _proposalId ID of the proposal to deactivate
     */
    function deactivateProposal(uint256 _proposalId) external onlyOwner {
        require(_proposalId < proposalCount, "SecretMetaverse: invalid proposal ID");
        proposals[_proposalId].active = false;
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
        // Deactivate all active proposals
        for (uint256 i = 0; i < proposalCount; i++) {
            if (proposals[i].active) {
                proposals[i].active = false;
            }
        }
    }

    /**
     * @dev Transfer ownership (only owner)
     * @param _newOwner Address of the new owner
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "SecretMetaverse: new owner is the zero address");
        owner = _newOwner;
    }
}