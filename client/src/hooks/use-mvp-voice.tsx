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

// Enhanced speech recognition support detection
const checkSpeechSupport = (): boolean => {
  const hasWebkitSpeech = 'webkitSpeechRecognition' in window;
  const hasSpeech = 'SpeechRecognition' in window;
  const isSecureContext = window.isSecureContext || window.location.protocol === 'https:';
  
  return (hasWebkitSpeech || hasSpeech) && isSecureContext;
};

// Get browser-specific speech recognition class
const getSpeechRecognition = () => {
  if ('webkitSpeechRecognition' in window) {
    return window.webkitSpeechRecognition;
  }
  if ('SpeechRecognition' in window) {
    return window.SpeechRecognition;
  }
  return null;
};

export function useMVPVoice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [speechSupported] = useState(checkSpeechSupport());
  const recognitionRef = useRef<SpeechRecognition | null>(null);
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
      console.error("Voice processing error:", error);
      
      let errorMessage = "Failed to process your input. Please try again.";
      if (error.message.includes("User not found")) {
        errorMessage = "Please sign in again to log activities.";
      } else if (error.message.includes("Server error")) {
        errorMessage = "Server is temporarily unavailable. Please try again.";
      }
      
      toast({
        title: "Voice Processing Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const startListening = useCallback(() => {
    // Check if speech recognition is supported
    if (!speechSupported) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition. You can type instead.",
        variant: "destructive",
      });
      setShowTextInput(true);
      return;
    }

    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setShowTextInput(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      
      // Configure recognition settings
      recognition.continuous = false; // Changed to false for better reliability
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log("🎤 Speech recognition started");
        setIsListening(true);
        setTranscript("");
        setShowTextInput(false);
      };

      recognition.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          console.log("🎯 Final transcript:", finalTranscript);
          setTranscript(finalTranscript);
        }
      };

      recognition.onend = () => {
        console.log("🔇 Speech recognition ended");
        setIsListening(false);
        
        if (transcript.trim()) {
          console.log("📝 Processing transcript:", transcript);
          voiceLogMutation.mutate(transcript);
        } else {
          toast({
            title: "No Speech Detected",
            description: "Please try speaking again or use text input.",
            variant: "destructive",
          });
          setShowTextInput(true);
        }
      };

      recognition.onerror = (event) => {
        console.error("🚨 Speech recognition error:", event.error);
        setIsListening(false);
        
        let errorMessage = "Speech recognition error occurred.";
        let shouldShowTextInput = true;
        
        switch(event.error) {
          case 'no-speech':
            errorMessage = "No speech detected. Please try again or use text input.";
            break;
          case 'audio-capture':
            errorMessage = "Microphone not accessible. Please check permissions or use text input.";
            break;
          case 'not-allowed':
            errorMessage = "Microphone permission denied. You can type instead.";
            break;
          case 'network':
            errorMessage = "Network error with speech service. You can type instead.";
            break;
          case 'service-not-allowed':
            errorMessage = "Speech service not allowed. You can type instead.";
            break;
          default:
            errorMessage = "Speech recognition failed. You can type instead.";
        }
        
        toast({
          title: "Voice Input Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        if (shouldShowTextInput) {
          setShowTextInput(true);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      toast({
        title: "Speech Recognition Failed",
        description: "Unable to start voice input. You can type instead.",
        variant: "destructive",
      });
      setShowTextInput(true);
    }
  }, [transcript, voiceLogMutation, toast, speechSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const handleTextSubmit = useCallback((text: string) => {
    const trimmedText = text.trim();
    if (trimmedText) {
      console.log("📝 Processing text input:", trimmedText);
      voiceLogMutation.mutate(trimmedText);
      setTextInput("");
      setShowTextInput(false);
    } else {
      toast({
        title: "Empty Input",
        description: "Please enter some text about your activity.",
        variant: "destructive",
      });
    }
  }, [voiceLogMutation, toast]);

  const toggleTextInput = useCallback(() => {
    setShowTextInput(!showTextInput);
    if (isListening) {
      stopListening();
    }
    // Clear any existing text when toggling
    if (!showTextInput) {
      setTextInput("");
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
    speechSupported,
  };
}