"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Focus, FocusStatus } from "@/lib/generated/prisma";
import { DailyFocusForm } from "./forms/daily-focus-form";
import { ImageLightbox } from "@/components/custom/image-lightbox";
import { getMoodColor, getStatusBadgeStyle, getStatusText } from "@/lib/status-colors";
import { ReusableModal, ConfirmModal } from "@/components/custom/reusable-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Edit2, Trash2, Zap } from "lucide-react";
import { UpdateFocus, DeleteFocus } from "@/actions";
import { toast } from "sonner";
import Loader from "./Loader";
import { R2FileUploader, type R2FileUploaderRef } from "@/components/custom/r2-file-uploader";
import { useR2Upload } from "@/hooks/use-r2-upload";
import { FloatingActionButton } from "./floating-action-button";

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
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
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

  const handleToggleComplete = async (item: Focus) => {
    try {
      // Optimistically update the UI
      const updatedFocus = recentFocus?.map(focus => 
        focus.id === item.id 
          ? { ...focus, status: focus.status === "ACHIEVED" ? "PENDING" : "ACHIEVED" as FocusStatus }
          : focus
      );
      
      // Update the local state
      if (updatedFocus) {
        // Since we're using props, we need to find a way to update the parent state
        // For now, we'll just update the selectedFocus if it's the one being toggled
        if (selectedFocus?.id === item.id) {
          setSelectedFocus(prev => prev ? { ...prev, status: prev.status === "ACHIEVED" ? "PENDING" : "ACHIEVED" } : null);
        }
      }

      // Prepare the update data
      const isCompleted = item.status === "ACHIEVED";
      const newStatus = isCompleted ? "PENDING" : "ACHIEVED";
      const updateData: FocusEntry = {
        id: item.id,
        focus: item.title,
        status: newStatus,
        mood: item.mood,
        notes: item.notes || "",
        date: item.date.toString(),
        image: item.image || undefined,
      };

      // Update on the server
      const res = await UpdateFocus(item.id, updateData);
      
      if (res?.error) {
        // Revert the optimistic update if there's an error
        toast.error(res.error);
        // You might want to trigger a refetch of the data here
      }
    } catch (error) {
      console.error("Error toggling focus status:", error);
      toast.error("Failed to update focus status. Please try again.");
      // You might want to trigger a refetch of the data here to sync with server
    }
  }


  return (
    <>
      <div className="max-w-8xl px-4 pb-4 sm:px-6 lg:px-12 md:p-6">
        <div className="mb-6 md:mb-12">
          <h1 className="font-serif text-3xl md:text-5xl font-normal leading-tight text-balance text-foreground sm:text-6xl">
            Daily Focus
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground leading-relaxed">
            What matters most today?
          </p>
        </div>
        <div className="grid grid-cols-1 gap-10">
          {/* Focus Items */}
          <div className="space-y-4">
            <div className="bg-card rounded-lg p-6 border border-border">
              <h4 className="font-serif font-bold text-foreground mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-chart-1" />
                Today's Priorities ({recentFocus?.length})
              </h4>
              <div className="space-y-3 grid grid-cols-1 lg:grid-cols-4 gap-10">
                {recentFocus?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No focus items yet. Click the + button to create one.</p>
                ) : (
                  recentFocus?.map((item) => {
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedEntryId(item.id)}
                        className="flex flex-col gap-2 p-3 rounded-lg hover:bg-muted transition-smooth group border border-border/50 hover:border-primary/10"
                      >
                        {item?.image && (
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.title}
                            className="w-full h-20 object-cover rounded-md cursor-pointer"
                            onClick={() => openLightbox(item.image || "")}
                          />
                        )}
                        <div className="flex items-start gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleComplete(item)
                            }}
                            className="mt-1 cursor-pointer"
                          >
                            <CheckCircle2
                              className={`w-5 h-5 transition-smooth ${item.status === "ACHIEVED" ? "text-chart-2" : "text-border"}`}
                            />
                          </button>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium break-words ${item.status === "ACHIEVED" ? "line-through text-muted-foreground" : "text-foreground"}`}
                            >
                              {item.title}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getMoodColor(item.mood)}`}>
                                {item.mood}
                              </span>
                              <p className="text-xs text-muted-foreground">{item.createdAt.toLocaleDateString()}</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditModal(item)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-smooth p-1 hover:bg-green-500/20 rounded cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4 text-green-500" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openDeleteModal(item)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-smooth p-1 hover:bg-destructive/20 rounded cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
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

        <ReusableModal
          open={addModalOpen}
          onOpenChange={setAddModalOpen}
          title="Add Focus Entry"
          description="Add your focus details"
          className="sm:max-w-[500px]"
        >
          <DailyFocusForm closeModal={() => setAddModalOpen(false)}/>
        </ReusableModal>

        <ConfirmModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          title="Delete Focus Entry"
          description="Are you sure you want to delete this focus? This action cannot be undone."
          onConfirm={handleDelete}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
          isLoading={isDeleting}
        />
      </div>
      <FloatingActionButton onClick={() => setAddModalOpen(true)} />
    </>
  );
}
