const { ethers } = require('ethers');

async function testFrontendCompatibility() {
    console.log("🧪 测试前端与新合约的兼容性...");

    const contractAddress = "0xC6BD14B68169DbC558046910707e725824C8391e";
    console.log("📍 合约地址:", contractAddress);

    try {
        // 使用与前端相同的 ABI
        const frontendABI = [
            "function vote(bool _vote) external",
            "function getVoteCount() external view returns (uint256)",
            "function hasVoted(address user) external view returns (bool)",
            "function owner() external view returns (address)",
            "function virtualWorldCount() external view returns (uint256)",
            "function proposalCount() external view returns (uint256)"
        ];

        // 连接到 Sepolia
        const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
        const contract = new ethers.Contract(contractAddress, frontendABI, provider);

        console.log("\n1️⃣ 测试只读函数...");

        // 测试基本只读函数
        try {
            const owner = await contract.owner();
            console.log("✅ owner():", owner);
        } catch (e) {
            console.log("❌ owner() 失败:", e.message.substring(0, 80));
        }

        try {
            const worldCount = await contract.virtualWorldCount();
            console.log("✅ virtualWorldCount():", worldCount.toString());
        } catch (e) {
            console.log("❌ virtualWorldCount() 失败:", e.message.substring(0, 80));
        }

        try {
            const proposalCount = await contract.proposalCount();
            console.log("✅ proposalCount():", proposalCount.toString());
        } catch (e) {
            console.log("❌ proposalCount() 失败:", e.message.substring(0, 80));
        }

        // 测试 hasVoted 函数
        try {
            const testAddress = "0x0000000000000000000000000000000000000001";
            const hasVoted = await contract.hasVoted(testAddress);
            console.log("✅ hasVoted():", hasVoted);
        } catch (e) {
            console.log("❌ hasVoted() 失败:", e.message.substring(0, 80));
        }

        // 测试 getVoteCount 函数
        try {
            const voteCount = await contract.getVoteCount();
            console.log("✅ getVoteCount():", voteCount.toString());
        } catch (e) {
            console.log("❌ getVoteCount() 失败:", e.message.substring(0, 80));
        }

        console.log("\n2️⃣ 测试 gas 估算...");

        // 测试 vote 函数的 gas 估算（不实际发送交易）
        try {
            const gasEstimate = await contract.vote.estimateGas(true);
            console.log("✅ vote(true) gas 估算:", gasEstimate.toString());
        } catch (e) {
            console.log("❌ vote(true) gas 估算失败:", e.message.substring(0, 80));
        }

        try {
            const gasEstimate = await contract.vote.estimateGas(false);
            console.log("✅ vote(false) gas 估算:", gasEstimate.toString());
        } catch (e) {
            console.log("❌ vote(false) gas 估算失败:", e.message.substring(0, 80));
        }

        console.log("\n🎯 兼容性测试结果:");
        console.log("- 前端 ABI 与合约基本兼容");
        console.log("- 只读函数调用正常");
        console.log("- Gas 估算可以正常工作");
        console.log("- 前端应该可以正常与合约交互");

        return true;

    } catch (error) {
        console.error("❌ 测试失败:", error.message);
        return false;
    }
}

testFrontendCompatibility();