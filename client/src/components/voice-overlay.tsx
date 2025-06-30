import { Mic, X, Type, Send, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import GlassmorphicCard from "./glassmorphic";

interface VoiceOverlayProps {
  isVisible: boolean;
  onStop: () => void;
  isListening: boolean;
  showTextInput?: boolean;
  textInput?: string;
  onTextInputChange?: (value: string) => void;
  onTextSubmit?: (text: string) => void;
  onToggleTextInput?: () => void;
  speechSupported?: boolean;
}

export default function VoiceOverlay({ 
  isVisible, 
  onStop, 
  isListening,
  showTextInput = false,
  textInput = "",
  onTextInputChange,
  onTextSubmit,
  onToggleTextInput,
  speechSupported = true
}: VoiceOverlayProps) {
  if (!isVisible) return null;

  const handleTextKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && textInput.trim() && onTextSubmit) {
      e.preventDefault();
      onTextSubmit(textInput);
    }
  };

  const handleTextSubmitClick = () => {
    if (textInput.trim() && onTextSubmit) {
      onTextSubmit(textInput);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg z-50 flex items-center justify-center">
      <GlassmorphicCard className="p-8 mx-6 text-center max-w-sm animate-fade-in">
        {showTextInput ? (
          // Text Input Mode
          <>
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <Type className="w-16 h-16 text-white" />
            </div>
            
            <h3 className="text-xl font-bold mb-2">Type Your Activity</h3>
            <p className="text-white/70 mb-6">
              Tell me about your wellness activity
            </p>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={textInput}
                  onChange={(e) => onTextInputChange?.(e.target.value)}
                  onKeyPress={handleTextKeyPress}
                  placeholder="e.g., I did a 30 minute workout"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  autoFocus
                  maxLength={500}
                />
                <Button
                  onClick={handleTextSubmitClick}
                  disabled={!textInput.trim()}
                  className="bg-green-500 text-white hover:bg-green-600 px-3 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="text-xs text-white/60 space-y-1">
                <p>Examples:</p>
                <div className="space-y-1">
                  <p>"I meditated for 15 minutes"</p>
                  <p>"Had a protein shake after workout"</p>
                  <p>"Did 30 minutes of yoga"</p>
                  <p>"Took my vitamin D supplement"</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              {speechSupported && (
                <Button 
                  onClick={onToggleTextInput}
                  className="flex-1 bg-white/10 text-white border border-white/20 hover:bg-white/20"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Use Voice
                </Button>
              )}
              <Button 
                onClick={onStop}
                className="flex-1 bg-red-500 text-white hover:bg-red-600"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </>
        ) : (
          // Voice Input Mode
          <>
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-rose-gold to-orange-400 rounded-full flex items-center justify-center">
              <Mic className={cn(
                "w-16 h-16 text-charcoal",
                isListening && "animate-pulse"
              )} />
            </div>
            
            <h3 className="text-xl font-bold mb-2">
              {isListening ? "Listening..." : "Ready to Listen"}
            </h3>
            <p className="text-white/70 mb-6">
              Tell me about your wellness activity
            </p>
            
            {!speechSupported && (
              <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-200" />
                <p className="text-sm text-yellow-200">
                  Speech recognition not supported in your browser
                </p>
              </div>
            )}
            
            {speechSupported && (
              <div className="mb-6 text-xs text-white/60 space-y-1">
                <p>Try saying:</p>
                <div className="space-y-1">
                  <p>"I did a 30 minute HIIT workout"</p>
                  <p>"Had a healthy lunch with salad"</p>
                  <p>"Meditated for 10 minutes"</p>
                  <p>"Took my daily vitamins"</p>
                </div>
              </div>
            )}
            
            <div className="flex space-x-3">
              <Button 
                onClick={onToggleTextInput}
                className="flex-1 bg-white/10 text-white border border-white/20 hover:bg-white/20"
              >
                <Type className="w-4 h-4 mr-2" />
                Type Instead
              </Button>
              <Button 
                onClick={onStop}
                className="flex-1 bg-red-500 text-white hover:bg-red-600"
              >
                <X className="w-4 h-4 mr-2" />
                {isListening ? "Stop Recording" : "Cancel"}
              </Button>
            </div>
          </>
        )}
      </GlassmorphicCard>
    </div>
  );
}