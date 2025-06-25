import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Mic, BarChart3, Target, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import VoiceButton from "@/components/voice-button";
import ProgressRing from "@/components/progress-ring";
import PillarCard from "@/components/pillar-card";
import GlassmorphicCard from "@/components/glassmorphic";
import VoiceOverlay from "@/components/voice-overlay";
import { useVoice } from "@/hooks/use-voice";
import { type DailyStats, type User } from "@shared/schema";

interface DashboardData {
  user: User;
  dailyStats: DailyStats | null;
  recentActivities: any[];
  goals: any[];
}

export default function Dashboard() {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const { isListening, startListening, stopListening } = useVoice();

  // For demo purposes, using userId 1
  const userId = 1;

  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: [`/api/dashboard/${userId}`],
  });

  const handleVoiceActivate = () => {
    setIsVoiceActive(true);
    startListening();
  };

  const handleVoiceStop = () => {
    setIsVoiceActive(false);
    stopListening();
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen px-6">
        <div className="pt-16 pb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Skeleton className="h-7 w-32 mb-2 bg-white/10 rounded-2xl" />
              <Skeleton className="h-4 w-20 bg-white/5 rounded-xl" />
            </div>
            <Skeleton className="w-12 h-12 rounded-full bg-white/10" />
          </div>
          <Skeleton className="h-40 w-full rounded-3xl bg-white/5" />
        </div>
      </div>
    );
  }

  const user = dashboardData?.user;
  const stats = dashboardData?.dailyStats;

  // Get current time greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="w-full min-h-screen relative">
      {/* Status Bar */}
      <div className="flex items-center justify-between px-6 pt-3 pb-2 text-sm font-medium">
        <span>9:41</span>
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white/50 rounded-full"></div>
          </div>
          <div className="w-6 h-3 border border-white/50 rounded-sm ml-2">
            <div className="w-4 h-full bg-white rounded-sm"></div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{greeting}</h1>
          <p className="text-white/60 text-lg font-medium mt-1">{user?.name || "User"}</p>
        </div>
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="w-14 h-14 rounded-2xl glassmorphic hover:scale-105 transition-all duration-300">
            <Avatar className="w-11 h-11">
              <AvatarImage src={user?.avatar} alt="User Avatar" />
              <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-black font-bold text-lg">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </Link>
      </div>

      {/* Daily Stats Overview */}
      <div className="px-6 mb-8">
        <GlassmorphicCard className="p-8">
          <h2 className="text-xl font-bold mb-6 text-center">Today's Progress</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <ProgressRing 
                progress={stats?.bodyProgress || 0} 
                size={80} 
                strokeWidth={4}
                color="hsl(19, 100%, 68%)"
              />
              <p className="text-sm font-medium text-white/80 mt-3">Body</p>
            </div>
            
            <div className="text-center">
              <ProgressRing 
                progress={stats?.mindProgress || 0} 
                size={80} 
                strokeWidth={4}
                color="hsl(142, 76%, 66%)"
              />
              <p className="text-sm font-medium text-white/80 mt-3">Mind</p>
            </div>
            
            <div className="text-center">
              <ProgressRing 
                progress={stats?.soulProgress || 0} 
                size={80} 
                strokeWidth={4}
                color="hsl(258, 90%, 75%)"
              />
              <p className="text-sm font-medium text-white/80 mt-3">Soul</p>
            </div>
          </div>
          
          {/* Current Streak */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white/60 font-medium">Current Streak</span>
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🔥</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  {user?.currentStreak || 0} days
                </span>
              </div>
            </div>
          </div>
        </GlassmorphicCard>
      </div>

      {/* Three Pillars Navigation */}
      <div className="px-6 mb-32">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Your Wellness Journey</h2>
        </div>
        
        <div className="space-y-6">
          <PillarCard
            pillar="BODY"
            title="Body"
            subtitle="Physical wellness"
            progress={stats?.bodyProgress || 0}
            stats={[
              { label: "Workouts", value: stats?.stats?.workouts || 0 },
              { label: "Calories", value: stats?.stats?.calories || 0 }
            ]}
            nextActivity="Evening workout"
            imageUrl="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120"
          />
          
          <PillarCard
            pillar="MIND"
            title="Mind"
            subtitle="Mental wellness"
            progress={stats?.mindProgress || 0}
            stats={[
              { label: "Min Meditation", value: stats?.stats?.meditation || 0 },
              { label: "Hrs Focus", value: Number(stats?.stats?.focusTime || 0).toFixed(1) }
            ]}
            nextActivity="Breathing exercise"
            imageUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120"
          />
          
          <PillarCard
            pillar="SOUL"
            title="Soul"
            subtitle="Spiritual wellness"
            progress={stats?.soulProgress || 0}
            stats={[
              { label: "Gratitudes", value: stats?.stats?.gratitude || 0 },
              { label: "Min Reflection", value: stats?.stats?.reflection || 0 }
            ]}
            nextActivity="Evening gratitude"
            imageUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120"
          />
        </div>
      </div>

      {/* Bottom Navigation with Voice Button */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md pb-8">
        <GlassmorphicCard className="rounded-3xl mx-6 px-8 py-6">
          <div className="flex items-center justify-center mb-6">
            <VoiceButton 
              onClick={handleVoiceActivate}
              isListening={isListening}
              className="shadow-xl"
              size="lg"
            />
          </div>
          
          {/* Secondary Navigation */}
          <div className="flex items-center justify-around">
            <Button variant="ghost" className="flex flex-col items-center space-y-2 py-3 px-6 rounded-2xl hover:bg-white/10 transition-all duration-300">
              <Menu className="w-6 h-6 text-white/70" />
              <span className="text-xs text-white/70 font-medium">Dashboard</span>
            </Button>
            
            <Button variant="ghost" className="flex flex-col items-center space-y-2 py-3 px-6 rounded-2xl hover:bg-white/10 transition-all duration-300">
              <BarChart3 className="w-6 h-6 text-white/70" />
              <span className="text-xs text-white/70 font-medium">Analytics</span>
            </Button>
            
            <Button variant="ghost" className="flex flex-col items-center space-y-2 py-3 px-6 rounded-2xl hover:bg-white/10 transition-all duration-300">
              <Target className="w-6 h-6 text-white/70" />
              <span className="text-xs text-white/70 font-medium">Goals</span>
            </Button>
          </div>
        </GlassmorphicCard>
      </div>

      {/* Voice Overlay */}
      <VoiceOverlay 
        isVisible={isVoiceActive}
        onStop={handleVoiceStop}
        isListening={isListening}
      />
    </div>
  );
}
