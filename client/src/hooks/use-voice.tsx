import { useState, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface VoiceLogResponse {
  success: boolean;
  activities: Array<{
    pillar: string;
    type: string;
    details: any;
    duration?: number;
  }>;
  message: string;
}

export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const voiceLogMutation = useMutation({
    mutationFn: async (voiceText: string): Promise<VoiceLogResponse> => {
      const response = await apiRequest("POST", "/api/voice/log", {
        userId: 1, // For demo purposes
        voiceText
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Voice Log Successful",
          description: data.message,
        });
        // Invalidate dashboard data to refresh
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/1"] });
      } else {
        toast({
          title: "Voice Log Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: () => {
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
