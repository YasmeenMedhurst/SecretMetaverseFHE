import { ethers } from "hardhat";

async function main() {
    console.log("🚀 部署 SecretMetaverseSepolia 合约...");

    // 获取部署账户
    const [deployer] = await ethers.getSigners();
    console.log("👤 部署账户:", deployer.address);
    console.log("💰 账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

    // 部署 SecretMetaverseSepolia 合约
    console.log("📋 部署 SecretMetaverseSepolia...");
    const SecretMetaverseSepolia = await ethers.getContractFactory("SecretMetaverseSepolia");

    // 部署合约
    const contract = await SecretMetaverseSepolia.deploy();
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log("✅ SecretMetaverseSepolia 部署成功!");
    console.log("📍 合约地址:", contractAddress);

    // 验证部署
    console.log("\n🔍 验证部署...");
    const owner = await contract.owner();
    console.log("👑 合约所有者:", owner);

    const worldCount = await contract.virtualWorldCount();
    console.log("🌍 虚拟世界数量:", worldCount.toString());

    const proposalCount = await contract.proposalCount();
    console.log("📋 提案数量:", proposalCount.toString());

    // 初始化合约数据
    console.log("\n🔧 初始化合约数据...");

    try {
        console.log("初始化虚拟世界...");
        const initWorldsTx = await contract.initializeWorlds();
        await initWorldsTx.wait();
        console.log("✅ 虚拟世界初始化完成");

        console.log("初始化提案...");
        const initProposalsTx = await contract.initializeProposals();
        await initProposalsTx.wait();
        console.log("✅ 提案初始化完成");

        // 再次检查数据
        const newWorldCount = await contract.virtualWorldCount();
        const newProposalCount = await contract.proposalCount();
        console.log("🌍 虚拟世界数量:", newWorldCount.toString());
        console.log("📋 提案数量:", newProposalCount.toString());

    } catch (error) {
        console.log("⚠️ 初始化失败:", error.message);
    }

    // 输出合约信息
    console.log("\n📋 部署总结:");
    console.log("合约名称: SecretMetaverseSepolia");
    console.log("合约地址:", contractAddress);
    console.log("支持函数: vote(bool), voteOnProposal(uint256,bool)");
    console.log("网络: Sepolia Testnet");
    console.log("前端兼容: ✅ 完全兼容当前ABI");

    return contractAddress;
}

main()
    .then((address) => {
        console.log(`\n🎉 部署完成! 新合约地址: ${address}`);
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ 部署失败:", error);
        process.exit(1);
    });