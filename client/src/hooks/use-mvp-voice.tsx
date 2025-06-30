import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type MVPIntentType } from "@shared/schema";

interface MVPVoiceLogResponse {
  success: boolean;
  intent: MVPIntentType;
  keywords: string[];
  message: string;
  confidence: number;
}

export function useMVPVoice() {
  const [textInput, setTextInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const voiceLogMutation = useMutation({
    mutationFn: async (inputText: string): Promise<MVPVoiceLogResponse> => {
      // Get user from localStorage for MVP
      const savedUser = localStorage.getItem('evolve_user');
      if (!savedUser) {
        throw new Error("User not found - please sign in again");
      }
      
      const user = JSON.parse(savedUser);
      if (!user.id) {
        throw new Error("Invalid user data - please sign in again");
      }

      const response = await apiRequest("POST", "/api/mvp/voice/log", {
        userId: user.id,
        voiceText: inputText.trim()
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorData}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        const confidenceEmoji = data.confidence > 0.8 ? "🎯" : data.confidence > 0.6 ? "✅" : "👍";
        toast({
          title: `Activity Logged! ${confidenceEmoji}`,
          description: data.message,
        });
        
        // Invalidate queries to refresh data
        const savedUser = localStorage.getItem('evolve_user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          queryClient.invalidateQueries({ queryKey: [`/api/mvp/dashboard/${user.id}`] });
          queryClient.invalidateQueries({ queryKey: [`/api/mvp/activities/${user.id}`] });
        }
      } else {
        toast({
          title: "Logging Failed",
          description: data.message || "Could not log your activity",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error("Text processing error:", error);
      
      let errorMessage = "Failed to process your input. Please try again.";
      if (error.message.includes("User not found")) {
        errorMessage = "Please sign in again to log activities.";
      } else if (error.message.includes("Server error")) {
        errorMessage = "Server is temporarily unavailable. Please try again.";
      }
      
      toast({
        title: "Processing Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleTextSubmit = useCallback(async (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      toast({
        title: "Empty Input",
        description: "Please enter some text about your activity.",
        variant: "destructive",
      });
      return;
    }

    if (trimmedText.length > 500) {
      toast({
        title: "Input Too Long",
        description: "Please keep your activity description under 500 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      console.log("📝 Processing text input:", trimmedText);
      await voiceLogMutation.mutateAsync(trimmedText);
      setTextInput("");
    } catch (error) {
      // Error handling is done in mutation onError
    } finally {
      setIsProcessing(false);
    }
  }, [voiceLogMutation, toast]);

  return {
    textInput,
    setTextInput,
    handleTextSubmit,
    isProcessing: isProcessing || voiceLogMutation.isPending,
    // Legacy compatibility - these are no longer used but kept for existing components
    isListening: false,
    transcript: "",
    showTextInput: true,
    startListening: () => {},
    stopListening: () => {},
    toggleTextInput: () => {},
    speechSupported: false,
  };
}