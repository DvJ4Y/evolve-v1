import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Edit, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import GlassmorphicCard from "@/components/glassmorphic";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type User } from "@shared/schema";

export default function Profile() {
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // For demo purposes, using userId 1
  const userId = 1;

  const { data: user, isLoading } = useQuery<User>({
    queryKey: [`/api/user/${userId}`],
  });

  const updateUserMutation = useMutation({
    mutationFn: async (updates: Partial<User>) => {
      const response = await apiRequest("PUT", `/api/user/${userId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setEditMode(false);
      setEditedUser({});
      queryClient.invalidateQueries({ queryKey: [`/api/user/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${userId}`] });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (Object.keys(editedUser).length > 0) {
      updateUserMutation.mutate(editedUser);
    } else {
      setEditMode(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditedUser({});
  };

  const updateField = (field: keyof User, value: any) => {
    setEditedUser(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="mobile-container">
        <div className="safe-area-top p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-white/10 rounded mb-4"></div>
            <div className="h-24 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const displayUser = { ...user, ...editedUser };

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="safe-area-top px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="icon" className="glassmorphic rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Profile</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editMode ? handleSave() : setEditMode(true)}
          className="glassmorphic rounded-full"
          disabled={updateUserMutation.isPending}
        >
          <Edit className="w-5 h-5" />
        </Button>
      </div>

      <div className="px-6 pb-32">
        {/* Profile Header */}
        <GlassmorphicCard className="p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={displayUser?.avatar} alt="Profile" />
              <AvatarFallback className="bg-rose-gold text-charcoal text-xl font-bold">
                {displayUser?.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {editMode ? (
                <Input
                  value={editedUser.name || displayUser?.name || ""}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="bg-white/10 border-white/20 text-white text-lg font-bold"
                  placeholder="Your name"
                />
              ) : (
                <h2 className="text-xl font-bold">{displayUser?.name}</h2>
              )}
              {editMode ? (
                <Input
                  value={editedUser.email || displayUser?.email || ""}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="bg-white/10 border-white/20 text-white/70 mt-2"
                  placeholder="Your email"
                />
              ) : (
                <p className="text-white/70">{displayUser?.email}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-rose-gold">
                {displayUser?.currentStreak || 0}
              </div>
              <div className="text-xs text-white/70">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-rose-gold">
                {displayUser?.longestStreak || 0}
              </div>
              <div className="text-xs text-white/70">Longest Streak</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-rose-gold">
                {new Date().getTime() - new Date(displayUser?.createdAt || 0).getTime() < 1000 * 60 * 60 * 24 * 7 ? 
                  Math.ceil((new Date().getTime() - new Date(displayUser?.createdAt || 0).getTime()) / (1000 * 60 * 60 * 24)) : 
                  Math.ceil((new Date().getTime() - new Date(displayUser?.createdAt || 0).getTime()) / (1000 * 60 * 60 * 24 * 7))
                }
              </div>
              <div className="text-xs text-white/70">
                {new Date().getTime() - new Date(displayUser?.createdAt || 0).getTime() < 1000 * 60 * 60 * 24 * 7 ? "Days" : "Weeks"}
              </div>
            </div>
          </div>

          {editMode && (
            <div className="flex space-x-2 mt-4">
              <Button
                onClick={handleSave}
                className="flex-1 bg-rose-gold text-charcoal"
                disabled={updateUserMutation.isPending}
              >
                Save Changes
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 glassmorphic border-white/20 text-white"
              >
                Cancel
              </Button>
            </div>
          )}
        </GlassmorphicCard>

        {/* Tabs */}
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 glassmorphic">
            <TabsTrigger value="info" className="data-[state=active]:bg-rose-gold data-[state=active]:text-charcoal">
              Info
            </TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-rose-gold data-[state=active]:text-charcoal">
              Goals
            </TabsTrigger>
            <TabsTrigger value="supplements" className="data-[state=active]:bg-rose-gold data-[state=active]:text-charcoal">
              Supplements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <GlassmorphicCard className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-white/70">Age</Label>
                  {editMode ? (
                    <Input
                      type="number"
                      value={editedUser.age || displayUser?.age || ""}
                      onChange={(e) => updateField("age", parseInt(e.target.value))}
                      className="bg-white/10 border-white/20 text-white mt-1"
                      placeholder="Age"
                    />
                  ) : (
                    <div className="text-white font-semibold mt-1">
                      {displayUser?.age || "Not set"}
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-white/70">Weight (kg)</Label>
                  {editMode ? (
                    <Input
                      type="number"
                      step="0.1"
                      value={editedUser.weight || displayUser?.weight || ""}
                      onChange={(e) => updateField("weight", e.target.value)}
                      className="bg-white/10 border-white/20 text-white mt-1"
                      placeholder="Weight"
                    />
                  ) : (
                    <div className="text-white font-semibold mt-1">
                      {displayUser?.weight || "Not set"}
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-white/70">Height (cm)</Label>
                  {editMode ? (
                    <Input
                      type="number"
                      step="0.1"
                      value={editedUser.height || displayUser?.height || ""}
                      onChange={(e) => updateField("height", e.target.value)}
                      className="bg-white/10 border-white/20 text-white mt-1"
                      placeholder="Height"
                    />
                  ) : (
                    <div className="text-white font-semibold mt-1">
                      {displayUser?.height || "Not set"}
                    </div>
                  )}
                </div>
              </div>
            </GlassmorphicCard>
          </TabsContent>

          <TabsContent value="goals">
            <div className="space-y-4">
              {/* Body Goals */}
              <GlassmorphicCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-rose-gold">Body Goals</h3>
                  <Badge variant="outline" className="border-rose-gold text-rose-gold">
                    {displayUser?.goals?.body?.length || 0}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {displayUser?.goals?.body?.map((goal, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-sm">{goal}</span>
                    </div>
                  )) || <p className="text-white/70 text-sm">No body goals set</p>}
                </div>
              </GlassmorphicCard>

              {/* Mind Goals */}
              <GlassmorphicCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-green-400">Mind Goals</h3>
                  <Badge variant="outline" className="border-green-400 text-green-400">
                    {displayUser?.goals?.mind?.length || 0}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {displayUser?.goals?.mind?.map((goal, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-sm">{goal}</span>
                    </div>
                  )) || <p className="text-white/70 text-sm">No mind goals set</p>}
                </div>
              </GlassmorphicCard>

              {/* Soul Goals */}
              <GlassmorphicCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-purple-400">Soul Goals</h3>
                  <Badge variant="outline" className="border-purple-400 text-purple-400">
                    {displayUser?.goals?.soul?.length || 0}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {displayUser?.goals?.soul?.map((goal, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-sm">{goal}</span>
                    </div>
                  )) || <p className="text-white/70 text-sm">No soul goals set</p>}
                </div>
              </GlassmorphicCard>
            </div>
          </TabsContent>

          <TabsContent value="supplements">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Supplement Library</h3>
                <Button size="sm" className="bg-rose-gold text-charcoal">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              {displayUser?.supplements?.map((supplement, index) => (
                <GlassmorphicCard key={supplement.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{supplement.name}</h4>
                      <p className="text-sm text-white/70">
                        {supplement.dosage} • {supplement.frequency}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/70 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </GlassmorphicCard>
              )) || (
                <GlassmorphicCard className="p-6 text-center">
                  <p className="text-white/70">No supplements added yet</p>
                  <Button className="mt-4 bg-rose-gold text-charcoal">
                    Add Your First Supplement
                  </Button>
                </GlassmorphicCard>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
