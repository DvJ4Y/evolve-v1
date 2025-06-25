import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import GlassmorphicCard from "./glassmorphic";
import { cn } from "@/lib/utils";
import { type PillarType } from "@shared/schema";

interface PillarCardProps {
  pillar: PillarType;
  title: string;
  subtitle: string;
  progress: number;
  stats: Array<{ label: string; value: string | number }>;
  nextActivity: string;
  imageUrl: string;
}

const pillarColors = {
  BODY: "text-orange-400",
  MIND: "text-emerald-400", 
  SOUL: "text-violet-400"
};

const pillarButtonColors = {
  BODY: "bg-gradient-to-r from-orange-400 to-red-500 text-white",
  MIND: "bg-gradient-to-r from-emerald-400 to-teal-500 text-white",
  SOUL: "bg-gradient-to-r from-violet-400 to-purple-500 text-white"
};

export default function PillarCard({
  pillar,
  title,
  subtitle,
  progress,
  stats,
  nextActivity,
  imageUrl
}: PillarCardProps) {
  const handleQuickLog = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Open quick logging modal
    console.log(`Quick log for ${pillar.toLowerCase()} pillar`);
  };

  return (
    <Link href={`/pillar/${pillar.toLowerCase()}`}>
      <GlassmorphicCard className="p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer border-l-4 border-l-white/20">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <img 
              src={imageUrl} 
              alt={`${title} wellness activities`}
              className="w-16 h-16 rounded-2xl object-cover"
            />
            <div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="text-white/70 text-sm">{subtitle}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={cn("text-2xl font-bold", pillarColors[pillar])}>
              {progress}%
            </div>
            <div className="text-xs text-white/70">Today</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          {stats.map((stat, index) => (
            <GlassmorphicCard key={index} variant="dark" className="p-4">
              <div className="text-lg font-bold">{stat.value}</div>
              <div className="text-xs text-white/70">{stat.label}</div>
            </GlassmorphicCard>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Next: {nextActivity}</span>
          <Button 
            onClick={handleQuickLog}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold touch-target",
              pillarButtonColors[pillar]
            )}
          >
            Quick Log
          </Button>
        </div>
      </GlassmorphicCard>
    </Link>
  );
}
