import type { Metadata } from "next";
// import {
//   Geist,
//   Geist_Mono,
//   Instrument_Serif,
//   Inter,
//   Playfair_Display,
// } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ServerSessionProvider from "./context/AuthProvider";
import AuthProvider from "./context/AuthProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Navigation from "./_components/Navigation";

// const inter = Inter({
//   subsets: ["latin"],
//   variable: "--font-inter",
//   display: "swap",
//   preload: true,
// });

// const instrumentSerif = Instrument_Serif({
//   subsets: ["latin"],
//   variable: "--font-instrument-serif",
//   weight: ["400"],
//   display: "swap",
//   preload: true,
// });

export const metadata: Metadata = {
  title: "OneDot",
  description: "Track your daily focus and decisions",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body className="font-sans">
        <AuthProvider session={session}>
          <Toaster position="top-center" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
