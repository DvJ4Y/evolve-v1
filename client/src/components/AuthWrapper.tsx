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
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      // Check for existing user session
      const savedUser = localStorage.getItem('evolve_user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          // Validate user session with server and wait for completion
          await validateUserSession(parsedUser);
        } catch (error) {
          console.error("Invalid user data in localStorage:", error);
          localStorage.removeItem('evolve_user');
        }
      }
      // Only set loading to false after validation is complete
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const validateUserSession = async (userData: User) => {
    try {
      const response = await apiRequest("GET", `/api/auth/validate/${userData.id}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Session invalid, clear storage
        localStorage.removeItem('evolve_user');
        setUser(null);
      }
    } catch (error) {
      console.error("Session validation failed:", error);
      // Keep user signed in if validation fails (offline mode)
      setUser(userData);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;
    
    setIsSigningIn(true);
    try {
      // For MVP, simulate Google OAuth with realistic demo users
      const demoUsers = [
        { 
          name: "Alex Johnson", 
          email: "alex@evolveai.com",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
        },
        { 
          name: "Sarah Chen", 
          email: "sarah@evolveai.com",
          avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
        },
        { 
          name: "Mike Rodriguez", 
          email: "mike@evolveai.com",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
        }
      ];

      // Randomly select a demo user for variety
      const selectedUser = demoUsers[Math.floor(Math.random() * demoUsers.length)];

      const response = await apiRequest("POST", "/api/auth/google", selectedUser);
      
      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Convert string ID to number for frontend compatibility
      const userWithNumericId = {
        ...data.user,
        id: parseInt(data.user.id) || 1
      };
      
      setUser(userWithNumericId);
      localStorage.setItem('evolve_user', JSON.stringify(userWithNumericId));
      
      if (data.isNewUser) {
        toast({
          title: "Welcome to Evolve AI!",
          description: "Let's set up your wellness profile.",
        });
      } else {
        toast({
          title: `Welcome back, ${userWithNumericId.name}!`,
          description: "Ready to continue your wellness journey?",
        });
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign In Failed",
        description: "Please try again. If the problem persists, check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsSigningIn(false);
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
            disabled={isSigningIn}
            className="w-full bg-white text-black hover:bg-white/90 font-semibold py-3 rounded-full disabled:opacity-50"
          >
            {isSigningIn ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2"></div>
                Signing in...
              </div>
            ) : (
              <>
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </Button>
          <p className="text-xs text-white/50 mt-4">
            MVP Demo - Realistic user simulation
          </p>
        </GlassmorphicCard>
      </div>
    );
  }

  return (
    <>
      {children(user)}
      {/* Debug sign out button - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={handleSignOut}
          className="fixed top-4 right-4 text-xs text-white/50 hover:text-white/80 z-50 bg-black/20 px-2 py-1 rounded"
        >
          Sign Out
        </button>
      )}
    </>
  );
}