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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Decision, DecisionCategory } from "@/lib/generated/prisma";
import Loader from "./Loader";
import { CreateDecision } from "@/actions";
import { toast } from "sonner";

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
  const [image, setImage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
      const newDecision: DecisionEntry = {
        id: Date.now().toString(),
        title,
        reason,
        category: category,
        date: new Date().toISOString().split("T")[0],
        image: image || undefined,
      };

      const res = await CreateDecision(newDecision);

      if (res?.error) {
        if (res.fieldErrors) {
          setErrors(res.fieldErrors);
        } else {
          setFormError(res.error);
        }
        return;
      }

      toast.success("Decision has been added!");

      setTitle("");
      setReason("");
      setCategory("CAREER");
      setImage("");
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
    <div className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8 p-6">
      <div className="mb-12 text-center">
        <h1 className="font-serif text-5xl font-normal leading-tight text-balance text-foreground sm:text-6xl">
          Decision Tracker
        </h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
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
                <Label htmlFor="title">Decision Title</Label>
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
                <Label htmlFor="reason">Reason</Label>
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
                <Label htmlFor="category">Category</Label>
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
                {!image ? (
                  <div className="flex items-center gap-2">
                    <Input
                      id="decision-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSubmitting}
                      onClick={() =>
                        document.getElementById("decision-image")?.click()
                      }
                      className="rounded-full"
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
                      disabled={isSubmitting}
                      className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
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
                        <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                          {decision.category}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {decision.reason}
                      </p>
                      {decision.image && (
                        <div className="pt-2">
                          <img
                            src={decision.image || "/placeholder.svg"}
                            alt="Decision reference"
                            className="h-20 w-20 rounded-xl object-cover shadow-sm"
                          />
                        </div>
                      )}
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
    </div>
  );
}
