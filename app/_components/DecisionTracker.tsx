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
import { AlertCircle, CheckCircle2, Edit2, Pencil, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Decision, DecisionCategory, DecisionStatus } from "@/lib/generated/prisma";
import Loader from "./Loader";
import { CreateDecision, UpdateDecisionImage, UpdateDecision, DeleteDecision } from "@/actions";
import { toast } from "sonner";
import { R2FileUploader, type R2FileUploaderRef } from "@/components/custom/r2-file-uploader";
import { useR2Upload } from "@/hooks/use-r2-upload";
import { ImageLightbox } from "@/components/custom/image-lightbox";
import { getCategoryColor, getCategoryIcon } from "@/lib/status-colors";
import { ReusableModal, ConfirmModal } from "@/components/custom/reusable-modal";
import { DecisionForm } from "./forms/decision-form";
import { FloatingActionButton } from "./floating-action-button";
import { EditDecisionForm } from "./forms/edit-decision-form";

export type DecisionEntry = {
  id: string;
  title: string;
  reason: string;
  status: DecisionStatus;
  category: DecisionCategory;
  date: string;
  image?: string;
};

export default function DecisionsTrackerPage({
  decisions,
}: {
  decisions: Decision[] | undefined;
}) {

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)

  const openLightbox = (imageUrl: string) => {
    setLightboxImages([imageUrl]);
    setLightboxIndex(0);
    setLightboxOpen(true);
  };

  const openEditModal = (decision: Decision) => {
    setSelectedDecision(decision);
    setEditModalOpen(true);
  };

  const openDeleteModal = (decision: Decision) => {
    setSelectedDecision(decision);
    setDeleteModalOpen(true);
  };


  const handleToggleStatus = async (id: string) => {
    try {
      // Find the decision to update
      const decisionToUpdate = decisions?.find(d => d.id === id);
      if (!decisionToUpdate) return;

      const newStatus:DecisionStatus = decisionToUpdate.status === 'ACHIEVED' ? 'PENDING' : 'ACHIEVED';
      
      // Update the selectedDecision if it's the one being toggled
      if (selectedDecision?.id === id) {
        setSelectedDecision(prev => prev ? { ...prev, status: newStatus } : null);
      }

      // Prepare the update data
      const updateData = {
        id: decisionToUpdate.id,
        title: decisionToUpdate.title,
        reason: decisionToUpdate.reason,
        status: newStatus,
        category: decisionToUpdate.category,
        date: decisionToUpdate.date.toString(),
        image: decisionToUpdate.image || undefined,
      };

      // Update on the server
      const res = await UpdateDecision(id, updateData);
      
      if (res?.error) {
        // Revert the optimistic update if there's an error
        toast.error(res.error);
        // You might want to trigger a refetch of the data here
      }
    } catch (error) {
      console.error("Error toggling decision status:", error);
      toast.error("Failed to update decision status. Please try again.");
    }
  }

  const handleDelete = async () => {
    if (!selectedDecision) return;

    try {
      setIsDeleting(true);

      const res = await DeleteDecision(selectedDecision.id);

      if (res?.error) {
        toast.error(res.error);
        setIsDeleting(false);
        return;
      }

      toast.success("Decision deleted successfully!");
      setDeleteModalOpen(false);
      setSelectedDecision(null);
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Error deleting decision:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="max-w-8xl px-4 pb-4 sm:px-6 lg:px-12 md:p-6">
        <div className="mb-6 md:mb-12 ">
          <h1 className="font-serif text-3xl md:text-5xl font-normal leading-tight text-balance text-foreground sm:text-6xl">
            Decisions
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground leading-relaxed">
            Document, deliberate, decide clearly
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10">
          {/* Decision List */}
          <div className="space-y-4">
            <div className="bg-card rounded-lg p-6 border border-border">
              <h4 className="font-serif font-bold text-foreground mb-4">Active Decisions ({decisions?.length})</h4>

              <div className="space-y-3 grid grid-cols-1 lg:grid-cols-4 gap-10">
                {decisions?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No decisions yet. Click the + button to create one.</p>
                ) : (
                  decisions?.map((d) => {
                    return (
                      <div
                        key={d.id}
                        onClick={() => setSelectedEntryId(d.id)}
                        className="flex flex-col gap-2 p-3 rounded-lg hover:bg-muted transition-smooth group border border-border/50 hover:border-primary/10"
                      >
                        {d?.image && (
                          <img
                            src={d.image || "/placeholder.svg"}
                            alt={d.title}
                            className="w-full h-20 object-cover rounded-md cursor-pointer"
                            onClick={() => openLightbox(d.image || "")}
                          />
                        )}
                        <div className="flex items-start gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleStatus(d.id)
                            }}
                            className="mt-1 cursor-pointer"
                          >
                            <CheckCircle2
                              className={`w-5 h-5 transition-smooth ${d.status === "ACHIEVED" ? "text-chart-2" : "text-border"}`}
                            />
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium break-words ${d.status === "ACHIEVED" ? "line-through text-muted-foreground" : "text-foreground"}`}
                            >
                              {d.title}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(d.category)}`}
                              >
                                {d.category}
                              </span>
                              <p className="text-xs text-muted-foreground">{d.createdAt.toLocaleDateString()}</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditModal(d)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-smooth p-1 hover:bg-green-500/20 rounded cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4 text-green-500" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              openDeleteModal(d)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-smooth p-1 hover:bg-destructive/20 rounded"
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
          alt="Decision reference"
        />

        <ReusableModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          title="Edit Decision"
          description="Update your decision details"
          className="sm:max-w-[500px]"
        >
          <EditDecisionForm decision={selectedDecision!} onSuccess={()=>setEditModalOpen(false)} onCancel={()=>setEditModalOpen(false)} />
        </ReusableModal>

        <ReusableModal
          open={addModalOpen}
          onOpenChange={setAddModalOpen}
          title="New Decision"
          description="Add your decision details"
          className="sm:max-w-[500px]"
        >
          <DecisionForm closeModal={()=>setAddModalOpen(false)} onSubmitSuccess={()=>setAddModalOpen(false)} />
        </ReusableModal>

        <ConfirmModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          title="Delete Decision"
          description="Are you sure you want to delete this decision? This action cannot be undone."
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
