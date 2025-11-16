"use client";

import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

interface NoDataFoundProps {
  title?: string;
  description?: string;
  onRetry?: () => void | Promise<void>;
  redirectOnRetry?: string;
  className?: string;
}

export function NoDataFound({
  title = "No Data Available",
  description = "We couldn't find any data to display.",
  onRetry,
  redirectOnRetry,
  className = ""
}: NoDataFoundProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="w-20 h-20 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center mb-4">
        <svg
          className="w-10 h-10 text-orange-500 dark:text-orange-400"
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
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
        {description}
      </p>
      {(onRetry || redirectOnRetry) && (
        <Button
          onClick={async (e) => {
            e.preventDefault();
            if (onRetry) {
              await onRetry();
            }
            if (redirectOnRetry) {
              window.location.href = redirectOnRetry;
            }
          }}
          variant="outline"
          className="border-orange-300 text-orange-600 dark:border-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          {onRetry ? 'Refresh Data' : 'Try Again'}
        </Button>
      )}
    </div>
  );
}
