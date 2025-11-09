"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReusableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  showDefaultFooter?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  isLoading?: boolean;
}

export function ReusableModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  showDefaultFooter = false,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "default",
  isLoading = false,
}: ReusableModalProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-[500px] rounded-2xl shadow-lg",
          className
        )}
      >
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-normal">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div>{children}</div>
        {(footer || showDefaultFooter) && (
          <DialogFooter>
            {footer || (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="rounded-full"
                >
                  {cancelText}
                </Button>
                <Button
                  type="button"
                  variant={confirmVariant}
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="rounded-full"
                >
                  {isLoading ? "Loading..." : confirmText}
                </Button>
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <ReusableModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      showDefaultFooter
      onConfirm={onConfirm}
      confirmText={confirmText}
      cancelText={cancelText}
      confirmVariant={variant}
      isLoading={isLoading}
    >
      <div className="text-sm text-muted-foreground py-0">
        {description}
      </div>
    </ReusableModal>
  );
}
