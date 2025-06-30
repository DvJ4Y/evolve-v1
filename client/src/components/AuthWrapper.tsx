import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import GlassmorphicCard from "./glassmorphic";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  primaryWellnessGoal?: string;
}

interface AuthWrapperProps {
  children: (user: User) => React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing user session
    const savedUser = localStorage.getItem('evolve_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      // For MVP, simulate Google OAuth with demo data
      // In production, this would integrate with actual Google OAuth
      const mockGoogleUser = {
        name: "Demo User",
        email: "demo@evolveai.com",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
      };

      const response = await apiRequest("POST", "/api/auth/google", mockGoogleUser);
      const data = await response.json();
      
      setUser(data.user);
      localStorage.setItem('evolve_user', JSON.stringify(data.user));
      
      if (data.isNewUser) {
        toast({
          title: "Welcome to Evolve AI!",
          description: "Let's set up your wellness profile.",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "Ready to continue your wellness journey?",
        });
      }
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('evolve_user');
    toast({
      title: "Signed Out",
      description: "See you next time!",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[hsl(225,15%,6%)] to-[hsl(225,15%,4%)]">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-white/10 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[hsl(225,15%,6%)] to-[hsl(225,15%,4%)] px-6">
        <GlassmorphicCard className="p-8 text-center max-w-sm w-full">
          <div className="text-6xl mb-6">🌟</div>
          <h1 className="text-2xl font-bold mb-4">Welcome to Evolve AI</h1>
          <p className="text-white/70 mb-8 leading-relaxed">
            Your voice-first wellness companion for tracking Body, Mind, and Soul.
          </p>
          <Button
            onClick={handleGoogleSignIn}
            className="w-full bg-white text-black hover:bg-white/90 font-semibold py-3 rounded-full"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>
          <p className="text-xs text-white/50 mt-4">
            MVP Demo - No actual Google OAuth required
          </p>
        </GlassmorphicCard>
      </div>
    );
  }

  return (
    <>
      {children(user)}
      {/* Debug sign out button - remove in production */}
      <button
        onClick={handleSignOut}
        className="fixed top-4 right-4 text-xs text-white/50 hover:text-white/80 z-50"
      >
        Sign Out
      </button>
    </>
  );
}