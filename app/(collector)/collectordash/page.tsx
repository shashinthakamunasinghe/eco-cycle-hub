"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Truck,
  Package,
  CheckCircle,
  MapPin,
  Battery,
  Navigation,
  User,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { pickupService, collectorService } from "@/lib/firebase-services";
import type { PickupRequest, CollectorProfile } from "@/types";

export default function CollectorDashboard() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [assignedPickups, setAssignedPickups] = useState<PickupRequest[]>([]);
  const [allPickups, setAllPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [collectorProfile, setCollectorProfile] =
    useState<CollectorProfile | null>(null);
  const { toast } = useToast();
  const { user } = useFirebaseAuth();

  // Stats computed from ALL pickup data (including completed)
  const stats = {
    assignedPickups: assignedPickups.filter((p) => p.status === "assigned")
      .length,
    completedToday: allPickups.filter(
      (p) =>
        p.status === "completed" &&
        p.completedAt &&
        new Date(p.completedAt).toDateString() === new Date().toDateString()
    ).length,
    totalCapacity: 1000, // kg - could be fetched from collector profile
    currentLoad: assignedPickups
      .filter((p) => p.status === "on-way" || p.status === "picked-up")
      .reduce((sum, p) => sum + p.weight, 0),
  };

  const loadPickups = useCallback(async () => {
    console.log(
      "🔄 Loading collector profile and pickups for user:",
      user?.id,
      user?.email
    );

    if (!user?.id || !user?.email) {
      console.log("❌ No user ID or email found, skipping pickup load");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // First, get the collector profile for this user
      console.log("📡 Fetching collector profile for email:", user.email);
      const allCollectors = await collectorService.getAllCollectorProfiles();
      const userCollectorProfile = allCollectors.find(
        (c) => c.email === user.email
      );

      if (!userCollectorProfile) {
        console.log("No collector profile found for user email:", user.email);
        toast({
          title: "Profile not found",
          description: "No collector profile found for your account",
          variant: "destructive",
        });
        return;
      }

      console.log("Found collector profile:", {
        id: userCollectorProfile.id,
        name: userCollectorProfile.name,
        email: userCollectorProfile.email,
        isAvailable: userCollectorProfile.isAvailable,
      });
      setCollectorProfile(userCollectorProfile);

      // Set availability from profile
      setIsAvailable(userCollectorProfile.isAvailable !== false); // Default to true if undefined

      // Now get pickups using the collector profile ID
      console.log(
        "📡 Fetching pickups for collector ID:",
        userCollectorProfile.id
      );
      const pickups = await pickupService.getPickupRequestsByCollector(
        userCollectorProfile.id
      );
      console.log("📦 Raw pickups from Firebase:", pickups);

      // Store ALL pickups for stats calculation (including completed)
      setAllPickups(pickups);

      // Filter to show only active pickups in the UI (not completed or cancelled)
      const activePickups = pickups.filter(
        (p) => p.status !== "completed" && p.status !== "cancelled"
      );
      console.log("✅ Active pickups after filtering:", activePickups);
      console.log("📊 Total pickups (including completed):", pickups.length);

      setAssignedPickups(activePickups);
    } catch (error) {
      console.error("❌ Error loading pickups:", error);
      toast({
        title: "Error",
        description: "Failed to load pickup requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.email, toast]);

  useEffect(() => {
    loadPickups();
  }, [loadPickups]);

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    if (!user?.id || !user?.email) return;

    const interval = setInterval(() => {
      console.log("🔄 Auto-refreshing pickups...");
      loadPickups();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [loadPickups, user?.id, user?.email]);

  const updatePickupStatus = async (
    id: string,
    newStatus: PickupRequest["status"]
  ) => {
    try {
      await pickupService.updateStatus(id, newStatus);

      // Refresh pickup data to get latest state
      await loadPickups();

      toast({
        title: "Status updated",
        description: `Pickup status updated to ${newStatus.replace("-", " ")}`,
      });
    } catch (error) {
      console.error("Error updating pickup status:", error);
      toast({
        title: "Error",
        description: "Failed to update pickup status",
        variant: "destructive",
      });
    }
  };

  const handleAvailabilityChange = async (available: boolean) => {
    try {
      setIsAvailable(available);

      // Update collector availability in both places for consistency
      if (collectorProfile?.id) {
        await Promise.all([
          // Update collector profile
          collectorService.updateCollectorProfile(collectorProfile.id, {
            isAvailable: available,
            lastActivity: new Date().toISOString(),
          }),
          // Update user record as well for admin dashboard sync
          collectorService.updateCollectorAvailability(
            collectorProfile.id,
            available
          ),
        ]);

        console.log(
          `✅ Availability updated: ${
            available ? "Online" : "Offline"
          } for collector ${collectorProfile.name}`
        );
      }

      toast({
        title: available ? "You're now available" : "You're now offline",
        description: available
          ? "You can receive new pickup assignments"
          : "You won't receive new assignments until you go online",
      });
    } catch (error) {
      console.error("Error updating availability:", error);
      toast({
        title: "Error",
        description: "Failed to update availability status",
        variant: "destructive",
      });
      // Revert local state on error
      setIsAvailable(!available);
    }
  };

  const acceptPickup = async (id: string) => {
    try {
      await updatePickupStatus(id, "on-way");
      toast({
        title: "Pickup accepted",
        description:
          "You have accepted the pickup request and marked as on-way.",
      });
    } catch (error) {
      console.error("Error accepting pickup:", error);
      toast({
        title: "Error",
        description: "Failed to accept pickup request",
        variant: "destructive",
      });
    }
  };

  const rejectPickup = async (id: string) => {
    try {
      // Update status back to pending and remove collector assignment
      await pickupService.updatePickupRequest(id, {
        status: "pending",
        collectorId: "",
        collectorName: "",
      });

      // Refresh pickup data to get latest state
      await loadPickups();

      toast({
        title: "Pickup rejected",
        description:
          "The pickup request has been rejected and returned to the pool.",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error rejecting pickup:", error);
      toast({
        title: "Error",
        description: "Failed to reject pickup request",
        variant: "destructive",
      });
    }
  };

  const navigateToLocation = (pickup: PickupRequest) => {
    if (pickup.location && pickup.location.lat && pickup.location.lng) {
      const { lat, lng } = pickup.location;
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
      window.open(googleMapsUrl, "_blank");
      toast({
        title: "Navigation started",
        description: `Opening Google Maps navigation to ${pickup.industryName}`,
      });
    } else if (pickup.location?.address) {
      // Fallback to address search
      const encodedAddress = encodeURIComponent(pickup.location.address);
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      window.open(googleMapsUrl, "_blank");
      toast({
        title: "Navigation started",
        description: `Opening Google Maps search for ${pickup.location.address}`,
      });
    } else {
      toast({
        title: "Navigation unavailable",
        description: "Location information not available for this pickup",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "on-way":
        return "bg-purple-100 text-purple-800";
      case "picked-up":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const capacityPercentage = (stats.currentLoad / stats.totalCapacity) * 100;

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header - Mobile optimized */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Collector Dashboard
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-full p-2 sm:p-2.5 shadow-lg">
              <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <Label htmlFor="availability" className="text-sm">
              Available for pickups
            </Label>
            <Switch
              id="availability"
              checked={isAvailable}
              onCheckedChange={handleAvailabilityChange}
            />
          </div>
          <Badge
            variant={isAvailable ? "default" : "secondary"}
            className="text-xs"
          >
            {isAvailable ? "Online" : "Offline"}
          </Badge>
        </div>
      </div>

      {/* Stats Cards - Mobile responsive grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Assigned
            </CardTitle>
            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {stats.assignedPickups}
            </div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Completed
            </CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {stats.completedToday}
            </div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card className="col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Capacity
            </CardTitle>
            <Truck className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-orange-600">
              {capacityPercentage.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.currentLoad}kg / {stats.totalCapacity}kg
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-orange-600 h-2 rounded-full transition-all"
                style={{ width: `${capacityPercentage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              GPS Status
            </CardTitle>
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">
              Active
            </div>
            <p className="text-xs text-muted-foreground">Tracking enabled</p>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Pickups */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Assigned Pickups</CardTitle>
          <CardDescription>Your current pickup assignments</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">
                  Loading pickup assignments...
                </p>
              </div>
            </div>
          ) : assignedPickups.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No assigned pickups
              </h3>
              <p className="text-gray-600">
                You don't have any pickup assignments at the moment.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {assignedPickups.map((pickup) => (
                  <div
                    key={pickup.id}
                    className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold text-sm sm:text-base truncate">
                            {pickup.industryName}
                          </h3>
                          <Badge
                            className={`${getStatusColor(
                              pickup.status
                            )} text-xs`}
                          >
                            {pickup.status.replace("-", " ")}
                          </Badge>
                          <Badge
                            className={`${getPriorityColor(
                              pickup.priority
                            )} text-xs`}
                          >
                            {pickup.priority}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Package className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">
                              {pickup.wasteType} - {pickup.weight}kg
                            </span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
                            <span className="break-words">
                              {pickup.location?.address ||
                                "Address not available"}
                            </span>
                          </div>
                          {pickup.location?.lat && (
                            <div className="flex items-center space-x-2">
                              <Navigation className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="text-xs truncate">
                                {pickup.location.lat.toFixed(4)},{" "}
                                {pickup.location.lng.toFixed(4)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col gap-2 sm:space-y-2 sm:space-x-0">
                        {pickup.status === "assigned" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => acceptPickup(pickup.id)}
                              className="bg-green-600 hover:bg-green-700 text-xs flex-1 sm:flex-none"
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectPickup(pickup.id)}
                              className="text-xs flex-1 sm:flex-none"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {pickup.status === "on-way" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updatePickupStatus(pickup.id, "picked-up")
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-xs"
                          >
                            Mark Picked Up
                          </Button>
                        )}
                        {pickup.status === "picked-up" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updatePickupStatus(pickup.id, "completed")
                            }
                            className="bg-purple-600 hover:bg-purple-700 text-xs"
                          >
                            Complete
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigateToLocation(pickup)}
                          className="text-xs"
                        >
                          Navigate
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" asChild>
                  <Link href="/assigned-pickups">View All Pickups</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions & Vehicle Status - Mobile responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start text-sm" asChild>
              <Link href="/collector-map">
                <MapPin className="mr-2 h-4 w-4" />
                View Map & Navigate
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-sm"
              asChild
            >
              <Link href="/assigned-pickups">
                <Package className="mr-2 h-4 w-4" />
                Manage Pickups
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-sm"
              asChild
            >
              <Link href="/collector-profile">
                <Truck className="mr-2 h-4 w-4" />
                Update Vehicle Info
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Vehicle Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Fuel Level:</span>
                <div className="flex items-center space-x-2">
                  <Battery className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">85%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">GPS Status:</span>
                <span className="text-sm font-medium text-green-600">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Updated:</span>
                <span className="text-sm">2 minutes ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
