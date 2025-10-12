"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { registerUser } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
}

interface SignupFormProps {
  onSubmitSuccess?: () => void;
  defaultValues?: {
    name?: string;
    email?: string;
    password?: string;
  };
}

export default function SignupForm({
  onSubmitSuccess,
  defaultValues,
}: SignupFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors({});

    const formDataObj = new FormData();
    formDataObj.append("name", formData.name);
    formDataObj.append("email", formData.email);
    formDataObj.append("password", formData.password);

    const result = await registerUser(formDataObj);

    if (result?.error) {
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
        // Show the first field error in toast
        // const firstError = Object.values(result.fieldErrors)[0];
      } else {
        toast.error(result.error);
      }
      setIsLoading(false);
      return;
    }

    toast.success("Account created successfully");
    onSubmitSuccess?.();
    signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });
    router.push("/daily-focus");
    setIsLoading(false);
  };

  // Clear individual field error when user starts typing
  const clearFieldError = (fieldName: keyof FieldErrors) => {
    setFieldErrors((prev) => ({ ...prev, [fieldName]: undefined }));
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Name
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Your name"
          required
          value={formData.name}
          onChange={handleInputChange}
          className={`h-11 ${fieldErrors.name ? "border-destructive" : ""}`}
        />
        {fieldErrors.name && (
          <p className="text-sm text-destructive mt-1">{fieldErrors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          value={formData.email}
          onChange={handleInputChange}
          className={`h-11 ${fieldErrors.email ? "border-destructive" : ""}`}
        />
        {fieldErrors.email && (
          <p className="text-sm text-destructive mt-1">{fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          value={formData.password}
          onChange={handleInputChange}
          className={`h-11 ${fieldErrors.password ? "border-destructive" : ""}`}
        />
        {fieldErrors.password && (
          <p className="text-sm text-destructive mt-1">
            {fieldErrors.password}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Must be at least 8 characters with uppercase, lowercase, and number
        </p>
      </div>

      <Button
        type="submit"
        className="w-full h-11 text-base rounded-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={4} />
        ) : (
          "Create Account"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
