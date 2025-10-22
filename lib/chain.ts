export const CHAINS = {
  sepolia: {
    id: 84532, // base sepolia
    name: 'Base Sepolia',
    rpc: process.env.BASE_SEPOLIA_RPC_URL!,
    token: process.env.NEXT_PUBLIC_TOKEN_ADDRESS!,
    gift: process.env.NEXT_PUBLIC_GIFTLINK_ADDRESS!,
  },
  base: {
    id: 8453,
    name: 'Base',
    rpc: process.env.BASE_RPC_URL!,
    token: process.env.NEXT_PUBLIC_TOKEN_ADDRESS!,
    gift: process.env.NEXT_PUBLIC_GIFTLINK_ADDRESS!,
  },
} as const;

export const ACTIVE = process.env.NEXT_PUBLIC_CHAIN_ENV === 'base' ? CHAINS.base : CHAINS.sepolia;

