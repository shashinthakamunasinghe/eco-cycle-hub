import React, { useEffect, useState, useRef } from "react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

interface CollectorLocation {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  status: string;
  assignedPickup: string | null;
  truckCapacity: number;
  currentLoad: number;
  email: string;
  phone?: string;
}

interface PickupLocation {
  id: string;
  industryName: string;
  location: { lat: number; lng: number };
  wasteType: string;
  priority: string;
  weight: number;
  address: string;
  status: string;
  requestedAt: Date;
  collectorId?: string;
  collectorName?: string;
}

interface AdminMapComponentProps {
  collectors: CollectorLocation[];
  pickups: PickupLocation[];
  onCollectorClick: (collector: CollectorLocation) => void;
  onPickupClick: (pickup: PickupLocation) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
}

export function AdminMapComponent({
  collectors,
  pickups,
  onCollectorClick,
  onPickupClick,
  center,
  zoom,
}: AdminMapComponentProps) {
  const { mapRef, map, isLoaded, loadError, addMarker, addInfoWindow } =
    useGoogleMaps({
      center,
      zoom,
    });

  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!isLoaded || !map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add collector markers
    collectors.forEach((collector) => {
      const marker = addMarker(collector.location, {
        title: collector.name,
        icon: {
          url:
            collector.status === "available"
              ? "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMyMkMzNTUiLz4KPHN2ZyB4PSI0IiB5PSI0IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgN2gxOGwtMiA5SDVsLTItOXoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Im03IDd2MTBhMSAxIDAgMCAwIDEgMWg4YTEgMSAwIDAgMCAxLTFWNyIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPg=="
              : "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMzQjgyRjYiLz4KPHN2ZyB4PSI0IiB5PSI0IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgN2gxOGwtMiA5SDVsLTItOXoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Im03IDd2MTBhMSAxIDAgMCAwIDEgMWg4YTEgMSAwIDAgMCAxLTFWNyIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPg==",
          scaledSize: new google.maps.Size(32, 32),
        },
      });

      if (marker) {
        const loadPercentage =
          (collector.currentLoad / collector.truckCapacity) * 100;
        const infoContent = `
          <div class="p-3 min-w-48">
            <h3 class="font-semibold text-lg">${collector.name}</h3>
            <p class="text-sm text-gray-600 mt-1">Status: <span class="font-medium">${collector.status.replace(
              "-",
              " "
            )}</span></p>
            <p class="text-sm text-gray-600">Load: ${
              collector.currentLoad
            }kg / ${collector.truckCapacity}kg (${loadPercentage.toFixed(
          1
        )}%)</p>
            ${
              collector.assignedPickup
                ? `<p class="text-sm text-gray-600">En route to: ${collector.assignedPickup}</p>`
                : ""
            }
            <div class="mt-2">
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full" style="width: ${loadPercentage}%"></div>
              </div>
            </div>
          </div>
        `;

        addInfoWindow(marker, infoContent);

        marker.addListener("click", () => {
          onCollectorClick(collector);
        });

        markersRef.current.push(marker);
      }
    });

    // Add pickup markers
    pickups.forEach((pickup) => {
      const getPriorityColor = (priority: string) => {
        switch (priority) {
          case "high":
            return "#EF4444";
          case "medium":
            return "#F59E0B";
          case "low":
            return "#F97316";
          default:
            return "#6B7280";
        }
      };

      const marker = addMarker(pickup.location, {
        title: pickup.industryName,
        icon: {
          url: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiR7Z2V0UHJpb3JpdHlDb2xvcihwaWNrdXAucHJpb3JpdHkpfSIvPgo8c3ZnIHg9IjQiIHk9IjQiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJtOSAxMiA0LTQgNC00djE4bC00LTQtNC00eiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPg==`,
          scaledSize: new google.maps.Size(28, 28),
        },
      });

      if (marker) {
        const infoContent = `
          <div class="p-3 min-w-48">
            <h3 class="font-semibold text-lg">${pickup.industryName}</h3>
            <p class="text-sm text-gray-600 mt-1">Waste Type: ${pickup.wasteType}</p>
            <p class="text-sm text-gray-600">Weight: ${pickup.weight}kg</p>
            <p class="text-sm text-gray-600">Priority: <span class="font-medium capitalize">${pickup.priority}</span></p>
            <p class="text-sm text-gray-600 mt-2">${pickup.address}</p>
          </div>
        `;

        addInfoWindow(marker, infoContent);

        marker.addListener("click", () => {
          onPickupClick(pickup);
        });

        markersRef.current.push(marker);
      }
    });

    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [
    isLoaded,
    map,
    collectors,
    pickups,
    addMarker,
    addInfoWindow,
    onCollectorClick,
    onPickupClick,
  ]);

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
    <div className="relative">
      <div ref={mapRef} className="h-96 w-full rounded-lg" />

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded shadow-lg">
        <h4 className="text-xs font-medium mb-2">Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs">Available Collector</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs">Busy Collector</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs">High Priority Pickup</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-xs">Medium Priority</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-xs">Low Priority</span>
          </div>
        </div>
      </div>
    </div>
  );
}
