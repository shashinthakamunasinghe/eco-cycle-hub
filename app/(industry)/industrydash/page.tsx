"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Truck,
  Clock,
  CheckCircle,
  Package,
  TrendingUp,
  MapPin,
  Plus,
  History,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { pickupService, industryService } from "@/lib/firebase-services";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { getCurrentLocationWithAddress } from "@/lib/location-utils";
import type { PickupRequest } from "@/types";

export default function IndustryDashboard() {
  const { toast } = useToast();
  const { user } = useFirebaseAuth();
  const [location, setLocation] = useState("Loading...");
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [recentRequests, setRecentRequests] = useState<PickupRequest[]>([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    totalWaste: 0,
  });

  // Load requests from Firestore
  const loadRequests = useCallback(async () => {
    if (!user?.id) return;

    try {
      const requests = await pickupService.getPickupRequestsByIndustry(user.id);
      setRecentRequests(requests.slice(0, 3)); // Show only latest 3

      // Calculate stats
      const total = requests.length;
      const pending = requests.filter(
        (r: PickupRequest) => r.status === "pending"
      ).length;
      const completed = requests.filter(
        (r: PickupRequest) => r.status === "completed"
      ).length;
      const totalWeight = requests.reduce(
        (sum: number, r: PickupRequest) => sum + (r.weight || 0),
        0
      );

      setStats({
        totalRequests: total,
        pendingRequests: pending,
        completedRequests: completed,
        totalWaste: totalWeight,
      });
    } catch (error) {
      console.error("Error loading requests:", error);
      toast({
        title: "Error",
        description: "Failed to load requests. Please try again.",
        variant: "destructive",
      });
    }
  }, [user?.id, toast]);

  // Load location from industry profile
  const loadLocation = useCallback(async () => {
    if (!user?.id) return;

    try {
      const locationInfo = await industryService.getIndustryLocation(user.id);
      
      if (locationInfo.location && locationInfo.locationAddress) {
        setLocation(locationInfo.locationAddress);
        setLocationEnabled(locationInfo.autoLocation);
      } else {
        setLocation("Location not set");
        setLocationEnabled(false);
      }
    } catch (error) {
      console.error("Error loading location:", error);
      setLocation("Unable to load location");
      setLocationEnabled(false);
    }
  }, [user?.id]);

  // Refresh location data (useful after profile updates)
  const refreshLocation = useCallback(async () => {
    await loadLocation();
  }, [loadLocation]);

  useEffect(() => {
    if (user?.id) {
      loadRequests();
      loadLocation();
    }
  }, [user?.id, loadRequests, loadLocation]);

  // Refresh location when window gains focus (useful when returning from profile page)
  useEffect(() => {
    const handleFocus = () => {
      if (user?.id) {
        refreshLocation();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user?.id, refreshLocation]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "on-way":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const updateLocation = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in to update your location.",
        variant: "destructive",
      });
      return;
    }

    setLocationLoading(true);

    try {
      // Get current location with address using Google Maps API
      const locationData = await getCurrentLocationWithAddress();
      
      // Update the industry profile in Firestore
      await industryService.updateIndustryLocation(
        user.id,
        locationData.coordinates,
        locationData.address
      );

      // Update local state
      setLocation(locationData.address);
      setLocationEnabled(true);

      toast({
        title: "Location updated successfully",
        description: `Your location has been updated to: ${locationData.address}`,
      });
    } catch (error) {
      console.error("Error updating location:", error);
      toast({
        title: "Location Update Failed",
        description: error instanceof Error ? error.message : "Unable to update location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLocationLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Button asChild>
          <Link href="/request">
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              All time requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingRequests}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.completedRequests}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Waste</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalWaste} kg
            </div>
            <p className="text-xs text-muted-foreground">Total collected</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Pickup Requests</CardTitle>
          <CardDescription>
            Your latest waste pickup requests and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentRequests.length > 0 ? (
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Package className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{request.wasteType}</h3>
                      <p className="text-sm text-gray-500">
                        {request.weight} kg • {request.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.replace("-", " ")}
                    </Badge>
                    <div className="text-sm text-gray-500">
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No pickup requests yet.</p>
              <Button asChild className="mt-4">
                <Link href="/request">Create Your First Request</Link>
              </Button>
            </div>
          )}
          {recentRequests.length > 0 && (
            <div className="mt-4 text-center">
              <Button variant="outline" asChild>
                <Link href="/history">View All Requests</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" asChild>
              <Link href="/request">
                <Plus className="mr-2 h-4 w-4" />
                Request New Pickup
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/history">
                <History className="mr-2 h-4 w-4" />
                View Pickup History
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/industry-profile">
                <User className="mr-2 h-4 w-4" />
                Update Profile
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className={`h-5 w-5 ${locationEnabled ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="text-sm">
                {locationEnabled ? 'Auto-location enabled' : 'Location not set'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Current location: {location}
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={updateLocation}
                disabled={locationLoading}
              >
                {locationLoading ? "Updating..." : "Update Location"}
              </Button>
              {!locationEnabled && (
                <Button variant="link" size="sm" asChild>
                  <Link href="/industry-profile">
                    Set in Profile
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
