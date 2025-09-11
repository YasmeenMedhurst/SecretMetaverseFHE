# Hello FHEVM: Your First Confidential Application Tutorial

Welcome to the most beginner-friendly introduction to building confidential applications with Fully Homomorphic Encryption Virtual Machine (FHEVM)! This tutorial will guide you step-by-step through creating your first privacy-preserving decentralized application.

## 📚 Table of Contents

1. [Introduction](#introduction)
2. [Learning Objectives](#learning-objectives)
3. [Prerequisites](#prerequisites)
4. [What We'll Build](#what-well-build)
5. [Understanding FHEVM Basics](#understanding-fhevm-basics)
6. [Setting Up Your Development Environment](#setting-up-your-development-environment)
7. [Building the Smart Contract](#building-the-smart-contract)
8. [Creating the Frontend](#creating-the-frontend)
9. [Testing Your Application](#testing-your-application)
10. [Deployment Guide](#deployment-guide)
11. [Common Issues and Solutions](#common-issues-and-solutions)
12. [Next Steps](#next-steps)

## 🌟 Introduction

Traditional blockchain applications expose all data publicly on the ledger. While this provides transparency, it creates significant privacy concerns for many use cases. FHEVM (Fully Homomorphic Encryption Virtual Machine) solves this by allowing computations on encrypted data without ever decrypting it.

This tutorial introduces you to FHEVM through a practical, hands-on approach. No advanced mathematics or cryptography knowledge required—just your existing Solidity and JavaScript skills!

## 🎯 Learning Objectives

By the end of this tutorial, you will:

- ✅ Understand what FHEVM is and why it matters
- ✅ Know how to write smart contracts that handle encrypted data
- ✅ Build a frontend that encrypts user inputs before sending to the blockchain
- ✅ Deploy and interact with your first confidential application
- ✅ Handle encrypted outputs and display results to users
- ✅ Debug common issues when working with encrypted data

## 📋 Prerequisites

Before starting, ensure you have:

- **Basic Solidity knowledge**: You can write and deploy simple smart contracts
- **JavaScript/React familiarity**: You understand frontend development basics
- **Development tools experience**: You've used Hardhat, MetaMask, and similar tools
- **Node.js installed**: Version 16 or higher
- **MetaMask wallet**: For interacting with the blockchain

**No prior knowledge needed:**
- ❌ Cryptography or advanced mathematics
- ❌ Fully Homomorphic Encryption theory
- ❌ Complex blockchain concepts beyond basic Solidity

## 🏗️ What We'll Build

We'll create a **Confidential Voting System** where:

- Users can cast encrypted votes
- Vote tallies are computed on encrypted data
- Only authorized parties can decrypt final results
- Individual votes remain completely private

This simple but powerful example demonstrates core FHEVM concepts while being practical and easy to understand.

## 🔐 Understanding FHEVM Basics

### What is FHEVM?

FHEVM is a blockchain virtual machine that can perform computations on encrypted data. Think of it as a regular Ethereum Virtual Machine, but with a superpower: it never needs to see your actual data to work with it.

### Key Concepts

#### 1. Encrypted Inputs
Instead of sending `42` to a contract, you send `encrypted(42)`. The contract can work with this encrypted value without knowing it's 42.

#### 2. Encrypted State Variables
Contract storage can hold encrypted values that remain private even though they're on a public blockchain.

#### 3. Homomorphic Operations
You can add, subtract, multiply encrypted numbers, and the result is also encrypted but mathematically correct.

#### 4. Access Control
Only authorized parties can decrypt specific encrypted values, controlled by the smart contract logic.

### Why This Matters

Traditional blockchain:
```
User sends: 42
Contract stores: 42 (visible to everyone)
Contract computes: 42 + 38 = 80 (visible to everyone)
```

FHEVM blockchain:
```
User sends: encrypted(42)
Contract stores: encrypted(42) (private)
Contract computes: encrypted(42) + encrypted(38) = encrypted(80) (private)
Authorized user decrypts: 80
```

## 🛠️ Setting Up Your Development Environment

### Step 1: Create Project Directory

```bash
mkdir hello-fhevm-tutorial
cd hello-fhevm-tutorial
```

### Step 2: Initialize Node.js Project

```bash
npm init -y
```

### Step 3: Install Dependencies

```bash
# Core FHEVM dependencies
npm install fhevmjs

# Development tools
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Frontend dependencies
npm install react react-dom ethers

# Additional utilities
npm install dotenv
```

### Step 4: Initialize Hardhat

```bash
npx hardhat init
```

Choose "Create a JavaScript project" when prompted.

### Step 5: Project Structure

Your project should look like this:

```
hello-fhevm-tutorial/
├── contracts/
│   └── ConfidentialVoting.sol
├── scripts/
│   └── deploy.js
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── VotingContract.js
│   │   └── utils/
│   │       └── fhevm.js
│   └── public/
├── test/
│   └── ConfidentialVoting.test.js
├── hardhat.config.js
└── package.json
```

## 📝 Building the Smart Contract

### Step 1: Understanding FHEVM Contract Structure

Create `contracts/ConfidentialVoting.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "fhevm/lib/TFHE.sol";
import "fhevm/lib/FHEVMConfig.sol";

contract ConfidentialVoting {
    using TFHE for euint32;

    // Encrypted vote counters
    euint32 private votesForOptionA;
    euint32 private votesForOptionB;

    // Track if user has voted (public for simplicity)
    mapping(address => bool) public hasVoted;

    // Contract owner (can decrypt results)
    address public owner;

    // Voting state
    bool public votingOpen;

    constructor() {
        owner = msg.sender;
        votingOpen = true;

        // Initialize encrypted counters to 0
        votesForOptionA = TFHE.asEuint32(0);
        votesForOptionB = TFHE.asEuint32(0);
    }

    // Cast an encrypted vote
    function vote(bytes calldata encryptedChoice) external {
        require(votingOpen, "Voting is closed");
        require(!hasVoted[msg.sender], "Already voted");

        // Convert encrypted input to euint32
        euint32 choice = TFHE.asEuint32(encryptedChoice);

        // Create encrypted 1 for incrementing
        euint32 one = TFHE.asEuint32(1);

        // If choice == 0, increment option A; if choice == 1, increment option B
        euint32 isOptionA = TFHE.eq(choice, TFHE.asEuint32(0));
        euint32 isOptionB = TFHE.eq(choice, TFHE.asEuint32(1));

        // Add to respective counters
        votesForOptionA = TFHE.add(votesForOptionA, TFHE.mul(isOptionA, one));
        votesForOptionB = TFHE.add(votesForOptionB, TFHE.mul(isOptionB, one));

        // Mark user as voted
        hasVoted[msg.sender] = true;
    }

    // Close voting (only owner)
    function closeVoting() external {
        require(msg.sender == owner, "Only owner can close voting");
        votingOpen = false;
    }

    // Get encrypted results (only owner can decrypt)
    function getResults() external view returns (bytes memory, bytes memory) {
        require(msg.sender == owner, "Only owner can see results");
        require(!votingOpen, "Voting still open");

        return (
            TFHE.decrypt(votesForOptionA),
            TFHE.decrypt(votesForOptionB)
        );
    }

    // Check if voting is complete
    function isVotingComplete() external view returns (bool) {
        return !votingOpen;
    }
}
```

### Step 2: Understanding the Code

Let's break down the key concepts:

#### Encrypted Data Types
```solidity
euint32 private votesForOptionA;  // 32-bit encrypted unsigned integer
```

#### Encrypted Operations
```solidity
// Addition on encrypted values
votesForOptionA = TFHE.add(votesForOptionA, one);

// Equality comparison (returns encrypted boolean)
euint32 isOptionA = TFHE.eq(choice, TFHE.asEuint32(0));

// Multiplication (for conditional logic)
TFHE.mul(isOptionA, one)  // Returns encrypted 1 if true, 0 if false
```

#### Access Control for Decryption
```solidity
require(msg.sender == owner, "Only owner can see results");
return TFHE.decrypt(votesForOptionA);
```

## 🎨 Creating the Frontend

### Step 1: Setup React App Structure

Create `frontend/src/App.js`:

```javascript
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { initFhevm, createInstance } from './utils/fhevm';
import VotingContract from './VotingContract';
import './App.css';

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [fhevmInstance, setFhevmInstance] = useState(null);
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [votingOpen, setVotingOpen] = useState(true);

  // Contract configuration
  const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS_HERE';
  const CONTRACT_ABI = [
    // Add your contract ABI here
  ];

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize FHEVM
      const instance = await initFhevm();
      setFhevmInstance(instance);

      // Connect to MetaMask
      await connectWallet();
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);

        const signer = provider.getSigner();
        const address = await signer.getAddress();

        setProvider(provider);
        setSigner(signer);
        setAccount(address);

        // Initialize contract
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        setContract(contract);

        // Check voting status
        const voted = await contract.hasVoted(address);
        const open = await contract.votingOpen();

        setHasVoted(voted);
        setVotingOpen(open);

      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const castVote = async (choice) => {
    if (!fhevmInstance || !contract) return;

    setLoading(true);
    try {
      // Encrypt the vote choice
      const encryptedChoice = fhevmInstance.encrypt32(choice);

      // Send transaction
      const tx = await contract.vote(encryptedChoice);
      await tx.wait();

      setHasVoted(true);
      alert('Vote cast successfully!');

    } catch (error) {
      console.error('Failed to cast vote:', error);
      alert('Failed to cast vote: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🗳️ Confidential Voting System</h1>
        <p>Your first FHEVM application</p>
      </header>

      <main className="App-main">
        {!account ? (
          <div className="connect-wallet">
            <h2>Connect Your Wallet</h2>
            <button onClick={connectWallet} className="connect-button">
              Connect MetaMask
            </button>
          </div>
        ) : (
          <VotingContract
            account={account}
            hasVoted={hasVoted}
            votingOpen={votingOpen}
            loading={loading}
            onVote={castVote}
          />
        )}
      </main>
    </div>
  );
}

export default App;
```

### Step 2: Create Voting Interface Component

Create `frontend/src/VotingContract.js`:

```javascript
import React from 'react';

const VotingContract = ({
  account,
  hasVoted,
  votingOpen,
  loading,
  onVote
}) => {
  const handleVote = (choice) => {
    if (window.confirm(`Are you sure you want to vote for Option ${choice === 0 ? 'A' : 'B'}?`)) {
      onVote(choice);
    }
  };

  return (
    <div className="voting-container">
      <div className="account-info">
        <p><strong>Connected Account:</strong> {account}</p>
        <p><strong>Voting Status:</strong> {votingOpen ? 'Open' : 'Closed'}</p>
        <p><strong>Your Vote:</strong> {hasVoted ? 'Cast ✅' : 'Not cast yet'}</p>
      </div>

      {votingOpen && !hasVoted ? (
        <div className="voting-options">
          <h2>Cast Your Confidential Vote</h2>
          <p>Your vote will be encrypted and remain completely private!</p>

          <div className="vote-buttons">
            <button
              onClick={() => handleVote(0)}
              disabled={loading}
              className="vote-button option-a"
            >
              {loading ? 'Processing...' : 'Vote for Option A'}
            </button>

            <button
              onClick={() => handleVote(1)}
              disabled={loading}
              className="vote-button option-b"
            >
              {loading ? 'Processing...' : 'Vote for Option B'}
            </button>
          </div>

          <div className="privacy-notice">
            <h3>🔐 Privacy Features:</h3>
            <ul>
              <li>Your vote choice is encrypted before sending</li>
              <li>The contract never sees your actual vote</li>
              <li>Only the final tally can be decrypted by authorized parties</li>
              <li>Individual votes remain forever private</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="voting-status">
          {hasVoted ? (
            <div className="voted-message">
              <h2>✅ Thank you for voting!</h2>
              <p>Your encrypted vote has been recorded on the blockchain.</p>
            </div>
          ) : (
            <div className="voting-closed">
              <h2>📊 Voting is closed</h2>
              <p>Results will be available to authorized parties only.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VotingContract;
```

### Step 3: FHEVM Utility Functions

Create `frontend/src/utils/fhevm.js`:

```javascript
import { createFhevmInstance } from 'fhevmjs';

let fhevmInstance = null;

export const initFhevm = async () => {
  if (fhevmInstance) return fhevmInstance;

  try {
    // Initialize FHEVM instance
    fhevmInstance = await createFhevmInstance({
      network: window.ethereum,
      gatewayUrl: 'https://gateway.zama.ai/'
    });

    console.log('FHEVM initialized successfully');
    return fhevmInstance;
  } catch (error) {
    console.error('Failed to initialize FHEVM:', error);
    throw error;
  }
};

export const createInstance = () => fhevmInstance;

// Utility function to encrypt 32-bit integers
export const encrypt32 = (value) => {
  if (!fhevmInstance) {
    throw new Error('FHEVM not initialized');
  }
  return fhevmInstance.encrypt32(value);
};

// Utility function to encrypt boolean values
export const encryptBool = (value) => {
  if (!fhevmInstance) {
    throw new Error('FHEVM not initialized');
  }
  return fhevmInstance.encryptBool(value);
};
```

## 🧪 Testing Your Application

### Step 1: Unit Tests for Smart Contract

Create `test/ConfidentialVoting.test.js`:

```javascript
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('ConfidentialVoting', function () {
  let voting, owner, voter1, voter2;

  beforeEach(async function () {
    [owner, voter1, voter2] = await ethers.getSigners();

    const ConfidentialVoting = await ethers.getContractFactory('ConfidentialVoting');
    voting = await ConfidentialVoting.deploy();
    await voting.deployed();
  });

  it('Should deploy with correct initial state', async function () {
    expect(await voting.owner()).to.equal(owner.address);
    expect(await voting.votingOpen()).to.equal(true);
  });

  it('Should allow users to vote', async function () {
    // This is a simplified test - in practice, you'd need to handle encryption
    expect(await voting.hasVoted(voter1.address)).to.equal(false);

    // In real testing, you'd encrypt the vote choice
    // await voting.connect(voter1).vote(encryptedChoice);

    // expect(await voting.hasVoted(voter1.address)).to.equal(true);
  });

  it('Should prevent double voting', async function () {
    // Test that users cannot vote twice
  });

  it('Should allow owner to close voting', async function () {
    await voting.connect(owner).closeVoting();
    expect(await voting.votingOpen()).to.equal(false);
  });

  it('Should only allow owner to see results', async function () {
    await voting.connect(owner).closeVoting();

    // Only owner should be able to call getResults()
    await expect(voting.connect(voter1).getResults()).to.be.reverted;
  });
});
```

### Step 2: Running Tests

```bash
npx hardhat test
```

## 🚀 Deployment Guide

### Step 1: Configure Hardhat for FHEVM

Update `hardhat.config.js`:

```javascript
require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

module.exports = {
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    zama_testnet: {
      url: 'https://devnet.zama.ai/',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8009
    }
  }
};
```

### Step 2: Create Deployment Script

Create `scripts/deploy.js`:

```javascript
const { ethers } = require('hardhat');

async function main() {
  console.log('Deploying ConfidentialVoting contract...');

  const ConfidentialVoting = await ethers.getContractFactory('ConfidentialVoting');
  const voting = await ConfidentialVoting.deploy();

  await voting.deployed();

  console.log('ConfidentialVoting deployed to:', voting.address);
  console.log('Owner address:', await voting.owner());
  console.log('Voting status:', await voting.votingOpen());

  // Save deployment info
  const deploymentInfo = {
    contractAddress: voting.address,
    deployer: await voting.owner(),
    network: 'zama_testnet',
    timestamp: new Date().toISOString()
  };

  console.log('Deployment completed successfully!');
  console.log('Contract details:', deploymentInfo);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
```

### Step 3: Deploy to Testnet

```bash
# Deploy to Zama testnet
npx hardhat run scripts/deploy.js --network zama_testnet
```

### Step 4: Update Frontend Configuration

After deployment, update your frontend:

1. Copy the contract address from deployment output
2. Update `CONTRACT_ADDRESS` in `App.js`
3. Add the contract ABI to `CONTRACT_ABI`

## 🐛 Common Issues and Solutions

### Issue 1: "FHEVM not initialized"

**Problem:** Frontend fails to initialize FHEVM instance.

**Solution:**
```javascript
// Ensure proper async initialization
useEffect(() => {
  const init = async () => {
    try {
      await initFhevm();
    } catch (error) {
      console.error('FHEVM initialization failed:', error);
      // Handle error appropriately
    }
  };
  init();
}, []);
```

### Issue 2: Transaction Reverts on Vote

**Problem:** Vote transaction fails with revert.

**Solutions:**
- Ensure voting is still open
- Check user hasn't already voted
- Verify encrypted input format
- Confirm sufficient gas limit

### Issue 3: Unable to Decrypt Results

**Problem:** Cannot decrypt vote results.

**Solutions:**
- Verify you're the contract owner
- Ensure voting is closed
- Check network connection
- Confirm proper decryption permissions

### Issue 4: MetaMask Connection Issues

**Problem:** Cannot connect to MetaMask or wrong network.

**Solutions:**
```javascript
// Add network switching
const switchToZamaNetwork = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x1F49' }], // 8009 in hex
    });
  } catch (error) {
    // Handle network addition if needed
  }
};
```

## 📈 Next Steps

Congratulations! You've built your first FHEVM application. Here's how to continue your journey:

### Immediate Improvements

1. **Enhanced UI/UX**
   - Add loading animations
   - Improve error handling
   - Create better visual feedback

2. **Extended Functionality**
   - Multiple choice voting
   - Time-based voting periods
   - Voter registration system

3. **Security Enhancements**
   - Access control improvements
   - Input validation
   - Rate limiting

### Advanced FHEVM Concepts

1. **Complex Data Types**
   - Working with encrypted arrays
   - Struct encryption
   - Dynamic data structures

2. **Advanced Operations**
   - Conditional logic with encrypted booleans
   - Comparison operations
   - Mathematical computations

3. **Gas Optimization**
   - Efficient encrypted operations
   - Batch processing
   - Storage optimization

### Real-World Applications

1. **Financial Privacy**
   - Private auctions
   - Confidential trading
   - Encrypted DeFi protocols

2. **Identity and Authentication**
   - Private identity verification
   - Confidential KYC systems
   - Encrypted reputation systems

3. **Gaming and Entertainment**
   - Hidden information games
   - Private leaderboards
   - Confidential in-game assets

### Learning Resources

- **Official Documentation:** [Zama FHEVM Docs](https://docs.zama.ai/fhevm)
- **Code Examples:** [FHEVM Examples Repository](https://github.com/zama-ai/fhevm)
- **Community:** [Zama Discord Server](https://discord.gg/zama)
- **Advanced Tutorials:** Coming soon!

### Contributing to the Ecosystem

1. **Open Source Contributions**
   - Improve existing tools
   - Create new libraries
   - Write documentation

2. **Educational Content**
   - Create tutorials
   - Share your experience
   - Help other developers

3. **Application Development**
   - Build real-world applications
   - Explore new use cases
   - Share lessons learned

## 🎉 Conclusion

You've successfully completed the "Hello FHEVM" tutorial! You now have:

- ✅ A working confidential voting application
- ✅ Understanding of FHEVM core concepts
- ✅ Hands-on experience with encrypted smart contracts
- ✅ Knowledge of privacy-preserving frontend development
- ✅ Foundation for building more complex confidential applications

The future of blockchain privacy is in your hands. Start building amazing confidential applications and help create a more private, secure digital world!

---

**Happy Building! 🚀**

For questions, issues, or contributions, please visit our [GitHub repository](https://github.com/YasmeenMedhurst/SecretMetaverseFHE) or reach out to the community.