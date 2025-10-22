"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Focus, FocusStatus } from "@/lib/generated/prisma";
import { DailyFocusForm } from "./forms/daily-focus-form";
import { ImageLightbox } from "@/components/custom/image-lightbox";
import { getStatusBadgeStyle, getStatusText } from "@/lib/status-colors";
import { ReusableModal, ConfirmModal } from "@/components/custom/reusable-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2 } from "lucide-react";
import { UpdateFocus, DeleteFocus } from "@/actions";
import { toast } from "sonner";
import Loader from "./Loader";
import { R2FileUploader, type R2FileUploaderRef } from "@/components/custom/r2-file-uploader";
import { useR2Upload } from "@/hooks/use-r2-upload";

export type FocusEntry = {
  id: string;
  focus: string;
  status: FocusStatus;
  mood: string;
  notes: string;
  date: string;
  image?: string;
};

export default function DailyFocusPage({
  recentFocus,
}: {
  recentFocus: Focus[] | undefined;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFocus, setSelectedFocus] = useState<Focus | null>(null);
  const [editFocus, setEditFocus] = useState("");
  const [editStatus, setEditStatus] = useState<FocusStatus>("PENDING");
  const [editMood, setEditMood] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const editUploaderRef = useRef<R2FileUploaderRef>(null);
  
  const { uploadFile } = useR2Upload({
    prefix: 'focus',
    showToast: false,
  });

  const openLightbox = (imageUrl: string) => {
    setLightboxImages([imageUrl]);
    setLightboxIndex(0);
    setLightboxOpen(true);
  };

  const openEditModal = (focus: Focus) => {
    setSelectedFocus(focus);
    setEditFocus(focus.title);
    setEditStatus(focus.status);
    setEditMood(focus.mood || "");
    setEditNotes(focus.notes || "");
    setEditModalOpen(true);
  };

  const openDeleteModal = (focus: Focus) => {
    setSelectedFocus(focus);
    setDeleteModalOpen(true);
  };

  const handleEditFilesSelected = (files: File[]) => {
    if (files && files.length > 0) {
      setEditSelectedFile(files[0]);
    }
  };

  const handleUpdate = async () => {
    if (!selectedFocus) return;

    try {
      setIsUpdating(true);
      setErrors({});
      
      const validationErrors: Record<string, string> = {};
      
      if (!editFocus.trim()) {
        validationErrors.focus = "Focus is required";
      } else if (editFocus.length > 100) {
        validationErrors.focus = "Focus must be less than 100 characters";
      }
      
      if (!editMood.trim()) {
        validationErrors.mood = "Mood is required";
      } else if (editMood.length > 50) {
        validationErrors.mood = "Mood must be less than 50 characters";
      }
      
      if (editNotes.length > 500) {
        validationErrors.notes = "Notes must be less than 500 characters";
      }
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsUpdating(false);
        return;
      }

      let imageUrl = selectedFocus.image;

      if (editSelectedFile) {
        const uploadResult = await uploadFile(editSelectedFile);
        
        if (!uploadResult.success) {
          toast.warning("Failed to upload new image. Keeping existing image.");
          console.error("Upload error:", uploadResult.error);
        } else if (uploadResult.url) {
          imageUrl = uploadResult.url;
        }
      }

      const updateData: FocusEntry = {
        id: selectedFocus.id,
        focus: editFocus,
        status: editStatus,
        mood: editMood,
        notes: editNotes,
        date: selectedFocus.date.toString(),
        image: imageUrl || undefined,
      };

      const res = await UpdateFocus(selectedFocus.id, updateData);

      if (res?.error) {
        if (res.fieldErrors) {
          setErrors(res.fieldErrors);
        } else {
          toast.error(res.error);
        }
        setIsUpdating(false);
        return;
      }

      toast.success("Focus updated successfully!");
      setEditModalOpen(false);
      setSelectedFocus(null);
      setEditSelectedFile(null);
      editUploaderRef.current?.resetFiles();
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Error updating focus:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFocus) return;

    try {
      setIsDeleting(true);
      
      const res = await DeleteFocus(selectedFocus.id);

      if (res?.error) {
        toast.error(res.error);
        setIsDeleting(false);
        return;
      }

      toast.success("Focus deleted successfully!");
      setDeleteModalOpen(false);
      setSelectedFocus(null);
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Error deleting focus:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8 md:p-6">
      <div className="mb-6 md:mb-12 text-center">
        <h1 className="font-serif text-3xl md:text-5xl font-normal leading-tight text-balance text-foreground sm:text-6xl">
          Daily Focus Journal
        </h1>
        <p className="mt-2 md:mt-4 text-sm md:text-lg text-muted-foreground leading-relaxed">
          Track your daily intentions and achievements
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-2xl font-normal">
              Today's Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DailyFocusForm />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="font-serif text-2xl font-normal">Recent Entries</h2>
          <div className="space-y-4">
            {recentFocus?.map((entry) => (
              <Card key={entry.id} className="shadow-sm">
                <CardContent className="">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4 ">
                      <div className="flex-1">
                        <h3 className="font-medium leading-relaxed">
                          {entry.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadgeStyle(entry.status)}`}
                        >
                          {getStatusText(entry.status)}
                        </span>
                        <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full hover:scale-125 transition-all ease-in-out duration-500"
                          onClick={() => openEditModal(entry)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full text-destructive hover:text-destructive hover:scale-125 transition-all ease-in-out duration-500"
                          onClick={() => openDeleteModal(entry)}
                        >
                          <Trash2 className="h-4 w-4" />

                        </Button>
                        </div>
                      </div>  
                    </div>
                    <div className="flex justify-between items-center gap-x-10">
                      <div className="flex flex-col space-y-1">
                        {entry.mood && (
                          <p className="text-sm text-muted-foreground max-w-xl w-full">
                            Mood: {entry.mood}
                          </p>
                        )}
                        {entry.notes && (
                          <p className="text-sm leading-relaxed text-muted-foreground max-w-md w-full">
                            {entry.notes}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString()}
                        </p>
                      </div>
                      {entry.image && (
                        <div className="pt-2">
                          <img
                            src={entry.image || "/placeholder.svg"}
                            alt="Entry"
                            className="rounded-xl h-24 object-cover shadow-sm hover:scale-110 transition-all ease-in-out duration-500 cursor-pointer"
                            onClick={() => openLightbox(entry.image!)}
                          />
                        </div>
                      )}
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
        alt="Focus entry"
      />

      <ReusableModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        title="Edit Focus Entry"
        description="Update your focus details"
        className="sm:max-w-[500px]"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-focus">What's your focus?</Label>
            <Input
              id="edit-focus"
              value={editFocus}
              onChange={(e) => setEditFocus(e.target.value)}
              placeholder="Enter your main focus..."
              className="rounded-full"
              disabled={isUpdating}
            />
            {errors.focus && (
              <p className="text-sm text-destructive">{errors.focus}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select
              value={editStatus}
              onValueChange={(value: string) => setEditStatus(value as FocusStatus)}
              disabled={isUpdating}
            >
              <SelectTrigger id="edit-status" className="rounded-full">
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
            <Label htmlFor="edit-mood">Mood</Label>
            <Input
              id="edit-mood"
              value={editMood}
              onChange={(e) => setEditMood(e.target.value)}
              placeholder="How are you feeling?"
              className="rounded-full"
              disabled={isUpdating}
            />
            {errors.mood && (
              <p className="text-sm text-destructive">{errors.mood}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Any additional thoughts..."
              rows={4}
              maxLength={500}
              className="rounded-2xl"
              disabled={isUpdating}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {errors.notes && (
                  <span className="text-destructive">{errors.notes}</span>
                )}
              </span>
              <span>{editNotes.length}/500</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-image">Attach Image (optional)</Label>
            <R2FileUploader
              ref={editUploaderRef}
              prefix="focus"
              multiple={false}
              autoUpload={false}
              onFilesSelected={handleEditFilesSelected}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditModalOpen(false)}
              disabled={isUpdating}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdate}
              disabled={isUpdating}
              className="rounded-full"
            >
              {isUpdating ? <Loader /> : "Update Focus"}
            </Button>
          </div>
        </div>
      </ReusableModal>

      <ConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Delete Focus Entry"
        description="Are you sure you want to delete this focus entry? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
