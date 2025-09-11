import { ethers } from "hardhat";
import { SecretMetaverse } from "../typechain-types";

async function main() {
  console.log("🚀 Deploying Secret Metaverse to Sepolia testnet...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "| Chain ID:", network.chainId);

  // Support both Sepolia testnet and localhost for testing
  const isSepoliaTestnet = network.chainId === 11155111n;
  const isLocalhost = network.chainId === 1337n;

  if (!isSepoliaTestnet && !isLocalhost) {
    throw new Error("❌ Wrong network! Please connect to Sepolia testnet (Chain ID: 11155111) or localhost (Chain ID: 1337)");
  }

  const networkName = isSepoliaTestnet ? "Sepolia" : "Localhost";
  console.log(`✅ Connected to ${networkName} network`);

  if (isSepoliaTestnet && parseFloat(ethers.formatEther(balance)) < 0.01) {
    throw new Error("❌ Insufficient balance! Need at least 0.01 ETH for deployment. Get Sepolia ETH from: https://sepoliafaucet.com/");
  }

  // Deploy the contract
  console.log("🔨 Compiling and deploying SecretMetaverse...");
  const SecretMetaverseFactory = await ethers.getContractFactory("contracts/SecretMetaverse.sol:SecretMetaverse");

  // Get gas price for deployment
  const gasPrice = await ethers.provider.getFeeData();
  console.log("💸 Gas price:", ethers.formatUnits(gasPrice.gasPrice || 0n, "gwei"), "gwei");

  // Deploy the contract
  const secretMetaverse = await SecretMetaverseFactory.deploy() as SecretMetaverse;

  console.log("⏳ Waiting for deployment transaction...");

  // Wait for deployment to complete
  await secretMetaverse.waitForDeployment();
  const contractAddress = await secretMetaverse.getAddress();

  console.log("✅ SecretMetaverse deployed successfully!");
  console.log("📍 Contract address:", contractAddress);
  console.log("🔗 Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);

  // Verify deployment by calling some view functions
  console.log("\n🔍 Verifying deployment...");

  try {
    const owner = await secretMetaverse.owner();
    const totalVotes = await secretMetaverse.getVoteCount();
    const virtualWorldCount = await secretMetaverse.virtualWorldCount();
    const proposalCount = await secretMetaverse.proposalCount();

    console.log("👑 Owner:", owner);
    console.log("🗳️  Total votes:", totalVotes.toString());
    console.log("🌍 Virtual worlds:", virtualWorldCount.toString());
    console.log("📋 Proposals:", proposalCount.toString());

    // Get some virtual world data
    if (virtualWorldCount > 0) {
      console.log("\n🌐 Virtual Worlds:");
      for (let i = 0; i < Number(virtualWorldCount); i++) {
        const world = await secretMetaverse.getVirtualWorld(i);
        console.log(`  ${i}: ${world.name} - ${world.description.substring(0, 50)}...`);
      }
    }

    // Get proposal data
    if (proposalCount > 0) {
      console.log("\n📊 Governance Proposals:");
      for (let i = 0; i < Number(proposalCount); i++) {
        const proposal = await secretMetaverse.getProposal(i);
        console.log(`  ${i}: ${proposal.title} - Active: ${proposal.active}`);
      }
    }

    // Get metaverse statistics
    const stats = await secretMetaverse.getMetaverseStats();
    console.log("\n📈 Metaverse Statistics:");
    console.log(`  Total Votes: ${stats.totalVotes}`);
    console.log(`  Active Users: ${stats.activeUsers}`);
    console.log(`  Total Worlds: ${stats.totalWorlds}`);
    console.log(`  Active Proposals: ${stats.activeProposals}`);

  } catch (error) {
    console.error("❌ Error verifying deployment:", error);
  }

  // Display connection info for frontend
  console.log("\n🔗 Frontend Configuration:");
  console.log("Update your frontend with this contract address:");
  console.log(`const CONTRACT_ADDRESS = "${contractAddress}";`);

  // Get transaction details
  const deployTx = secretMetaverse.deploymentTransaction();
  if (deployTx) {
    console.log("\n📋 Transaction Details:");
    console.log(`  Transaction Hash: ${deployTx.hash}`);
    console.log(`  Block Number: ${deployTx.blockNumber || 'pending'}`);
    console.log(`  Gas Used: ${deployTx.gasLimit.toString()}`);
    console.log(`  Gas Price: ${ethers.formatUnits(deployTx.gasPrice || 0n, "gwei")} gwei`);
  }

  // Save deployment information
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: deployer.address,
    network: network.name,
    chainId: Number(network.chainId),
    deployedAt: new Date().toISOString(),
    txHash: deployTx?.hash,
    blockNumber: deployTx?.blockNumber,
    gasUsed: deployTx?.gasLimit.toString(),
    gasPrice: ethers.formatUnits(deployTx?.gasPrice || 0n, "gwei"),
    etherscan: isSepoliaTestnet ? `https://sepolia.etherscan.io/address/${contractAddress}` : `http://localhost:8545`,
    actualCost: deployTx ? ethers.formatEther((deployTx.gasLimit || 0n) * (deployTx.gasPrice || 0n)) : "0"
  };

  console.log("\n💾 Deployment completed successfully!");
  console.log("Save this information for your records:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🎯 Next Steps:");
  console.log("1. Update frontend CONTRACT_ADDRESS with:", contractAddress);
  console.log("2. Verify contract on Etherscan (optional)");
  console.log("3. Test the dApp with real transactions");
  console.log("4. Share the contract address with users");

  return {
    contract: secretMetaverse,
    address: contractAddress,
    deploymentInfo
  };
}

// Execute deployment
main()
  .then((result) => {
    console.log("\n🎉 Secret Metaverse deployment completed!");
    console.log("🔗 Contract Address:", result.address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Deployment failed:", error);
    process.exit(1);
  });