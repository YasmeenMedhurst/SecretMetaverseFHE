const { ethers } = require('ethers');

async function checkContractAddress() {
    console.log("🔍 Checking contract addresses...");

    // Use public Sepolia RPC
    const provider = new ethers.JsonRpcProvider('https://rpc.sepolia.org');

    const addresses = [
        "0xC6BD14B68169DbC558046910707e725824C8391e"  // Current SecretMetaverseSepolia contract
    ];

    // Our FHE contract ABI
    const fheAbi = [
        "function vote(bytes32, bytes) external",
        "function hasVoted(address) external view returns (bool)",
        "function getVoteCount() external view returns (uint256)",
        "function owner() external view returns (address)"
    ];

    // Game contract ABI
    const gameAbi = [
        "function submitGuess(uint8) external",
        "function startNewRound() external",
        "function isGuessTimeActive() external view returns (bool)"
    ];

    for (let i = 0; i < addresses.length; i++) {
        const addr = addresses[i];
        console.log(`\n📍 Checking address ${i + 1}: ${addr}`);

        try {
            // Check if contract exists
            const code = await provider.getCode(addr);
            if (code === '0x') {
                console.log("❌ No contract found at this address");
                continue;
            }
            console.log("✅ Contract found");

            // Try FHE contract functions
            try {
                const fheContract = new ethers.Contract(addr, fheAbi, provider);
                const owner = await fheContract.owner();
                console.log("✅ FHE Contract detected - Owner:", owner);
            } catch (fheError) {
                console.log("❌ Not FHE contract:", fheError.message.substring(0, 50));
            }

            // Try game contract functions
            try {
                const gameContract = new ethers.Contract(addr, gameAbi, provider);
                const isActive = await gameContract.isGuessTimeActive();
                console.log("✅ Game Contract detected - Guess active:", isActive);
            } catch (gameError) {
                console.log("❌ Not game contract:", gameError.message.substring(0, 50));
            }

        } catch (error) {
            console.error("❌ Error checking address:", error.message);
        }
    }
}

checkContractAddress();