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
import SignupForm from "@/app/_components/forms/signup-form";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Sign Up",
  description: "Create your ClarityLog account and start your journey to better focus, mindful decisions, and increased productivity.",
  keywords: ["signup", "register", "create account", "new user", "get started"],
  canonicalUrl: "/signup",
});

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F3] flex items-center justify-center p-4">
      <Navigation />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="font-serif text-4xl md:text-5xl">
            Create Account
          </CardTitle>
          <CardDescription className="text-base">
            Start your journey to better focus and decisions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>
    </div>
  );
}
