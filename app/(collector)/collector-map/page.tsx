"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Navigation,
  Package,
  Loader2,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CollectorMapComponent } from "@/components/Collector/CollectorMapComponent";
import { pickupService, collectorService } from "@/lib/firebase-services";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import type { PickupRequest as FirebasePickupRequest, User } from "@/types";

interface PickupRequest {
  id: string;
  industryName: string;
  wasteType: string;
  weight: number;
  status: "assigned" | "on-way" | "picked-up" | "completed";
  address: string;
  coordinates: { lat: number; lng: number };
  requestedAt?: Date;
  notes?: string;
}

export default function CollectorMapPage() {
  const [assignedPickups, setAssignedPickups] = useState<PickupRequest[]>([]);
  const [currentLocation, setCurrentLocation] = useState<
    { lat: number; lng: number } | undefined
  >();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useFirebaseAuth();

  useEffect(() => {
    const loadAssignedPickups = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Get collector profile by email
        const collectors = await collectorService.getAllCollectors();
        const collectorProfile = collectors.find(
          (c: User) => c.email === user.email
        );

        if (!collectorProfile) {
          console.log("No collector profile found for user:", user.email);
          setLoading(false);
          return;
        }

        // Get assigned pickup requests for this collector
        const allPickups = await pickupService.getAllPickupRequests();
        const assignedPickupRequests = allPickups.filter(
          (pickup: FirebasePickupRequest) =>
            pickup.collectorId === collectorProfile.id &&
            (pickup.status === "assigned" ||
              pickup.status === "on-way" ||
              pickup.status === "picked-up")
        );

        // Transform to our interface
        const transformedPickups: PickupRequest[] = assignedPickupRequests.map(
          (pickup: FirebasePickupRequest) => ({
            id: pickup.id,
            industryName: pickup.industryName,
            wasteType: pickup.wasteType,
            weight: pickup.weight,
            status: pickup.status as PickupRequest["status"],
            address: pickup.location.address,
            coordinates: { lat: pickup.location.lat, lng: pickup.location.lng },
            requestedAt: pickup.requestedAt,
            notes: (pickup as any).notes || "",
          })
        );

        setAssignedPickups(transformedPickups);

        if (transformedPickups.length === 0) {
          toast({
            title: "No Assigned Pickups",
            description:
              "You don't have any assigned pickup requests at the moment.",
          });
        }
      } catch (error) {
        console.error("Error loading assigned pickups:", error);
        toast({
          title: "Error",
          description: "Failed to load assigned pickups",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadAssignedPickups();
  }, [user?.email, toast]);

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to Colombo coordinates
          setCurrentLocation({ lat: 6.9271, lng: 79.8612 });
        }
      );
    } else {
      // Fallback to Colombo coordinates
      setCurrentLocation({ lat: 6.9271, lng: 79.8612 });
    }
  }, []);

  const [navigationMode, setNavigationMode] = useState(false);
  const [selectedNavPickup, setSelectedNavPickup] =
    useState<PickupRequest | null>(null);

  const navigateToLocation = (pickup: PickupRequest) => {
    setSelectedNavPickup(pickup);
    setNavigationMode(true);

    toast({
      title: "Navigation Mode Activated",
      description: `Showing internal navigation to ${pickup.industryName}`,
    });
  };

  const updatePickupStatus = async (
    pickupId: string,
    newStatus: PickupRequest["status"]
  ) => {
    try {
      // Update in Firebase
      await pickupService.updateStatus(pickupId, newStatus);

      // Update local state
      setAssignedPickups((prev) => {
        const updated = prev.map((pickup) =>
          pickup.id === pickupId ? { ...pickup, status: newStatus } : pickup
        );
        return updated;
      });

      toast({
        title: "Status updated",
        description: `Pickup status changed to ${newStatus.replace("-", " ")}`,
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

  return (
    <div className="space-y-6">
      {!navigationMode ? (
        <>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Map View</h1>
            <p className="text-gray-600 mt-2">
              Navigate to your assigned pickup locations
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map Container */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Pickup Locations</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          Loading your assigned pickups...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <CollectorMapComponent
                      pickups={assignedPickups}
                      currentLocation={currentLocation}
                      onNavigateToPickup={navigateToLocation}
                      onPickupStatusUpdate={updatePickupStatus}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Pickup List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Your Pickups</h2>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading pickups...</span>
                </div>
              ) : assignedPickups.length > 0 ? (
                assignedPickups.map((pickup) => (
                  <Card key={pickup.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{pickup.industryName}</h3>
                          <Badge
                            variant={
                              pickup.status === "on-way"
                                ? "default"
                                : pickup.status === "picked-up"
                                ? "secondary"
                                : pickup.status === "completed"
                                ? "outline"
                                : "secondary"
                            }
                          >
                            {pickup.status.replace("-", " ")}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4" />
                            <span>
                              {pickup.wasteType} - {pickup.weight}kg
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{pickup.address}</span>
                          </div>
                          {pickup.notes && (
                            <div className="text-xs text-gray-500 mt-1">
                              <strong>Notes:</strong> {pickup.notes}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => navigateToLocation(pickup)}
                          >
                            <Navigation className="h-4 w-4 mr-2" />
                            Navigate
                          </Button>
                          {pickup.status === "assigned" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updatePickupStatus(pickup.id, "on-way")
                              }
                            >
                              Start Journey
                            </Button>
                          )}
                          {pickup.status === "on-way" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updatePickupStatus(pickup.id, "picked-up")
                              }
                            >
                              Picked Up
                            </Button>
                          )}
                          {pickup.status === "picked-up" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updatePickupStatus(pickup.id, "completed")
                              }
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No assigned pickups</p>
                  <p className="text-gray-400 text-xs">
                    Check back later or contact your admin
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Navigation Mode */
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNavigationMode(false);
                setSelectedNavPickup(null);
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Map
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Navigation Mode
              </h1>
              <p className="text-gray-600">
                Navigating to {selectedNavPickup?.industryName}
              </p>
            </div>
          </div>

          {selectedNavPickup && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Navigation Map - Takes most space */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Navigation className="h-5 w-5 text-blue-600" />
                        <span>Route to Destination</span>
                      </CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (selectedNavPickup.coordinates) {
                            const { lat, lng } = selectedNavPickup.coordinates;
                            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
                            window.open(googleMapsUrl, "_blank");
                          }
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Google Maps
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[60vh]">
                      <CollectorMapComponent
                        pickups={[selectedNavPickup]}
                        currentLocation={currentLocation}
                        onNavigateToPickup={() => {}}
                        onPickupStatusUpdate={updatePickupStatus}
                        navigationMode={true}
                        autoShowRoute={true}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pickup Details */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Destination Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {selectedNavPickup.industryName}
                      </h3>
                      <Badge
                        variant={
                          selectedNavPickup.status === "on-way"
                            ? "default"
                            : selectedNavPickup.status === "picked-up"
                            ? "secondary"
                            : selectedNavPickup.status === "completed"
                            ? "outline"
                            : "secondary"
                        }
                      >
                        {selectedNavPickup.status.replace("-", " ")}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span>{selectedNavPickup.wasteType}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Weight:</span>
                        <span>{selectedNavPickup.weight}kg</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span className="text-xs leading-relaxed">
                          {selectedNavPickup.address}
                        </span>
                      </div>
                    </div>

                    {selectedNavPickup.notes && (
                      <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-sm font-medium text-yellow-800">
                          Special Notes:
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          {selectedNavPickup.notes}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      {selectedNavPickup.status === "assigned" && (
                        <Button
                          className="w-full"
                          onClick={() =>
                            updatePickupStatus(selectedNavPickup.id, "on-way")
                          }
                        >
                          Start Journey
                        </Button>
                      )}
                      {selectedNavPickup.status === "on-way" && (
                        <Button
                          className="w-full bg-yellow-500 hover:bg-yellow-600"
                          onClick={() =>
                            updatePickupStatus(
                              selectedNavPickup.id,
                              "picked-up"
                            )
                          }
                        >
                          Mark as Picked Up
                        </Button>
                      )}
                      {selectedNavPickup.status === "picked-up" && (
                        <Button
                          className="w-full bg-green-500 hover:bg-green-600"
                          onClick={() =>
                            updatePickupStatus(
                              selectedNavPickup.id,
                              "completed"
                            )
                          }
                        >
                          Complete Pickup
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        if (currentLocation) {
                          // Center on current location
                        }
                      }}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Center on My Location
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        // Call contact
                        toast({
                          title: "Contact Feature",
                          description: "Contact integration coming soon! 📞",
                        });
                      }}
                    >
                      📞 Call Customer
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        toast({
                          title: "Emergency Feature",
                          description:
                            "Emergency contact feature coming soon! 🚨",
                        });
                      }}
                    >
                      � Emergency Contact
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
