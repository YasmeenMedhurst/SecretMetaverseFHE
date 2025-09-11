const { ethers } = require('ethers');

async function testActualVoteFunction() {
    console.log("🧪 测试合约实际的投票函数...");

    const contractAddress = "0xC6BD14B68169DbC558046910707e725824C8391e";

    try {
        const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");

        // 获取合约字节码并分析函数选择器
        const code = await provider.getCode(contractAddress);
        console.log("📋 合约代码长度:", code.length);

        // 测试不同的函数签名
        console.log("\n🔍 测试函数调用...");

        // 测试1: vote(bool) - 0x4b9f5c98
        console.log("1️⃣ 测试 vote(bool) 函数...");
        try {
            const callData = "0x4b9f5c980000000000000000000000000000000000000000000000000000000000000001"; // vote(true)
            const result = await provider.call({
                to: contractAddress,
                data: callData
            });
            console.log("✅ vote(bool) 成功:", result);
        } catch (e) {
            console.log("❌ vote(bool) 失败:", e.message.substring(0, 100));
        }

        // 测试2: vote(uint256,bytes) - FHEVM风格
        console.log("\n2️⃣ 测试 vote(uint256,bytes) 函数...");
        try {
            // 函数签名: vote(uint256,bytes) = 0x3819a2cc
            const iface = new ethers.Interface(["function vote(uint256,bytes)"]);
            const callData = iface.encodeFunctionData("vote", [0, "0x"]);
            console.log("Function selector for vote(uint256,bytes):", callData.substring(0, 10));

            const result = await provider.call({
                to: contractAddress,
                data: callData
            });
            console.log("✅ vote(uint256,bytes) 成功:", result);
        } catch (e) {
            console.log("❌ vote(uint256,bytes) 失败:", e.message.substring(0, 100));
        }

        // 测试3: 使用ABI方式检查
        console.log("\n3️⃣ 使用 ABI 检查函数存在性...");

        const testABI = [
            "function vote(bool)",
            "function vote(uint256,bytes)",
            "function hasVoted(address) view returns (bool)"
        ];

        try {
            const contract = new ethers.Contract(contractAddress, testABI, provider);

            // 测试hasVoted首先确认合约响应
            const hasVoted = await contract.hasVoted("0x0000000000000000000000000000000000000001");
            console.log("✅ hasVoted 测试:", hasVoted);

            // 测试函数是否存在 - 通过staticCall
            try {
                await contract.vote.staticCall(true);
                console.log("✅ vote(bool) 函数存在");
            } catch (e) {
                console.log("❌ vote(bool) 不存在或有限制:", e.message.substring(0, 80));
            }

        } catch (e) {
            console.log("❌ ABI 测试失败:", e.message.substring(0, 80));
        }

        // 测试4: 检查实际的函数选择器
        console.log("\n4️⃣ 分析函数选择器...");
        console.log("vote(bool) 选择器: 0x4b9f5c98");
        console.log("vote(uint256,bytes) 选择器: 0x3819a2cc");
        console.log("hasVoted(address) 选择器: 0x486b5db4");

        console.log("\n📋 结论:");
        console.log("需要确定合约实际支持的函数签名和调用方式");

    } catch (error) {
        console.error("❌ 测试失败:", error.message);
    }
}

testActualVoteFunction();