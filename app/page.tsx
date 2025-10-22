"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { Wallet } from "@coinbase/onchainkit/wallet";

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.headerWrapper}>
        <Wallet />
      </header>

      <div className={styles.content}>
        <Image
          priority
          src="/logo.svg"
          alt="Unwrapt Logo"
          width={200}
          height={200}
        />
        <h1 className={styles.title}>Unwrapt</h1>

        <p>
          Create and share crypto gifts through Farcaster Frames
        </p>

        <div className={styles.components}>
          <a href="/create" className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
            Create Gift
          </a>
        </div>

        <h2 className={styles.componentsTitle}>How it works</h2>

        <ul className={styles.components}>
          <li>1. Deposit USDC to create a gift with expiry and claim slots</li>
          <li>2. Share the Farcaster Frame link with recipients</li>
          <li>3. Recipients claim tokens directly in Farcaster</li>
          <li>4. Unclaimed tokens can be refunded after expiry</li>
        </ul>
      </div>
    </div>
  );
}
