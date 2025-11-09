"use client"

import { useState } from "react"
import { X, Save, Trash2 } from "lucide-react"
import { useData } from "@/contexts/data-context"
import { Decision, Focus } from "@/lib/generated/prisma"

interface EntryDetailModalProps {
    type: "focus" | "decision" | "doc",
    entryId: string
    onClose: () => void
    onDelete?: (id: string) => void
    getEntry: (id: string) => Focus | Decision | undefined
    updateEntry: (id: string, updates: Partial<Focus | Decision>) => void
    deleteEntry: (id: string) => void
}

export function EntryDetailModal({ type, entryId, onClose, onDelete, getEntry, updateEntry, deleteEntry }: EntryDetailModalProps) {
    const entry = getEntry(entryId)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState<Focus | Decision | undefined>(entry)

    if (!entry) return null

    const handleSave = () => {
        if (formData) {
            updateEntry(entryId, formData)
            setIsEditing(false)
        }
    }

    const handleDelete = () => {
        deleteEntry(entryId)
        onDelete?.(entryId)
        onClose()
    }

    const getMoodColor = (mood: string) => {
        const moodMap: Record<string, string> = {
            energized: "bg-chart-1/20 text-chart-1",
            focused: "bg-chart-2/20 text-chart-2",
            calm: "bg-chart-3/20 text-chart-3",
            stressed: "bg-destructive/20 text-destructive",
            neutral: "bg-muted text-muted-foreground",
        }
        return moodMap[mood] || moodMap.neutral
    }

    const getCategoryColor = (category: string) => {
        const categoryMap: Record<string, string> = {
            CAREER: "bg-chart-1/20 text-chart-1",
            HEALTH: "bg-chart-2/20 text-chart-2",
            FINANCE: "bg-chart-3/20 text-chart-3",
            RELATIONSHIPS: "bg-chart-4/20 text-chart-4",
            LIFESTYLE: "bg-purple-500/20 text-purple-500",
            GENERAL: "bg-muted text-muted-foreground",
            OTHER: "bg-muted text-muted-foreground",
        }
        return categoryMap[category] || categoryMap.GENERAL
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-card rounded-lg border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
                    <h2 className="text-2xl font-serif font-bold text-foreground">
                        {type === "focus" ? "Focus Entry" : type === "decision" ? "Decision" : "Document"}
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-muted rounded">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Image */}
                    {entry.image && (
                        <div className="rounded-lg overflow-hidden">
                            <img src={entry.image || "/placeholder.svg"} alt={entry.title} className="w-full h-48 object-cover" />
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Title</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData?.title || ""}
                                onChange={(e) => setFormData(formData ? { ...formData, title: e.target.value } : entry)}
                                className="w-full mt-2 px-3 py-2 rounded-lg bg-muted border border-border text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        ) : (
                            <p className="mt-2 text-lg font-medium text-foreground">{entry.title}</p>
                        )}
                    </div>

                    {type === "focus" && (
                        <>
                            {/* Mood */}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Mood</label>
                                {isEditing ? (
                                    <select
                                        value={(formData as any)?.mood || "neutral"}
                                        onChange={(e) => setFormData(formData ? { ...formData, mood: e.target.value } : entry)}
                                        className="w-full mt-2 px-3 py-2 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="energized">Energized</option>
                                        <option value="focused">Focused</option>
                                        <option value="calm">Calm</option>
                                        <option value="stressed">Stressed</option>
                                        <option value="neutral">Neutral</option>
                                    </select>
                                ) : (
                                    <span
                                        className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium ${getMoodColor((entry as any).mood)}`}
                                    >
                                        {(entry as any).mood}
                                    </span>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Status</label>
                                {isEditing ? (
                                    <select
                                        value={(formData as any)?.status || "PENDING"}
                                        onChange={(e) => setFormData(formData ? { ...formData, status: e.target.value } : entry)}
                                        className="w-full mt-2 px-3 py-2 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="ACHIEVED">Achieved</option>
                                        <option value="NOT_ACHIEVED">Not Achieved</option>
                                        <option value="PARTIALLY_ACHIEVED">Partially Achieved</option>
                                    </select>
                                ) : (
                                    <p className="mt-2 text-foreground">{(entry as any).status}</p>
                                )}
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Notes</label>
                                {isEditing ? (
                                    <textarea
                                        value={(formData as any)?.notes || ""}
                                        onChange={(e) => setFormData(formData ? { ...formData, notes: e.target.value } : entry)}
                                        className="w-full mt-2 px-3 py-2 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
                                    />
                                ) : (
                                    <p className="mt-2 text-foreground whitespace-pre-wrap">{(entry as any).notes || "—"}</p>
                                )}
                            </div>
                        </>
                    )}

                    {type === "decision" && (
                        <>
                            {/* Category */}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Category</label>
                                {isEditing ? (
                                    <select
                                        value={(formData as any)?.category || "GENERAL"}
                                        onChange={(e) => setFormData(formData ? { ...formData, category: e.target.value } : entry)}
                                        className="w-full mt-2 px-3 py-2 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="CAREER">Career</option>
                                        <option value="HEALTH">Health</option>
                                        <option value="FINANCE">Finance</option>
                                        <option value="RELATIONSHIPS">Relationships</option>
                                        <option value="LIFESTYLE">Lifestyle</option>
                                        <option value="GENERAL">General</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                ) : (
                                    <span
                                        className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium ${getCategoryColor((entry as any).category)}`}
                                    >
                                        {(entry as any).category}
                                    </span>
                                )}
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Reason</label>
                                {isEditing ? (
                                    <textarea
                                        value={(formData as any)?.reason || ""}
                                        onChange={(e) => setFormData(formData ? { ...formData, reason: e.target.value } : entry)}
                                        className="w-full mt-2 px-3 py-2 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
                                    />
                                ) : (
                                    <p className="mt-2 text-foreground whitespace-pre-wrap">{(entry as any).reason || "—"}</p>
                                )}
                            </div>
                        </>
                    )}

                    {type === "doc" && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Content</label>
                            {isEditing ? (
                                <textarea
                                    value={(formData as any)?.content || ""}
                                    onChange={(e) => setFormData(formData ? { ...formData, content: e.target.value } : entry)}
                                    className="w-full mt-2 px-3 py-2 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-48 resize-none"
                                />
                            ) : (
                                <p className="mt-2 text-foreground whitespace-pre-wrap">{(entry as any).content || "—"}</p>
                            )}
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border text-sm">
                        <div>
                            <p className="text-xs text-muted-foreground">Created</p>
                            <p className="text-foreground font-medium">{new Date(entry.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Updated</p>
                            <p className="text-foreground font-medium">{new Date(entry.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-3 p-6 border-t border-border sticky bottom-0 bg-card">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => {
                                    setFormData(entry)
                                    setIsEditing(false)
                                }}
                                className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-smooth"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-smooth flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-smooth"
                            >
                                Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-smooth flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
