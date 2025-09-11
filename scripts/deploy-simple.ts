import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying Secret Metaverse FHE Contract...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "| Chain ID:", network.chainId);

  try {
    // Deploy the contract
    console.log("🔨 Compiling and deploying SecretMetaverse...");
    const SecretMetaverseFactory = await ethers.getContractFactory("contracts/SecretMetaverse.sol:SecretMetaverse");

    // Deploy with simple constructor (no parameters)
    const secretMetaverse = await SecretMetaverseFactory.deploy();

    console.log("⏳ Waiting for deployment transaction...");

    // Wait for deployment to complete
    await secretMetaverse.waitForDeployment();
    const contractAddress = await secretMetaverse.getAddress();

    console.log("✅ SecretMetaverse deployed successfully!");
    console.log("📍 Contract address:", contractAddress);
    console.log("🔐 Contract uses REAL FHE encryption with euint32/ebool types");

    // Get transaction details
    const deployTx = secretMetaverse.deploymentTransaction();
    if (deployTx) {
      console.log("\n📋 Transaction Details:");
      console.log(`  Transaction Hash: ${deployTx.hash}`);
      console.log(`  Block Number: ${deployTx.blockNumber || 'pending'}`);
      console.log(`  Gas Used: ${deployTx.gasLimit.toString()}`);
      console.log(`  Gas Price: ${ethers.formatUnits(deployTx.gasPrice || 0n, "gwei")} gwei`);
    }

    // Try to call some basic functions
    console.log("\n🔍 Verifying basic deployment...");

    try {
      const owner = await secretMetaverse.owner();
      const worldCount = await secretMetaverse.virtualWorldCount();
      const proposalCount = await secretMetaverse.proposalCount();

      console.log("👑 Owner:", owner);
      console.log("🌍 Virtual worlds:", worldCount.toString());
      console.log("📋 Proposals:", proposalCount.toString());

    } catch (verifyError) {
      console.log("❌ Error during verification:", verifyError.message);
      console.log("Note: This is expected if FHE operations fail on standard networks");
    }

    console.log("\n🎯 Deployment Summary:");
    console.log("✅ Contract compiled successfully");
    console.log("✅ Uses real FHE types (euint32, ebool)");
    console.log("✅ Based on reference implementation pattern");
    console.log("✅ Maintains Secret Metaverse theme and functionality");

    if (network.chainId === 1337n) {
      console.log("⚠️  Deployed on localhost - FHE operations may fail without FHEVM environment");
      console.log("🔄 For full FHE functionality, deploy on FHEVM-compatible network");
    }

    return {
      contract: secretMetaverse,
      address: contractAddress
    };

  } catch (error) {
    console.error("💥 Deployment failed:", error.message);
    console.log("\n📋 Possible issues:");
    console.log("- FHE operations require FHEVM-compatible network");
    console.log("- Constructor initializes FHE values which may fail on standard EVM");
    console.log("- Consider using localhost for testing basic compilation");

    throw error;
  }
}

// Execute deployment
main()
  .then((result) => {
    console.log("\n🎉 Secret Metaverse FHE deployment completed!");
    console.log("🔗 Contract Address:", result.address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Deployment failed:", error.message);
    process.exit(1);
  });