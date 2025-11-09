"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Focus, FocusStatus } from "@/lib/generated/prisma";
import { DailyFocusForm } from "./forms/daily-focus-form";
import { ImageLightbox } from "@/components/custom/image-lightbox";
import { getMoodColor, getStatusBadgeStyle, getStatusText } from "@/lib/status-colors";
import { ReusableModal, ConfirmModal } from "@/components/custom/reusable-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit2, Trash2, Zap, CheckCircle2 } from "lucide-react";
import { UpdateFocus, DeleteFocus } from "@/actions";
import { toast } from "sonner";
import { FloatingActionButton } from "./floating-action-button";
import { EditFocusForm } from "./forms/edit-focus-form";

export type FocusEntry = {
  id: string;
  title: string;
  status: FocusStatus;
  mood: string;
  notes: string;
  date: string;
  image?: string | null;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

interface DailyFocusPageProps {
  recentFocus: Focus[] | undefined;
  onUpdate?: () => void;
}

export default function DailyFocusPage({
  recentFocus,
  onUpdate,
}: DailyFocusPageProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFocus, setSelectedFocus] = useState<Focus | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)

  const openLightbox = (imageUrl: string) => {
    setLightboxImages([imageUrl]);
    setLightboxIndex(0);
    setLightboxOpen(true);
  };

  const openEditModal = (focus: Focus) => {
    setSelectedFocus(focus);
    setEditModalOpen(true);
  };

  const openDeleteModal = (focus: Focus) => {
    setSelectedFocus(focus);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
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
        title: item.title,
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
          <EditFocusForm 
            focus={selectedFocus!} 
            onSuccess={() => {
              setEditModalOpen(false);
              // Refresh the data or update the UI as needed
              if (onUpdate) {
                onUpdate();
              }
            }} 
            onCancel={() => setEditModalOpen(false)} 
          />
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
          description="Are you sure you want to delete this focus entry? This action cannot be undone. This will permanently delete the focus entry and all associated data."
          onConfirm={handleDeleteConfirm}
          confirmText="Delete"
          variant="destructive"
          isLoading={isDeleting}
        />
      </div>
      <FloatingActionButton onClick={() => setAddModalOpen(true)} />
    </>
  );
}
