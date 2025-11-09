"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface FloatingActionButtonProps {
  onClick: () => void
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <Button
    variant={"heroDark"}
      onClick={onClick}
      className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-110 transition-smooth flex items-center justify-center z-40 group cursor-pointer"
    >
      <Plus className="w-20 h-20 group-hover:rotate-90 transition-smooth duration-300 ease-in-out" />
    </Button>
  )
}
