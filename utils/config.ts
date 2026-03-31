"use client";

import { http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

export const config = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Onchain Habit Tracker",
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
});