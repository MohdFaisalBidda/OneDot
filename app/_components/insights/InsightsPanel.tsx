"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPatternsInsights } from "@/actions/ai-reflections";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type Insight = {
  insight: string;
  suggestion: string;
};

export function InsightsPanel() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const result = await getPatternsInsights();
        if (result.success && result.insights) {
          setInsights(result.insights);
        }
      } catch (error) {
        console.error('Error fetching insights:', error);
        toast.error("Failed to load insights");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Smart Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Smart Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
            <p>Not enough data to generate insights yet.</p>
            <p className="text-sm">Keep using the app to see personalized patterns.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Smart Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {insights.map((insight, index) => (
          <div key={index} className="space-y-2">
            <h4 className="font-medium text-foreground">{insight.insight}</h4>
            <p className="text-sm text-muted-foreground">{insight.suggestion}</p>
            {index < insights.length - 1 && <div className="h-px bg-border" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}