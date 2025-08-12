import React, { useEffect, useState, useRef } from "react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { Button } from "@/components/ui/button";
import { Navigation, MapPin } from "lucide-react";

interface PickupRequest {
  id: string;
  industryName: string;
  wasteType: string;
  weight: number;
  status: "assigned" | "on-way" | "picked-up" | "completed";
  address: string;
  coordinates: { lat: number; lng: number };
}

interface CollectorMapComponentProps {
  pickups: PickupRequest[];
  currentLocation?: { lat: number; lng: number };
  onNavigateToPickup: (pickup: PickupRequest) => void;
  onPickupStatusUpdate: (
    pickupId: string,
    status: PickupRequest["status"]
  ) => void;
  navigationMode?: boolean;
  autoShowRoute?: boolean;
}

export function CollectorMapComponent({
  pickups,
  currentLocation,
  onNavigateToPickup,
  onPickupStatusUpdate,
  navigationMode = false,
  autoShowRoute = false,
}: CollectorMapComponentProps) {
  const [selectedPickup, setSelectedPickup] = useState<PickupRequest | null>(
    null
  );
  const [routeRenderer, setRouteRenderer] =
    useState<google.maps.DirectionsRenderer | null>(null);

  const {
    mapRef,
    map,
    isLoaded,
    loadError,
    addMarker,
    addInfoWindow,
    calculateRoute,
    displayRoute,
    updateMapCenter,
  } = useGoogleMaps({
    center: currentLocation || { lat: 6.9271, lng: 79.8612 },
    zoom: 13,
  });

  const markersRef = useRef<google.maps.Marker[]>([]);

  const showRouteToPickup = async (pickup: PickupRequest) => {
    if (!currentLocation || !isLoaded) return;

    try {
      // Clear existing route
      if (routeRenderer) {
        routeRenderer.setMap(null);
      }

      const route = await calculateRoute(currentLocation, pickup.coordinates);
      if (route) {
        const renderer = displayRoute(route);
        setRouteRenderer(renderer);
        setSelectedPickup(pickup);
      }
    } catch (error) {
      console.error("Error showing route:", error);
    }
  };

  // Update map center when current location changes
  useEffect(() => {
    if (currentLocation && isLoaded) {
      updateMapCenter(currentLocation, 15);
    }
  }, [currentLocation, isLoaded, updateMapCenter]);

  // Auto-show route in navigation mode
  useEffect(() => {
    if (
      navigationMode &&
      autoShowRoute &&
      pickups.length > 0 &&
      currentLocation &&
      isLoaded
    ) {
      const targetPickup = pickups[0]; // In navigation mode, there should be only one pickup
      showRouteToPickup(targetPickup);
    }
  }, [navigationMode, autoShowRoute, pickups, currentLocation, isLoaded]);

  useEffect(() => {
    if (!isLoaded || !map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Clear existing route
    if (routeRenderer) {
      routeRenderer.setMap(null);
      setRouteRenderer(null);
    }

    // Add current location marker
    if (currentLocation) {
      const currentLocationMarker = addMarker(currentLocation, {
        title: "Your Current Location",
        icon: {
          url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMxRjJBMzciLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNCIgZmlsbD0id2hpdGUiLz4KPC9zdmc+",
          scaledSize: new google.maps.Size(20, 20),
        },
      });

      if (currentLocationMarker) {
        addInfoWindow(
          currentLocationMarker,
          '<div class="p-2"><strong>Your Current Location</strong></div>'
        );
        markersRef.current.push(currentLocationMarker);
      }
    }

    // Add pickup markers
    pickups.forEach((pickup) => {
      const getStatusColor = (status: string) => {
        switch (status) {
          case "assigned":
            return "#6B7280";
          case "on-way":
            return "#3B82F6";
          case "picked-up":
            return "#F59E0B";
          case "completed":
            return "#10B981";
          default:
            return "#6B7280";
        }
      };

      const marker = addMarker(pickup.coordinates, {
        title: pickup.industryName,
        icon: {
          url: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiR7Z2V0U3RhdHVzQ29sb3IocGlja3VwLnN0YXR1cyl9Ii8+CjxzdmcgeD0iNCIgeT0iNCIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0yMSAxNlY4YTIgMiAwIDAgMC0yLTJINWEyIDIgMCAwIDAtMiAydjhsMi0yaDEybDIgMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Im0xMiAxM2wtNC00aC0ydjZoMTJWOWgtMmwtNCA0WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPg==`,
          scaledSize: new google.maps.Size(32, 32),
        },
      });

      if (marker) {
        const statusActions =
          pickup.status === "assigned"
            ? `<button onclick="window.updatePickupStatus('${pickup.id}', 'on-way')" class="bg-blue-500 text-white px-3 py-1 rounded text-sm mt-2 mr-2">Start Journey</button>`
            : pickup.status === "on-way"
            ? `<button onclick="window.updatePickupStatus('${pickup.id}', 'picked-up')" class="bg-yellow-500 text-white px-3 py-1 rounded text-sm mt-2 mr-2">Mark Picked Up</button>`
            : pickup.status === "picked-up"
            ? `<button onclick="window.updatePickupStatus('${pickup.id}', 'completed')" class="bg-green-500 text-white px-3 py-1 rounded text-sm mt-2 mr-2">Complete</button>`
            : "";

        const infoContent = `
          <div class="p-3 min-w-56">
            <h3 class="font-semibold text-lg">${pickup.industryName}</h3>
            <p class="text-sm text-gray-600 mt-1">Waste Type: ${
              pickup.wasteType
            }</p>
            <p class="text-sm text-gray-600">Weight: ${pickup.weight}kg</p>
            <p class="text-sm text-gray-600">Status: <span class="font-medium capitalize">${pickup.status.replace(
              "-",
              " "
            )}</span></p>
            <p class="text-sm text-gray-600 mt-1">${pickup.address}</p>
            <div class="mt-2">
              <button onclick="window.navigateToPickup('${
                pickup.id
              }')" class="bg-blue-600 text-white px-3 py-1 rounded text-sm mr-2">Navigate</button>
              ${statusActions}
            </div>
          </div>
        `;

        addInfoWindow(marker, infoContent);

        marker.addListener("click", () => {
          setSelectedPickup(pickup);
        });

        markersRef.current.push(marker);
      }
    });

    // Set up global functions for info window buttons
    (window as any).navigateToPickup = (pickupId: string) => {
      const pickup = pickups.find((p) => p.id === pickupId);
      if (pickup) {
        onNavigateToPickup(pickup);
      }
    };
    (window as any).updatePickupStatus = (
      pickupId: string,
      newStatus: string
    ) => {
      onPickupStatusUpdate(pickupId, newStatus as PickupRequest["status"]);
    };

    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      if (routeRenderer) {
        routeRenderer.setMap(null);
      }
    };
  }, [
    isLoaded,
    map,
    pickups,
    currentLocation,
    addMarker,
    addInfoWindow,
    onNavigateToPickup,
    onPickupStatusUpdate,
  ]);

  const clearRoute = () => {
    if (routeRenderer) {
      routeRenderer.setMap(null);
      setRouteRenderer(null);
    }
    setSelectedPickup(null);
  };

  if (loadError) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium">Failed to load Google Maps</p>
          <p className="text-sm text-gray-500 mt-1">
            Please check your API key configuration
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div
          ref={mapRef}
          className={`w-full rounded-lg ${
            navigationMode ? "h-[60vh]" : "h-96"
          }`}
        />

        {/* Map Controls */}
        <div className="absolute top-4 left-4 bg-white p-2 rounded shadow-lg space-y-2">
          {selectedPickup && (
            <div className="text-sm">
              <p className="font-medium">
                Route to: {selectedPickup.industryName}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={clearRoute}
                className="mt-1 w-full"
              >
                Clear Route
              </Button>
            </div>
          )}
        </div>

        {/* Enhanced Legend for navigation mode */}
        <div className="absolute bottom-4 right-4 bg-white p-3 rounded shadow-lg">
          <h4 className="text-xs font-medium mb-2">Status Legend</h4>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-black rounded-full"></div>
              <span className="text-xs">Your Location</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="text-xs">Assigned</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs">On Way</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-xs">Picked Up</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs">Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Hidden in navigation mode */}
      {!navigationMode && (
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => {
              if (currentLocation) {
                updateMapCenter(currentLocation, 15);
              }
            }}
            className="flex items-center space-x-2"
          >
            <MapPin className="h-4 w-4" />
            <span>Center on Me</span>
          </Button>

          {pickups.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                const nextPickup = pickups.find(
                  (p) => p.status === "assigned" || p.status === "on-way"
                );
                if (nextPickup) {
                  showRouteToPickup(nextPickup);
                }
              }}
              className="flex items-center space-x-2"
            >
              <Navigation className="h-4 w-4" />
              <span>Show Route</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
