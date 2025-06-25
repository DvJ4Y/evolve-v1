import { Mic, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import GlassmorphicCard from "./glassmorphic";

interface VoiceOverlayProps {
  isVisible: boolean;
  onStop: () => void;
  isListening: boolean;
}

export default function VoiceOverlay({ isVisible, onStop, isListening }: VoiceOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg z-50 flex items-center justify-center">
      <GlassmorphicCard className="p-8 mx-6 text-center max-w-sm animate-fade-in">
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
          Tell me about your wellness journey
        </p>
        
        <Button 
          onClick={onStop}
          className="bg-red-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-600 transition-colors touch-target"
        >
          <X className="w-4 h-4 mr-2" />
          Stop Recording
        </Button>
      </GlassmorphicCard>
    </div>
  );
}
