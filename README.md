# Midnight Bulletin Board (Level 2 dApp)

A premium, privacy-first bulletin board application built on the **Midnight Network** utilizing zero-knowledge proofs. Users can connect their **Lace Wallet** to post public messages on-chain, while privately proving ownership of their posts using a local browser ZK prover without exposing their secret keys or signatures.

## Live Demo
- **Frontend URL**: [https://midnight-level2-bboard.vercel.app](https://midnight-level2-bboard.vercel.app)
- **Demo Video**: [https://youtu.be/demo-video-placeholder](https://youtu.be/demo-video-placeholder)

## Deployed Contract Address
- **Preprod Contract Address**: `0200dbf964f541e1950883f5b2f539b66fd6111e46ce8e6e9551fbdd180114d5dd5b`
- **Network**: `Preprod`

---

## What This Does
The Midnight Bulletin Board is a decentralized application that enables users to post messages publicly on the ledger. However, removing or "taking down" a post requires proving ownership. Using Midnight's zero-knowledge capabilities, the post author can verify their authorization to delete the message locally inside the browser. The smart contract validates this proof on-chain without the author ever revealing the secret key that authorizes the action.

---

## Privacy Model

### PUBLIC (What everyone can see)
- The smart contract address and verification keys.
- The state of the board (`VACANT` or `OCCUPIED`).
- The text content of the message when it is active.
- The cryptographic owner identifier (derived public hash value).
- The transaction hash submitting the state transitions.

### PRIVATE (What remains hidden)
- The user's wallet seed phrase and unshielded private keys.
- The `localSecretKey` that determines ownership of the posted message.
- The intermediate values and witnesses used during local ZK proof generation.

### User Proves
- The user proves: *"I know the private `localSecretKey` corresponding to the owner hash of the currently occupied board"* without revealing the `localSecretKey` itself.

---

## Privacy Claim

### What an on-chain observer CAN see:
- That a message was successfully posted or taken down.
- That the action was validated by a valid, locally-generated zero-knowledge proof.
- The cryptographic hash identifying the owner.

### What an on-chain observer CANNOT see:
- The private secret key of the message author.
- Any link linking the bulletin board post to the author's real shielded wallet address or coin public key.

---

## Tech Stack
- **Midnight Network**: Privacy-first Layer-1 blockchain.
- **Compact**: Smart contract programming language for zero-knowledge circuits.
- **Midnight.js SDK**: TypeScript library for contract deployment, proving, and ledger submission.
- **React + Vite**: Modern, responsive frontend application.
- **Lace Wallet**: Official browser extension wallet for token management and transaction signing.

---

## Prerequisites
- **Node.js**: `v22+` (tested with `v22.23.1`)
- **Lace Wallet**: Browser extension set to the **Preprod** network.
- **Docker**: Needed to run the local proof server.
- **Compact Compiler**: Compiler version `0.31.1`.

---

## Run Locally

### 1. Clone & Setup
```bash
# Clone the repository
git clone https://github.com/your-username/midnight-level2-bboard.git
cd midnight-level2-bboard

# Install dependencies for the monorepo
npm install
```

### 2. Compile the Smart Contract
Generate typescript bindings, zkir files, and proving keys using the Compact compiler:
```bash
cd contract

# Create the output directory
mkdir -p src/managed/bboard

# Compile contract and generate keys
compactc src/bboard.compact ./src/managed/bboard
zkir compile-many ./src/managed/bboard/zkir ./src/managed/bboard/keys

# Build TypeScript target
npm run build
cd ..
```

### 3. Build API and Frontend
```bash
# Build api bindings
cd api
npm run build
cd ..

# Build frontend UI assets
cd bboard-ui
npm run build
```

### 4. Run the Dev Server
```bash
# Start Vite development server
npm run dev
```

### 5. Deploying
To deploy the frontend to Vercel or Netlify:
```bash
# Build the UI
npm run build

# Deploy via Vercel CLI
vercel --prod
```
The workspace includes predefined `vercel.json` and `netlify.toml` files to handle route rewrites automatically.
