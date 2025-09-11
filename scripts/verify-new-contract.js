const { ethers } = require('ethers');

async function verifyNewContract() {
    console.log("🔍 验证新合约地址...");

    const contractAddress = "0xC6BD14B68169DbC558046910707e725824C8391e";
    console.log("📍 检查地址:", contractAddress);

    try {
        const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");

        // 检查合约是否存在
        console.log("1️⃣ 检查合约代码...");
        const code = await provider.getCode(contractAddress);
        if (code === '0x') {
            console.log("❌ 该地址没有部署合约!");
            return false;
        }
        console.log("✅ 合约存在，代码长度:", code.length);

        // 测试基本函数
        console.log("\n2️⃣ 测试基本函数...");
        const basicABI = [
            "function owner() external view returns (address)",
            "function virtualWorldCount() external view returns (uint256)",
            "function proposalCount() external view returns (uint256)"
        ];

        const basicContract = new ethers.Contract(contractAddress, basicABI, provider);

        try {
            const owner = await basicContract.owner();
            console.log("✅ owner():", owner);
        } catch (e) {
            console.log("❌ owner() 失败:", e.message.substring(0, 50));
        }

        try {
            const worldCount = await basicContract.virtualWorldCount();
            console.log("✅ virtualWorldCount():", worldCount.toString());
        } catch (e) {
            console.log("❌ virtualWorldCount() 失败:", e.message.substring(0, 50));
        }

        try {
            const proposalCount = await basicContract.proposalCount();
            console.log("✅ proposalCount():", proposalCount.toString());
        } catch (e) {
            console.log("❌ proposalCount() 失败:", e.message.substring(0, 50));
        }

        // 测试投票函数签名
        console.log("\n3️⃣ 测试投票函数签名...");

        // 测试 FHE 风格 vote(uint256, bytes)
        try {
            const fheABI = ["function vote(uint256, bytes) external"];
            const fheContract = new ethers.Contract(contractAddress, fheABI, provider);

            // 只测试函数签名存在性，不实际调用
            const iface = new ethers.Interface(fheABI);
            const fragment = iface.getFunction("vote");
            console.log("FHE vote 函数签名:", fragment.format());

            // 尝试 staticCall 来测试函数是否存在
            try {
                await fheContract.vote.staticCall(0, "0x");
                console.log("✅ FHE vote(uint256,bytes) 函数存在");
            } catch (e) {
                if (e.message.includes("revert") || e.message.includes("already voted")) {
                    console.log("✅ FHE vote(uint256,bytes) 函数存在 (被逻辑阻止)");
                } else {
                    console.log("❌ FHE vote 函数调用失败:", e.message.substring(0, 100));
                }
            }
        } catch (e) {
            console.log("❌ FHE vote 函数接口错误:", e.message.substring(0, 50));
        }

        // 测试简单 vote(bool)
        try {
            const simpleABI = ["function vote(bool) external"];
            const simpleContract = new ethers.Contract(contractAddress, simpleABI, provider);

            try {
                await simpleContract.vote.staticCall(true);
                console.log("✅ Simple vote(bool) 函数存在");
            } catch (e) {
                if (e.message.includes("revert") || e.message.includes("already voted")) {
                    console.log("✅ Simple vote(bool) 函数存在 (被逻辑阻止)");
                } else {
                    console.log("❌ Simple vote 函数调用失败:", e.message.substring(0, 100));
                }
            }
        } catch (e) {
            console.log("❌ Simple vote 函数接口错误:", e.message.substring(0, 50));
        }

        console.log("\n🎯 合约状态:");
        console.log("- 合约存在: ✅");
        console.log("- 基本函数可用: 需要进一步测试");
        console.log("- 投票函数类型: 需要确认正确的ABI");

        return true;

    } catch (error) {
        console.error("❌ 验证失败:", error.message);
        return false;
    }
}

verifyNewContract();