import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying SecretMetaverse to Sepolia testnet...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  // Check if we have enough balance
  if (balance < ethers.parseEther("0.01")) {
    console.error("❌ Insufficient balance for deployment. Need at least 0.01 ETH for gas fees.");
    console.log("💡 Get Sepolia ETH from: https://sepoliafaucet.com/");
    process.exit(1);
  }

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "| Chain ID:", network.chainId);

  if (Number(network.chainId) !== 11155111) {
    console.error("❌ Wrong network! Please connect to Sepolia testnet (Chain ID: 11155111)");
    process.exit(1);
  }

  try {
    // Deploy the contract
    console.log("🔨 Compiling and deploying SecretMetaverse...");
    const SecretMetaverseFactory = await ethers.getContractFactory("contracts/SecretMetaverseSepolia.sol:SecretMetaverse");

    // Estimate gas
    const estimatedGas = await ethers.provider.estimateGas({
      data: SecretMetaverseFactory.bytecode
    });
    console.log("⛽ Estimated gas:", estimatedGas.toString());

    // Get current gas price
    const gasPrice = await ethers.provider.getFeeData();
    console.log("💸 Gas price:", ethers.formatUnits(gasPrice.gasPrice || 0n, "gwei"), "gwei");

    // Deploy with explicit gas settings
    const secretMetaverse = await SecretMetaverseFactory.deploy({
      gasLimit: estimatedGas * 120n / 100n, // Add 20% buffer
      gasPrice: gasPrice.gasPrice
    });

    console.log("⏳ Waiting for deployment transaction...");
    console.log("📤 Transaction hash:", secretMetaverse.deploymentTransaction()?.hash);

    // Wait for deployment to complete
    await secretMetaverse.waitForDeployment();
    const contractAddress = await secretMetaverse.getAddress();

    console.log("✅ SecretMetaverse deployed successfully!");
    console.log("📍 Contract address:", contractAddress);
    console.log("🔗 Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);

    // Get transaction details
    const deployTx = secretMetaverse.deploymentTransaction();
    if (deployTx) {
      console.log("\n📋 Transaction Details:");
      console.log(`  Transaction Hash: ${deployTx.hash}`);
      console.log(`  Block Number: ${deployTx.blockNumber || 'pending'}`);
      console.log(`  Gas Limit: ${deployTx.gasLimit.toString()}`);
      console.log(`  Gas Price: ${ethers.formatUnits(deployTx.gasPrice || 0n, "gwei")} gwei`);

      // Wait for receipt to get actual gas used
      const receipt = await deployTx.wait();
      if (receipt) {
        console.log(`  Gas Used: ${receipt.gasUsed.toString()}`);
        console.log(`  Transaction Fee: ${ethers.formatEther(receipt.gasUsed * (deployTx.gasPrice || 0n))} ETH`);
      }
    }

    // Verify deployment by calling some view functions
    console.log("\n🔍 Verifying deployment...");

    try {
      const owner = await secretMetaverse.owner();
      const virtualWorldCount = await secretMetaverse.virtualWorldCount();
      const proposalCount = await secretMetaverse.proposalCount();

      console.log("👑 Owner:", owner);
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

    } catch (verifyError: any) {
      console.log("❌ Error during verification:", verifyError.message);
    }

    // Display connection info for frontend
    console.log("\n🔗 Frontend Configuration:");
    console.log("Update your frontend with this contract address:");
    console.log(`const CONTRACT_ADDRESS = "${contractAddress}";`);

    // Save deployment information
    const deploymentInfo = {
      contractName: "SecretMetaverse",
      contractAddress: contractAddress,
      deployer: deployer.address,
      network: "sepolia",
      chainId: Number(network.chainId),
      deployedAt: new Date().toISOString(),
      txHash: deployTx?.hash,
      blockNumber: deployTx?.blockNumber,
      gasUsed: deployTx?.gasLimit.toString(),
      gasPrice: ethers.formatUnits(deployTx?.gasPrice || 0n, "gwei"),
      etherscanUrl: `https://sepolia.etherscan.io/address/${contractAddress}`,
      features: [
        "Real blockchain deployment on Sepolia",
        "Governance voting system",
        "Virtual world management",
        "User interaction tracking",
        "MetaMask integration ready"
      ]
    };

    console.log("\n💾 Deployment completed successfully!");
    console.log("Save this information for your records:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    console.log("\n🎯 Next Steps:");
    console.log("1. Update frontend CONTRACT_ADDRESS to use the new address");
    console.log("2. Test voting functionality with MetaMask");
    console.log("3. Verify contract on Etherscan (optional)");
    console.log("4. Share the dApp with users for testing");

    return {
      contract: secretMetaverse,
      address: contractAddress,
      deploymentInfo
    };

  } catch (error: any) {
    console.error("💥 Deployment failed:", error.message);

    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.log("💡 Solution: Add more Sepolia ETH to your wallet");
      console.log("🚰 Faucet: https://sepoliafaucet.com/");
    } else if (error.code === 'NETWORK_ERROR') {
      console.log("💡 Solution: Check your internet connection and RPC endpoint");
    } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
      console.log("💡 Solution: Contract constructor may have issues, check the code");
    }

    throw error;
  }
}

// Execute deployment
main()
  .then((result) => {
    console.log("\n🎉 Sepolia deployment completed!");
    console.log("🔗 Contract Address:", result.address);
    console.log("🌐 View on Etherscan:", `https://sepolia.etherscan.io/address/${result.address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Deployment failed:", error.message);
    process.exit(1);
  });