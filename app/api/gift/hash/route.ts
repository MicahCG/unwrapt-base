import { NextRequest, NextResponse } from 'next/server';
import { keccak256, toBytes } from 'viem';

export async function POST(req: NextRequest) {
  const { secret } = await req.json();
  // MVP: use secret only; optionally bind to fid with keccak256(fid||secret)
  const claimHash = keccak256(toBytes(secret));
  return NextResponse.json({ claimHash });
}

