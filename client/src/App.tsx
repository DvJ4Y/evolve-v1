import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthWrapper from "@/components/AuthWrapper";
import MVPOnboarding from "@/pages/mvp-onboarding";
import MVPDashboard from "@/pages/mvp-dashboard";
import Dashboard from "@/pages/dashboard";
import Onboarding from "@/pages/onboarding";
import Profile from "@/pages/profile";
import Pillar from "@/pages/pillar";
import NotFound from "@/pages/not-found";
import { useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  primaryWellnessGoal?: string;
}

function MVPRouter() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  return (
    <AuthWrapper>
      {(user: User) => {
        // Check if user needs onboarding
        if (!user.primaryWellnessGoal) {
          return (
            <MVPOnboarding 
              user={user} 
              onComplete={(updatedUser) => setCurrentUser(updatedUser)} 
            />
          );
        }

        return (
          <Switch>
            <Route path="/mvp-dashboard" component={() => <MVPDashboard user={currentUser || user} />} />
            <Route path="/" component={() => <MVPDashboard user={currentUser || user} />} />
            
            {/* Legacy routes for development */}
            <Route path="/legacy/dashboard" component={Dashboard} />
            <Route path="/legacy/onboarding" component={Onboarding} />
            <Route path="/legacy/profile" component={Profile} />
            <Route path="/legacy/pillar/:pillar" component={Pillar} />
            
            <Route component={NotFound} />
          </Switch>
        );
      }}
    </AuthWrapper>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="w-full max-w-md mx-auto min-h-screen bg-gradient-to-b from-[hsl(225,15%,6%)] to-[hsl(225,15%,4%)] text-white relative overflow-hidden">
          {/* Enhanced Sci-Fi Background Pattern with Complex Floating Animation */}
          <div className="sci-fi-bg">
            <div className="floating-orb"></div>
            <div className="floating-orb"></div>
            <div className="floating-orb"></div>
            <div className="floating-orb"></div>
            
            {/* Floating particles for extra sci-fi effect */}
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 12}s`,
                  animationDuration: `${8 + Math.random() * 8}s`
                }}
              />
            ))}
          </div>
          
          <div className="relative z-10">
            <Toaster />
            <MVPRouter />
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;