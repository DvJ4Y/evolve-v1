import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type PillarType, type InsertActivityLog } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useWellness(userId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Dashboard data
  const useDashboard = () => {
    return useQuery({
      queryKey: [`/api/dashboard/${userId}`],
    });
  };

  // Pillar data
  const usePillar = (pillar: PillarType) => {
    return useQuery({
      queryKey: [`/api/pillar/${userId}/${pillar}`],
    });
  };

  // Activities
  const useActivities = (pillar?: PillarType) => {
    const queryKey = pillar 
      ? [`/api/activities/${userId}`, { pillar }]
      : [`/api/activities/${userId}`];
    
    return useQuery({
      queryKey,
    });
  };

  // Goals
  const useGoals = () => {
    return useQuery({
      queryKey: [`/api/goals/${userId}`],
    });
  };

  // Activity logging mutation
  const useLogActivity = () => {
    return useMutation({
      mutationFn: async (activity: InsertActivityLog) => {
        const response = await apiRequest("POST", "/api/activities", activity);
        return response.json();
      },
      onSuccess: () => {
        toast({
          title: "Activity Logged",
          description: "Your wellness activity has been recorded successfully.",
        });
        queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${userId}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/activities/${userId}`] });
      },
      onError: () => {
        toast({
          title: "Logging Failed", 
          description: "Failed to log your activity. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  // Goal creation mutation
  const useCreateGoal = () => {
    return useMutation({
      mutationFn: async (goal: any) => {
        const response = await apiRequest("POST", "/api/goals", goal);
        return response.json();
      },
      onSuccess: () => {
        toast({
          title: "Goal Created",
          description: "Your wellness goal has been set successfully.",
        });
        queryClient.invalidateQueries({ queryKey: [`/api/goals/${userId}`] });
      },
      onError: () => {
        toast({
          title: "Goal Creation Failed",
          description: "Failed to create your goal. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  return {
    useDashboard,
    usePillar,
    useActivities,
    useGoals,
    useLogActivity,
    useCreateGoal,
  };
}
