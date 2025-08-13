"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Upload, Save, Edit, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { collectorService } from "@/lib/firebase-services";
import { pickupService } from "@/lib/firebase-services";
import type { CollectorProfile } from "@/types";

export default function CollectorProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { user } = useFirebaseAuth();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState<CollectorProfile>({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    licenseNumber: "",
    vehicleType: "truck",
    vehicleModel: "",
    vehicleCapacity: 1000,
    experience: "0-1 years",
    status: "active",
    rating: 0,
    completedPickups: 0,
    avatar: "/placeholder.svg?height=100&width=100",
    joinedDate: new Date().toISOString().split("T")[0],
    emergencyContact: "",
    workingHours: "8:00 AM - 6:00 PM",
    specializations: [],
  });

  const handleInputChange = (field: string, value: string | number) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const fetchCompletedPickupsCount = async (
    userId: string
  ): Promise<number> => {
    try {
      // Get all pickup requests for this collector
      const allPickups = await pickupService.getAllPickupRequests();
      const completedPickups = allPickups.filter(
        (pickup: any) =>
          pickup.collectorId === userId && pickup.status === "completed"
      );

      console.log(
        `✅ Found ${completedPickups.length} completed pickups for collector ${userId}`
      );
      return completedPickups.length;
    } catch (error) {
      console.error("Error fetching completed pickups count:", error);
      return 0; // Return 0 if there's an error
    }
  };

  const refreshCompletedPickups = async () => {
    const userId = user?.id;
    if (!userId) return;

    try {
      const actualCompletedCount = await fetchCompletedPickupsCount(userId);

      setProfileData((prev) => ({
        ...prev,
        completedPickups: actualCompletedCount,
      }));

      // Update the database with the correct count
      await collectorService.setCollectorProfile(userId, {
        ...profileData,
        completedPickups: actualCompletedCount,
        updatedAt: new Date(),
      });

      toast({
        title: "Pickups Count Updated",
        description: `Completed pickups count updated to ${actualCompletedCount}`,
      });

      console.log(
        `✅ Refreshed completed pickups count: ${actualCompletedCount}`
      );
    } catch (error) {
      console.error("Error refreshing completed pickups count:", error);
      toast({
        title: "Error",
        description: "Failed to refresh completed pickups count.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    const userId = user?.id;
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to save your profile.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Ensure required fields are filled
      if (!profileData.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Full name is required.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!profileData.email.trim()) {
        toast({
          title: "Validation Error",
          description: "Email is required.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Prepare profile data with proper timestamps
      const profileToSave = {
        ...profileData,
        id: userId,
        email: user?.email || profileData.email,
        updatedAt: new Date(),
        createdAt: profileData.createdAt || new Date(),
      };

      await collectorService.setCollectorProfile(userId, profileToSave);

      // Also save to localStorage as backup
      localStorage.setItem("collectorProfile", JSON.stringify(profileToSave));

      setProfileData(profileToSave);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description:
          "Your profile has been successfully saved to the database.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original data
    loadProfileData();
    setIsEditing(false);
  };

  const loadProfileData = async () => {
    const userId = user?.id;
    if (!userId) return;

    try {
      setInitialLoading(true);
      const savedProfile = await collectorService.getCollectorProfile(userId);

      if (savedProfile) {
        console.log("✅ Profile loaded from database:", savedProfile);

        // Fetch actual completed pickups count
        const actualCompletedCount = await fetchCompletedPickupsCount(userId);

        // Update profile with actual completed pickups count
        const updatedProfile = {
          ...savedProfile,
          completedPickups: actualCompletedCount,
        };

        setProfileData(updatedProfile);

        // Update the database with correct count if it's different
        if (savedProfile.completedPickups !== actualCompletedCount) {
          try {
            await collectorService.setCollectorProfile(userId, updatedProfile);
            console.log(
              `✅ Updated completed pickups count: ${actualCompletedCount}`
            );
          } catch (error) {
            console.warn(
              "⚠️ Could not update completed pickups count in database:",
              error
            );
          }
        }
      } else {
        console.log("📝 No profile found, creating default profile");
        // If no profile exists in Firebase, check localStorage or use default
        const localData = localStorage.getItem("collectorProfile");
        if (localData) {
          const parsedData = JSON.parse(localData);
          setProfileData({
            ...parsedData,
            id: userId,
            email: user?.email || parsedData.email,
            name: user?.name || parsedData.name,
          });
        } else {
          // Set default data with user info and fetch actual completed pickups
          const actualCompletedCount = await fetchCompletedPickupsCount(userId);

          const defaultProfile = {
            ...profileData,
            id: userId,
            email: user?.email || "",
            name: user?.name || "",
            joinedDate: new Date().toISOString().split("T")[0],
            createdAt: new Date(),
            completedPickups: actualCompletedCount,
          };
          setProfileData(defaultProfile);

          // Auto-save default profile to database
          try {
            await collectorService.setCollectorProfile(userId, defaultProfile);
            console.log(
              "✅ Default profile created in database with actual completed count"
            );
          } catch (error) {
            console.warn("⚠️ Could not create default profile:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData((prev) => ({
          ...prev,
          avatar: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
      toast({
        title: "Avatar Updated",
        description:
          "Your profile picture has been updated. Don't forget to save changes.",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const userId = user?.id;
      if (!userId) return;

      try {
        setInitialLoading(true);
        const savedProfile = await collectorService.getCollectorProfile(userId);

        if (savedProfile) {
          console.log("✅ Profile loaded from database:", savedProfile);

          // Fetch actual completed pickups count
          const actualCompletedCount = await fetchCompletedPickupsCount(userId);

          // Update profile with actual completed pickups count
          const updatedProfile = {
            ...savedProfile,
            completedPickups: actualCompletedCount,
          };

          setProfileData(updatedProfile);

          // Update the database with correct count if it's different
          if (savedProfile.completedPickups !== actualCompletedCount) {
            try {
              await collectorService.setCollectorProfile(
                userId,
                updatedProfile
              );
              console.log(
                `✅ Updated completed pickups count: ${actualCompletedCount}`
              );
            } catch (error) {
              console.warn(
                "⚠️ Could not update completed pickups count in database:",
                error
              );
            }
          }
        } else {
          console.log("📝 No profile found, creating default profile");
          // If no profile exists in Firebase, check localStorage or use default
          const localData = localStorage.getItem("collectorProfile");
          if (localData) {
            const parsedData = JSON.parse(localData);
            const actualCompletedCount = await fetchCompletedPickupsCount(
              userId
            );

            setProfileData({
              ...parsedData,
              id: userId,
              email: user?.email || parsedData.email,
              name: user?.name || parsedData.name,
              completedPickups: actualCompletedCount,
            });
          } else {
            // Set default data with user info and fetch actual completed pickups
            const actualCompletedCount = await fetchCompletedPickupsCount(
              userId
            );

            const defaultProfile = {
              ...profileData,
              id: userId,
              email: user?.email || "",
              name: user?.name || "",
              joinedDate: new Date().toISOString().split("T")[0],
              createdAt: new Date(),
              completedPickups: actualCompletedCount,
            };
            setProfileData(defaultProfile);

            // Auto-save default profile to database
            try {
              await collectorService.setCollectorProfile(
                userId,
                defaultProfile
              );
              console.log(
                "✅ Default profile created in database with actual completed count"
              );
            } catch (error) {
              console.warn("⚠️ Could not create default profile:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive",
        });
      } finally {
        setInitialLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id, user?.email, user?.name, toast]);

  // Show loading state while fetching initial data
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  // Show message if user is not logged in
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please Log In</h2>
          <p className="text-gray-600 mb-4">
            You need to be logged in to view your collector profile.
          </p>
          <Button asChild>
            <a href="/login">Go to Login</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your collector profile and vehicle information
          </p>
        </div>
        <div className="flex space-x-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={profileData.avatar || "/placeholder.svg"}
                  alt={profileData.name}
                />
                <AvatarFallback>
                  {profileData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <Button variant="outline" size="sm" asChild>
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </label>
                  </Button>
                </div>
              )}
              <div className="text-center">
                <h3 className="font-semibold text-lg">{profileData.name}</h3>
                <p className="text-gray-600">{profileData.email}</p>
                <Badge
                  variant={
                    profileData.status === "active" ? "default" : "secondary"
                  }
                  className="mt-2"
                >
                  {profileData.status}
                </Badge>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Completed Pickups:
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {profileData.completedPickups}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={refreshCompletedPickups}
                    className="h-6 w-6 p-0"
                    title="Refresh completed pickups count"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Experience:</span>
                <span className="font-medium">{profileData.experience}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Joined:</span>
                <span className="font-medium">
                  {new Date(profileData.joinedDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={!isEditing}
                className="flex items-center"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={profileData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                disabled={!isEditing}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency">Emergency Contact</Label>
              <Input
                id="emergency"
                value={profileData.emergencyContact}
                onChange={(e) =>
                  handleInputChange("emergencyContact", e.target.value)
                }
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
            <CardDescription>
              Your vehicle details and specifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="license">License Number</Label>
              <Input
                id="license"
                value={profileData.licenseNumber}
                onChange={(e) =>
                  handleInputChange("licenseNumber", e.target.value)
                }
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <Select
                value={profileData.vehicleType}
                onValueChange={(value) =>
                  handleInputChange("vehicleType", value)
                }
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="lorry">Lorry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (kg)</Label>
              <Input
                id="capacity"
                type="number"
                value={profileData.vehicleCapacity}
                onChange={(e) =>
                  handleInputChange(
                    "vehicleCapacity",
                    parseInt(e.target.value) || 0
                  )
                }
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
