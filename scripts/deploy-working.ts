import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying SecretMetaverse (Simple Version)...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  try {
    // Deploy the simple contract
    console.log("🔨 Deploying SecretMetaverse (Simple)...");
    const SecretMetaverseFactory = await ethers.getContractFactory("contracts/SecretMetaverseSimple.sol:SecretMetaverse");

    // Deploy contract
    const secretMetaverse = await SecretMetaverseFactory.deploy();

    console.log("⏳ Waiting for deployment transaction...");

    // Wait for deployment to complete
    await secretMetaverse.waitForDeployment();
    const contractAddress = await secretMetaverse.getAddress();

    console.log("✅ SecretMetaverse (Simple) deployed successfully!");
    console.log("📍 Contract address:", contractAddress);

    // Verify deployment by calling some view functions
    console.log("\n🔍 Verifying deployment...");

    try {
      const owner = await secretMetaverse.owner();
      const virtualWorldCount = await secretMetaverse.virtualWorldCount();
      const proposalCount = await secretMetaverse.proposalCount();

      console.log("👑 Owner:", owner);
      console.log("🌍 Virtual worlds:", virtualWorldCount.toString());
      console.log("📋 Proposals:", proposalCount.toString());

      // Get metaverse statistics
      const stats = await secretMetaverse.getMetaverseStats();
      console.log("\n📈 Metaverse Statistics:");
      console.log(`  Active Users: ${stats.activeUsers}`);
      console.log(`  Total Worlds: ${stats.totalWorlds}`);
      console.log(`  Active Proposals: ${stats.activeProposals}`);
      console.log(`  Total Votes: ${stats.totalVotes}`);

    } catch (verifyError: any) {
      console.log("❌ Error during verification:", verifyError.message);
    }

    console.log("\n🔗 Frontend Configuration:");
    console.log(`const CONTRACT_ADDRESS = "${contractAddress}";`);

    return {
      contract: secretMetaverse,
      address: contractAddress
    };

  } catch (error: any) {
    console.error("💥 Deployment failed:", error.message);
    throw error;
  }
}

// Execute deployment
main()
  .then((result) => {
    console.log("\n🎉 SecretMetaverse deployment completed!");
    console.log("🔗 Contract Address:", result.address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Deployment failed:", error.message);
    process.exit(1);
  });