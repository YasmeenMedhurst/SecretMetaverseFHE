const { ethers } = require('ethers');

async function checkContractFunctions() {
    console.log("🔍 检查合约实际可用的函数签名...");

    const contractAddress = "0xC6BD14B68169DbC558046910707e725824C8391e";

    try {
        const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");

        // 获取合约代码
        const code = await provider.getCode(contractAddress);
        console.log("📋 合约代码长度:", code.length);

        // 测试不同的 vote 函数签名
        console.log("\n🧪 测试不同的 vote 函数签名...");

        // 1. 测试 vote(bool)
        try {
            const simpleABI = ["function vote(bool) external"];
            const simpleContract = new ethers.Contract(contractAddress, simpleABI, provider);

            // 尝试 staticCall
            try {
                await simpleContract.vote.staticCall(true);
                console.log("✅ vote(bool) 函数存在并可调用");
            } catch (e) {
                if (e.message.includes("revert") || e.message.includes("already voted")) {
                    console.log("✅ vote(bool) 函数存在 (逻辑限制)");
                } else {
                    console.log("❌ vote(bool) 函数不存在:", e.message.substring(0, 50));
                }
            }
        } catch (e) {
            console.log("❌ vote(bool) ABI 错误:", e.message.substring(0, 50));
        }

        // 2. 测试 FHE vote(uint256, bytes)
        try {
            const fheABI = ["function vote(uint256, bytes) external"];
            const fheContract = new ethers.Contract(contractAddress, fheABI, provider);

            try {
                await fheContract.vote.staticCall(0, "0x");
                console.log("✅ vote(uint256,bytes) 函数存在并可调用");
            } catch (e) {
                if (e.message.includes("revert") || e.message.includes("already voted")) {
                    console.log("✅ vote(uint256,bytes) 函数存在 (逻辑限制)");
                } else {
                    console.log("❌ vote(uint256,bytes) 函数不存在:", e.message.substring(0, 50));
                }
            }
        } catch (e) {
            console.log("❌ vote(uint256,bytes) ABI 错误:", e.message.substring(0, 50));
        }

        // 3. 测试其他可能的函数签名
        console.log("\n🔍 检查其他函数...");

        const testABI = [
            "function hasVoted(address) external view returns (bool)",
            "function getVoteCount() external view returns (uint256)",
            "function owner() external view returns (address)"
        ];

        const testContract = new ethers.Contract(contractAddress, testABI, provider);

        try {
            const owner = await testContract.owner();
            console.log("✅ owner():", owner);
        } catch (e) {
            console.log("❌ owner() 失败");
        }

        try {
            const hasVoted = await testContract.hasVoted("0x0000000000000000000000000000000000000001");
            console.log("✅ hasVoted():", hasVoted);
        } catch (e) {
            console.log("❌ hasVoted() 失败");
        }

        try {
            const voteCount = await testContract.getVoteCount();
            console.log("✅ getVoteCount():", voteCount.toString());
        } catch (e) {
            console.log("❌ getVoteCount() 失败");
        }

        console.log("\n📋 结论:");
        console.log("需要确定合约实际支持的 vote 函数签名");

    } catch (error) {
        console.error("❌ 检查失败:", error.message);
    }
}

checkContractFunctions();