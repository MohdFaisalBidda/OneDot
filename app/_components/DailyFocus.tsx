"use client";

import type React from "react";

import { useState } from "react";
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
import { AlertCircle, ImageIcon, X } from "lucide-react";
import { CreateFocus } from "@/actions";
import { Focus, FocusStatus } from "@/lib/generated/prisma";
import Loader from "./Loader";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DailyFocusForm } from "./forms/daily-focus-form";

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
  const [focus, setFocus] = useState("");
  const [status, setStatus] = useState<FocusStatus>("PENDING");
  const [mood, setMood] = useState("");
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState<string>("");
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
      const newEntry: FocusEntry = {
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
    <div className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8 p-6">
      <div className="mb-12 text-center">
        <h1 className="font-serif text-5xl font-normal leading-tight text-balance text-foreground sm:text-6xl">
          Daily Focus Journal
        </h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
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
            {/* <form onSubmit={handleSubmit} className="space-y-6">
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
                  onValueChange={(value: string) =>
                    setStatus(value as FocusStatus)
                  }
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
                {!image ? (
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
                )}
              </div>

              <Button
                disabled={isSubmitting}
                type="submit"
                className="w-full rounded-full"
                size="lg"
              >
                {isSubmitting ? <Loader /> : "Add Focus"}
              </Button>
            </form> */}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="font-serif text-2xl font-normal">Recent Entries</h2>
          <div className="space-y-4">
            {recentFocus?.map((entry) => (
              <Card key={entry.id} className="shadow-sm">
                <CardContent className="">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-medium leading-relaxed">
                        {entry.title}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                          entry.status === "ACHIEVED"
                            ? "bg-primary text-primary-foreground"
                            : entry.status === "PARTIALLY_ACHIEVED"
                            ? "bg-muted text-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {entry.status === "ACHIEVED"
                          ? "Achieved"
                          : entry.status === "PARTIALLY_ACHIEVED"
                          ? "Partial Achieved"
                          : entry.status === "NOT_ACHIEVED"
                          ? "Not Achieved"
                          : "Pending"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col space-y-1">
                        {entry.mood && (
                          <p className="text-sm text-muted-foreground">
                            Mood: {entry.mood}
                          </p>
                        )}
                        {entry.notes && (
                          <p className="text-sm leading-relaxed text-muted-foreground">
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
                            className="h-20 w-20 rounded-xl object-cover shadow-sm hover:scale-200 transition-all ease-in-out duration-500"
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
    </div>
  );
}
