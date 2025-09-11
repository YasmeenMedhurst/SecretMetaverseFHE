import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying SimpleVoting to Sepolia...");

  // Use a well-funded test account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH");

  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "Chain ID:", network.chainId);

  try {
    // Deploy simple contract
    const SimpleVotingFactory = await ethers.getContractFactory("SimpleVoting");

    // Use specific gas settings for Sepolia
    const simpleVoting = await SimpleVotingFactory.deploy({
      gasLimit: 500000,
      gasPrice: ethers.parseUnits("2", "gwei")
    });

    console.log("⏳ Waiting for deployment...");
    console.log("📤 TX Hash:", simpleVoting.deploymentTransaction()?.hash);

    await simpleVoting.waitForDeployment();
    const address = await simpleVoting.getAddress();

    console.log("✅ SimpleVoting deployed!");
    console.log("📍 Address:", address);
    console.log("🔗 Etherscan:", `https://sepolia.etherscan.io/address/${address}`);

    // Test the contract
    console.log("\n🔍 Testing contract...");
    const owner = await simpleVoting.owner();
    const voteCount = await simpleVoting.getVoteCount();

    console.log("👑 Owner:", owner);
    console.log("🗳️ Vote count:", voteCount.toString());

    console.log("\n🔗 Frontend Update:");
    console.log(`const CONTRACT_ADDRESS = "${address}";`);

    return { contract: simpleVoting, address };

  } catch (error: any) {
    console.error("💥 Deployment failed:", error.message);
    throw error;
  }
}

main()
  .then((result) => {
    console.log("\n🎉 Deployment successful!");
    console.log("📍 Contract:", result.address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  });