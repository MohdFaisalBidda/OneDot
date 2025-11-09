// components/forms/decision-form.tsx
"use client";

import type React from "react";
import { useState, useRef } from "react";
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
import { DecisionCategory, DecisionStatus } from "@/lib/generated/prisma";
import { CreateDecision, UpdateDecisionImage } from "@/actions";
import { toast } from "sonner";
import Loader from "../Loader";
import { R2FileUploader, type R2FileUploaderRef } from "@/components/custom/r2-file-uploader";
import { useR2Upload } from "@/hooks/use-r2-upload";
import { DecisionEntry } from "../DecisionTracker";

interface DecisionFormProps {
    onSubmitSuccess?: () => void;
    defaultValues?: {
        title?: string;
        reason?: string;
        status?: DecisionStatus;
        category?: DecisionCategory;
        image?: string;
    };
    closeModal?: () => void;
}

export function DecisionForm({
    onSubmitSuccess,
    defaultValues,
    closeModal,
}: DecisionFormProps) {
    const [title, setTitle] = useState(defaultValues?.title || "");
    const [reason, setReason] = useState(defaultValues?.reason || "");
    const [category, setCategory] = useState<DecisionCategory>(
        defaultValues?.category || "CAREER"
    );
    const [status, setStatus] = useState<DecisionStatus>(
        defaultValues?.status || "PENDING"
    );
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formError, setFormError] = useState<string>("");
    const uploaderRef = useRef<R2FileUploaderRef>(null);

    const { uploadFile } = useR2Upload({
        prefix: 'decisions',
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

            // Client-side validation
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
                status: status || "PENDING",
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

            // Upload file if selected (only after DB entry succeeds)
            if (selectedFile && res.id) {
                const uploadResult = await uploadFile(selectedFile);

                if (!uploadResult.success) {
                    // DB entry created but upload failed - show warning
                    toast.warning("Decision created, but image upload failed. You can try uploading again later.");
                    console.error("Upload error:", uploadResult.error);
                } else if (uploadResult.url) {
                    // Update decision with image URL (only if upload succeeds)
                    const updateRes = await UpdateDecisionImage(res.id, uploadResult.url);

                    if (updateRes?.error) {
                        toast.warning("Decision created, but failed to attach image.");
                        console.error("Update error:", updateRes.error);
                    }
                }
            }

            toast.success("Decision has been added!");
            onSubmitSuccess?.();

            // Reset form
            setTitle("");
            setStatus("PENDING");
            setReason("");
            setCategory("CAREER");
            setSelectedFile(null);
            closeModal?.();
            uploaderRef.current?.resetFiles();
        } catch (error) {
            setFormError("An unexpected error occurred. Please try again.");
            console.error("Error creating decision entry:", error);
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
                <Label aria-required htmlFor="title">Decision Title</Label>
                <Input
                    id="title"
                    type="text"
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
                    maxLength={500}
                    rows={4}
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
                <Label aria-required htmlFor="status">Status</Label>
                <Select
                    value={status}
                    onValueChange={(value: string) => setStatus(value as DecisionStatus)}
                    disabled={isSubmitting}
                >
                    <SelectTrigger id="status" className="rounded-full">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.values(DecisionStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                                {status.replace("_", " ")}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label aria-required htmlFor="category">Category</Label>
                <Select
                    value={category}
                    onValueChange={(value: string) => setCategory(value as DecisionCategory)}
                    disabled={isSubmitting}
                >
                    <SelectTrigger id="category" className="rounded-full">
                        <SelectValue placeholder="Select a category" />
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
                <Label htmlFor="image">Reference Image (Optional)</Label>
                <div className="w-full">
                    <R2FileUploader
                        ref={uploaderRef}
                        onFilesSelected={handleFilesSelected}
                        prefix="decisions"
                        multiple={false}
                        autoUpload={false}
                    />
                    {errors.image && (
                        <p className="text-sm text-destructive">{errors.image}</p>
                    )}
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <Loader />
                    ) : (
                        "Add Decision"
                    )}
                </Button>
            </div>
        </form>
    );
}
