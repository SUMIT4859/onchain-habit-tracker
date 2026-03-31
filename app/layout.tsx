import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Onchain Habit Tracker | Build Better Habits on Base",
  description:
    "Track your daily habits with blockchain accountability. Build streaks, prove consistency, and improve your life onchain.",
  generator: "v0.app",
  keywords: [
    "habit tracker",
    "blockchain",
    "web3",
    "base",
    "onchain",
    "productivity",
  ],
  authors: [{ name: "Onchain Habit Tracker" }],

  // 🔥 ADD THIS PART (VERY IMPORTANT)
  other: {
    "talentapp:project_verification":
      "921317443ac76e71389a42db44a1eee552b665ea3568282e9cec604c53604ac3a4f8b46cc384cdd5e22049df72c94d0491f4cff0c40b0a0601e6c0f1e1afc8f8",
  },

  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },

  openGraph: {
    title: "Onchain Habit Tracker",
    description:
      "Track your daily habits with blockchain accountability on Base",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Onchain Habit Tracker",
    description:
      "Track your daily habits with blockchain accountability on Base",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a14",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}