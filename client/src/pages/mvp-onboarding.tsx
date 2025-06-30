import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import GlassmorphicCard from "@/components/glassmorphic";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  primaryWellnessGoal?: string;
}

interface MVPOnboardingProps {
  user: User;
  onComplete: (updatedUser: User) => void;
}

export default function MVPOnboarding({ user, onComplete }: MVPOnboardingProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    age: "",
    primaryWellnessGoal: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.age || !formData.primaryWellnessGoal.trim()) {
      toast({
        title: "Please complete all fields",
        description: "We need your age and wellness goal to personalize your experience.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/onboarding/complete", {
        userId: user.id,
        age: parseInt(formData.age),
        primaryWellnessGoal: formData.primaryWellnessGoal.trim()
      });
      
      const data = await response.json();
      
      // Update local storage
      localStorage.setItem('evolve_user', JSON.stringify(data.user));
      
      onComplete(data.user);
      
      toast({
        title: "Welcome to Evolve AI!",
        description: "Your wellness journey begins now.",
      });
      
      setLocation("/mvp-dashboard");
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(225,15%,6%)] to-[hsl(225,15%,4%)] px-6 py-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🎯</div>
          <h1 className="text-2xl font-bold mb-2">Let's personalize your experience</h1>
          <p className="text-white/70">
            Tell us a bit about yourself to get started
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <GlassmorphicCard className="p-6 space-y-6">
            <div>
              <Label htmlFor="age" className="text-white">Age</Label>
              <Input
                id="age"
                type="number"
                min="13"
                max="120"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                placeholder="Enter your age"
                className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="goal" className="text-white">
                What's your primary wellness goal?
              </Label>
              <Textarea
                id="goal"
                value={formData.primaryWellnessGoal}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryWellnessGoal: e.target.value }))}
                placeholder="e.g., I want to exercise regularly, reduce stress, and feel more energetic..."
                rows={4}
                className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
                required
              />
              <p className="text-sm text-white/60 mt-2">
                This helps our AI better understand and categorize your activities.
              </p>
            </div>
          </GlassmorphicCard>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:from-amber-500 hover:to-orange-600 font-semibold py-3 rounded-full"
          >
            {isLoading ? "Setting up..." : "Complete Setup"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </div>
    </div>
  );
}