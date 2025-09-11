import { ethers } from "hardhat";

async function main() {
    console.log("🚀 部署更新的 SecretMetaverseFHE 合约...");

    // 获取部署账户
    const [deployer] = await ethers.getSigners();
    console.log("👤 部署账户:", deployer.address);
    console.log("💰 账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

    // 部署 SecretMetaverseFHE 合约
    console.log("📋 部署 SecretMetaverseFHE（包含 vote(bool) 函数）...");
    const SecretMetaverseFHE = await ethers.getContractFactory("SecretMetaverseFHE");

    // 部署合约
    const contract = await SecretMetaverseFHE.deploy();
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log("✅ SecretMetaverseFHE 部署成功!");
    console.log("📍 合约地址:", contractAddress);

    // 验证部署
    console.log("\n🔍 验证部署...");
    const owner = await contract.owner();
    console.log("👑 合约所有者:", owner);

    const worldCount = await contract.virtualWorldCount();
    console.log("🌍 虚拟世界数量:", worldCount.toString());

    const proposalCount = await contract.proposalCount();
    console.log("📋 提案数量:", proposalCount.toString());

    // 测试新的 vote(bool) 函数
    console.log("\n🧪 测试 vote(bool) 函数...");
    try {
        const gasEstimate = await contract.vote.estimateGas(true);
        console.log("✅ vote(bool) gas 估算:", gasEstimate.toString());
        console.log("✅ vote(bool) 函数可用!");
    } catch (e) {
        console.log("❌ vote(bool) 测试失败:", e.message.substring(0, 100));
    }

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
    console.log("合约名称: SecretMetaverseFHE (更新版本)");
    console.log("合约地址:", contractAddress);
    console.log("支持函数: vote(bool), voteFHE(externalEbool,bytes)");
    console.log("网络: Sepolia Testnet");
    console.log("前端兼容: ✅ 支持 vote(bool) 调用");
    console.log("FHE 支持: ✅ 保留完整 FHE 功能");

    return contractAddress;
}

main()
    .then((address) => {
        console.log(`\n🎉 部署完成! 新合约地址: ${address}`);
        console.log("请更新前端的 CONTRACT_ADDRESS 为此地址");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ 部署失败:", error);
        process.exit(1);
    });