'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Gift {
  sender: string;
  amount: string;
  remaining: string;
  expiry: string;
  slots: string;
  claimHash: string;
  feeBps: string;
}

export default function GiftPage() {
  const params = useParams();
  const [gift, setGift] = useState<Gift | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGift() {
      try {
        const response = await fetch(`/api/gift/status/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch gift');
        }
        const data = await response.json();
        setGift(data.gift);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchGift();
    }
  }, [params.id]);

  if (loading) {
    return (
      <main className="max-w-xl mx-auto p-6">
        <div className="text-center">Loading gift details...</div>
      </main>
    );
  }

  if (error || !gift) {
    return (
      <main className="max-w-xl mx-auto p-6">
        <div className="text-center text-red-600">
          {error || 'Gift not found'}
        </div>
      </main>
    );
  }

  const expiryDate = new Date(Number(gift.expiry) * 1000);
  const isExpired = Date.now() > Number(gift.expiry) * 1000;
  const remainingAmount = Number(gift.remaining) / 1e6; // Convert from wei to USDC
  const totalAmount = Number(gift.amount) / 1e6;

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Gift #{params.id}</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-medium mb-2">Gift Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span>{totalAmount.toFixed(6)} USDC</span>
            </div>
            <div className="flex justify-between">
              <span>Remaining:</span>
              <span>{remainingAmount.toFixed(6)} USDC</span>
            </div>
            <div className="flex justify-between">
              <span>Slots:</span>
              <span>{gift.slots}</span>
            </div>
            <div className="flex justify-between">
              <span>Expiry:</span>
              <span className={isExpired ? 'text-red-600' : ''}>
                {expiryDate.toLocaleString()}
                {isExpired && ' (Expired)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Platform Fee:</span>
              <span>{(Number(gift.feeBps) / 100).toFixed(2)}%</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded">
          <h3 className="font-medium mb-2">Farcaster Frame</h3>
          <p className="text-sm text-gray-600 mb-2">
            Share this link in Farcaster to let others claim the gift:
          </p>
          <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
            {`${process.env.NEXT_PUBLIC_URL}/api/frame/${params.id}`}
          </pre>
        </div>

        {isExpired && remainingAmount > 0 && (
          <div className="p-4 bg-yellow-50 rounded">
            <p className="text-sm text-yellow-800">
              This gift has expired. The sender can refund the remaining {remainingAmount.toFixed(6)} USDC.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

