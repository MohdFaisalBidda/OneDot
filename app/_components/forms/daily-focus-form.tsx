// components/forms/daily-focus-form.tsx (Extracted from your page)
"use client";

import type React from "react";
import { useState } from "react";
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
import { AlertCircle, ImageIcon, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FocusStatus } from "@/lib/generated/prisma";
import { CreateFocus } from "@/actions";
import { toast } from "sonner";
import Loader from "../Loader";
import { R2FileUploader } from "@/components/custom/r2-file-uploader";

interface DailyFocusFormProps {
  onSubmitSuccess?: () => void;
  defaultValues?: {
    focus?: string;
    status?: FocusStatus;
    mood?: string;
    notes?: string;
    image?: string;
  };
}

export function DailyFocusForm({
  onSubmitSuccess,
  defaultValues,
}: DailyFocusFormProps) {
  const [focus, setFocus] = useState(defaultValues?.focus || "");
  const [status, setStatus] = useState<FocusStatus>(
    defaultValues?.status || "PENDING"
  );
  const [mood, setMood] = useState(defaultValues?.mood || "");
  const [notes, setNotes] = useState(defaultValues?.notes || "");
  const [image, setImage] = useState<string>(defaultValues?.image || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Please upload an image file",
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size should be less than 5MB",
        }));
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setErrors({});

    try {
      setIsSubmitting(true);
      const newEntry = {
        id: Date.now().toString(),
        focus,
        status: status || "PENDING",
        mood,
        notes,
        date: new Date().toISOString().split("T")[0],
        image: image || undefined,
      };

      const res = await CreateFocus(newEntry);

      if (res?.error) {
        if (res.fieldErrors) {
          setErrors(res.fieldErrors);
        } else {
          setFormError(res.error);
        }
        return;
      }

      toast.success("Focus has been added!");
      onSubmitSuccess?.();

      // Reset form
      setFocus("");
      setStatus("PENDING");
      setMood("");
      setNotes("");
      setImage("");
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
        <Label htmlFor="focus">What's your focus today?</Label>
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
        <Label htmlFor="status">Status</Label>
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
        <Label htmlFor="mood">Mood</Label>
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
        <Label htmlFor="image">Attach Image (optional)</Label>
        {/* {!image ? (
          <div className="flex items-center gap-2">
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isSubmitting}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("image")?.click()}
              className="rounded-full"
              disabled={isSubmitting}
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Upload Image
            </Button>
          </div>
        ) : (
          <div className="relative inline-block">
            <img
              src={image || "/placeholder.svg"}
              alt="Preview"
              className="h-24 w-24 rounded-2xl object-cover shadow-sm"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={removeImage}
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
              disabled={isSubmitting}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        {errors.image && (
          <p className="text-sm text-destructive">{errors.image}</p>
        )} */}
        <R2FileUploader/>
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
