"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Focus, FocusStatus } from "@/lib/generated/prisma";
import { DailyFocusForm } from "./forms/daily-focus-form";
import { ImageLightbox } from "@/components/custom/image-lightbox";
import { getStatusBadgeStyle, getStatusText } from "@/lib/status-colors";

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

  const openLightbox = (imageUrl: string) => {
    setLightboxImages([imageUrl]);
    setLightboxIndex(0);
    setLightboxOpen(true);
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
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-medium leading-relaxed">
                        {entry.title}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadgeStyle(entry.status)}`}
                      >
                        {getStatusText(entry.status)}
                      </span>
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
    </div>
  );
}
