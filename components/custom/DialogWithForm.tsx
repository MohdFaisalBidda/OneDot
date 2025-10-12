"use client";

import type React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ReusableDialogProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function ReusableDialog({
  trigger,
  title,
  description,
  children,
  footer,
  open,
  onOpenChange,
  className = "sm:max-w-[425px]",
}: ReusableDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        {children}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

interface DialogFormProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  form: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function DialogWithForm({
  trigger,
  title,
  description,
  form,
  footer,
  className = "sm:max-w-[425px]",
}: DialogFormProps) {
  return (
    <ReusableDialog
      trigger={trigger}
      title={title}
      description={description}
      footer={footer}
      className={className}
    >
      {form}
    </ReusableDialog>
  );
}