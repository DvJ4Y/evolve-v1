import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import GlassmorphicCard from "@/components/glassmorphic";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    weight: "",
    height: "",
    goals: ""
  });

  const steps = [
    {
      title: "Welcome to Evolve AI",
      subtitle: "Your holistic wellness companion",
      component: WelcomeStep,
    },
    {
      title: "Let's get to know you",
      subtitle: "Basic information",
      component: BasicInfoStep,
    },
    {
      title: "What are your wellness goals?",
      subtitle: "Tell us about your aspirations",
      component: GoalsStep,
    },
    {
      title: "You're all set!",
      subtitle: "Ready to start your journey",
      component: CompletionStep,
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    toast({
      title: "Welcome to Evolve AI!",
      description: "Your wellness journey begins now.",
    });
    setLocation("/");
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="mobile-container min-h-screen flex flex-col">
      {/* Progress indicator */}
      <div className="safe-area-top px-6 py-4">
        <div className="flex space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full flex-1 transition-colors ${
                index <= currentStep ? "bg-rose-gold" : "bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">
            {steps[currentStep].title}
          </h1>
          <p className="text-white/70">
            {steps[currentStep].subtitle}
          </p>
        </div>

        <CurrentStepComponent 
          formData={formData}
          updateFormData={updateFormData}
        />
      </div>

      {/* Navigation */}
      <div className="px-6 pb-8 safe-area-bottom">
        <div className="flex space-x-4">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 touch-target glassmorphic border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="flex-1 bg-rose-gold text-charcoal hover:bg-rose-gold/90 touch-target"
          >
            {currentStep === steps.length - 1 ? "Complete" : "Next"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function WelcomeStep() {
  return (
    <GlassmorphicCard className="p-8 text-center">
      <div className="text-6xl mb-6">🌟</div>
      <h2 className="text-xl font-semibold mb-4">
        Transform your wellness journey
      </h2>
      <p className="text-white/70 leading-relaxed">
        Evolve AI helps you track and improve your Body, Mind, and Soul 
        through personalized insights and voice-first logging.
      </p>
    </GlassmorphicCard>
  );
}

function BasicInfoStep({ formData, updateFormData }: any) {
  return (
    <GlassmorphicCard className="p-6 space-y-6">
      <div>
        <Label htmlFor="name" className="text-white">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          placeholder="Your name"
          className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50"
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="age" className="text-white">Age</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => updateFormData({ age: e.target.value })}
            placeholder="28"
            className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
        
        <div>
          <Label htmlFor="weight" className="text-white">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            value={formData.weight}
            onChange={(e) => updateFormData({ weight: e.target.value })}
            placeholder="70"
            className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
        
        <div>
          <Label htmlFor="height" className="text-white">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            value={formData.height}
            onChange={(e) => updateFormData({ height: e.target.value })}
            placeholder="175"
            className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
      </div>
    </GlassmorphicCard>
  );
}

function GoalsStep({ formData, updateFormData }: any) {
  return (
    <GlassmorphicCard className="p-6">
      <div className="space-y-4">
        <Label htmlFor="goals" className="text-white">
          Tell us about your wellness goals
        </Label>
        <Textarea
          id="goals"
          value={formData.goals}
          onChange={(e) => updateFormData({ goals: e.target.value })}
          placeholder="I want to exercise 3 times a week, meditate daily, and practice gratitude. I'd like to reduce stress and feel more energetic..."
          rows={6}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
        />
        <p className="text-sm text-white/60">
          Describe your aspirations for physical health, mental wellness, and spiritual growth. 
          Our AI will help categorize and track these goals.
        </p>
      </div>
    </GlassmorphicCard>
  );
}

function CompletionStep() {
  return (
    <GlassmorphicCard className="p-8 text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h2 className="text-xl font-semibold mb-4">
        Ready to evolve!
      </h2>
      <p className="text-white/70 leading-relaxed mb-6">
        Your personalized wellness dashboard is ready. Start logging activities 
        with your voice and watch your progress unfold.
      </p>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl mb-2">💪</div>
          <div className="text-sm text-white/70">Body</div>
        </div>
        <div>
          <div className="text-2xl mb-2">🧠</div>
          <div className="text-sm text-white/70">Mind</div>
        </div>
        <div>
          <div className="text-2xl mb-2">✨</div>
          <div className="text-sm text-white/70">Soul</div>
        </div>
      </div>
    </GlassmorphicCard>
  );
}
