import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceButtonProps {
  onClick: () => void;
  isListening?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function VoiceButton({ 
  onClick, 
  isListening = false, 
  className,
  size = "lg" 
}: VoiceButtonProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16", 
    lg: "w-20 h-20"
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <Button
      onClick={onClick}
      className={cn(
        sizeClasses[size],
        "bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl hover:shadow-amber-400/50 transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-amber-300/30",
        isListening && "animate-pulse shadow-amber-400/60",
        className
      )}
    >
      <Mic className={cn(iconSizes[size], "text-black font-bold")} />
    </Button>
  );
}
