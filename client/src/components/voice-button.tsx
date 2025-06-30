import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceButtonProps {
  onClick: () => void;
  isListening?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

export default function VoiceButton({ 
  onClick, 
  isListening = false, 
  className,
  size = "lg",
  disabled = false
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
      disabled={disabled}
      className={cn(
        sizeClasses[size],
        "bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl hover:shadow-blue-400/50 transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-blue-300/30 disabled:opacity-50",
        isListening && "animate-pulse shadow-blue-400/60",
        className
      )}
    >
      <MessageCircle className={cn(iconSizes[size], "text-white font-bold")} />
    </Button>
  );
}