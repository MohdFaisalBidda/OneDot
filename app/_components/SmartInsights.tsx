"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Brain, TrendingUp, Target, Lightbulb, RefreshCw, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { getAISmartInsights } from "@/actions/ai-reflections";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

type SmartInsight = {
  type: 'trend' | 'pattern' | 'recommendation' | 'achievement' | 'insight';
  message: string;
  details?: string;
};

export default function SmartInsights() {
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsights = async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      
      const result = await getAISmartInsights();
      
      if (result.success && result.data) {
        // Ensure we have valid insights
        const validInsights = result.data.filter(insight => 
          insight && 
          typeof insight.message === 'string' && 
          insight.message.trim().length > 0
        );
        
        if (validInsights.length > 0) {
          setInsights(validInsights);
        } else {
          // Fallback to a default message if no valid insights
          setInsights([{
            type: 'insight',
            message: 'Analyzing your patterns',
            details: 'Keep using the app to see personalized insights based on your activity.'
          }]);
        }
      } else {
        console.error('Failed to fetch insights:', result.error);
        // Show error message to user
        setInsights([{
          type: 'insight',
          message: 'Temporary issue',
          details: 'We had trouble loading your insights. Please try refreshing the page.'
        }]);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
      // Show error message to user
      setInsights([{
        type: 'insight',
        message: 'Something went wrong',
        details: 'We encountered an error while analyzing your data. Our team has been notified.'
      }]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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
      case "insight":
        return <Sparkles className="h-4 w-4 text-purple-600" />;
      default:
        return <Sparkles className="h-4 w-4 text-[#605A57]" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "trend":
        return "bg-blue-50 dark:bg-blue-900/30 text-foreground border-blue-200 dark:border-blue-800";
      case "pattern":
        return "bg-orange-50 dark:bg-orange-900/20 text-foreground border-orange-200 dark:border-orange-800/50";
      case "recommendation":
        return "bg-yellow-50 dark:bg-yellow-900/20 text-foreground border-yellow-200 dark:border-yellow-800/50";
      case "achievement":
        return "bg-green-50 dark:bg-green-900/20 text-foreground border-green-200 dark:border-green-800/50";
      case "insight":
        return "bg-purple-50 dark:bg-purple-900/20 text-foreground border-purple-200 dark:border-purple-800/50";
      default:
        return "bg-muted/50 dark:bg-muted/20 text-foreground border-border";
    }
  };

  const renderInsightsContent = () => (
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
  );

  return (
    <Dialog>
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
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  fetchInsights();
                }}
                disabled={refreshing}
                className="rounded-full"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 text-xs">
                  View All <ArrowRight className="h-3 w-3" />
                </Button>
              </DialogTrigger>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="text-center text-[#605A57] py-8">
              <Brain className="h-12 w-12 mx-auto text-orange-300 mb-2 animate-pulse" />
              <p>Analyzing your patterns...</p>
              <p className="text-sm text-muted-foreground mt-2">This may take a moment</p>
            </div>
          ) : error ? (
            <div className="text-center text-[#605A57] py-8">
              <Brain className="h-12 w-12 mx-auto text-orange-300 mb-2" />
              <p>Error: {error}</p>
              <p className="text-sm text-muted-foreground mt-2">Please try again later.</p>
            </div>
          ) : insights.length > 0 ? (
            <>
              {renderInsightsContent()}
              <div className="pt-2">
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                    <div className="flex items-center justify-center gap-1 cursor-pointer">
                      View all insights <ArrowRight className="h-3 w-3 ml-1" />
                    </div>
                  </Button>
                </DialogTrigger>
              </div>
            </>
          ) : (
            <div className="text-center text-[#605A57] py-8 space-y-2">
              <Brain className="h-12 w-12 mx-auto text-[#E0DEDB]" />
              <p className="text-sm">Not enough data yet.</p>
              <p className="text-xs">Keep logging your focus and decisions to unlock AI insights!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-orange-600" />
            Smart Insights & AI Analysis
          </h2>
        </div>
        
        <ScrollArea className="h-[calc(80vh-180px)] pr-4 -mr-4">
          <div className="space-y-4 pb-4">
            {loading ? (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto text-orange-300 mb-2 animate-pulse" />
                <p className="text-muted-foreground">Analyzing your patterns...</p>
              </div>
            ) : insights.length > 0 ? (
              renderInsightsContent()
            ) : (
              <div className="text-center py-8 space-y-2">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground/30" />
                <p className="text-muted-foreground">No insights available yet</p>
                <p className="text-sm text-muted-foreground/70">Keep using the app to see personalized patterns and reflections.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
