import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Instrument_Serif,
  Inter,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
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
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} antialiased`}
    >
      <body className="font-sans">{children}</body>
    </html>
  );
}
