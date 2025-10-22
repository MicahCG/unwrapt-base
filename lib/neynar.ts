export async function verifyFrameRequest(req: Request) {
  const apiKey = process.env.NEYNAR_API_KEY!;
  const body = await req.json();
  // Forward to Neynar frames verify endpoint
  const r = await fetch('https://api.neynar.com/v2/farcaster/frame/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api_key': apiKey,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!r.ok) throw new Error('Neynar verify failed');
  const data = await r.json();
  return {
    valid: data.valid as boolean,
    buttonIndex: data.button as number,
    requesterFid: data.interactor?.fid as number,
    castId: data.cast_id,
    address: data.interactor?.verified_accounts?.[0] ?? undefined,
    raw: data,
  };
}

