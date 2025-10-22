'use client';
import { useState } from 'react';
import { parseUnits } from 'viem';
import { useWriteContract } from 'wagmi';
import { GiftLinkABI } from '@/lib/abi/GiftLink';
import { ACTIVE } from '@/lib/chain';

export default function CreateGiftPage() {
  const [amount, setAmount] = useState('10');
  const [days, setDays] = useState(7);
  const [slots, setSlots] = useState(1);
  const [mysteryMode, setMysteryMode] = useState(false);
  const [giftId, setGiftId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { writeContractAsync } = useWriteContract();

  async function onCreate() {
    setIsLoading(true);
    try {
      const secret = crypto.getRandomValues(new Uint8Array(16));
      const secretHex = '0x' + Array.from(secret).map(b => b.toString(16).padStart(2, '0')).join('');
      const res = await fetch('/api/gift/hash', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: secretHex }) 
      });
      const { claimHash: _claimHash } = await res.json();

      const expiry = Math.floor(Date.now()/1000) + days*24*3600;
      const amountWei = parseUnits(amount, 6); // assume USDC 6 decimals

      // 1) approve token first (omitted here) then 2) createGift
      await writeContractAsync({
        address: ACTIVE.gift as `0x${string}`,
        abi: GiftLinkABI,
        functionName: 'createGift',
        args: [
          amountWei,
          BigInt(expiry),
          Number(slots),
          _claimHash as `0x${string}`,
          Number(process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS || 75),
          mysteryMode ? 1 : 0 // SplitMode: 0 = Even, 1 = Mystery
        ],
      });

      // TODO: parse logs or simply fetch nextId via read after tx mine
      setGiftId(123); // Placeholder - will be updated with actual gift ID
    } catch (error) {
      console.error('Error creating gift:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Create Gift</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Amount (USDC)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Expiry (days)</label>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full p-2 border rounded"
            placeholder="7"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Slots (1 = single claim, &gt;1 = multi-claim)</label>
          <input
            type="number"
            value={slots}
            onChange={(e) => setSlots(Number(e.target.value))}
            className="w-full p-2 border rounded"
            placeholder="1"
            min="1"
            max="1000"
          />
        </div>

        <div className="flex items-center space-x-3 p-3 border rounded bg-gray-50">
          <input
            type="checkbox"
            id="mysteryMode"
            checked={mysteryMode}
            onChange={(e) => setMysteryMode(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <label htmlFor="mysteryMode" className="text-sm font-medium cursor-pointer">
            🎲 Random Split (Mystery Mode)
          </label>
        </div>
        {mysteryMode && (
          <p className="text-xs text-gray-600 -mt-2 ml-1">
            Each claim gets a random amount between 5-150% of the average. Last claimer gets the remainder.
          </p>
        )}

        <button 
          onClick={onCreate} 
          disabled={isLoading}
          className="w-full px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Gift'}
        </button>
      </div>

      {giftId && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="font-medium">Gift created successfully!</p>
          <p className="text-sm text-gray-600 mt-2">Share your Frame URL:</p>
          <pre className="text-xs bg-white p-2 rounded mt-1 overflow-x-auto">
            {`${process.env.NEXT_PUBLIC_URL}/api/frame/${giftId}`}
          </pre>
        </div>
      )}
    </main>
  );
}

