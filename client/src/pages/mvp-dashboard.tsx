import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MessageCircle, Activity, User, TrendingUp, Calendar, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import GlassmorphicCard from "@/components/glassmorphic";
import VoiceOverlay from "@/components/voice-overlay";
import { useMVPVoice } from "@/hooks/use-mvp-voice";
import { formatDistanceToNow } from "date-fns";
import { type MvpActivityLog } from "@shared/schema";

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  primaryWellnessGoal?: string;
}

interface MVPDashboardData {
  user: User;
  recentActivities: MvpActivityLog[];
  totalActivities: number;
  todayActivities: number;
  activityBreakdown: Record<string, number>;
}

interface MVPDashboardProps {
  user: User;
}

// Enhanced loading skeleton component
const DashboardSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-b from-[hsl(225,15%,6%)] to-[hsl(225,15%,4%)] px-6">
    <div className="pt-16 pb-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32 bg-white/10 rounded-2xl" />
          <Skeleton className="h-4 w-20 bg-white/5 mt-2 rounded-xl" />
        </div>
        <Skeleton className="w-14 h-14 rounded-full bg-white/10" />
      </div>
      <Skeleton className="h-32 w-full bg-white/5 rounded-3xl" />
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <Skeleton key={i} className="h-20 w-full bg-white/5 rounded-2xl" />
        ))}
      </div>
    </div>
  </div>
);

// Error component
const ErrorDisplay = ({ onRetry }: { onRetry: () => void }) => (
  <div className="min-h-screen bg-gradient-to-b from-[hsl(225,15%,6%)] to-[hsl(225,15%,4%)] px-6 flex items-center justify-center">
    <GlassmorphicCard className="p-8 text-center max-w-sm">
      <div className="text-4xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
      <p className="text-white/70 mb-6">
        We couldn't load your dashboard data. This might be a temporary issue.
      </p>
      <div className="space-y-3">
        <Button onClick={onRetry} className="w-full bg-amber-500 text-black hover:bg-amber-600">
          Try Again
        </Button>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
          className="w-full border-white/20 text-white hover:bg-white/10"
        >
          Reload Page
        </Button>
      </div>
    </GlassmorphicCard>
  </div>
);

