"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

interface FieldErrors {
  email?: string;
  password?: string;
}

interface FormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSubmitSuccess?: () => void;
  defaultValues?: {
    email?: string;
    password?: string;
    redirect?: boolean;
    callbackUrl?: string;
  };
}

export default function LoginForm({
  onSubmitSuccess,
  defaultValues,
}: LoginFormProps) {
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
        onSubmitSuccess?.();
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
        {isLoading ? <Loader2 className="animate-spin" size={4} /> : "Log In"}
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
  );
}
