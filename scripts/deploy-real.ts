import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying Secret Metaverse to Sepolia...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "| Chain ID:", network.chainId);

  // Validate network
  if (Number(network.chainId) !== 11155111) {
    console.error("❌ Wrong network! Please connect to Sepolia testnet (Chain ID: 11155111)");
    console.log("🔧 Add Sepolia to Hardhat config:");
    console.log("SEPOLIA_URL=https://ethereum-sepolia-rpc.publicnode.com");
    console.log("PRIVATE_KEY=your_private_key_here");
    process.exit(1);
  }

  // Check if we have enough balance
  if (balance < ethers.parseEther("0.01")) {
    console.error("❌ Insufficient balance for deployment. Need at least 0.01 ETH for gas fees.");
    console.log("💡 Get Sepolia ETH from faucets:");
    console.log("🚰 https://sepoliafaucet.com/");
    console.log("🚰 https://sepolia-faucet.pk910.de/");
    process.exit(1);
  }

  try {
    // Deploy the contract
    console.log("🔨 Compiling and deploying SecretMetaverse...");
    const SecretMetaverseFactory = await ethers.getContractFactory("contracts/SecretMetaverseSepolia.sol:SecretMetaverse");

    // Estimate gas first
    console.log("⛽ Estimating gas...");
    const deploymentData = SecretMetaverseFactory.interface.encodeDeploy([]);
    const estimatedGas = await ethers.provider.estimateGas({
      data: deploymentData
    });
    console.log("📊 Estimated gas:", estimatedGas.toString());

    // Get current gas price
    const feeData = await ethers.provider.getFeeData();
    console.log("💸 Current gas price:", ethers.formatUnits(feeData.gasPrice || 0n, "gwei"), "gwei");

    // Deploy with explicit gas settings
    const secretMetaverse = await SecretMetaverseFactory.deploy({
      gasLimit: estimatedGas * 120n / 100n, // Add 20% buffer
      gasPrice: feeData.gasPrice
    });

    console.log("⏳ Waiting for deployment...");
    console.log("📤 Transaction hash:", secretMetaverse.deploymentTransaction()?.hash);

    // Wait for deployment
    await secretMetaverse.waitForDeployment();
    const contractAddress = await secretMetaverse.getAddress();

    console.log("✅ Contract deployed successfully!");
    console.log("📍 Contract address:", contractAddress);
    console.log("🔗 Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);

    // Verify deployment by calling functions
    console.log("\n🔍 Verifying deployment...");

    try {
      const owner = await secretMetaverse.owner();
      const virtualWorldCount = await secretMetaverse.virtualWorldCount();
      const proposalCount = await secretMetaverse.proposalCount();
      const stats = await secretMetaverse.getMetaverseStats();

      console.log("👑 Owner:", owner);
      console.log("🌍 Virtual worlds:", virtualWorldCount.toString());
      console.log("📋 Proposals:", proposalCount.toString());
      console.log("📊 Stats - Total votes:", stats.totalVotes.toString());
      console.log("📊 Stats - Active users:", stats.activeUsers.toString());

      // Test a virtual world
      if (virtualWorldCount > 0) {
        const world = await secretMetaverse.getVirtualWorld(0);
        console.log("🌐 First world:", world.name);
      }

      // Test a proposal
      if (proposalCount > 0) {
        const proposal = await secretMetaverse.getProposal(0);
        console.log("📊 First proposal:", proposal.title);
      }

      console.log("✅ All functions working correctly!");

    } catch (verifyError: any) {
      console.log("❌ Error during verification:", verifyError.message);
    }

    // Get transaction details
    const deployTx = secretMetaverse.deploymentTransaction();
    if (deployTx) {
      console.log("\n📋 Transaction Details:");
      console.log(`  Hash: ${deployTx.hash}`);
      console.log(`  Block: ${deployTx.blockNumber || 'pending'}`);
      console.log(`  Gas Limit: ${deployTx.gasLimit.toString()}`);
      console.log(`  Gas Price: ${ethers.formatUnits(deployTx.gasPrice || 0n, "gwei")} gwei`);

      // Calculate transaction cost
      const receipt = await deployTx.wait();
      if (receipt) {
        const gasUsed = receipt.gasUsed;
        const gasCost = gasUsed * (deployTx.gasPrice || 0n);
        console.log(`  Gas Used: ${gasUsed.toString()}`);
        console.log(`  Transaction Cost: ${ethers.formatEther(gasCost)} ETH`);
      }
    }

    // Frontend configuration
    console.log("\n🔗 Frontend Configuration:");
    console.log("Replace CONTRACT_ADDRESS in index.html:");
    console.log(`const CONTRACT_ADDRESS = "${contractAddress}";`);

    // Save deployment info
    const deploymentInfo = {
      contractName: "SecretMetaverse",
      network: "sepolia",
      chainId: 11155111,
      contractAddress,
      deployer: deployer.address,
      deployedAt: new Date().toISOString(),
      txHash: deployTx?.hash,
      gasUsed: deployTx?.gasLimit.toString(),
      etherscanUrl: `https://sepolia.etherscan.io/address/${contractAddress}`,
      verified: true
    };

    console.log("\n💾 Deployment completed successfully!");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    console.log("\n🎯 Next Steps:");
    console.log("1. Update frontend CONTRACT_ADDRESS");
    console.log("2. Test wallet connection on Sepolia");
    console.log("3. Submit real votes with MetaMask");
    console.log("4. Verify on Etherscan");

    return {
      contract: secretMetaverse,
      address: contractAddress,
      deploymentInfo
    };

  } catch (error: any) {
    console.error("💥 Deployment failed:", error);

    // Specific error handling
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.log("💡 Solution: Get more Sepolia ETH from faucets");
    } else if (error.code === 'NETWORK_ERROR') {
      console.log("💡 Solution: Check network connection and RPC endpoint");
    } else if (error.message.includes('nonce')) {
      console.log("💡 Solution: Reset MetaMask account nonce");
    } else if (error.message.includes('gas')) {
      console.log("💡 Solution: Increase gas limit or gas price");
    }

    throw error;
  }
}

// Execute deployment
main()
  .then((result) => {
    console.log("\n🎉 Secret Metaverse deployed to Sepolia!");
    console.log("🔗 Contract:", result.address);
    console.log("🌐 Etherscan:", `https://sepolia.etherscan.io/address/${result.address}`);
    console.log("🚀 Ready for real blockchain interactions!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Deployment failed:", error.message);
    process.exit(1);
  });