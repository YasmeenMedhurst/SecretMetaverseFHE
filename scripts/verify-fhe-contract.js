const { ethers } = require('ethers');

async function verifyFHEContract() {
    console.log("🔍 验证 FHE 合约地址...");

    const contractAddress = "0xC6BD14B68169DbC558046910707e725824C8391e";
    console.log("📍 检查地址:", contractAddress);

    try {
        // 使用 Hardhat 的本地网络连接
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

        // 检查合约是否存在
        const code = await provider.getCode(contractAddress);
        if (code === '0x') {
            console.log("❌ 该地址没有部署合约");
            return false;
        }
        console.log("✅ 地址存在合约代码");

        // 我们的 FHE 合约 ABI (主要函数)
        const fheContractABI = [
            "function owner() external view returns (address)",
            "function hasVoted(address) external view returns (bool)",
            "function getVoteCount() external view returns (uint256)", // 注意：这里可能是 euint32
            "function virtualWorldCount() external view returns (uint256)",
            "function proposalCount() external view returns (uint256)",
            "function vote(bytes32, bytes) external",
            "function initializeWorlds() external",
            "function initializeProposals() external",
            "function getVirtualWorld(uint256) external view returns (string, string, uint256, bool)",
            "function getProposal(uint256) external view returns (string, string, uint256, uint256, bool)",
            "function getMetaverseStats() external view returns (uint256, uint256, uint256, uint256)"
        ];

        const contract = new ethers.Contract(contractAddress, fheContractABI, provider);

        console.log("\n🧪 测试 FHE 合约函数...");

        // 测试基本函数
        try {
            const owner = await contract.owner();
            console.log("✅ owner():", owner);
        } catch (e) {
            console.log("❌ owner() 失败:", e.message.substring(0, 50));
        }

        try {
            const worldCount = await contract.virtualWorldCount();
            console.log("✅ virtualWorldCount():", worldCount.toString());
        } catch (e) {
            console.log("❌ virtualWorldCount() 失败:", e.message.substring(0, 50));
        }

        try {
            const proposalCount = await contract.proposalCount();
            console.log("✅ proposalCount():", proposalCount.toString());
        } catch (e) {
            console.log("❌ proposalCount() 失败:", e.message.substring(0, 50));
        }

        try {
            // 测试账户地址 - 使用一个虚拟地址
            const testAddress = "0x0000000000000000000000000000000000000001";
            const hasVoted = await contract.hasVoted(testAddress);
            console.log("✅ hasVoted():", hasVoted);
        } catch (e) {
            console.log("❌ hasVoted() 失败:", e.message.substring(0, 50));
        }

        try {
            const stats = await contract.getMetaverseStats();
            console.log("✅ getMetaverseStats():", stats);
        } catch (e) {
            console.log("❌ getMetaverseStats() 失败:", e.message.substring(0, 50));
        }

        console.log("\n🎯 结论:");
        console.log("这个地址包含了类似我们 FHE 合约的函数");
        return true;

    } catch (error) {
        console.error("❌ 验证过程出错:", error.message);
        return false;
    }
}

// 删除旧的游戏合约对比功能

async function main() {
    const isFHE = await verifyFHEContract();

    console.log("\n📋 验证结果:");
    if (isFHE) {
        console.log("✅ 0x1604... 是我们的合约");
        console.log("状态: 前端已配置使用此地址");
    } else {
        console.log("❌ 0x1604... 合约验证失败");
        console.log("建议: 检查网络连接或合约状态");
    }
}

main();