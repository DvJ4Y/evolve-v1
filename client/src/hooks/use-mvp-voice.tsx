import { useState, useCallback, useRef } from "react";
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
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const voiceLogMutation = useMutation({
    mutationFn: async (voiceText: string): Promise<MVPVoiceLogResponse> => {
      // Get user from localStorage for MVP
      const savedUser = localStorage.getItem('evolve_user');
      if (!savedUser) {
        throw new Error("User not found");
      }
      const user = JSON.parse(savedUser);

      const response = await apiRequest("POST", "/api/mvp/voice/log", {
        userId: user.id,
        voiceText
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Activity Logged! 🎉",
          description: data.message,
        });
        
        // Get user from localStorage to invalidate correct queries
        const savedUser = localStorage.getItem('evolve_user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          queryClient.invalidateQueries({ queryKey: [`/api/mvp/dashboard/${user.id}`] });
          queryClient.invalidateQueries({ queryKey: [`/api/mvp/activities/${user.id}`] });
        }
      } else {
        toast({
          title: "Logging Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Voice Processing Error",
        description: "Failed to process your voice input. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setTranscript(finalTranscript);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (transcript.trim()) {
        voiceLogMutation.mutate(transcript);
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      toast({
        title: "Speech Recognition Error",
        description: "Error occurred in recognition: " + event.error,
        variant: "destructive",
      });
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [transcript, voiceLogMutation, toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isProcessing: voiceLogMutation.isPending,
  };
}