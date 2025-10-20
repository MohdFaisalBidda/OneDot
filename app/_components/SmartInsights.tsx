"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Brain, TrendingUp, Target, Lightbulb, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { getSmartInsights } from "@/actions/insights";
import type { SmartInsight } from "@/actions/insights";

export default function SmartInsights() {
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsights = async () => {
    setRefreshing(true);
    const result = await getSmartInsights();
    if (result.data) {
      setInsights(result.data);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "trend":
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case "pattern":
        return <Brain className="h-4 w-4 text-orange-600" />;
      case "recommendation":
        return <Lightbulb className="h-4 w-4 text-yellow-600" />;
      case "achievement":
        return <Target className="h-4 w-4 text-green-600" />;
      default:
        return <Sparkles className="h-4 w-4 text-[#605A57]" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "trend":
        return "bg-blue-50 text-[#37322F] border-[#E0DEDB]";
      case "pattern":
        return "bg-orange-50 text-[#37322F] border-[#E0DEDB]";
      case "recommendation":
        return "bg-yellow-50 text-[#37322F] border-[#E0DEDB]";
      case "achievement":
        return "bg-green-50 text-[#37322F] border-[#E0DEDB]";
      default:
        return "bg-[#F7F5F3] text-[#37322F] border-[#E0DEDB]";
    }
  };

  return (
    <Card className="border-[#E0DEDB] bg-gradient-to-br from-orange-50/30 to-blue-50/20 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-serif text-xl font-semibold text-[#37322F] flex items-center gap-2">
              <Brain className="h-5 w-5 text-orange-600" />
              Smart Insights
              <Badge className="ml-2 bg-[#37322F] text-[#F7F5F3] text-[10px] px-2 border border-[#E0DEDB]">
                AI POWERED
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm text-[#605A57] mt-1">
              AI-generated patterns and recommendations from your activity
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchInsights}
            disabled={refreshing}
            className="rounded-full"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-center text-[#605A57] py-8">
            <Brain className="h-12 w-12 mx-auto text-orange-300 mb-2 animate-pulse" />
            <p>Analyzing your patterns...</p>
          </div>
        ) : insights.length > 0 ? (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getInsightColor(insight.type)} transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-semibold capitalize">{insight.type}</h4>
                    <p className="text-sm leading-relaxed">{insight.message}</p>
                    {insight.details && (
                      <p className="text-xs opacity-80 mt-1">{insight.details}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-[#605A57] py-8 space-y-2">
            <Brain className="h-12 w-12 mx-auto text-[#E0DEDB]" />
            <p className="text-sm">Not enough data yet.</p>
            <p className="text-xs">Keep logging your focus and decisions to unlock AI insights!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
