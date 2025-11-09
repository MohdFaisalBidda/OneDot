"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lightbulb, Sparkles, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";

type Insight = {
  insight: string;
  suggestion: string;
};

type InsightsDialogProps = {
  triggerButton?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
};

export function InsightsDialog({ triggerButton, onOpenChange }: InsightsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const { theme } = useTheme();

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (onOpenChange) onOpenChange(open);
    
    if (open && insights.length === 0) {
      try {
        setIsLoading(true);
        const response = await fetch('/api/insights');
        const data = await response.json();
        if (data.success) {
          setInsights(data.insights || []);
        }
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            View Smart Insights
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className={`h-5 w-5 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
              Smart Insights & AI Reflection
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleOpenChange(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-border bg-card">
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : insights.length > 0 ? (
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <Card key={index} className="border-border bg-card hover:bg-card/80 transition-colors">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-foreground mb-2">{insight.insight}</h4>
                    <p className="text-sm text-muted-foreground">{insight.suggestion}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Lightbulb className="h-10 w-10 mb-3 opacity-50" />
              <p className="font-medium">No insights available yet</p>
              <p className="text-sm">Keep using the app to see personalized patterns and reflections.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}