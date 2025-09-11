// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SimpleVoting
 * @dev Simple voting contract for Secret Metaverse
 */
contract SimpleVoting {

    address public owner;
    uint256 public totalVotes;
    uint256 public approveVotes;
    uint256 public rejectVotes;

    mapping(address => bool) public hasVoted;
    mapping(address => bool) public userVotes; // true = approve, false = reject

    event VoteSubmitted(address indexed voter, bool vote);

    constructor() {
        owner = msg.sender;
    }

    function vote(bool _vote) external {
        require(!hasVoted[msg.sender], "Already voted");

        hasVoted[msg.sender] = true;
        userVotes[msg.sender] = _vote;
        totalVotes++;

        if (_vote) {
            approveVotes++;
        } else {
            rejectVotes++;
        }

        emit VoteSubmitted(msg.sender, _vote);
    }

    function getVoteCount() external view returns (uint256) {
        return totalVotes;
    }

    function getResults() external view returns (uint256 approve, uint256 reject, uint256 total) {
        return (approveVotes, rejectVotes, totalVotes);
    }

    function getUserVote(address user) external view returns (bool voted, bool vote) {
        return (hasVoted[user], userVotes[user]);
    }
}