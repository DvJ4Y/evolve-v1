import { Mic, X, Type, Send, AlertCircle, Zap, Utensils, Pill, Brain, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import GlassmorphicCard from "./glassmorphic";
import { type MvpActivityLog } from "@shared/schema";

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
  lastLoggedActivity?: MvpActivityLog | null;
  onQuickSelect?: (phrase: string) => void;
}

const quickSelectOptions = [
  {
    icon: Zap,
    label: "Workout",
    phrase: "I did a 30 minute workout",
    color: "from-orange-400 to-red-500",
    description: "Log exercise activity"
  },
  {
    icon: Utensils,
    label: "Meal",
    phrase: "I had a healthy meal",
    color: "from-green-400 to-emerald-500",
    description: "Track food intake"
  },
  {
    icon: Pill,
    label: "Supplement",
    phrase: "I took my daily supplements",
    color: "from-blue-400 to-cyan-500",
    description: "Record supplements"
  },
  {
    icon: Brain,
    label: "Meditation",
    phrase: "I meditated for 15 minutes",
    color: "from-purple-400 to-violet-500",
    description: "Log mindfulness"
  }
];

const examplePhrases = [
  "I did a 30 minute HIIT workout",
  "Had a protein shake after workout",
  "Meditated for 10 minutes",
  "Took my vitamin D supplement",
  "Went for a 5km run",
  "Had a healthy salad for lunch"
];

export default function VoiceOverlay({ 
  isVisible, 
  onStop, 
  isListening,
  showTextInput = false,
  textInput = "",
  onTextInputChange,
  onTextSubmit,
  onToggleTextInput,
  speechSupported = true,
  lastLoggedActivity,
  onQuickSelect
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

  const handleQuickSelectClick = (phrase: string) => {
    if (onQuickSelect) {
      onQuickSelect(phrase);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-lg z-50 flex items-center justify-center">
      <GlassmorphicCard className="p-6 mx-6 text-center max-w-sm w-full animate-fade-in">
        {/* Enhanced Chat History Section */}
        {lastLoggedActivity && (
          <div className="mb-6 p-4 glassmorphic-dark rounded-2xl chat-bubble">
            <div className="flex items-center justify-center mb-3">
              <MessageCircle className="w-4 h-4 text-amber-400 mr-2" />
              <div className="text-xs text-white/50">Last Activity</div>
            </div>
            <div className="chat-message">
              <div className="text-sm text-white/90 mb-2 leading-relaxed">
                "{lastLoggedActivity.rawTextInput}"
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <div className="text-xs text-amber-400 capitalize font-medium">
                  {lastLoggedActivity.detectedIntent.replace('_', ' ')}
                </div>
              </div>
            </div>
          </div>
        )}

        {showTextInput ? (
          // Enhanced Text Input Mode with Chat Interface
          <>
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center relative">
              <Type className="w-12 h-12 text-white" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-2">Tell me about your activity</h3>
            <p className="text-white/70 mb-6">
              Choose a quick option or type your own
            </p>
            
            {/* Enhanced Quick Select Options */}
            <div className="mb-6">
              <div className="text-sm text-white/60 mb-4 flex items-center justify-center">
                <Zap className="w-4 h-4 mr-2" />
                Quick Actions
              </div>
              <div className="quick-select-grid">
                {quickSelectOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSelectClick(option.phrase)}
                    className="quick-select-button text-left group hover:scale-105 transition-all duration-200"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${option.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                      <option.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-sm font-medium text-white">{option.label}</div>
                    <div className="text-xs text-white/60 mt-1">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Enhanced Text Input with Chat Styling */}
            <div className="space-y-4">
              <div className="chat-input-container p-3">
                <div className="flex space-x-2">
                  <Input
                    value={textInput}
                    onChange={(e) => onTextInputChange?.(e.target.value)}
                    onKeyPress={handleTextKeyPress}
                    placeholder="e.g., I did a 30 minute workout"
                    className="bg-transparent border-none text-white placeholder:text-white/50 focus:ring-0 focus:outline-none"
                    autoFocus
                    maxLength={500}
                  />
                  <Button
                    onClick={handleTextSubmitClick}
                    disabled={!textInput.trim()}
                    className="bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 px-3 disabled:opacity-50 rounded-full"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Example Phrases */}
              <div className="text-xs text-white/60 space-y-2">
                <p className="font-medium flex items-center justify-center">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Example phrases:
                </p>
                <div className="grid grid-cols-1 gap-1">
                  {examplePhrases.slice(0, 3).map((phrase, index) => (
                    <button
                      key={index}
                      onClick={() => onTextInputChange?.(phrase)}
                      className="text-left hover:text-white/80 transition-colors p-1 rounded hover:bg-white/5"
                    >
                      "{phrase}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              {speechSupported && (
                <Button 
                  onClick={onToggleTextInput}
                  className="flex-1 glassmorphic text-white border border-white/20 hover:bg-white/20"
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
          // Enhanced Voice Input Mode
          <>
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-rose-gold to-orange-400 rounded-full flex items-center justify-center relative">
              <Mic className={cn(
                "w-12 h-12 text-charcoal",
                isListening && "animate-pulse"
              )} />
              {isListening && (
                <div className="absolute inset-0 rounded-full border-4 border-amber-400 animate-ping"></div>
              )}
            </div>
            
            <h3 className="text-xl font-bold mb-2">
              {isListening ? (
                <span className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                  Listening...
                </span>
              ) : "Ready to Listen"}
            </h3>
            <p className="text-white/70 mb-6">
              {isListening ? "Speak naturally about your wellness activity" : "Tell me about your wellness journey"}
            </p>
            
            {!speechSupported && (
              <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-200" />
                <p className="text-sm text-yellow-200">
                  Speech recognition not supported in your browser
                </p>
              </div>
            )}
            
            {/* Quick Select Options for Voice Mode */}
            {!isListening && (
              <div className="mb-6">
                <div className="text-sm text-white/60 mb-3 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Or choose quickly:
                </div>
                <div className="quick-select-grid">
                  {quickSelectOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickSelectClick(option.phrase)}
                      className="quick-select-button text-left group quick-action-pulse"
                      style={{ animationDelay: `${index * 0.2}s` }}
                    >
                      <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${option.color} flex items-center justify-center mb-1 group-hover:scale-110 transition-transform`}>
                        <option.icon className="w-3 h-3 text-white" />
                      </div>
                      <div className="text-xs font-medium text-white">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {speechSupported && !isListening && (
              <div className="mb-6 text-xs text-white/60 space-y-2">
                <p className="font-medium flex items-center justify-center">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Try saying:
                </p>
                <div className="grid grid-cols-1 gap-1">
                  {examplePhrases.slice(0, 4).map((phrase, index) => (
                    <p key={index} className="opacity-80">"{phrase}"</p>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex space-x-3">
              <Button 
                onClick={onToggleTextInput}
                className="flex-1 glassmorphic text-white border border-white/20 hover:bg-white/20"
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