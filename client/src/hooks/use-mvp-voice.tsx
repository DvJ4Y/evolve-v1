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

// Check if speech recognition is supported
const checkSpeechSupport = (): boolean => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

export function useMVPVoice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const voiceLogMutation = useMutation({
    mutationFn: async (inputText: string): Promise<MVPVoiceLogResponse> => {
      // Get user from localStorage for MVP
      const savedUser = localStorage.getItem('evolve_user');
      if (!savedUser) {
        throw new Error("User not found");
      }
      const user = JSON.parse(savedUser);

      const response = await apiRequest("POST", "/api/mvp/voice/log", {
        userId: user.id,
        voiceText: inputText
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
      console.error("Voice processing error:", error);
      toast({
        title: "Voice Processing Error",
        description: "Failed to process your input. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startListening = useCallback(() => {
    // Check if speech recognition is supported
    if (!checkSpeechSupport()) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. You can type instead.",
        variant: "destructive",
      });
      setShowTextInput(true);
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
      setShowTextInput(false);
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
      let errorMessage = "Speech recognition error occurred.";
      
      switch(event.error) {
        case 'no-speech':
          errorMessage = "No speech detected. Please try again or use text input.";
          setShowTextInput(true);
          break;
        case 'audio-capture':
          errorMessage = "Microphone not accessible. Please check permissions or use text input.";
          setShowTextInput(true);
          break;
        case 'not-allowed':
          errorMessage = "Microphone permission denied. You can type instead.";
          setShowTextInput(true);
          break;
        case 'network':
          errorMessage = "Network error. Please check your connection.";
          break;
        default:
          errorMessage = "Speech recognition failed. You can type instead.";
          setShowTextInput(true);
      }
      
      toast({
        title: "Voice Input Error",
        description: errorMessage,
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

  const handleTextSubmit = useCallback((text: string) => {
    if (text.trim()) {
      voiceLogMutation.mutate(text.trim());
      setTextInput("");
      setShowTextInput(false);
    }
  }, [voiceLogMutation]);

  const toggleTextInput = useCallback(() => {
    setShowTextInput(!showTextInput);
    if (isListening) {
      stopListening();
    }
  }, [showTextInput, isListening, stopListening]);

  return {
    isListening,
    transcript,
    showTextInput,
    textInput,
    setTextInput,
    startListening,
    stopListening,
    handleTextSubmit,
    toggleTextInput,
    isProcessing: voiceLogMutation.isPending,
    speechSupported: checkSpeechSupport(),
  };
}