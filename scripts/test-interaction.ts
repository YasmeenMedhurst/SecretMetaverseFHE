import { ethers } from "hardhat";

async function testContractInteraction() {
  console.log("🧪 Testing Secret Metaverse contract interaction...");

  // Connect to deployed contract
  const contractAddress = "0xC6BD14B68169DbC558046910707e725824C8391e";
  const contract = await ethers.getContractAt("SimpleVoting", contractAddress);

  // Get signers
  const [owner, user1] = await ethers.getSigners();
  console.log("🔑 Owner address:", owner.address);
  console.log("👤 User1 address:", user1.address);

  // Test contract state
  console.log("\n📊 Initial Contract State:");
  const voteCount = await contract.getVoteCount();
  const worldCount = await contract.virtualWorldCount();
  const proposalCount = await contract.proposalCount();

  console.log("🗳️  Total votes:", voteCount.toString());
  console.log("🌍 Virtual worlds:", worldCount.toString());
  console.log("📋 Proposals:", proposalCount.toString());

  // Test voting functionality
  console.log("\n🗳️  Testing encrypted voting...");

  // Check if user1 has voted
  const hasVotedBefore = await contract.hasVoted(user1.address);
  console.log("User1 voted before:", hasVotedBefore);

  if (!hasVotedBefore) {
    // Submit a vote from user1
    console.log("Submitting vote from user1...");
    const voteTx = await contract.connect(user1).vote(true);
    console.log("📤 Vote transaction hash:", voteTx.hash);

    // Wait for transaction confirmation
    await voteTx.wait();
    console.log("✅ Vote confirmed!");

    // Check updated state
    const newVoteCount = await contract.getVoteCount();
    const hasVotedAfter = await contract.hasVoted(user1.address);

    console.log("🗳️  New total votes:", newVoteCount.toString());
    console.log("User1 voted after:", hasVotedAfter);

    // Get encrypted vote
    const encryptedVote = await contract.getUserEncryptedVote(user1.address);
    console.log("🔐 Encrypted vote hash:", encryptedVote);
  } else {
    console.log("User1 has already voted");
  }

  // Test proposal voting
  console.log("\n📊 Testing proposal voting...");
  const proposalId = 0; // Vote on first proposal
  const proposal = await contract.getProposal(proposalId);
  console.log(`Proposal: ${proposal.title}`);
  console.log(`For votes: ${proposal.forVotes}, Against votes: ${proposal.againstVotes}`);

  // Try to vote on proposal (if not already voted)
  try {
    const proposalVoteTx = await contract.connect(user1).voteOnProposal(proposalId, true);
    console.log("📤 Proposal vote transaction hash:", proposalVoteTx.hash);
    await proposalVoteTx.wait();
    console.log("✅ Proposal vote confirmed!");

    // Check updated proposal
    const updatedProposal = await contract.getProposal(proposalId);
    console.log(`Updated - For votes: ${updatedProposal.forVotes}, Against votes: ${updatedProposal.againstVotes}`);
  } catch (error) {
    console.log("User1 has already voted on this proposal");
  }

  // Get metaverse statistics
  console.log("\n📈 Final Metaverse Statistics:");
  const stats = await contract.getMetaverseStats();
  console.log(`Total Votes: ${stats.totalVotes}`);
  console.log(`Active Users: ${stats.activeUsers}`);
  console.log(`Total Worlds: ${stats.totalWorlds}`);
  console.log(`Active Proposals: ${stats.activeProposals}`);

  console.log("\n🎉 Contract interaction test completed successfully!");
}

testContractInteraction()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });