import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { ACTIVE } from '@/lib/chain';
import { GiftLinkABI } from '@/lib/abi/GiftLink';

const client = createPublicClient({ 
  chain: { id: ACTIVE.id }, 
  transport: http(ACTIVE.rpc) 
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const id = BigInt(params.id);
  const gift = await client.readContract({
    address: ACTIVE.gift as `0x${string}`,
    abi: GiftLinkABI,
    functionName: 'gifts',
    args: [id],
  });
  return NextResponse.json({ gift });
}

