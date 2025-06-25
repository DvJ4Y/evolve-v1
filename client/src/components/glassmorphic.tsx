import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface GlassmorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "dark";
  blur?: "sm" | "md" | "lg" | "xl";
}

const GlassmorphicCard = forwardRef<HTMLDivElement, GlassmorphicCardProps>(
  ({ className, variant = "light", blur = "lg", children, ...props }, ref) => {
    const baseClasses = "rounded-3xl border transition-all duration-300";
    
    const variantClasses = {
      light: "glassmorphic",
      dark: "glassmorphic-dark"
    };
    
    const blurClasses = {
      sm: "backdrop-blur-sm",
      md: "backdrop-blur-md", 
      lg: "backdrop-blur-xl",
      xl: "backdrop-blur-2xl"
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          blurClasses[blur],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassmorphicCard.displayName = "GlassmorphicCard";

export default GlassmorphicCard;
