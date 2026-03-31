import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// ✅ Keep basic metadata only (no verification here)
export const metadata: Metadata = {
  title: "Onchain Habit Tracker",
  description: "Track habits onchain on Base",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a14",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* 🔥 TALENT VERIFICATION */}
        <meta
          name="talentapp:project_verification"
          content="921317443ac76e71389a42db44a1eee552b665ea3568282e9cec604c53604ac3a4f8b46cc384cdd5e22049df72c94d0491f4cff0c40b0a0601e6c0f1e1afc8f8"
        />

        {/* 🔥 BASE VERIFICATION */}
        <meta
          name="base:app_id"
          content="6978ee373a92926b661fd8b4"
        />
      </head>

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