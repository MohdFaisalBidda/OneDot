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
import {
  generatePageMetadata,
  generateOrganizationSchema,
  generateWebApplicationSchema,
} from "@/lib/metadata";
import { AuthDialogProvider } from "@/components/custom/AuthDialog";

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

export const metadata: Metadata = generatePageMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  
  // Generate JSON-LD structured data
  const organizationSchema = generateOrganizationSchema();
  const webApplicationSchema = generateWebApplicationSchema();

  return (
    <html lang="en">
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webApplicationSchema),
          }}
        />
      </head>
      <body className="font-sans">

        <AuthProvider session={session}>
        <AuthDialogProvider>
          <Toaster position="top-center" />
          {children}
        </AuthDialogProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
