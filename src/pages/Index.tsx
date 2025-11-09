import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Copy } from "lucide-react";

// OpenRouter API key
const OPENROUTER_API_KEY = "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";

const Index = () => {
  const [originalText, setOriginalText] = useState("");
  const [textToRemove, setTextToRemove] = useState("");
  const [updatedText, setUpdatedText] = useState("");
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Sync aiInput with updatedText
  useEffect(() => {
    setAiInput(updatedText);
  }, [updatedText]);

  const handleRemoveText = () => {
    if (!originalText) {
      toast.error("Please enter some text first");
      return;
    }
    if (!textToRemove) {
      toast.error("Please enter text to remove");
      return;
    }

    const regex = new RegExp(textToRemove.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const result = originalText.replace(regex, '');
    setUpdatedText(result);
    toast.success("Text removed successfully");
  };

  const handleCopyText = () => {
    if (!updatedText) {
      toast.error("No text to copy");
      return;
    }
    navigator.clipboard.writeText(updatedText);
    toast.success("Text copied to clipboard");
  };

  const handleAskAI = async () => {
    if (!aiInput) {
      toast.error("Please enter some text for the AI");
      return;
    }

    setIsLoading(true);
    setAiResponse("");

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-4o",
          messages: [
            {
              role: "user",
              content: aiInput,
            },
          ],
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "API request failed");
      }

      const data = await response.json();
      const message = data.choices?.[0]?.message?.content || "No response from AI";
      setAiResponse(message);
      toast.success("AI response received");
    } catch (error) {
      console.error("AI API error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to get AI response");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Text Processor</h1>
          <p className="text-muted-foreground">Remove text and get AI assistance</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel: Text Processor */}
          <Card>
            <CardHeader>
              <CardTitle>Text Processor</CardTitle>
              <CardDescription>Remove specific text from your paragraph</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="original-text">Original Text</Label>
                <Textarea
                  id="original-text"
                  placeholder="Enter your text here..."
                  value={originalText}
                  onChange={(e) => setOriginalText(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="text-to-remove">Text to Remove</Label>
                <Input
                  id="text-to-remove"
                  placeholder="Enter text to remove..."
                  value={textToRemove}
                  onChange={(e) => setTextToRemove(e.target.value)}
                />
              </div>

              <Button onClick={handleRemoveText} className="w-full">
                Remove Text
              </Button>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="updated-text">Updated Text</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyText}
                    disabled={!updatedText}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <Textarea
                  id="updated-text"
                  value={updatedText}
                  readOnly
                  className="min-h-[200px] resize-none bg-muted"
                  placeholder="Processed text will appear here..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Right Panel: AI Assistant */}
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant</CardTitle>
              <CardDescription>Get AI-powered insights on your text</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ai-input">Text to Analyze</Label>
                <Textarea
                  id="ai-input"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  className="min-h-[150px] resize-none"
                  placeholder="Text from the processor will appear here, or type your own..."
                />
              </div>

              <Button 
                onClick={handleAskAI} 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Ask AI"
                )}
              </Button>

              {aiResponse && (
                <div className="space-y-2">
                  <Label>AI Response</Label>
                  <div className="p-4 rounded-lg bg-accent/50 border border-border min-h-[150px] whitespace-pre-wrap">
                    {aiResponse}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
