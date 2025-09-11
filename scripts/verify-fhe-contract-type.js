const { ethers } = require('ethers');

async function verifyFHEContractType() {
    console.log("🔍 验证合约是否为 SecretMetaverseFHE.sol...");

    const contractAddress = "0xC6BD14B68169DbC558046910707e725824C8391e";
    console.log("📍 合约地址:", contractAddress);

    try {
        const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");

        // SecretMetaverseFHE.sol 的特征函数
        const fheABI = [
            // FHE合约特有的函数签名
            "function vote(bytes32, bytes) external",  // FHE版本的vote函数
            "function totalVoteCountEncrypted() external view returns (uint256)", // FHE特有
            "function owner() external view returns (address)",
            "function virtualWorldCount() external view returns (uint256)",
            "function proposalCount() external view returns (uint256)"
        ];

        // SecretMetaverseSepolia.sol 的特征函数
        const sepoliaABI = [
            "function vote(bool) external",  // Sepolia版本的vote函数
            "function totalVoteCount() external view returns (uint256)", // 普通版本
            "function owner() external view returns (address)",
            "function virtualWorldCount() external view returns (uint256)",
            "function proposalCount() external view returns (uint256)"
        ];

        console.log("\n🧪 测试 FHE 合约特征...");

        // 测试FHE合约的vote函数签名
        try {
            const fheContract = new ethers.Contract(contractAddress, fheABI, provider);

            // 尝试调用FHE特有的函数
            try {
                await fheContract.vote.staticCall("0x0000000000000000000000000000000000000000000000000000000000000000", "0x");
                console.log("✅ FHE vote(bytes32,bytes) 函数存在");
                var hasFHEVote = true;
            } catch (e) {
                if (e.message.includes("user has already voted") || e.message.includes("revert")) {
                    console.log("✅ FHE vote(bytes32,bytes) 函数存在 (被合约逻辑阻止)");
                    var hasFHEVote = true;
                } else {
                    console.log("❌ FHE vote 函数不存在:", e.message.substring(0, 80));
                    var hasFHEVote = false;
                }
            }

        } catch (fheError) {
            console.log("❌ 无法作为FHE合约连接:", fheError.message.substring(0, 80));
            var hasFHEVote = false;
        }

        console.log("\n🧪 测试 Sepolia 合约特征...");

        // 测试Sepolia合约的vote函数签名
        try {
            const sepoliaContract = new ethers.Contract(contractAddress, sepoliaABI, provider);

            try {
                await sepoliaContract.vote.staticCall(true);
                console.log("✅ Sepolia vote(bool) 函数存在");
                var hasSepoliaVote = true;
            } catch (e) {
                if (e.message.includes("already voted") || e.message.includes("revert")) {
                    console.log("✅ Sepolia vote(bool) 函数存在 (被合约逻辑阻止)");
                    var hasSepoliaVote = true;
                } else {
                    console.log("❌ Sepolia vote 函数不存在:", e.message.substring(0, 80));
                    var hasSepoliaVote = false;
                }
            }

        } catch (sepoliaError) {
            console.log("❌ 无法作为Sepolia合约连接:", sepoliaError.message.substring(0, 80));
            var hasSepoliaVote = false;
        }

        console.log("\n📋 合约类型判断:");
        if (hasFHEVote && !hasSepoliaVote) {
            console.log("🔐 这是 SecretMetaverseFHE.sol 合约");
            console.log("✅ 支持 FHE 加密投票功能");
            return "FHE";
        } else if (!hasFHEVote && hasSepoliaVote) {
            console.log("🌐 这是 SecretMetaverseSepolia.sol 合约");
            console.log("✅ 支持普通布尔投票功能");
            return "SEPOLIA";
        } else if (hasFHEVote && hasSepoliaVote) {
            console.log("🤔 合约同时支持两种投票方式 (不太可能)");
            return "HYBRID";
        } else {
            console.log("❌ 无法确定合约类型");
            return "UNKNOWN";
        }

    } catch (error) {
        console.error("❌ 验证过程出错:", error.message);
        return "ERROR";
    }
}

async function main() {
    const result = await verifyFHEContractType();

    console.log("\n🎯 最终结论:");
    switch(result) {
        case "FHE":
            console.log("✅ 地址 0x1604... 符合 SecretMetaverseFHE.sol");
            console.log("💡 前端应使用 FHE 的 ABI 和加密投票逻辑");
            break;
        case "SEPOLIA":
            console.log("❌ 地址 0x1604... 不符合 SecretMetaverseFHE.sol");
            console.log("🌐 这是 SecretMetaverseSepolia.sol 合约");
            console.log("💡 前端应使用普通投票逻辑");
            break;
        case "HYBRID":
            console.log("🤔 合约类型未知 - 同时支持多种投票方式");
            break;
        default:
            console.log("❌ 无法验证合约类型");
    }
}

main();