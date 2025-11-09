"use client";

import { useState, useRef } from "react";
import { Focus, FocusStatus } from "@/lib/generated/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { R2FileUploader, type R2FileUploaderRef } from "@/components/custom/r2-file-uploader";
import { useR2Upload } from "@/hooks/use-r2-upload";
import { UpdateFocus } from "@/actions";
import { toast } from "sonner";
import Loader from "../Loader";

interface EditFocusFormProps {
  focus: Focus;
  onSuccess?: () => void;
  onCancel?: () => void;
  viewOnly?: boolean;
}

export function EditFocusForm({ focus, onSuccess, onCancel, viewOnly = false }: EditFocusFormProps) {
  const [title, setTitle] = useState(focus?.title || "");
  const [status, setStatus] = useState<FocusStatus>(focus?.status as FocusStatus);
  const [mood, setMood] = useState(focus?.mood || "");
  const [notes, setNotes] = useState(focus?.notes || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
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
      setIsUpdating(true);

      // Client-side validation
      const validationErrors: Record<string, string> = {};

      if (!title.trim()) {
        validationErrors.title = "Title is required";
      } else if (title.length > 100) {
        validationErrors.title = "Title must be less than 100 characters";
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsUpdating(false);
        return;
      }

      let imageUrl = focus.image;

      if (selectedFile) {
        const uploadResult = await uploadFile(selectedFile);

        if (!uploadResult.success) {
          toast.warning("Failed to upload new image. Keeping existing image.");
          console.error("Upload error:", uploadResult.error);
        } else if (uploadResult.url) {
          imageUrl = uploadResult.url;
        }
      }

      const updateData = {
        id: focus.id,
        title,
        status,
        mood,
        notes,
        image: imageUrl || undefined,
      };

      const res = await UpdateFocus(focus.id, updateData);

      if (res?.error) {
        if (res.fieldErrors) {
          setErrors(res.fieldErrors);
        } else {
          setFormError(res.error);
        }
        setIsUpdating(false);
        return;
      }

      toast.success("Focus entry updated successfully!");
      onSuccess?.();
    } catch (error) {
      setFormError("An unexpected error occurred. Please try again.");
      console.error("Error updating focus entry:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const clearError = (field: string) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
          {formError}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="edit-title" className={viewOnly ? "font-medium" : ""}>
          Title
        </Label>
        <Input
          id="edit-title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            clearError("title");
          }}
          placeholder="Enter a title..."
          className="rounded-full"
          disabled={isUpdating || viewOnly}
          readOnly={viewOnly}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(value: string) => setStatus(value as FocusStatus)}
            disabled={isUpdating || viewOnly}
          >
            <SelectTrigger className="rounded-full">
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
            onChange={(e) => setMood(e.target.value)}
            placeholder="How are you feeling?"
            className="rounded-full"
            disabled={isUpdating || viewOnly}
            readOnly={viewOnly}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes..."
          rows={3}
           maxLength={500}
          className="rounded-2xl"
          disabled={isUpdating || viewOnly}
          readOnly={viewOnly}
        />
      </div>

      {!viewOnly && (
        <div className="space-y-2">
          <Label htmlFor="edit-image">Reference Image (Optional)</Label>
          <R2FileUploader
            ref={uploaderRef}
            onFilesSelected={handleFilesSelected}
            prefix="focus"
            multiple={false}
            autoUpload={false}
          />
        </div>
      )}

      {!viewOnly && (
        <div className="flex justify-end space-x-3 pt-4">
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
            {isUpdating ? <Loader /> : "Update Focus"}
          </Button>
        </div>
      )}
    </form>
  );
}
