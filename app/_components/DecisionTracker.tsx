"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Decision, DecisionCategory } from "@/lib/generated/prisma";
import Loader from "./Loader";
import { CreateDecision, UpdateDecisionImage } from "@/actions";
import { toast } from "sonner";
import { R2FileUploader, type R2FileUploaderRef } from "@/components/custom/r2-file-uploader";
import { useR2Upload } from "@/hooks/use-r2-upload";
import { ImageLightbox } from "@/components/custom/image-lightbox";
import { getCategoryColor, getCategoryIcon } from "@/lib/status-colors";

export type DecisionEntry = {
  id: string;
  title: string;
  reason: string;
  category: DecisionCategory;
  date: string;
  image?: string;
};

export default function DecisionsTrackerPage({
  decisions,
}: {
  decisions: Decision[] | undefined;
}) {
  // const [decisions, setDecisions] = useState<Decision[]>([
  //   {
  //     id: "1",
  //     title: "Switched to morning workouts",
  //     reason: "Better energy throughout the day",
  //     category: "Health",
  //     date: "2025-02-09",
  //   },
  //   {
  //     id: "2",
  //     title: "Started learning TypeScript",
  //     reason: "Career advancement and better code quality",
  //     category: "Career",
  //     date: "2025-02-07",
  //   },
  //   {
  //     id: "3",
  //     title: "Reduced social media time",
  //     reason: "More time for meaningful activities",
  //     category: "Lifestyle",
  //     date: "2025-02-05",
  //   },
  // ])

  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("");
  const [category, setCategory] = useState<DecisionCategory>("CAREER");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>("");
  const uploaderRef = useRef<R2FileUploaderRef>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  const { uploadFile } = useR2Upload({
    prefix: 'decisions',
    showToast: false,
  });

  const handleFilesSelected = (files: File[]) => {
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const openLightbox = (imageUrl: string) => {
    setLightboxImages([imageUrl]);
    setLightboxIndex(0);
    setLightboxOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setErrors({});

    try {
      setIsSubmitting(true);
      
      // Step 1: Client-side validation
      const validationErrors: Record<string, string> = {};
      
      if (!title.trim()) {
        validationErrors.title = "Title is required";
      } else if (title.length > 100) {
        validationErrors.title = "Title must be less than 100 characters";
      }
      
      if (!reason.trim()) {
        validationErrors.reason = "Reason is required";
      } else if (reason.length > 500) {
        validationErrors.reason = "Reason must be less than 500 characters";
      }
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }

      // Step 2: Create decision entry first (without image)
      const newDecision: DecisionEntry = {
        id: Date.now().toString(),
        title,
        reason,
        category: category,
        date: new Date().toISOString().split("T")[0],
        image: undefined, // No image yet
      };

      const res = await CreateDecision(newDecision);

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
          toast.warning("Decision created, but image upload failed. You can try uploading again later.");
          console.error("Upload error:", uploadResult.error);
        } else if (uploadResult.url) {
          // Step 4: Update decision with image URL (only if upload succeeds)
          const updateRes = await UpdateDecisionImage(res.id, uploadResult.url);
          
          if (updateRes?.error) {
            toast.warning("Decision created, but failed to attach image.");
            console.error("Update error:", updateRes.error);
          }
        }
      }

      toast.success("Decision has been added!");

      // Reset form
      setTitle("");
      setReason("");
      setCategory("CAREER");
      setSelectedFile(null);
      uploaderRef.current?.resetFiles();
    } catch (error) {
      setFormError("An unexpected error occurred. Please try again.");
      console.log("Error creating decision entry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = (field: string) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8 md:p-6">
      <div className="mb-6 md:mb-12 text-center">
        <h1 className="font-serif text-3xl md:text-5xl font-normal leading-tight text-balance text-foreground sm:text-6xl">
          Decision Tracker
        </h1>
        <p className="mt-2 md:mt-4 text-sm md:text-lg text-muted-foreground leading-relaxed">
          Document important decisions and their reasoning
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-2xl font-normal">
              New Decision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {formError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label aria-required htmlFor="title">Decision Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    clearError("title");
                  }}
                  placeholder="What did you decide?"
                  className="rounded-full"
                  disabled={isSubmitting}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label aria-required htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    clearError("reason");
                  }}
                  placeholder="Why did you make this decision?"
                  rows={4}
                  maxLength={500}
                  className="rounded-2xl"
                  disabled={isSubmitting}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {errors.reason && (
                      <p className="text-sm text-destructive">{errors.reason}</p>
                    )}
                  </span>
                  <span>{reason.length}/500</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label aria-required htmlFor="category">Category</Label>
                <Select
                  value={category}
                  onValueChange={(val: string) =>
                    setCategory(val as DecisionCategory)
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="category" className="rounded-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(DecisionCategory).map((dec) => (
                      <SelectItem key={dec} value={dec}>
                        {dec.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="decision-image">
                  Reference Image (optional)
                </Label>
                <R2FileUploader
                  ref={uploaderRef}
                  prefix="decisions"
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
                {isSubmitting ? <Loader /> : "Add Decision"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="font-serif text-2xl font-normal">Decision Timeline</h2>
          <div className="space-y-4">
            {decisions?.map((decision, index) => (
              <Card key={decision.id} className="shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                        {index + 1}
                      </div>
                      {index < decisions.length - 1 && (
                        <div className="mt-2 h-full w-px bg-border" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2 pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-medium leading-relaxed">
                          {decision.title}
                        </h3>
                        <span className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${getCategoryColor(decision.category)}`}>
                          <span>{getCategoryIcon(decision.category)}</span>
                          <span>{decision.category}</span>
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-4">

                      <p className="text-sm leading-relaxed text-muted-foreground max-w-md w-full">
                        {decision.reason}
                      </p>
                      {decision.image && (
                        <div className="pt-2">
                          <img
                            src={decision.image || "/placeholder.svg"}
                            alt="Decision reference"
                            className="rounded-xl h-24 object-cover shadow-sm hover:scale-110 transition-all ease-in-out duration-500 cursor-pointer"
                            onClick={() => openLightbox(decision.image!)}
                          />
                        </div>
                      )}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {new Date(decision.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        alt="Decision reference"
      />
    </div>
  );
}
