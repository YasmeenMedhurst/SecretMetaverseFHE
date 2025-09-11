import { ethers } from "hardhat";
import { SecretMetaverseFHE } from "../typechain-types";

async function main() {
  console.log("🚀 Deploying SecretMetaverseFHE to localhost...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "| Chain ID:", network.chainId);

  // Deploy the FHE contract
  console.log("🔨 Compiling and deploying SecretMetaverseFHE...");
  const SecretMetaverseFHEFactory = await ethers.getContractFactory("contracts/SecretMetaverseFHE.sol:SecretMetaverseFHE");

  // Deploy with minimal gas
  const secretMetaverseFHE = await SecretMetaverseFHEFactory.deploy() as SecretMetaverseFHE;

  console.log("⏳ Waiting for deployment transaction...");

  // Wait for deployment to complete
  await secretMetaverseFHE.waitForDeployment();
  const contractAddress = await secretMetaverseFHE.getAddress();

  console.log("✅ SecretMetaverseFHE deployed successfully!");
  console.log("📍 Contract address:", contractAddress);

  // Initialize the contract
  console.log("\n🔧 Initializing contract...");

  try {
    console.log("Initializing virtual worlds...");
    const initWorldsTx = await secretMetaverseFHE.initializeWorlds();
    await initWorldsTx.wait();
    console.log("✅ Virtual worlds initialized");

    console.log("Initializing proposals...");
    const initProposalsTx = await secretMetaverseFHE.initializeProposals();
    await initProposalsTx.wait();
    console.log("✅ Proposals initialized");

  } catch (error) {
    console.error("❌ Error during initialization:", error);
  }

  // Verify deployment by calling some view functions
  console.log("\n🔍 Verifying deployment...");

  try {
    const owner = await secretMetaverseFHE.owner();
    const virtualWorldCount = await secretMetaverseFHE.virtualWorldCount();
    const proposalCount = await secretMetaverseFHE.proposalCount();

    console.log("👑 Owner:", owner);
    console.log("🌍 Virtual worlds:", virtualWorldCount.toString());
    console.log("📋 Proposals:", proposalCount.toString());

    // Get some virtual world data
    if (virtualWorldCount > 0) {
      console.log("\n🌐 Virtual Worlds:");
      for (let i = 0; i < Number(virtualWorldCount); i++) {
        const world = await secretMetaverseFHE.getVirtualWorld(i);
        console.log(`  ${i}: ${world.name} - ${world.description.substring(0, 50)}...`);
      }
    }

    // Get proposal data
    if (proposalCount > 0) {
      console.log("\n📊 Governance Proposals:");
      for (let i = 0; i < Number(proposalCount); i++) {
        const proposal = await secretMetaverseFHE.getProposal(i);
        console.log(`  ${i}: ${proposal.title} - Active: ${proposal.active}`);
      }
    }

    // Get metaverse statistics
    const stats = await secretMetaverseFHE.getMetaverseStats();
    console.log("\n📈 Metaverse Statistics:");
    console.log(`  Active Users: ${stats.activeUsers}`);
    console.log(`  Total Worlds: ${stats.totalWorlds}`);
    console.log(`  Active Proposals: ${stats.activeProposals}`);
    console.log(`  Total Votes: [ENCRYPTED]`); // FHE encrypted value

  } catch (error) {
    console.error("❌ Error verifying deployment:", error);
  }

  // Display connection info for frontend
  console.log("\n🔗 Frontend Configuration:");
  console.log("Update your frontend with this FHE contract address:");
  console.log(`const FHE_CONTRACT_ADDRESS = "${contractAddress}";`);

  // Get transaction details
  const deployTx = secretMetaverseFHE.deploymentTransaction();
  if (deployTx) {
    console.log("\n📋 Transaction Details:");
    console.log(`  Transaction Hash: ${deployTx.hash}`);
    console.log(`  Block Number: ${deployTx.blockNumber || 'pending'}`);
    console.log(`  Gas Used: ${deployTx.gasLimit.toString()}`);
    console.log(`  Gas Price: ${ethers.formatUnits(deployTx.gasPrice || 0n, "gwei")} gwei`);
  }

  // Save deployment information
  const deploymentInfo = {
    contractName: "SecretMetaverseFHE",
    contractAddress: contractAddress,
    deployer: deployer.address,
    network: network.name,
    chainId: Number(network.chainId),
    deployedAt: new Date().toISOString(),
    txHash: deployTx?.hash,
    blockNumber: deployTx?.blockNumber,
    gasUsed: deployTx?.gasLimit.toString(),
    gasPrice: ethers.formatUnits(deployTx?.gasPrice || 0n, "gwei"),
    isRealFHE: true,
    features: [
      "Real FHE encryption with euint32/ebool types",
      "Encrypted vote counting",
      "Privacy-preserving governance",
      "Homomorphic operations (add, select, gt)"
    ]
  };

  console.log("\n💾 FHE Contract deployment completed successfully!");
  console.log("Save this information for your records:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🎯 Next Steps:");
  console.log("1. Update frontend to use FHE contract functions");
  console.log("2. Implement encrypted voting UI with input proofs");
  console.log("3. Test real FHE transactions");
  console.log("4. Compare with simulated version for verification");

  return {
    contract: secretMetaverseFHE,
    address: contractAddress,
    deploymentInfo
  };
}

// Execute deployment
main()
  .then((result) => {
    console.log("\n🎉 SecretMetaverseFHE deployment completed!");
    console.log("🔗 FHE Contract Address:", result.address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 FHE Deployment failed:", error);
    process.exit(1);
  });