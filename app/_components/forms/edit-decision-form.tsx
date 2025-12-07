import { useState, useRef } from "react";
import { Decision, DecisionCategory, DecisionStatus } from "@/lib/generated/prisma";
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
import { toast } from "sonner";
import { UpdateDecision, UpdateDecisionImage } from "@/actions";
import { R2FileUploader, type R2FileUploaderRef } from "@/components/custom/r2-file-uploader";
import { useR2Upload } from "@/hooks/use-r2-upload";
import Loader from "../Loader";
import { DecisionEntry } from "../DecisionTracker";

interface EditDecisionFormProps {
    decision: Decision;
    onSuccess?: () => void;
    onCancel?: () => void;
    viewOnly?: boolean;
}

export function EditDecisionForm({ decision, onSuccess, onCancel, viewOnly = false }: EditDecisionFormProps) {
    console.log(decision, "decision");

    const [title, setTitle] = useState(decision?.title);
    const [reason, setReason] = useState(decision?.reason);
    const [status, setStatus] = useState<DecisionStatus>(decision?.status as DecisionStatus);
    const [category, setCategory] = useState<DecisionCategory>(decision?.category as DecisionCategory);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formError, setFormError] = useState<string>("");
    const [imageUrl, setImageUrl] = useState<string | null>(decision?.image || null);
    const uploaderRef = useRef<R2FileUploaderRef>(null);

    const { uploadFile, deleteFile } = useR2Upload({
        prefix: 'decisions',
        showToast: true,
        onUploadSuccess: (result) => {
            if (result.key) {
                console.log('File uploaded successfully:', result);
            }
        },
    });

    const handleFilesSelected = async (files: File[]) => {
        if (files && files.length > 0) {
            setSelectedFile(files[0]);

            // If there's an existing image, delete it first
            if (imageUrl) {
                try {
                    await deleteFile(imageUrl);
                    setImageUrl(null);
                } catch (error) {
                    console.error('Error removing old image:', error);
                    toast.error('Failed to remove old image');
                }
            }
        }
    };

    const handleImageRemove = () => {
        setImageUrl(null);
        setSelectedFile(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        if (viewOnly) {
            onCancel?.();
            return;
        }

        e.preventDefault();
        setFormError("");
        setErrors({});

        try {
            setIsUpdating(true);

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
                setIsUpdating(false);
                return;
            }

            // If we have a selected file, upload it
            if (selectedFile) {
                const uploadResult = await uploadFile(selectedFile);

                if (!uploadResult.success) {
                    toast.warning("Failed to upload new image. Please try again.");
                    console.error("Upload error:", uploadResult.error);
                    setIsUpdating(false);
                    return;
                } else if (uploadResult.url) {
                    setImageUrl(uploadResult.url);
                }
            }

            // If we don't have a new image URL and no existing image, clear the image
            const finalImageUrl = imageUrl || decision.image;

            const updateData: DecisionEntry = {
                id: decision.id,
                title: title,
                reason: reason,
                status: status,
                category: category,
                date: decision.date.toString(),
                image: finalImageUrl || undefined,
            };

            const res = await UpdateDecision(decision.id, updateData);

            if (res?.error) {
                if (res.fieldErrors) {
                    setErrors(res.fieldErrors);
                } else {
                    setFormError(res.error);
                }
                setIsUpdating(false);
                return;
            }

            // Upload file if selected (only after DB entry succeeds)
            if (selectedFile) {
                try {
                    const uploadResult = await uploadFile(selectedFile);

                    if (!uploadResult.success) {
                        // DB entry created but upload failed - show warning
                        toast.warning("Decision updated, but image upload failed. You can try uploading again later.");
                        console.error("Upload error:", uploadResult.error);
                    } else if (uploadResult.key) {
                        // Get the public URL for the uploaded file
                        const publicUrl = uploadResult.url || `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${uploadResult.key}`;

                        // Update decision with image URL (only if upload succeeds)
                        const updateRes = await UpdateDecisionImage(decision.id, publicUrl);

                        if (updateRes?.error) {
                            toast.warning("Decision updated, but failed to attach image.");
                            console.error("Update error:", updateRes.error);
                        } else {
                            setImageUrl(publicUrl);
                            console.log("Image URL updated in database:", publicUrl);
                        }
                    }
                } catch (error) {
                    console.error("Error during file upload/update:", error);
                    toast.warning("Decision updated, but there was an error processing the image.");
                }

                toast.success("Decision updated successfully!");
                onSuccess?.();
            }
        } catch (error) {
            setFormError("An unexpected error occurred. Please try again.");
            console.error("Error updating decision:", error);
        } finally {
            setIsUpdating(false);
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
                <Label aria-required htmlFor="edit-title">
                    Decision Title
                </Label>
                <Input
                    id="edit-title"
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        clearError("title");
                    }}
                    placeholder="What did you decide?"
                    className="rounded-full"
                    disabled={isUpdating || viewOnly}
                    readOnly={viewOnly}
                />
                {errors.title && (
                    <p className="text-sm text-destructive">{errors.title}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label aria-required htmlFor="edit-reason">
                    Reason
                </Label>
                <Textarea
                    id="edit-reason"
                    value={reason}
                    onChange={(e) => {
                        setReason(e.target.value);
                        clearError("reason");
                    }}
                    placeholder="Why did you make this decision?"
                    maxLength={500}
                    rows={4}
                    className="rounded-2xl"
                    disabled={isUpdating || viewOnly}
                    readOnly={viewOnly}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                        {errors.reason && (
                            <span className="text-destructive">{errors.reason}</span>
                        )}
                    </span>
                    <span>{reason?.length}/500</span>
                </div>
            </div>

            <div className="space-y-2">
                <Label aria-required htmlFor="status">Status</Label>
                <Select
                    value={status}
                    onValueChange={(value: string) => setStatus(value as DecisionStatus)}
                    disabled={isUpdating || viewOnly}
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
                <Label aria-required htmlFor="edit-category">
                    Category
                </Label>
                <Select
                    value={category}
                    onValueChange={(value: string) => setCategory(value as DecisionCategory)}
                    disabled={isUpdating || viewOnly}
                >
                    <SelectTrigger id="edit-category" className="rounded-full">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.values(DecisionCategory).map((cat) => (
                            <SelectItem key={cat} value={cat}>
                                {cat.replace("_", " ")}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {(decision?.image || !viewOnly) && (
                <div className="space-y-2">
                    <Label htmlFor="edit-image">Reference Image (Optional)</Label>
                    <R2FileUploader
                        ref={uploaderRef}
                        prefix="decisions"
                        autoUpload={false}
                        onFilesSelected={handleFilesSelected}
                        onImageRemove={handleImageRemove}
                        imageSrc={decision?.image || null}
                        viewOnly={viewOnly}
                        className="mb-4"
                    />
                </div>
            )}

            {!viewOnly && (
                <div className="flex justify-end space-x-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isUpdating}
                        className="rounded-full"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isUpdating}
                        className="rounded-full"
                    >
                        {isUpdating ? <Loader /> : "Update Decision"}
                    </Button>
                </div>
            )}
        </form>
    );
}
