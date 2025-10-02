"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageIcon, X } from "lucide-react"

type Decision = {
  id: string
  title: string
  reason: string
  category: string
  date: string
  image?: string
}

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([
    {
      id: "1",
      title: "Switched to morning workouts",
      reason: "Better energy throughout the day",
      category: "Health",
      date: "2025-02-09",
    },
    {
      id: "2",
      title: "Started learning TypeScript",
      reason: "Career advancement and better code quality",
      category: "Career",
      date: "2025-02-07",
    },
    {
      id: "3",
      title: "Reduced social media time",
      reason: "More time for meaningful activities",
      category: "Lifestyle",
      date: "2025-02-05",
    },
  ])

  const [title, setTitle] = useState("")
  const [reason, setReason] = useState("")
  const [category, setCategory] = useState("")
  const [image, setImage] = useState<string>("")

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImage("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !reason) return

    const newDecision: Decision = {
      id: Date.now().toString(),
      title,
      reason,
      category: category || "General",
      date: new Date().toISOString().split("T")[0],
      image: image || undefined,
    }

    setDecisions([newDecision, ...decisions])
    setTitle("")
    setReason("")
    setCategory("")
    setImage("")
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
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
            <CardTitle className="font-serif text-2xl font-normal">New Decision</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Decision Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What did you decide?"
                  className="rounded-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why did you make this decision?"
                  rows={4}
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category" className="rounded-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Career">Career</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Relationships">Relationships</SelectItem>
                    <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="decision-image">Reference Image (optional)</Label>
                {!image ? (
                  <div className="flex items-center gap-2">
                    <Input
                      id="decision-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("decision-image")?.click()}
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
                      className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full rounded-full" size="lg">
                Add Decision
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="font-serif text-2xl font-normal">Decision Timeline</h2>
          <div className="space-y-4">
            {decisions.map((decision, index) => (
              <Card key={decision.id} className="shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                        {index + 1}
                      </div>
                      {index < decisions.length - 1 && <div className="mt-2 h-full w-px bg-border" />}
                    </div>
                    <div className="flex-1 space-y-2 pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-medium leading-relaxed">{decision.title}</h3>
                        <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                          {decision.category}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">{decision.reason}</p>
                      {decision.image && (
                        <div className="pt-2">
                          <img
                            src={decision.image || "/placeholder.svg"}
                            alt="Decision reference"
                            className="h-20 w-20 rounded-xl object-cover shadow-sm"
                          />
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">{decision.date}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
