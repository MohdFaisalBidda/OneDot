// components/forms/daily-focus-form.tsx (Extracted from your page)
"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FocusStatus } from "@/lib/generated/prisma";
import { CreateFocus, UpdateFocusImage } from "@/actions";
import { toast } from "sonner";
import Loader from "../Loader";
import { R2FileUploader, type R2FileUploaderRef } from "@/components/custom/r2-file-uploader";
import { useR2Upload } from "@/hooks/use-r2-upload";
import { FocusEntry } from "../DailyFocus";

interface DailyFocusFormProps {
  onSubmitSuccess?: () => void;
  defaultValues?: {
    focus?: string;
    status?: FocusStatus;
    mood?: string;
    notes?: string;
    image?: string;
  };
  closeModal?: () => void;
}

export function DailyFocusForm({
  onSubmitSuccess,
  defaultValues,
  closeModal,
}: DailyFocusFormProps) {
  const [focus, setFocus] = useState(defaultValues?.focus || "");
  const [status, setStatus] = useState<FocusStatus>(
    defaultValues?.status || "PENDING"
  );
  const [mood, setMood] = useState(defaultValues?.mood || "");
  const [notes, setNotes] = useState(defaultValues?.notes || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>("");
  const uploaderRef = useRef<R2FileUploaderRef>(null);
  
  const { uploadFile } = useR2Upload({
    prefix: 'focus',
    showToast: false,
  });

  const handleFilesSelected = (files: File[]) => {
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setErrors({});

    try {
      setIsSubmitting(true);
      
      // Step 1: Client-side validation
      const validationErrors: Record<string, string> = {};
      
      if (!focus.trim()) {
        validationErrors.focus = "Focus is required";
      } else if (focus.length > 100) {
        validationErrors.focus = "Focus must be less than 100 characters";
      }
      
      if (!mood.trim()) {
        validationErrors.mood = "Mood is required";
      } else if (mood.length > 50) {
        validationErrors.mood = "Mood must be less than 50 characters";
      }
      
      if (notes.length > 500) {
        validationErrors.notes = "Notes must be less than 500 characters";
      }
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }

      // Step 2: Create focus entry first (without image)
      const newEntry: FocusEntry = {
        id: Date.now().toString(),
        title: focus,
        status: status || "PENDING",
        mood,
        notes,
        date: new Date().toISOString().split("T")[0],
        image: undefined, // No image yet
      };

      const res = await CreateFocus(newEntry);

      if (res?.error) {
        if (res.fieldErrors) {
          setErrors(res.fieldErrors);
        } else {
          setFormError(res.error);
        }
        setIsSubmitting(false);
        return;
      }

      // Step 3: Upload file if selected (only after DB entry succeeds)
      if (selectedFile && res.id) {
        const uploadResult = await uploadFile(selectedFile);
        
        if (!uploadResult.success) {
          // DB entry created but upload failed - show warning
          toast.warning("Focus created, but image upload failed. You can try uploading again later.");
          console.error("Upload error:", uploadResult.error);
        } else if (uploadResult.key) {
          // Step 4: Update focus with image URL (only if upload succeeds)
          const updateRes = await UpdateFocusImage(res.id, `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${uploadResult.key}`);
          
          if (updateRes?.error) {
            toast.warning("Focus created, but failed to attach image.");
            console.error("Update error:", updateRes.error);
          }
        }
      }

      toast.success("Focus has been added!");
      onSubmitSuccess?.();

      // Reset form
      setFocus("");
      setStatus("PENDING");
      setMood("");
      setNotes("");
      setSelectedFile(null);
      closeModal?.();
      uploaderRef.current?.resetFiles();
    } catch (error) {
      setFormError("An unexpected error occurred. Please try again.");
      console.log("Error creating focus entry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = (field: string) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label aria-required htmlFor="focus">What's your focus today?</Label>
        <Input
          id="focus"
          type="text"
          value={focus}
          onChange={(e) => {
            setFocus(e.target.value);
            clearError("focus");
          }}
          placeholder="Enter your main focus..."
          className="rounded-full"
          disabled={isSubmitting}
        />
        {errors.focus && (
          <p className="text-sm text-destructive">{errors.focus}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label aria-required htmlFor="status">Status</Label>
        <Select
          value={status}
          onValueChange={(value: string) => setStatus(value as FocusStatus)}
          disabled={isSubmitting}
        >
          <SelectTrigger id="status" className="rounded-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(FocusStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label aria-required htmlFor="mood">Mood</Label>
        <Input
          id="mood"
          value={mood}
          onChange={(e) => {
            setMood(e.target.value);
            clearError("mood");
          }}
          placeholder="How are you feeling?"
          className="rounded-full"
          disabled={isSubmitting}
        />
        {errors.mood && (
          <p className="text-sm text-destructive">{errors.mood}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            clearError("notes");
          }}
          placeholder="Any additional thoughts..."
          rows={4}
          maxLength={500}
          className="rounded-2xl"
          disabled={isSubmitting}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {errors.notes && (
              <span className="text-destructive">{errors.notes}</span>
            )}
          </span>
          <span>{notes.length}/500</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Attach Image</Label>
        <R2FileUploader
          ref={uploaderRef}
          prefix="focus"
          multiple={false}
          autoUpload={false}
          onFilesSelected={handleFilesSelected}
        />
        {errors.image && (
          <p className="text-sm text-destructive">{errors.image}</p>
        )}
      </div>

      <Button
        disabled={isSubmitting}
        type="submit"
        className="w-full rounded-full"
        size="lg"
      >
        {isSubmitting ? <Loader /> : "Add Focus"}
      </Button>
    </form>
  );
}
