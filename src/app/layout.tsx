import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "RankBid — India's Public Pay-to-Rank Leaderboard (INR)",
  description:
    "India's transparent paid-placement featured leaderboard for startups, D2C brands, creators, AI tools, and businesses. Claim your rank in INR via UPI.",
  keywords: [
    "RankBid",
    "India Startup Leaderboard",
    "Paid Placement",
    "D2C Leaderboard",
    "SaaS Leaderboard India",
    "Creator Directory India",
    "UPI Bidding",
    "ASCI Sponsored Content",
  ],
  authors: [{ name: "RankBid India" }],
  openGraph: {
    title: "RankBid — India's Public Pay-to-Rank Leaderboard",
    description: "Claim top rank on Bharat's high-visibility paid placement leaderboard.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
