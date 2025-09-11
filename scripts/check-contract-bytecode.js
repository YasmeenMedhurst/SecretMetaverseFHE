const { ethers } = require('ethers');

async function checkContractBytecode() {
    console.log("🔍 通过字节码分析合约类型...");

    const contractAddress = "0xC6BD14B68169DbC558046910707e725824C8391e";

    try {
        const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");

        // 获取合约字节码
        const bytecode = await provider.getCode(contractAddress);
        console.log("📏 字节码长度:", bytecode.length);

        // 分析字节码中的关键特征
        console.log("\n🔍 字节码特征分析:");

        // FHE合约的特征：包含FHEVM相关的函数签名
        const fheSignatures = [
            "SepoliaConfig",  // FHE合约继承自SepoliaConfig
            "euint32",        // FHE加密类型
            "ebool",          // FHE布尔类型
            "FHE",            // FHE库调用
        ];

        // Sepolia合约的特征：简单的数据类型
        const sepoliaSignatures = [
            "totalVoteCount", // 普通计数器
            "hasVotedGlobal", // 简单映射
        ];

        let fheMatches = 0;
        let sepoliaMatches = 0;

        console.log("🔐 检查 FHE 特征:");
        fheSignatures.forEach(sig => {
            if (bytecode.includes(Buffer.from(sig).toString('hex'))) {
                console.log(`✅ 找到 FHE 特征: ${sig}`);
                fheMatches++;
            } else {
                console.log(`❌ 未找到: ${sig}`);
            }
        });

        console.log("\n🌐 检查 Sepolia 特征:");
        sepoliaSignatures.forEach(sig => {
            if (bytecode.includes(Buffer.from(sig).toString('hex'))) {
                console.log(`✅ 找到 Sepolia 特征: ${sig}`);
                sepoliaMatches++;
            } else {
                console.log(`❌ 未找到: ${sig}`);
            }
        });

        // 额外检查：尝试调用FHE特有的函数
        console.log("\n🧪 功能测试:");

        try {
            // 测试是否有FHE特有的加密变量
            const testABI = [
                "function totalVoteCountEncrypted() external view returns (uint256)",
                "function owner() external view returns (address)"
            ];

            const testContract = new ethers.Contract(contractAddress, testABI, provider);

            try {
                const encrypted = await testContract.totalVoteCountEncrypted();
                console.log("✅ 有 FHE 加密变量:", encrypted.toString());
                fheMatches += 2;
            } catch (e) {
                console.log("❌ 没有 FHE 加密变量");
            }

        } catch (e) {
            console.log("❌ 无法进行功能测试");
        }

        // 最终判断
        console.log("\n📊 分析结果:");
        console.log(`FHE 特征匹配: ${fheMatches}`);
        console.log(`Sepolia 特征匹配: ${sepoliaMatches}`);

        if (fheMatches > sepoliaMatches) {
            console.log("\n🔐 结论: 这是 SecretMetaverseFHE.sol 合约");
            console.log("✅ 支持真正的 FHE 加密功能");
        } else {
            console.log("\n🌐 结论: 这是 SecretMetaverseSepolia.sol 合约");
            console.log("✅ 普通的 Solidity 投票合约");
        }

    } catch (error) {
        console.error("❌ 分析失败:", error.message);
    }
}

checkContractBytecode();