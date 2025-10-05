"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Navigation from "@/app/_components/Navigation";

interface FieldErrors {
  email?: string;
  password?: string;
}

interface FormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setFieldErrors({});

      const login = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (login?.ok) {
        toast.success("Logged in successfully");
        router.push("/dashboard/daily-focus");
      } else {
        toast.error(login?.error);
      }
    } catch (error) {
      console.log(error, "error");
    } finally {
      setIsLoading(false);
      setFieldErrors({});
    }
  };

  const clearFieldError = (fieldName: keyof FieldErrors) => {
    setFieldErrors((prev) => ({ ...prev, [fieldName]: undefined }));
  };

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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-base rounded-full cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={4} />
              ) : (
                "Log In"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
