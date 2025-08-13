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
  const [collectorAddress, setCollectorAddress] = useState<string>("");
  const [collectorLocation, setCollectorLocation] = useState<
    { lat: number; lng: number } | undefined
  >();
  const [loading, setLoading] = useState(true);
  const [gpsStatus, setGpsStatus] = useState<{
    accuracy: number | null;
    isAccurate: boolean;
    lastUpdate: Date | null;
  }>({ accuracy: null, isAccurate: false, lastUpdate: null });
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

        // Get collector's detailed profile for address information
        let collectorFullProfile;
        try {
          collectorFullProfile = await collectorService.getCollectorProfile(
            collectorProfile.id
          );
          console.log("Full collector profile loaded:", collectorFullProfile);
        } catch (error) {
          console.log(
            "No detailed collector profile found, using basic user data:",
            error
          );
          collectorFullProfile = null;
        }

        // Set collector address from profile or user data
        const address =
          collectorFullProfile?.address || collectorProfile.address || "";
        setCollectorAddress(address);

        console.log("Collector address set:", {
          profileAddress: collectorFullProfile?.address,
          userAddress: collectorProfile.address,
          finalAddress: address,
          collectorId: collectorProfile.id,
          collectorName: collectorProfile.name,
        });

        // If collector has an address, geocode it to get coordinates
        if (address) {
          console.log("Collector has address for navigation:", address);
          setCollectorLocation(currentLocation); // Will be updated when currentLocation is available
        } else {
          console.warn(
            "⚠️ Collector has no address set! Navigation will use current GPS location."
          );
          toast({
            title: "Address Not Set",
            description:
              "Please update your address in your profile for better navigation",
            variant: "default",
          });
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
    // Get current location with high accuracy and watch for updates
    if (navigator.geolocation) {
      // Get initial position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(newLocation);
          console.log("🎯 Current location updated:", newLocation);

          // Only show initial success toast, not for every update
          if (!currentLocation) {
            toast({
              title: "Location Found",
              description: `GPS ready: ${newLocation.lat.toFixed(
                4
              )}, ${newLocation.lng.toFixed(4)}`,
            });
          }
        },
        (error) => {
          console.error("Error getting location:", error);

          // Provide specific error messages
          let errorMessage = "Unable to get your location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location access denied. Please enable location services.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }

          toast({
            title: "Location Error",
            description: errorMessage,
            variant: "destructive",
          });

          // Fallback to Colombo coordinates
          setCurrentLocation({ lat: 6.9271, lng: 79.8612 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // 1 minute
        }
      );

      // Watch position for real-time updates with strict GPS requirements
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const accuracy = position.coords.accuracy;
          console.log("📡 Raw GPS data:", {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: accuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: new Date(position.timestamp).toLocaleTimeString(),
          });

          // Only accept accurate GPS readings (less than 100m accuracy)
          if (accuracy <= 100) {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setCurrentLocation(newLocation);
            setGpsStatus({
              accuracy,
              isAccurate: true,
              lastUpdate: new Date(),
            });
            console.log(
              "✅ High-accuracy GPS location accepted:",
              newLocation,
              "Accuracy:",
              accuracy,
              "m"
            );
          } else {
            setGpsStatus({
              accuracy,
              isAccurate: false,
              lastUpdate: new Date(),
            });
            console.warn(
              "🚫 GPS location rejected - too inaccurate:",
              accuracy,
              "m (need <100m)"
            );

            // Show guidance for better GPS
            if (accuracy > 1000) {
              console.log(
                "📱 GPS Tips: Move outdoors, away from buildings, enable High Accuracy GPS in phone settings"
              );

              // Show helpful toast occasionally
              if (Math.random() < 0.2) {
                // 20% chance to show tip
                toast({
                  title: "Improving GPS Signal 📡",
                  description:
                    "Move to an open outdoor area for accurate navigation",
                  variant: "default",
                });
              }
            }
            // Don't update location, keep the previous one
          }
        },
        (error) => {
          console.error("❌ Error watching location:", error);
          // Don't show toast for watch errors to avoid spam
        },
        {
          enableHighAccuracy: true, // Force GPS satellites
          timeout: 15000, // Give more time for GPS fix
          maximumAge: 0, // Always get fresh location, no cached data
        }
      );

      // Also set up periodic location refresh as backup with adaptive intervals
      let consecutiveTimeouts = 0;
      const MAX_TIMEOUTS = 3;

      const performPeriodicRefresh = () => {
        console.log("🔄 Requesting fresh GPS location...");
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const accuracy = position.coords.accuracy;
            console.log("📡 Periodic GPS data:", {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: accuracy,
              timestamp: new Date(position.timestamp).toLocaleTimeString(),
            });

            // Only accept accurate GPS readings
            if (accuracy <= 100) {
              const newLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              setCurrentLocation(newLocation);
              consecutiveTimeouts = 0; // Reset on success
              console.log(
                "✅ Periodic high-accuracy GPS accepted:",
                newLocation,
                "Accuracy:",
                accuracy,
                "m"
              );
            } else {
              console.warn(
                "🚫 Periodic GPS rejected - too inaccurate:",
                accuracy,
                "m (need <100m)"
              );
            }
          },
          (error) => {
            if (error.code === error.TIMEOUT) {
              consecutiveTimeouts++;
              console.log(
                `⏱️ GPS still searching for satellites ${consecutiveTimeouts}/${MAX_TIMEOUTS} (this is normal)`
              );

              if (consecutiveTimeouts >= MAX_TIMEOUTS) {
                console.warn(
                  "� GPS may have poor satellite signal - try moving to open area"
                );
              }
            } else {
              console.warn("⚠️ GPS error:", error.message, "Code:", error.code);
            }
          },
          {
            enableHighAccuracy: true, // Force GPS satellites
            timeout: 20000, // Give more time for GPS satellite fix
            maximumAge: 0, // Always get fresh location from satellites
          }
        );
      };

      // Adaptive refresh interval based on success rate
      const getNextInterval = () => {
        if (consecutiveTimeouts >= MAX_TIMEOUTS) {
          return 60000; // Slow down to 1 minute if many timeouts
        }
        return 30000; // Normal 30-second refresh
      };

      let refreshTimeout: NodeJS.Timeout;
      const scheduleNextRefresh = () => {
        const interval = getNextInterval();
        refreshTimeout = setTimeout(() => {
          performPeriodicRefresh();
          scheduleNextRefresh(); // Schedule next refresh
        }, interval);
      };

      // Start the adaptive refresh cycle
      scheduleNextRefresh();

      // Cleanup watch and refresh timeout on unmount
      return () => {
        console.log("🧹 Cleaning up location tracking");
        navigator.geolocation.clearWatch(watchId);
        if (refreshTimeout) {
          clearTimeout(refreshTimeout);
        }
      };
    } else {
      toast({
        title: "GPS Not Supported",
        description: "Your device doesn't support GPS navigation",
        variant: "destructive",
      });
      // Fallback to Colombo coordinates
      setCurrentLocation({ lat: 6.9271, lng: 79.8612 });
    }
  }, [toast]);

  const [navigationMode, setNavigationMode] = useState(false);
  const [selectedNavPickup, setSelectedNavPickup] =
    useState<PickupRequest | null>(null);

  // Helper function to validate and get fresh accurate GPS location
  const ensureLocationAvailable = async (): Promise<{
    lat: number;
    lng: number;
  } | null> => {
    // Check if current location is accurate enough
    if (currentLocation) {
      console.log("✅ Using existing GPS location:", currentLocation);
      return currentLocation;
    }

    console.log("🔄 Requesting fresh high-accuracy GPS location...");

    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const accuracy = position.coords.accuracy;
            console.log("📡 Fresh GPS attempt:", {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: accuracy,
              timestamp: new Date(position.timestamp).toLocaleTimeString(),
            });

            // Only accept accurate GPS readings for navigation
            if (accuracy <= 100) {
              const newLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              setCurrentLocation(newLocation);
              console.log(
                "✅ High-accuracy GPS location obtained:",
                newLocation,
                "Accuracy:",
                accuracy,
                "m"
              );
              resolve(newLocation);
            } else {
              console.warn(
                "🚫 GPS too inaccurate for navigation:",
                accuracy,
                "m"
              );
              toast({
                title: "GPS Not Accurate Enough",
                description: `GPS accuracy: ${Math.round(
                  accuracy
                )}m. Move to open area for better signal.`,
                variant: "default",
              });
              resolve(null);
            }
          },
          (error) => {
            console.error("❌ Failed to get GPS location:", error);
            let errorMessage = "Unable to get your GPS location.";

            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage =
                  "Location permission denied. Please enable GPS access.";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = "GPS unavailable. Please move to an open area.";
                break;
              case error.TIMEOUT:
                errorMessage =
                  "GPS timeout. Please ensure location services are enabled.";
                break;
            }

            toast({
              title: "GPS Error",
              description: errorMessage,
              variant: "destructive",
            });
            resolve(null);
          },
          {
            enableHighAccuracy: true, // Force GPS satellites
            timeout: 25000, // Give extra time for GPS satellite fix
            maximumAge: 0, // Always get fresh location from satellites
          }
        );
      } else {
        resolve(null);
      }
    });
  };

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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Map View</h1>
              <p className="text-gray-600 mt-2">
                Navigate to your assigned pickup locations using real-time GPS
              </p>
            </div>

            {/* GPS Status Indicator */}
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                  gpsStatus.isAccurate
                    ? "bg-green-50 border border-green-200"
                    : "bg-amber-50 border border-amber-200"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    gpsStatus.isAccurate ? "bg-green-500" : "bg-amber-500"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    gpsStatus.isAccurate ? "text-green-700" : "text-amber-700"
                  }`}
                >
                  {gpsStatus.isAccurate
                    ? `GPS: ${gpsStatus.accuracy?.toFixed(1)}m`
                    : gpsStatus.accuracy
                    ? `GPS: ${(gpsStatus.accuracy / 1000).toFixed(
                        1
                      )}km (Move outdoors)`
                    : "GPS: Searching..."}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      const newLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                      };
                      setCurrentLocation(newLocation);
                      toast({
                        title: "Location Refreshed",
                        description: `Updated to: ${newLocation.lat.toFixed(
                          4
                        )}, ${newLocation.lng.toFixed(4)}`,
                      });
                    },
                    (error) => {
                      toast({
                        title: "Location Error",
                        description:
                          "Unable to refresh location. Please check GPS settings.",
                        variant: "destructive",
                      });
                    },
                    { enableHighAccuracy: true, timeout: 10000 }
                  );
                } else {
                  toast({
                    title: "GPS Not Available",
                    description: "Your device doesn't support GPS",
                    variant: "destructive",
                  });
                }
              }}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Refresh Location
            </Button>
          </div>

          {/* Current Location Status */}
          {currentLocation ? (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Navigation className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-900">
                      Real-Time Navigation Ready
                    </h3>
                    <p className="text-sm text-green-700 mt-1">
                      Current Location: {currentLocation.lat.toFixed(4)},{" "}
                      {currentLocation.lng.toFixed(4)}
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      Navigation will start from your current GPS location for
                      accurate routing
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Navigation className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-900">
                      Getting Your Location...
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Please enable GPS/location services for accurate
                      navigation
                    </p>
                    <p className="text-xs text-yellow-600 mt-2">
                      Navigation will use real-time location for best routing
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              const { lat, lng } = pickup.coordinates;

                              console.log("📋 Pickup List Navigation:");
                              console.log("- Pickup destination:", {
                                lat,
                                lng,
                              });
                              console.log(
                                "- Pickup industry:",
                                pickup.industryName
                              );
                              console.log("- Pickup address:", pickup.address);
                              console.log(
                                "- Current collector GPS:",
                                currentLocation
                              );

                              // Ensure we have a valid location before navigation
                              const validLocation =
                                await ensureLocationAvailable();

                              if (validLocation) {
                                console.log(
                                  "🗺️ Creating route FROM collector GPS TO pickup location:"
                                );
                                console.log(
                                  "- Start (collector GPS):",
                                  validLocation
                                );
                                console.log("- End (pickup location):", {
                                  lat,
                                  lng,
                                });

                                const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${validLocation.lat},${validLocation.lng}&destination=${lat},${lng}&travelmode=driving`;

                                console.log(
                                  "🌍 Google Maps URL:",
                                  googleMapsUrl
                                );
                                window.open(googleMapsUrl, "_blank");

                                toast({
                                  title: "Google Maps Opened",
                                  description: `Navigation from GPS: ${validLocation.lat.toFixed(
                                    4
                                  )}, ${validLocation.lng.toFixed(4)} → ${
                                    pickup.industryName
                                  }`,
                                });
                              } else {
                                // Fallback - open destination only
                                const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
                                window.open(googleMapsUrl, "_blank");

                                toast({
                                  title: "Google Maps Opened",
                                  description:
                                    "GPS unavailable - Google Maps will use your device location",
                                  variant: "default",
                                });
                              }
                            }}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Maps
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
                        onClick={async () => {
                          if (selectedNavPickup.coordinates) {
                            const { lat, lng } = selectedNavPickup.coordinates;

                            console.log("🎯 Navigation Details:");
                            console.log("- Pickup destination:", { lat, lng });
                            console.log(
                              "- Pickup industry:",
                              selectedNavPickup.industryName
                            );
                            console.log(
                              "- Pickup address:",
                              selectedNavPickup.address
                            );
                            console.log(
                              "- Current collector GPS:",
                              currentLocation
                            );

                            // Ensure we have a valid location before navigation
                            const validLocation =
                              await ensureLocationAvailable();

                            if (validLocation) {
                              console.log(
                                "🗺️ Creating route FROM collector GPS TO pickup location:"
                              );
                              console.log(
                                "- Start (collector GPS):",
                                validLocation
                              );
                              console.log("- End (pickup location):", {
                                lat,
                                lng,
                              });

                              const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${validLocation.lat},${validLocation.lng}&destination=${lat},${lng}&travelmode=driving`;

                              console.log("🌍 Google Maps URL:", googleMapsUrl);
                              window.open(googleMapsUrl, "_blank");

                              toast({
                                title: "Navigation Started",
                                description: `From GPS: ${validLocation.lat.toFixed(
                                  4
                                )}, ${validLocation.lng.toFixed(4)} → ${
                                  selectedNavPickup.industryName
                                }`,
                              });
                            } else {
                              console.warn(
                                "⚠️ Navigation mode - GPS unavailable, using destination-only"
                              );
                              const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

                              window.open(googleMapsUrl, "_blank");

                              toast({
                                title: "Navigation Started",
                                description:
                                  "GPS unavailable - Google Maps will use your device location",
                                variant: "default",
                              });
                            }
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

                    {/* Starting Point Information */}
                    <div className="p-3 bg-green-50 rounded border border-green-200">
                      <p className="text-sm font-medium text-green-800">
                        Starting Point:
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        {currentLocation
                          ? `Current GPS Location: ${currentLocation.lat.toFixed(
                              4
                            )}, ${currentLocation.lng.toFixed(4)}`
                          : "Getting your location..."}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        � Real-time navigation from your current position
                      </p>
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
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              const newLocation = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude,
                              };
                              setCurrentLocation(newLocation);
                              toast({
                                title: "Location Refreshed",
                                description: `Updated to: ${newLocation.lat.toFixed(
                                  4
                                )}, ${newLocation.lng.toFixed(4)}`,
                              });
                            },
                            (error) => {
                              toast({
                                title: "Location Error",
                                description: "Unable to get current location",
                                variant: "destructive",
                              });
                            },
                            { enableHighAccuracy: true, timeout: 10000 }
                          );
                        }
                      }}
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Refresh My Location
                    </Button>
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
