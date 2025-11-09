"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { generateAIReflection } from "@/actions/ai-reflections";
import { toast } from "sonner";

type ReflectionType = 'daily' | 'weekly' | 'decision';

const REFLECTION_PROMPTS = {
  daily: "What was your biggest win today?",
  weekly: "What were your key achievements this week?",
  decision: "Looking back, was this decision effective?"
};

export function ReflectionWizard() {
  const [type, setType] = useState<ReflectionType>('daily');
  const [prompt, setPrompt] = useState(REFLECTION_PROMPTS.daily);
  const [isLoading, setIsLoading] = useState(false);
  const [reflection, setReflection] = useState<string | null>(null);

  const handleTypeChange = (newType: ReflectionType) => {
    setType(newType);
    setPrompt(REFLECTION_PROMPTS[newType]);
    setReflection(null);
  };

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      const result = await generateAIReflection(type, prompt);
      
      if (result.success && result.reflection) {
        setReflection(result.reflection.content);
      } else {
        toast.error("Failed to generate reflection");
      }
    } catch (error) {
      console.error('Error generating reflection:', error);
      toast.error("An error occurred while generating your reflection");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-border">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">AI Reflection</CardTitle>
        <CardDescription>
          Take a moment to reflect on your journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Reflection Type</Label>
          <div className="flex gap-2 flex-wrap">
            {(['daily', 'weekly', 'decision'] as const).map((t) => (
              <Button
                key={t}
                variant={type === t ? "default" : "outline"}
                onClick={() => handleTypeChange(t)}
                className="capitalize"
              >
                {t}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Your Reflection Prompt</Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
            placeholder="What's on your mind?"
          />
        </div>

        {reflection && (
          <div className="space-y-2">
            <Label>Your Reflection</Label>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="whitespace-pre-line">{reflection}</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Reflection
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}