import { X, Send, Zap, Utensils, Pill, Brain, MessageCircle, Sparkles, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import GlassmorphicCard from "./glassmorphic";
import { type MvpActivityLog } from "@shared/schema";

interface VoiceOverlayProps {
  isVisible: boolean;
  onStop: () => void;
  textInput?: string;
  onTextInputChange?: (value: string) => void;
  onTextSubmit?: (text: string) => void;
  lastLoggedActivity?: MvpActivityLog | null;
  onQuickSelect?: (phrase: string) => void;
  isProcessing?: boolean;
}

const quickSelectOptions = [
  {
    icon: Zap,
    label: "Workout",
    phrases: [
      "I did a 30 minute HIIT workout",
      "Went for a 5km run this morning",
      "Completed strength training session",
      "Did yoga for 45 minutes"
    ],
    color: "from-orange-400 to-red-500",
    description: "Log exercise activity"
  },
  {
    icon: Utensils,
    label: "Meal",
    phrases: [
      "Had a healthy chicken salad for lunch",
      "Ate an apple and nuts as a snack",
      "Drank a protein shake after workout",
      "Cooked salmon with vegetables for dinner"
    ],
    color: "from-green-400 to-emerald-500",
    description: "Track food intake"
  },
  {
    icon: Pill,
    label: "Supplement",
    phrases: [
      "Took my daily multivitamin",
      "Had my Vitamin D supplement",
      "Took omega-3 fish oil capsules",
      "Had magnesium before bed"
    ],
    color: "from-blue-400 to-cyan-500",
    description: "Record supplements"
  },
  {
    icon: Brain,
    label: "Meditation",
    phrases: [
      "Meditated for 15 minutes",
      "Did breathing exercises to relax",
      "Practiced mindfulness meditation",
      "Had a 10 minute meditation session"
    ],
    color: "from-purple-400 to-violet-500",
    description: "Log mindfulness"
  }
];

const timeBasedSuggestions = [
  {
    time: "morning",
    icon: "🌅",
    suggestions: [
      "Had a healthy breakfast",
      "Did morning meditation",
      "Took my morning supplements",
      "Went for a morning run"
    ]
  },
  {
    time: "afternoon", 
    icon: "☀️",
    suggestions: [
      "Had lunch with colleagues",
      "Did a quick workout",
      "Took a mindful walk",
      "Had an afternoon snack"
    ]
  },
  {
    time: "evening",
    icon: "🌙",
    suggestions: [
      "Cooked a healthy dinner",
      "Did evening yoga",
      "Took evening supplements",
      "Practiced gratitude journaling"
    ]
  }
];

export default function VoiceOverlay({ 
  isVisible, 
  onStop, 
  textInput = "",
  onTextInputChange,
  onTextSubmit,
  lastLoggedActivity,
  onQuickSelect,
  isProcessing = false
}: VoiceOverlayProps) {
  if (!isVisible) return null;

  const handleTextKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && textInput.trim() && onTextSubmit && !isProcessing) {
      e.preventDefault();
      onTextSubmit(textInput);
    }
  };

  const handleTextSubmitClick = () => {
    if (textInput.trim() && onTextSubmit && !isProcessing) {
      onTextSubmit(textInput);
    }
  };

  const handleQuickSelectClick = (phrase: string) => {
    if (onQuickSelect && !isProcessing) {
      onQuickSelect(phrase);
    }
  };

  const getCurrentTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  };

  const currentTimeOfDay = getCurrentTimeOfDay();
  const currentTimeSuggestions = timeBasedSuggestions.find(t => t.time === currentTimeOfDay);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-lg z-50 flex items-center justify-center">
      <div className="w-full max-w-md mx-6 max-h-[90vh] overflow-y-auto">
        <GlassmorphicCard className="p-6 text-center animate-fade-in">
          {/* Chat History Section */}
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

          {/* Header */}
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center relative">
            <MessageCircle className="w-12 h-12 text-white" />
            {isProcessing && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          
          <h3 className="text-xl font-bold mb-2">
            {isProcessing ? "Processing..." : "Tell me about your activity"}
          </h3>
          <p className="text-white/70 mb-6">
            {isProcessing ? "Analyzing your wellness activity..." : "Choose a quick option or type your own"}
          </p>
          
          {/* Time-based Suggestions */}
          {currentTimeSuggestions && !isProcessing && (
            <div className="mb-6">
              <div className="text-sm text-white/60 mb-3 flex items-center justify-center">
                <Clock className="w-4 h-4 mr-2" />
                {currentTimeSuggestions.icon} {currentTimeSuggestions.time} suggestions
              </div>
              <div className="grid grid-cols-1 gap-2">
                {currentTimeSuggestions.suggestions.slice(0, 2).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSelectClick(suggestion)}
                    className="quick-select-button text-left p-3 hover:scale-105 transition-all duration-200"
                    disabled={isProcessing}
                  >
                    <div className="text-sm font-medium text-white">{suggestion}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Quick Select Options */}
          {!isProcessing && (
            <div className="mb-6">
              <div className="text-sm text-white/60 mb-4 flex items-center justify-center">
                <Zap className="w-4 h-4 mr-2" />
                Quick Actions
              </div>
              <div className="quick-select-grid">
                {quickSelectOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSelectClick(option.phrases[0])}
                    className="quick-select-button text-left group hover:scale-105 transition-all duration-200"
                    disabled={isProcessing}
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
          )}
          
          {/* Text Input with Chat Styling */}
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
                  disabled={isProcessing}
                />
                <Button
                  onClick={handleTextSubmitClick}
                  disabled={!textInput.trim() || isProcessing}
                  className="bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 px-3 disabled:opacity-50 rounded-full"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="text-xs text-white/50 mt-2 text-right">
                {textInput.length}/500 characters
              </div>
            </div>
            
            {/* Example Phrases */}
            {!isProcessing && (
              <div className="text-xs text-white/60 space-y-2">
                <p className="font-medium flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Popular examples:
                </p>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    "I did a 30 minute HIIT workout",
                    "Had a protein shake after workout", 
                    "Meditated for 10 minutes",
                    "Took my vitamin D supplement"
                  ].map((phrase, index) => (
                    <button
                      key={index}
                      onClick={() => onTextInputChange?.(phrase)}
                      className="text-left hover:text-white/80 transition-colors p-1 rounded hover:bg-white/5"
                      disabled={isProcessing}
                    >
                      "{phrase}"
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex space-x-3 mt-6">
            <Button 
              onClick={onStop}
              disabled={isProcessing}
              className="flex-1 bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
            >
              <X className="w-4 h-4 mr-2" />
              {isProcessing ? "Processing..." : "Cancel"}
            </Button>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                <p className="text-sm text-blue-200">
                  Our AI is analyzing your activity...
                </p>
              </div>
            </div>
          )}
        </GlassmorphicCard>
      </div>
    </div>
  );
}