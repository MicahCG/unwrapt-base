import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");

    // Handle React Native dependencies for MetaMask SDK
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@react-native-async-storage/async-storage": false,
    };

    return config;
  },
  async redirects() {
    return [
      {
        source: '/.well-known/farcaster.json',
        destination:
          'https://api.farcaster.xyz/miniapps/hosted-manifest/019a0cf5-f81d-7fd0-5990-4eb84bfb4e5d',
        permanent: false, // 307 Temporary Redirect
      },
    ];
  },
};

export default nextConfig;
