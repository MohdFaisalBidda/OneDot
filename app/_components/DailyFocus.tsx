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

type FocusEntry = {
  id: string
  focus: string
  achieved: string
  mood: string
  notes: string
  date: string
  image?: string
}

export default function DailyFocusPage() {
  const [entries, setEntries] = useState<FocusEntry[]>([
    {
      id: "1",
      focus: "Complete project proposal",
      achieved: "yes",
      mood: "Productive",
      notes: "Great progress today",
      date: "2025-02-09",
    },
    {
      id: "2",
      focus: "Review team feedback",
      achieved: "partial",
      mood: "Focused",
      notes: "Need more time for thorough review",
      date: "2025-02-08",
    },
  ])

  const [focus, setFocus] = useState("")
  const [achieved, setAchieved] = useState("")
  const [mood, setMood] = useState("")
  const [notes, setNotes] = useState("")
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
    if (!focus) return

    const newEntry: FocusEntry = {
      id: Date.now().toString(),
      focus,
      achieved: achieved || "pending",
      mood,
      notes,
      date: new Date().toISOString().split("T")[0],
      image: image || undefined,
    }

    setEntries([newEntry, ...entries])
    setFocus("")
    setAchieved("")
    setMood("")
    setNotes("")
    setImage("")
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
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
            <CardTitle className="font-serif text-2xl font-normal">Today's Focus</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="focus">What's your focus today?</Label>
                <Input
                  id="focus"
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="Enter your main focus..."
                  className="rounded-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="achieved">Status</Label>
                <Select value={achieved} onValueChange={setAchieved}>
                  <SelectTrigger id="achieved" className="rounded-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="yes">Achieved</SelectItem>
                    <SelectItem value="partial">Partially Achieved</SelectItem>
                    <SelectItem value="no">Not Achieved</SelectItem>
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional thoughts..."
                  rows={4}
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Attach Image (optional)</Label>
                {!image ? (
                  <div className="flex items-center gap-2">
                    <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("image")?.click()}
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
                Add Focus
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="font-serif text-2xl font-normal">Recent Entries</h2>
          <div className="space-y-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="shadow-sm">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-medium leading-relaxed">{entry.focus}</h3>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                          entry.achieved === "yes"
                            ? "bg-primary text-primary-foreground"
                            : entry.achieved === "partial"
                              ? "bg-muted text-foreground"
                              : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {entry.achieved === "yes"
                          ? "Achieved"
                          : entry.achieved === "partial"
                            ? "Partial"
                            : entry.achieved === "no"
                              ? "Not Achieved"
                              : "Pending"}
                      </span>
                    </div>
                    {entry.mood && <p className="text-sm text-muted-foreground">Mood: {entry.mood}</p>}
                    {entry.notes && <p className="text-sm leading-relaxed text-muted-foreground">{entry.notes}</p>}
                    {entry.image && (
                      <div className="pt-2">
                        <img
                          src={entry.image || "/placeholder.svg"}
                          alt="Entry"
                          className="h-20 w-20 rounded-xl object-cover shadow-sm"
                        />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">{entry.date}</p>
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
