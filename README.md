# Unwrapt - Crypto Gift Links via Farcaster Frames

A Web3 application that allows users to create crypto gifts that can be claimed through Farcaster Frames. Built with Next.js, OnchainKit, and Solidity.

## Features

- **Create Gifts**: Deposit USDC to create gifts with configurable expiry and claim slots
- **Farcaster Integration**: Recipients can claim gifts directly through Farcaster Frames
- **Multi-claim Support**: Single or multiple claim slots per gift
- **Automatic Refunds**: Unclaimed tokens are refunded to sender after expiry
- **Platform Fees**: Configurable platform fees (default 0.75%)

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Blockchain**: OnchainKit, Wagmi, Viem
- **Smart Contracts**: Solidity ^0.8.24, Foundry
- **Frames**: Farcaster Frames v2 with Neynar verification
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- Foundry (for smart contract development)
- Base Sepolia testnet ETH for testing

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd unwrapt-base
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# RPCs
BASE_RPC_URL="https://base.llamarpc.com"
BASE_SEPOLIA_RPC_URL="https://sepolia.base.org"

# Deployer keys for Foundry
DEPLOYER_PRIVATE_KEY="0x..."

# Farcaster verification
NEYNAR_API_KEY="..."

# App config
NEXT_PUBLIC_CHAIN_ENV="sepolia"
NEXT_PUBLIC_GIFTLINK_ADDRESS="0x0000000000000000000000000000000000000000"
NEXT_PUBLIC_TOKEN_ADDRESS="0x0000000000000000000000000000000000000000"
PLATFORM_FEE_BPS="75"
FEE_COLLECTOR="0xYourFeeCollectorAddress"
NEXT_PUBLIC_URL="https://unwrapt-base.vercel.app"
```

### Smart Contract Deployment

1. Navigate to contracts directory:
```bash
cd contracts
```

2. Install Foundry dependencies:
```bash
forge install
```

3. Build contracts:
```bash
forge build
```

4. Deploy to Base Sepolia:
```bash
forge script script/Deploy.s.sol:Deploy \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast \
  --verify --verifier blockscout \
  -vvvv
```

5. Update the contract address in your `.env.local` file.

### Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Create a Gift**: 
   - Connect your wallet
   - Navigate to `/create`
   - Enter amount, expiry days, and number of claim slots
   - Approve USDC and create the gift

2. **Share the Gift**:
   - Copy the Farcaster Frame URL
   - Share it in Farcaster or other social platforms

3. **Claim a Gift**:
   - Click the Frame URL in Farcaster
   - Tap "Claim" to receive the tokens

4. **Refund Unclaimed Gifts**:
   - After expiry, the sender can refund remaining tokens

## Project Structure

```
unwrapt-base/
├── app/                    # Next.js app directory
│   ├── create/            # Create gift page
│   ├── gift/[id]/         # Gift details page
│   └── api/               # API routes
│       ├── frame/[id]/    # Farcaster Frame endpoints
│       └── gift/          # Gift-related APIs
├── contracts/             # Solidity smart contracts
│   ├── src/              # Contract source files
│   ├── script/           # Deployment scripts
│   └── lib/              # Dependencies
├── lib/                   # Shared utilities
│   ├── abi/              # Contract ABIs
│   ├── chain.ts          # Chain configuration
│   └── neynar.ts         # Farcaster verification
└── public/               # Static assets
```

## Smart Contract

The `GiftLink.sol` contract handles:
- Gift creation with escrow
- Multi-slot claiming with proper distribution
- Platform fee collection
- Expiry-based refunds
- Reentrancy protection

## API Endpoints

- `GET/POST /api/frame/[id]` - Farcaster Frame interface
- `POST /api/gift/hash` - Generate claim hash
- `GET /api/gift/status/[id]` - Get gift status

## Deployment

### Vercel Deployment

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Mainnet Deployment

1. Deploy contracts to Base mainnet
2. Update environment variables
3. Redeploy frontend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
