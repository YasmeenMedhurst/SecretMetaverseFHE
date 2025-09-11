import { ethers } from "hardhat";

async function testSimpleVoting() {
  console.log("🧪 Testing SimpleVoting contract...");

  const contractAddress = "0xC6BD14B68169DbC558046910707e725824C8391e";
  const contract = await ethers.getContractAt("SimpleVoting", contractAddress);

  const [owner, user1] = await ethers.getSigners();
  console.log("👑 Owner:", owner.address);
  console.log("👤 User1:", user1.address);

  try {
    // Test initial state
    const voteCount = await contract.getVoteCount();
    const contractOwner = await contract.owner();
    console.log("🗳️ Initial vote count:", voteCount.toString());
    console.log("👑 Contract owner:", contractOwner);

    // Check if user1 has voted
    const [hasVoted, userVote] = await contract.getUserVote(user1.address);
    console.log("✅ User1 has voted:", hasVoted);

    if (!hasVoted) {
      // Submit a vote
      console.log("📤 Submitting vote from user1...");
      const tx = await contract.connect(user1).vote(true);
      console.log("🔗 Transaction hash:", tx.hash);

      await tx.wait();
      console.log("✅ Vote confirmed!");

      // Check updated state
      const newVoteCount = await contract.getVoteCount();
      const [newHasVoted, newUserVote] = await contract.getUserVote(user1.address);
      const results = await contract.getResults();

      console.log("📊 New vote count:", newVoteCount.toString());
      console.log("✅ User1 voted:", newHasVoted, "Vote:", newUserVote);
      console.log("📊 Results - Approve:", results[0].toString(), "Reject:", results[1].toString(), "Total:", results[2].toString());
    }

    console.log("🎉 SimpleVoting test completed successfully!");

  } catch (error: any) {
    console.error("❌ Test failed:", error.message);
    throw error;
  }
}

testSimpleVoting()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Test failed:", error);
    process.exit(1);
  });