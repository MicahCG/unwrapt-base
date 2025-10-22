# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Unwrapt is a Web3 application for creating crypto gift links claimable through Farcaster Frames. Users deposit USDC to create gifts with configurable expiry and claim slots. Recipients claim gifts directly through Farcaster Frames using Neynar verification.

**Key Technologies:**
- Frontend: Next.js 15 (App Router), React 19, TypeScript
- Blockchain: OnchainKit, Wagmi, Viem
- Smart Contracts: Solidity ^0.8.24, Foundry
- Frames: Farcaster Frames v2

## Development Commands

### Frontend Development
```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint
```

### Smart Contract Development
```bash
# All Foundry commands run from the contracts/ directory
cd contracts

# Install/update Foundry dependencies
forge install

# Build contracts
forge build

# Run tests
forge test

# Run tests with gas reporting
forge test --gas-report

# Format contracts
forge fmt

# Deploy to Base Sepolia (requires env vars)
forge script script/DeployAll.s.sol:DeployAll \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast \
  --verify --verifier blockscout \
  -vvvv

# Deploy single contract
forge script script/Deploy.s.sol:Deploy \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast \
  -vvvv
```

## Architecture

### Frontend Structure

The Next.js app uses App Router with the following key areas:

**Pages:**
- `/` - Landing page (app/page.tsx)
- `/create` - Gift creation interface (app/create/page.tsx)
- `/gift/[id]` - Gift details page (app/gift/[id]/)

**API Routes:**
- `/api/frame/[id]` - Farcaster Frame endpoints (GET/POST)
- `/api/gift/hash` - Generate claim hash for transactions
- `/api/gift/status/[id]` - Query gift status

**Shared Utilities (lib/):**
- `lib/abi/GiftLink.ts` - Contract ABI for frontend interactions
- `lib/chain.ts` - Chain configuration (Base/Base Sepolia)
- `lib/addresses.ts` - Deployed contract addresses
- `lib/neynar.ts` - Farcaster Frame verification via Neynar API

**State Management:**
- OnchainKit provider configured in `app/rootProvider.tsx`
- Uses Wagmi for wallet connections and contract interactions
- Chain config switches between Base mainnet and Sepolia testnet via `NEXT_PUBLIC_CHAIN_ENV`

### Smart Contract Architecture

**Core Contract: GiftLink.sol**
- Handles gift creation with USDC escrow
- Multi-slot claiming with proper token distribution
- Platform fee collection (configurable basis points)
- Expiry-based refunds to sender
- Reentrancy protection

**Test Contracts:**
- `TestUSDC.sol` - Mock USDC for local/testnet development
- `Counter.sol` - Template contract (can be removed)

**Deployment Scripts (contracts/script/):**
- `DeployAll.s.sol` - Deploys both GiftLink and TestUSDC
- `Deploy.s.sol` - Deploys GiftLink only

### Environment Configuration

The app switches between Base mainnet and Base Sepolia testnet based on `NEXT_PUBLIC_CHAIN_ENV`:
- `sepolia` - Base Sepolia (testnet)
- `base` - Base (mainnet)

Contract addresses are managed in `lib/addresses.ts` and set via:
- `NEXT_PUBLIC_GIFTLINK_ADDRESS`
- `NEXT_PUBLIC_TOKEN_ADDRESS`

### Farcaster Frame Flow

1. User creates gift via `/create` page
2. Gift URL generated with Frame metadata
3. Frame shared on Farcaster
4. Recipient clicks Frame → `/api/frame/[id]` endpoint
5. Neynar verifies Frame interaction
6. Claim transaction executed with verified user's address
7. Tokens transferred from escrow to recipient

## Important Notes

- **Path Aliases:** Uses `@/*` to reference root-level imports (configured in tsconfig.json)
- **Webpack Externals:** Next.js config excludes `pino-pretty`, `lokijs`, `encoding` (common with Wagmi)
- **Contract ABIs:** After deploying contracts, export ABIs from Foundry's `out/` folder to `lib/abi/`
- **Neynar API:** All Frame verification goes through Neynar's `/v2/farcaster/frame/verify` endpoint
- **Platform Fees:** Set in basis points (75 = 0.75%) in contract constructor

## Testing Workflow

1. Deploy contracts to Base Sepolia
2. Update `NEXT_PUBLIC_GIFTLINK_ADDRESS` and `NEXT_PUBLIC_TOKEN_ADDRESS` in `.env.local`
3. Set `NEXT_PUBLIC_CHAIN_ENV=sepolia`
4. Run `npm run dev`
5. Test gift creation/claiming flow locally
6. For Frame testing, deploy to Vercel or use ngrok tunnel
