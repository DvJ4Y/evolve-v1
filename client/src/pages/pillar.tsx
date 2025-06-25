import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Plus, Activity, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import GlassmorphicCard from "@/components/glassmorphic";
import ProgressRing from "@/components/progress-ring";
import { formatDistanceToNow } from "date-fns";
import { type PillarType } from "@shared/schema";

const pillarConfig = {
  body: {
    title: "Body",
    color: "hsl(20, 57%, 74%)",
    bgColor: "bg-rose-gold",
    textColor: "text-rose-gold",
    borderColor: "border-rose-gold",
    icon: "💪",
    description: "Physical wellness and fitness"
  },
  mind: {
    title: "Mind", 
    color: "hsl(120, 58%, 67%)",
    bgColor: "bg-green-400",
    textColor: "text-green-400",
    borderColor: "border-green-400",
    icon: "🧠",
    description: "Mental wellness and mindfulness"
  },
  soul: {
    title: "Soul",
    color: "hsl(270, 70%, 70%)",
    bgColor: "bg-purple-400", 
    textColor: "text-purple-400",
    borderColor: "border-purple-400",
    icon: "✨",
    description: "Spiritual growth and reflection"
  }
};

export default function Pillar() {
  const { pillar } = useParams<{ pillar: string }>();
  const pillarType = pillar?.toUpperCase() as PillarType;
  
  // For demo purposes, using userId 1
  const userId = 1;

  const { data: pillarData, isLoading } = useQuery({
    queryKey: [`/api/pillar/${userId}/${pillarType}`],
  });

  if (!pillar || !pillarConfig[pillar as keyof typeof pillarConfig]) {
    return (
      <div className="mobile-container p-6">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-4">Pillar Not Found</h1>
          <Link href="/">
            <Button className="bg-rose-gold text-charcoal">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const config = pillarConfig[pillar as keyof typeof pillarConfig];

  if (isLoading) {
    return (
      <div className="mobile-container">
        <div className="safe-area-top p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/10 rounded"></div>
            <div className="h-32 bg-white/10 rounded-3xl"></div>
            <div className="h-48 bg-white/10 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const activities = pillarData?.activities || [];
  const goals = pillarData?.goals || [];
  const weeklyProgress = pillarData?.weeklyProgress || [];
  
  // Calculate current progress (latest day)
  const currentProgress = weeklyProgress[weeklyProgress.length - 1]?.progress || 0;

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="safe-area-top px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="icon" className="glassmorphic rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{config.icon}</span>
          <h1 className="text-xl font-bold">{config.title}</h1>
        </div>
        <Button 
          size="icon" 
          className={`${config.bgColor} text-charcoal rounded-full`}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <div className="px-6 pb-32">
        {/* Progress Overview */}
        <GlassmorphicCard className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">{config.title} Progress</h2>
              <p className="text-white/70 text-sm">{config.description}</p>
            </div>
            <ProgressRing 
              progress={currentProgress}
              size={80}
              strokeWidth={4}
              color={config.color}
            />
          </div>

          {/* Weekly Progress Chart */}
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3 text-white/70">7-Day Trend</h3>
            <div className="flex items-end justify-between h-16 space-x-1">
              {weeklyProgress.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className={`w-full ${config.bgColor} rounded-t`}
                    style={{ 
                      height: `${Math.max(day.progress * 0.6, 4)}px`,
                      opacity: day.progress / 100 
                    }}
                  />
                  <span className="text-xs text-white/50 mt-1">
                    {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </GlassmorphicCard>

        {/* Tabs */}
        <Tabs defaultValue="activities" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 glassmorphic">
            <TabsTrigger 
              value="activities" 
              className={`data-[state=active]:${config.bgColor} data-[state=active]:text-charcoal`}
            >
              <Activity className="w-4 h-4 mr-2" />
              Activities
            </TabsTrigger>
            <TabsTrigger 
              value="goals" 
              className={`data-[state=active]:${config.bgColor} data-[state=active]:text-charcoal`}
            >
              <Target className="w-4 h-4 mr-2" />
              Goals
            </TabsTrigger>
            <TabsTrigger 
              value="insights" 
              className={`data-[state=active]:${config.bgColor} data-[state=active]:text-charcoal`}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activities">
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity: any) => (
                  <GlassmorphicCard key={activity.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className={`${config.borderColor} ${config.textColor}`}>
                            {activity.activityType.replace('_', ' ')}
                          </Badge>
                          {activity.durationMinutes && (
                            <span className="text-xs text-white/70">
                              {activity.durationMinutes} min
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/70">
                          {activity.details?.description || activity.details?.notes || "Activity completed"}
                        </p>
                      </div>
                      <span className="text-xs text-white/50">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </GlassmorphicCard>
                ))
              ) : (
                <GlassmorphicCard className="p-6 text-center">
                  <div className="text-4xl mb-4">{config.icon}</div>
                  <h3 className="font-semibold mb-2">No activities yet</h3>
                  <p className="text-white/70 text-sm mb-4">
                    Start logging your {config.title.toLowerCase()} activities with voice or manual entry
                  </p>
                  <Button className={`${config.bgColor} text-charcoal`}>
                    Log First Activity
                  </Button>
                </GlassmorphicCard>
              )}
            </div>
          </TabsContent>

          <TabsContent value="goals">
            <div className="space-y-4">
              {goals.length > 0 ? (
                goals.map((goal: any) => (
                  <GlassmorphicCard key={goal.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{goal.title}</h4>
                      <Badge variant="outline" className={`${config.borderColor} ${config.textColor}`}>
                        {goal.frequency}
                      </Badge>
                    </div>
                    {goal.description && (
                      <p className="text-sm text-white/70 mb-3">{goal.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${config.bgColor} transition-all duration-300`}
                            style={{ 
                              width: `${goal.targetValue ? (goal.currentValue / goal.targetValue) * 100 : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-white/70 ml-4">
                        {goal.currentValue}/{goal.targetValue} {goal.unit}
                      </span>
                    </div>
                  </GlassmorphicCard>
                ))
              ) : (
                <GlassmorphicCard className="p-6 text-center">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="font-semibold mb-2">No goals set</h3>
                  <p className="text-white/70 text-sm mb-4">
                    Set specific goals for your {config.title.toLowerCase()} wellness journey
                  </p>
                  <Button className={`${config.bgColor} text-charcoal`}>
                    Create First Goal
                  </Button>
                </GlassmorphicCard>
              )}
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <GlassmorphicCard className="p-6">
              <h3 className="font-semibold mb-4">AI Insights</h3>
              <p className="text-white/70 text-sm">
                AI-generated insights will appear here based on your activity patterns and progress.
                Keep logging activities to unlock personalized recommendations!
              </p>
            </GlassmorphicCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
