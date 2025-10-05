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

export const metadata: Metadata = {
  title: "ClarityLog",
  description: "Track your daily focus and decisions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`font-sans ${geistSans.variable} ${geistSans.variable} ${playfair.variable} antialiased`}
      >
        <DashboardLayout>
          <Suspense fallback={<Loader />}>
            <main className="min-h-screen">{children}</main>
          </Suspense>
        </DashboardLayout>
      </body>
    </html>
  );
}
