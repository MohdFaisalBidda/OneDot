// components/custom/controlled-hover-popover.tsx
"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HoverPopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HoverPopover({
  trigger,
  content,
  open,
  onOpenChange,
}: HoverPopoverProps) {
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onOpenChange(true);
  };

  const handleClose = () => {
    timeoutRef.current = setTimeout(() => {
      onOpenChange(false);
    }, 200);
  };

  const handleContentMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleContentMouseLeave = (e: React.MouseEvent) => {
    const relatedTarget = e.relatedTarget as Node;
    if (popoverRef.current && !popoverRef.current.contains(relatedTarget)) {
      handleClose();
    }
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
          className="inline-flex"
        >
          {trigger}
        </div>
      </PopoverTrigger>
      <PopoverContent
        ref={popoverRef}
        side="bottom"
        align="end"
        className="w-56 rounded-xl mt-2"
        sideOffset={5}
        onMouseEnter={handleContentMouseEnter}
        onMouseLeave={handleContentMouseLeave}
      >
        {content}
      </PopoverContent>
    </Popover>
  );
}