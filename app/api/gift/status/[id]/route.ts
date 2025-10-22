import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, defineChain } from 'viem';
import { ACTIVE } from '@/lib/chain';
import { GiftLinkABI } from '@/lib/abi/GiftLink';

const chain = defineChain({
  id: ACTIVE.id,
  name: ACTIVE.name,
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [ACTIVE.rpc] },
  },
});

const client = createPublicClient({ 
  chain, 
  transport: http(ACTIVE.rpc) 
});

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = BigInt(idStr);
  const gift = await client.readContract({
    address: ACTIVE.gift as `0x${string}`,
    abi: GiftLinkABI,
    functionName: 'gifts',
    args: [id],
  });
  return NextResponse.json({ gift });
}