export default function MVPDashboard({ user }: MVPDashboardProps) {
  const [isInputActive, setIsInputActive] = useState(false);
  const { 
    textInput,
    setTextInput,
    handleTextSubmit,
    isProcessing
  } = useMVPVoice();

  const { data: dashboardData, isLoading, error, refetch } = useQuery<MVPDashboardData>({
    queryKey: [`/api/mvp/dashboard/${user.id}`],
    retry: 2,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<MvpActivityLog[]>({
    queryKey: [`/api/mvp/activities/${user.id}`],
    retry: 2,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const handleInputActivate = () => {
    setIsInputActive(true);
  };

  const handleInputStop = () => {
    setIsInputActive(false);
  };

  const handleOverlayTextSubmit = (text: string) => {
    handleTextSubmit(text);
    setIsInputActive(false);
  };

  const handleQuickSelect = (phrase: string) => {
    setTextInput(phrase);
    handleTextSubmit(phrase);
    setIsInputActive(false);
  };

  // Get current time greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const intentColors = {
    workout: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    food_intake: "bg-green-500/20 text-green-400 border-green-500/30",
    supplement_intake: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    meditation: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    general_activity_log: "bg-gray-500/20 text-gray-400 border-gray-500/30"
  };

  const intentLabels = {
    workout: "Workout",
    food_intake: "Food",
    supplement_intake: "Supplement",
    meditation: "Meditation",
    general_activity_log: "Activity"
  };

  const intentEmojis = {
    workout: "💪",
    food_intake: "🥗",
    supplement_intake: "💊",
    meditation: "🧘",
    general_activity_log: "📝"
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <ErrorDisplay onRetry={() => refetch()} />;
  }

  // Get the most recent activity for chat context
  const lastLoggedActivity = activities && activities.length > 0 ? activities[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(225,15%,6%)] to-[hsl(225,15%,4%)] relative">
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
          <p className="text-white/60 text-lg font-medium mt-1">{user.name}</p>
        </div>
        <Button variant="ghost" size="icon" className="w-14 h-14 rounded-2xl glassmorphic hover:scale-105 transition-all duration-300">
          <Avatar className="w-11 h-11">
            <AvatarImage src={user.avatar} alt="User Avatar" />
            <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-black font-bold text-lg">
              {user.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </div>

      {/* Enhanced Quick Stats */}
      <div className="px-6 mb-8">
        <GlassmorphicCard className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-amber-400" />
            Your Wellness Journey
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">
                {activities?.length || 0}
              </div>
              <div className="text-sm text-white/70">Total Activities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">
                {dashboardData?.todayActivities || 0}
              </div>
              <div className="text-sm text-white/70 flex items-center justify-center">
                <Calendar className="w-3 h-3 mr-1" />
                Today
              </div>
            </div>
          </div>

          {/* Activity Breakdown */}
          {dashboardData?.activityBreakdown && Object.keys(dashboardData.activityBreakdown).length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-white/70 mb-3">Recent Activity Types</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(dashboardData.activityBreakdown).map(([intent, count]) => (
                  <div key={intent} className="flex items-center space-x-1">
                    <span className="text-sm">{intentEmojis[intent as keyof typeof intentEmojis]}</span>
                    <span className="text-xs text-white/70">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {user.primaryWellnessGoal && (
            <div className="pt-4 border-t border-white/10">
              <div className="text-sm text-white/60 mb-2 flex items-center">
                <MessageCircle className="w-3 h-3 mr-1" />
                Your Goal
              </div>
              <p className="text-sm text-white/90 leading-relaxed">{user.primaryWellnessGoal}</p>
            </div>
          )}
        </GlassmorphicCard>
      </div>

      {/* Recent Activities with Chat-like Interface */}
      <div className="px-6 mb-40">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Recent Activities
          </h2>
          {activities && activities.length > 0 && (
            <span className="text-sm text-white/50">{activities.length} total</span>
          )}
        </div>
        
        {activitiesLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <Skeleton key={i} className="h-20 w-full bg-white/5 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {activities && activities.length > 0 ? (
              activities.slice(0, 10).map((activity, index) => (
                <GlassmorphicCard key={activity.id} className="p-4 hover:bg-white/5 transition-colors chat-message" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge 
                          variant="outline" 
                          className={`${intentColors[activity.detectedIntent]} text-xs`}
                        >
                          {intentEmojis[activity.detectedIntent]} {intentLabels[activity.detectedIntent]}
                        </Badge>
                        {activity.extractedKeywords?.duration && (
                          <span className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded-full">
                            {activity.extractedKeywords.duration}
                          </span>
                        )}
                        {activity.extractedKeywords?.intensity && (
                          <span className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded-full">
                            {activity.extractedKeywords.intensity}
                          </span>
                        )}
                      </div>
                      <div className="flex items-start space-x-2 mb-2">
                        <MessageCircle className="w-4 h-4 text-white/50 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-white/90 leading-relaxed">
                          "{activity.rawTextInput}"
                        </p>
                      </div>
                      {activity.extractedKeywords?.keywords && activity.extractedKeywords.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 ml-6">
                          {activity.extractedKeywords.keywords.slice(0, 4).map((keyword, index) => (
                            <span 
                              key={index}
                              className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded-full"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <span className="text-xs text-white/50">
                        {activity.timestamp && formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </GlassmorphicCard>
              ))
            ) : (
              <GlassmorphicCard className="p-8 text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="font-semibold mb-2">Start Your Journey</h3>
                <p className="text-white/70 text-sm mb-6">
                  Use the chat button below to log your first wellness activity
                </p>
                <div className="space-y-2 text-xs text-white/50">
                  <p className="font-medium flex items-center justify-center">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Try typing:
                  </p>
                  <div className="space-y-1">
                    <p>"I did a 30 minute workout"</p>
                    <p>"I meditated for 10 minutes"</p>
                    <p>"I had a healthy lunch"</p>
                    <p>"I took my vitamins"</p>
                  </div>
                </div>
              </GlassmorphicCard>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Floating Chat Button */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-30">
        <div className="relative">
          {/* 3D Shadow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-500/30 rounded-full blur-xl scale-110 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-2xl scale-125"></div>
          
          {/* Main Chat Button */}
          <div className="relative">
            <Button
              onClick={handleInputActivate}
              disabled={isProcessing}
              className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 border-4 border-white/20 disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <MessageCircle className="w-8 h-8 text-white" />
              )}
            </Button>
            {isProcessing && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Bottom Navigation Menu */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md z-20">
        <div className="mx-6 mb-6">
          <GlassmorphicCard className="px-8 py-4 border-t-2 border-white/20">
            <div className="flex items-center justify-around">
              <Button 
                variant="ghost" 
                className="flex flex-col items-center space-y-1 py-3 px-4 rounded-2xl hover:bg-white/10 transition-all duration-300"
              >
                <Activity className="w-6 h-6 text-amber-400" />
                <span className="text-xs text-white/90 font-medium">Dashboard</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="flex flex-col items-center space-y-1 py-3 px-4 rounded-2xl hover:bg-white/10 transition-all duration-300"
                onClick={handleInputActivate}
                disabled={isProcessing}
              >
                <MessageCircle className={`w-6 h-6 ${isProcessing ? 'text-blue-400' : 'text-white/70'}`} />
                <span className="text-xs text-white/70 font-medium">
                  {isProcessing ? "Processing..." : "Log Activity"}
                </span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="flex flex-col items-center space-y-1 py-3 px-4 rounded-2xl hover:bg-white/10 transition-all duration-300"
              >
                <User className="w-6 h-6 text-white/70" />
                <span className="text-xs text-white/70 font-medium">Profile</span>
              </Button>
            </div>
          </GlassmorphicCard>
        </div>
      </div>

      {/* Enhanced Chat Overlay */}
      <VoiceOverlay 
        isVisible={isInputActive}
        onStop={handleInputStop}
        textInput={textInput}
        onTextInputChange={setTextInput}
        onTextSubmit={handleOverlayTextSubmit}
        lastLoggedActivity={lastLoggedActivity}
        onQuickSelect={handleQuickSelect}
        isProcessing={isProcessing}
      />
    </div>
  );
}