import { ethers } from "hardhat";

async function testFHEVoting() {
  console.log("🧪 Testing FHE Voting contract...");

  const contractAddress = "0xC6BD14B68169DbC558046910707e725824C8391e";

  // Use the ABI directly from frontend
  const abi = [
    "function submitGuess(uint8 _guess) external",
    "function startNewRound() external",
    "function revealResult() external",
    "function getCurrentRoundInfo() external view returns (uint8, bool, bool, uint256, uint256)",
    "function getPlayerGuessStatus(address) external view returns (bool, uint256)",
    "function getCurrentHourUTC3() external view returns (uint256)",
    "function isOddHour() external view returns (bool)",
    "function isEvenHour() external view returns (bool)",
    "function isGuessTimeActive() external view returns (bool)",
    "function isRevealTimeActive() external view returns (bool)",
    "function getRoundHistory(uint8) external view returns (bool, address, uint8, uint256, uint256, uint256)"
  ];

  const contract = new ethers.Contract(contractAddress, abi, ethers.provider);

  const [owner, user1] = await ethers.getSigners();
  console.log("👑 Owner:", owner.address);
  console.log("👤 User1:", user1.address);

  try {
    // Check current time status
    console.log("\n⏰ Checking game timing...");
    const isGuessActive = await contract.isGuessTimeActive();
    const isRevealActive = await contract.isRevealTimeActive();

    console.log("🕐 Guess time active:", isGuessActive);
    console.log("🕑 Reveal time active:", isRevealActive);

    // Get current round info
    const roundInfo = await contract.getCurrentRoundInfo();
    console.log("📊 Round info:", {
      round: roundInfo[0].toString(),
      guessActive: roundInfo[1],
      revealActive: roundInfo[2],
      startTime: roundInfo[3].toString(),
      endTime: roundInfo[4].toString()
    });

    // If not in guess time, try to start new round
    if (!isGuessActive) {
      console.log("🔄 Not in guess time, attempting to start new round...");
      try {
        const startTx = await contract.startNewRound();
        console.log("📤 Start round TX:", startTx.hash);
        await startTx.wait();
        console.log("✅ New round started!");

        // Check status again
        const newIsGuessActive = await contract.isGuessTimeActive();
        console.log("🕐 New guess time active:", newIsGuessActive);
      } catch (startError) {
        console.log("❌ Could not start new round:", startError.message);
      }
    }

    // Check if we can guess now
    const finalGuessActive = await contract.isGuessTimeActive();
    if (finalGuessActive) {
      console.log("\n🗳️ Submitting test guess...");

      // Check if user has already guessed
      const [hasGuessed, guessTime] = await contract.getPlayerGuessStatus(user1.address);
      console.log("📊 User1 guess status:", hasGuessed, guessTime.toString());

      if (!hasGuessed) {
        const guessTx = await contract.connect(user1).submitGuess(5);
        console.log("📤 Guess TX:", guessTx.hash);
        await guessTx.wait();
        console.log("✅ Guess submitted successfully!");
      } else {
        console.log("ℹ️ User1 has already guessed in this round");
      }
    } else {
      console.log("❌ Still not in guess time after attempting to start new round");
    }

    console.log("\n🎉 FHE Voting test completed!");

  } catch (error: any) {
    console.error("❌ Test failed:", error.message);
    throw error;
  }
}

testFHEVoting()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Test failed:", error);
    process.exit(1);
  });