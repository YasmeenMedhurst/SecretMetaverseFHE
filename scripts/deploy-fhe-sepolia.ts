import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying SecretMetaverseFHE to Sepolia...");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH");

  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "Chain ID:", network.chainId);

  if (network.chainId !== 11155111n) {
    throw new Error("❌ Must deploy to Sepolia network (chainId: 11155111)");
  }

  try {
    // Deploy FHE contract with gas optimization
    const SecretMetaverseFHEFactory = await ethers.getContractFactory("SecretMetaverseFHE");

    console.log("🔨 Deploying SecretMetaverseFHE...");
    const secretMetaverseFHE = await SecretMetaverseFHEFactory.deploy({
      gasLimit: 3000000,
      gasPrice: ethers.parseUnits("20", "gwei")
    });

    console.log("⏳ Waiting for deployment...");
    console.log("📤 TX Hash:", secretMetaverseFHE.deploymentTransaction()?.hash);

    await secretMetaverseFHE.waitForDeployment();
    const address = await secretMetaverseFHE.getAddress();

    console.log("✅ SecretMetaverseFHE deployed!");
    console.log("📍 Address:", address);
    console.log("🔗 Etherscan:", `https://sepolia.etherscan.io/address/${address}`);

    // Initialize contract
    console.log("\n🔧 Initializing...");

    try {
      const initWorldsTx = await secretMetaverseFHE.initializeWorlds({
        gasLimit: 500000
      });
      await initWorldsTx.wait();
      console.log("✅ Virtual worlds initialized");

      const initProposalsTx = await secretMetaverseFHE.initializeProposals({
        gasLimit: 500000
      });
      await initProposalsTx.wait();
      console.log("✅ Proposals initialized");
    } catch (initError) {
      console.warn("⚠️ Initialization failed:", initError);
    }

    // Verify deployment
    console.log("\n🔍 Verifying...");
    const owner = await secretMetaverseFHE.owner();
    const worldCount = await secretMetaverseFHE.virtualWorldCount();
    const proposalCount = await secretMetaverseFHE.proposalCount();

    console.log("👑 Owner:", owner);
    console.log("🌍 Worlds:", worldCount.toString());
    console.log("📋 Proposals:", proposalCount.toString());

    console.log("\n🔗 Frontend Update:");
    console.log(`const FHE_CONTRACT_ADDRESS = "${address}";`);

    return { contract: secretMetaverseFHE, address };

  } catch (error: any) {
    console.error("💥 Deployment failed:", error.message);
    throw error;
  }
}

main()
  .then((result) => {
    console.log("\n🎉 FHE deployment successful!");
    console.log("📍 Contract:", result.address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  });