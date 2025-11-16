"use client";

import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface NotFoundProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  className?: string;
}

export function NotFound({
  title = "Page Not Found",
  description = "The page you're looking for doesn't exist or has been moved.",
  showBackButton = true,
  showHomeButton = true,
  className = "",
}: NotFoundProps) {
  const router = useRouter();

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center min-h-[70vh] ${className}`}>
      <div className="w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6">
        <svg
          className="w-12 h-12 text-blue-500 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        404
      </h1>
      
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
        {title}
      </h2>
      
      <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md">
        {description}
      </p>
      
      <div className="flex flex-wrap gap-4 justify-center">
        {showBackButton && (
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        )}
        
        {showHomeButton && (
          <Button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
          >
            <Home className="mr-2 h-4 w-4" />
            Return Home
          </Button>
        )}
      </div>
    </div>
  );
}
