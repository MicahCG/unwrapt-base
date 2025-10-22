import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import { RootProvider } from "./rootProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Unwrapt - Crypto Gifts via Farcaster Frames",
  description: "Create and share crypto gifts through Farcaster Frames. Deposit USDC to create gifts with expiry and claim slots.",
  keywords: ["crypto", "gifts", "farcaster", "frames", "usdc", "blockchain"],
  authors: [{ name: "Unwrapt Team" }],
  creator: "Unwrapt",
  publisher: "Unwrapt",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://unwrapt-base.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Unwrapt - Crypto Gifts via Farcaster Frames",
    description: "Create and share crypto gifts through Farcaster Frames. Deposit USDC to create gifts with expiry and claim slots.",
    url: "https://unwrapt-base.vercel.app",
    siteName: "Unwrapt",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "Unwrapt - Crypto Gifts via Farcaster Frames",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unwrapt - Crypto Gifts via Farcaster Frames",
    description: "Create and share crypto gifts through Farcaster Frames. Deposit USDC to create gifts with expiry and claim slots.",
    images: ["/logo.svg"],
    creator: "@unwrapt",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sourceCodePro.variable}`}>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
