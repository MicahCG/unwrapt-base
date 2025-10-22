import { NextRequest, NextResponse } from 'next/server';
import { verifyFrameRequest } from '@/lib/neynar';
import { encodeFunctionData } from 'viem';
import { ACTIVE } from '@/lib/chain';
import { GiftLinkABI } from '@/lib/abi/GiftLink';

function frameResponse(body: Record<string, unknown>) {
  return NextResponse.json(body, { headers: { 'Content-Type': 'application/json' } });
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return frameResponse({
    image: `${process.env.NEXT_PUBLIC_URL}/og/gift-${id}.png`,
    buttons: [ { text: 'Claim' }, { text: 'Status' }, { text: 'Share' } ],
    post_url: `${process.env.NEXT_PUBLIC_URL}/api/frame/${id}`,
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = BigInt(idStr);
  const v = await verifyFrameRequest(req);
  if (!v.valid) return frameResponse({ error: 'Invalid frame' });

  // Button 1: Claim
  if (v.buttonIndex === 1) {
    const secret = 'gift-secret-v1'; // TODO: generate per-gift or per-FID
    const data = encodeFunctionData({
      abi: GiftLinkABI,
      functionName: 'claim',
      args: [id, ("0x" + Buffer.from(secret).toString('hex')) as `0x${string}`, v.address as `0x${string}`],
    });
    return frameResponse({
      chainId: 'eip155:' + ACTIVE.id,
      method: 'eth_sendTransaction',
      params: [{ to: ACTIVE.gift, data }],
    });
  }

  // Button 2: Status — just re-render image with remaining/expiry (MVP: static)
  if (v.buttonIndex === 2) {
    return frameResponse({
      image: `${process.env.NEXT_PUBLIC_URL}/og/status-${idStr}.png`,
      buttons: [ { text: 'Claim' }, { text: 'Share' } ],
      post_url: `${process.env.NEXT_PUBLIC_URL}/api/frame/${idStr}`,
    });
  }

  // Button 3: Share — prefill a cast with this frame URL
  return frameResponse({
    text: 'Claim this GiftLink →',
    links: [{ url: `${process.env.NEXT_PUBLIC_URL}/api/frame/${idStr}` }],
  });
}

