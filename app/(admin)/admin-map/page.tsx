"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Truck,
  Package,
  Navigation,
  RefreshCw,
  Users,
  Target,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdminMapComponent } from "@/components/Admin/AdminMapComponent";
import { pickupService, collectorService } from "@/lib/firebase-services";
import type { PickupRequest, User } from "@/types";

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

export default function AdminMapPage() {
  const { toast } = useToast();
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);
  const [trackedCollector, setTrackedCollector] =
    useState<CollectorLocation | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState<PickupLocation | null>(
    null
  );
  const [mapCenter, setMapCenter] = useState({ lat: 6.9271, lng: 79.8612 });
  const [mapZoom, setMapZoom] = useState(12);
  const [loading, setLoading] = useState(true);
  const [collectors, setCollectors] = useState<CollectorLocation[]>([]);
  const [pendingPickups, setPendingPickups] = useState<PickupLocation[]>([]);

  // Load real data from Firebase
  useEffect(() => {
    const loadMapData = async () => {
      try {
        setLoading(true);

        // Load all collectors
        const allCollectors = await collectorService.getAllCollectors();
        const transformedCollectors: CollectorLocation[] = allCollectors.map(
          (collector: User) => ({
            id: collector.id,
            name: collector.name,
            email: collector.email,
            phone: collector.phone,
            location: collector.currentLocation || {
              lat: 6.9271,
              lng: 79.8612,
            }, // Default to Colombo if no location
            status: collector.isAvailable ? "available" : "busy",
            assignedPickup: null, // Will be determined from pickup requests
            truckCapacity: (collector as any).truckCapacity || 1000,
            currentLoad: (collector as any).currentLoad || 0,
          })
        );

        // Load pending pickup requests
        const allPickups = await pickupService.getAllPickupRequests();
        const pendingPickupRequests = allPickups.filter(
          (pickup: PickupRequest) =>
            pickup.status === "pending" || pickup.status === "assigned"
        );

        // Transform pickup requests to match our interface
        const transformedPickups: PickupLocation[] = pendingPickupRequests.map(
          (pickup: PickupRequest) => ({
            id: pickup.id,
            industryName: pickup.industryName,
            location: pickup.location,
            wasteType: pickup.wasteType,
            priority: (pickup as any).priority || "medium",
            weight: pickup.weight,
            address: pickup.location.address,
            status: pickup.status,
            requestedAt: pickup.requestedAt,
            collectorId: pickup.collectorId,
            collectorName: pickup.collectorName,
          })
        );

        // Update collectors with their assigned pickups
        const updatedCollectors = transformedCollectors.map((collector) => {
          const assignedPickup = transformedPickups.find(
            (pickup) => pickup.collectorId === collector.id
          );
          return {
            ...collector,
            assignedPickup: assignedPickup ? assignedPickup.industryName : null,
            status: assignedPickup ? "on-way" : "available",
          };
        });

        setCollectors(updatedCollectors);
        setPendingPickups(
          transformedPickups.filter((pickup) => pickup.status === "pending")
        );
      } catch (error) {
        console.error("Error loading map data:", error);
        toast({
          title: "Error",
          description: "Failed to load map data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, [toast]);

  // Real-time updates (simplified for now)
  useEffect(() => {
    if (collectors.length === 0) return;

    const interval = setInterval(() => {
      // Simulate small location updates for active collectors
      setCollectors((prevCollectors) =>
        prevCollectors.map((collector) => ({
          ...collector,
          location: {
            lat: collector.location.lat + (Math.random() - 0.5) * 0.0005,
            lng: collector.location.lng + (Math.random() - 0.5) * 0.0005,
          },
        }))
      );
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [collectors.length]);

  const trackCollector = (collector: CollectorLocation) => {
    setTrackedCollector(collector);
    setMapCenter(collector.location);
    setMapZoom(15);
    setIsTrackingDialogOpen(true);

    toast({
      title: "Tracking collector",
      description: `Now tracking ${collector.name} on the map.`,
    });
  };

  const assignCollectorToPickup = async (
    pickupId: string,
    collectorId: string
  ) => {
    try {
      const collector = collectors.find((c) => c.id === collectorId);
      const pickup = pendingPickups.find((p) => p.id === pickupId);

      if (!collector || !pickup) {
        toast({
          title: "Error",
          description: "Collector or pickup not found",
          variant: "destructive",
        });
        return;
      }

      // Update in Firebase
      await pickupService.assignCollector(
        pickupId,
        collectorId,
        collector.name
      );

      // Update local state
      setCollectors((prevCollectors) =>
        prevCollectors.map((c) =>
          c.id === collectorId
            ? { ...c, status: "on-way", assignedPickup: pickup.industryName }
            : c
        )
      );

      setPendingPickups((prevPickups) =>
        prevPickups.filter((p) => p.id !== pickupId)
      );

      setIsAssignDialogOpen(false);

      toast({
        title: "Collector assigned",
        description: `${collector.name} has been assigned to ${pickup.industryName}.`,
      });
    } catch (error) {
      console.error("Error assigning collector:", error);
      toast({
        title: "Error",
        description: "Failed to assign collector",
        variant: "destructive",
      });
    }
  };

  const openAssignDialog = (pickup: PickupLocation) => {
    setSelectedPickup(pickup);
    setIsAssignDialogOpen(true);
  };

  const centerOnCollectors = () => {
    if (collectors.length === 0) return;

    const avgLat =
      collectors.reduce((sum: number, c) => sum + c.location.lat, 0) /
      collectors.length;
    const avgLng =
      collectors.reduce((sum: number, c) => sum + c.location.lng, 0) /
      collectors.length;

    setMapCenter({ lat: avgLat, lng: avgLng });
    setMapZoom(13);

    toast({
      title: "Map centered",
      description: "Map centered on all active collectors.",
    });
  };

  const showAllPickups = () => {
    if (pendingPickups.length === 0) return;

    const avgLat =
      pendingPickups.reduce((sum: number, p) => sum + p.location.lat, 0) /
      pendingPickups.length;
    const avgLng =
      pendingPickups.reduce((sum: number, p) => sum + p.location.lng, 0) /
      pendingPickups.length;

    setMapCenter({ lat: avgLat, lng: avgLng });
    setMapZoom(12);

    toast({
      title: "Showing all pickups",
      description: "Map updated to show all pending pickup locations.",
    });
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      // Reload data from Firebase
      const allCollectors = await collectorService.getAllCollectors();
      const transformedCollectors: CollectorLocation[] = allCollectors.map(
        (collector: User) => ({
          id: collector.id,
          name: collector.name,
          email: collector.email,
          phone: collector.phone,
          location: collector.currentLocation || { lat: 6.9271, lng: 79.8612 },
          status: collector.isAvailable ? "available" : "busy",
          assignedPickup: null,
          truckCapacity: (collector as any).truckCapacity || 1000,
          currentLoad: (collector as any).currentLoad || 0,
        })
      );

      const allPickups = await pickupService.getAllPickupRequests();
      const pendingPickupRequests = allPickups.filter(
        (pickup: PickupRequest) =>
          pickup.status === "pending" || pickup.status === "assigned"
      );

      const transformedPickups: PickupLocation[] = pendingPickupRequests.map(
        (pickup: PickupRequest) => ({
          id: pickup.id,
          industryName: pickup.industryName,
          location: pickup.location,
          wasteType: pickup.wasteType,
          priority: (pickup as any).priority || "medium",
          weight: pickup.weight,
          address: pickup.location.address,
          status: pickup.status,
          requestedAt: pickup.requestedAt,
          collectorId: pickup.collectorId,
          collectorName: pickup.collectorName,
        })
      );

      const updatedCollectors = transformedCollectors.map((collector) => {
        const assignedPickup = transformedPickups.find(
          (pickup) => pickup.collectorId === collector.id
        );
        return {
          ...collector,
          assignedPickup: assignedPickup ? assignedPickup.industryName : null,
          status: assignedPickup ? "on-way" : "available",
        };
      });

      setCollectors(updatedCollectors);
      setPendingPickups(
        transformedPickups.filter((pickup) => pickup.status === "pending")
      );

      toast({
        title: "Data refreshed",
        description: "Live tracking data has been updated.",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Live Map View</h1>
        <p className="text-gray-600 mt-2">
          Real-time tracking of collectors and pickup locations
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Live Tracking Map</span>
                <div className="flex items-center space-x-2">
                  {loading ? (
                    <Badge variant="secondary">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Loading...
                    </Badge>
                  ) : (
                    <>
                      <Badge variant="secondary">
                        {collectors.length} Collectors
                      </Badge>
                      <Badge variant="outline">
                        {pendingPickups.length} Pending
                      </Badge>
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Loading map data...</p>
                  </div>
                </div>
              ) : (
                <AdminMapComponent
                  collectors={collectors}
                  pickups={pendingPickups}
                  onCollectorClick={trackCollector}
                  onPickupClick={openAssignDialog}
                  center={mapCenter}
                  zoom={mapZoom}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Active Collectors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="h-5 w-5" />
                <span>Active Collectors</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading collectors...</span>
                </div>
              ) : (
                collectors.map((collector) => (
                  <div key={collector.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{collector.name}</h4>
                      <Badge
                        variant={
                          collector.status === "on-way"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {collector.status.replace("-", " ")}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {collector.location.lat.toFixed(4)},{" "}
                          {collector.location.lng.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Truck className="h-3 w-3" />
                        <span>
                          {collector.currentLoad}kg / {collector.truckCapacity}
                          kg
                        </span>
                      </div>
                      {collector.assignedPickup && (
                        <div className="flex items-center space-x-1">
                          <Package className="h-3 w-3" />
                          <span>En route to {collector.assignedPickup}</span>
                        </div>
                      )}
                    </div>

                    {/* Capacity bar */}
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              (collector.currentLoad /
                                collector.truckCapacity) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => trackCollector(collector)}
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      Track
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Pending Pickups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Pending Pickups</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading pickups...</span>
                </div>
              ) : (
                pendingPickups.map((pickup) => (
                  <div key={pickup.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">
                        {pickup.industryName}
                      </h4>
                      <Badge
                        variant={
                          pickup.priority === "high"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {pickup.priority}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center space-x-1">
                        <Package className="h-3 w-3" />
                        <span>
                          {pickup.wasteType} - {pickup.weight}kg
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {pickup.location.lat.toFixed(4)},{" "}
                          {pickup.location.lng.toFixed(4)}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => openAssignDialog(pickup)}
                    >
                      Assign Collector
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Map Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Map Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={centerOnCollectors}
              >
                <Users className="h-4 w-4 mr-2" />
                Center on Collectors
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={showAllPickups}
              >
                <Target className="h-4 w-4 mr-2" />
                Show All Pickups
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={refreshData}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tracking Dialog */}
      <Dialog
        open={isTrackingDialogOpen}
        onOpenChange={setIsTrackingDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tracking {trackedCollector?.name}</DialogTitle>
          </DialogHeader>
          {trackedCollector && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Current Status
                  </h4>
                  <div className="p-3 border rounded-lg">
                    <Badge
                      variant={
                        trackedCollector.status === "on-way"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {trackedCollector.status.replace("-", " ")}
                    </Badge>
                    {trackedCollector.assignedPickup && (
                      <p className="text-sm mt-2">
                        En route to: {trackedCollector.assignedPickup}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Vehicle Info
                  </h4>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm">
                      Capacity: {trackedCollector.truckCapacity}kg
                    </p>
                    <p className="text-sm">
                      Current Load: {trackedCollector.currentLoad}kg
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (trackedCollector.currentLoad /
                              trackedCollector.truckCapacity) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Live Location
                </h4>
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">
                      {trackedCollector.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Lat: {trackedCollector.location.lat.toFixed(6)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Lng: {trackedCollector.location.lng.toFixed(6)}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Real-time tracking active
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsTrackingDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setMapCenter(trackedCollector.location);
                    setMapZoom(16);
                    setIsTrackingDialogOpen(false);
                  }}
                >
                  Center on Map
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Collector Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Collector</DialogTitle>
          </DialogHeader>
          {selectedPickup && (
            <div className="space-y-4 py-4">
              <div>
                <h4 className="font-medium">{selectedPickup.industryName}</h4>
                <p className="text-sm text-gray-600">
                  {selectedPickup.wasteType} - {selectedPickup.weight}kg
                </p>
                <p className="text-sm text-gray-600">
                  {selectedPickup.address}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Select Collector:</label>
                <Select
                  onValueChange={(value) =>
                    assignCollectorToPickup(selectedPickup.id, value)
                  }
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Choose available collector" />
                  </SelectTrigger>
                  <SelectContent>
                    {collectors
                      .filter((c) => c.status === "available")
                      .map((collector) => (
                        <SelectItem key={collector.id} value={collector.id}>
                          {collector.name} - {collector.currentLoad}kg/
                          {collector.truckCapacity}kg
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAssignDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
