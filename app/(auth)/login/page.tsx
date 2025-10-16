import type React from "react";
import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Navigation from "@/app/_components/Navigation";
import LoginForm from "@/app/_components/forms/login-form";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Login",
  description: "Sign in to your ClarityLog account to track your daily focus, decisions, and maintain clarity in your work.",
  keywords: ["login", "sign in", "account access", "user authentication"],
  canonicalUrl: "/login",
  noIndex: true, // Prevent indexing of login pages
});

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F3] flex items-center justify-center p-4">
      <Navigation />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="font-serif text-4xl md:text-5xl">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-base">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
