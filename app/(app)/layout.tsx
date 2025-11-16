import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Instrument_Serif,
  Playfair_Display,
} from "next/font/google";
import "../../app/globals.css";
import { Suspense } from "react";
import Loader from "../_components/Loader";
import { DashboardLayout } from "../_components/dashboard-layout";
import { generatePageMetadata } from "@/lib/metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: ["400"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = generatePageMetadata({
  title: "Dashboard",
  description: "Your personal dashboard for tracking daily focus, decisions, and progress. View insights and manage your productivity journey.",
  keywords: ["dashboard", "overview", "productivity dashboard", "focus tracker", "decision tracker"],
  canonicalUrl: "/dashboard",
  noIndex: true,
});

const bodyClassName = `font-sans ${geistSans.variable} ${playfair.variable} ${instrumentSerif.variable} antialiased`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={bodyClassName}>
        <DashboardLayout>
          <Suspense fallback={<Loader />}>
            <main className="">{children}</main>
          </Suspense>
        </DashboardLayout>
      </body>
    </html>
  );
}
