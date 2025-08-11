"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, MapPin, Clock, User, Search, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { collectorService, pickupService } from "@/lib/firebase-services";
import type { PickupRequest } from "@/types";

interface AvailableCollector {
  id: string;
  name: string;
  isAvailable: boolean;
  email: string;
  phone?: string;
  vehicleCapacity?: number;
  currentLoad?: number;
  lastActivity?: string | null;
}
export default function AdminPickupsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [availableCollectors, setAvailableCollectors] = useState<
    AvailableCollector[]
  >([]);
  const { toast } = useToast();
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentPickup, setCurrentPickup] = useState<PickupRequest | null>(
    null
  );

  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([]);
  const [pickupRequestsLoading, setPickupRequestsLoading] = useState(true);
  const [collectorsLoading, setCollectorsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Load pickup requests from Firebase
  useEffect(() => {
    const loadPickupRequests = async () => {
      try {
        setPickupRequestsLoading(true);
        const requests = await pickupService.getAllPickupRequests();
        setPickupRequests(requests);
      } catch (error) {
        console.error("Error loading pickup requests:", error);
        toast({
          title: "Error",
          description: "Failed to load pickup requests",
          variant: "destructive",
        });
      } finally {
        setPickupRequestsLoading(false);
      }
    };

    loadPickupRequests();
  }, [toast]);

  // Load collectors from Firebase
  // Load collectors from Firebase
  useEffect(() => {
    const loadCollectors = async () => {
      try {
        setCollectorsLoading(true);
        const collectorsData = await collectorService.getAllCollectors();

        // Transform collector data to match our interface
        const formattedCollectors: AvailableCollector[] = collectorsData.map(
          (collector) => ({
            id: collector.id,
            name: collector.name,
            email: collector.email,
            phone: collector.phone,
            isAvailable: collector.isAvailable || true, // Default to available if not specified
            vehicleCapacity:
              collector.truckCapacity ||
              (collector as any).vehicleCapacity ||
              100,
            currentLoad: collector.currentLoad || 0,
          })
        );

        setAvailableCollectors(formattedCollectors);
        console.log(
          "📋 Loaded collectors for assignment:",
          formattedCollectors
        );
      } catch (error) {
        console.error("❌ Error loading collectors:", error);
        toast({
          title: "Error",
          description: "Failed to load collectors for assignment",
          variant: "destructive",
        });
      } finally {
        setCollectorsLoading(false);
      }
    };
    loadCollectors();
  }, [toast]);

  const refreshData = async () => {
    setIsLoading(true);
    setCollectorsLoading(true);
    try {
      // Reload pickup requests
      const requests = await pickupService.getAllPickupRequests();
      setPickupRequests(requests);

      // Reload collectors
      const collectorsData = await collectorService.getAllCollectors();

      // Transform collector data to match our interface
      const formattedCollectors: AvailableCollector[] = collectorsData.map(
        (collector) => ({
          id: collector.id,
          name: collector.name,
          email: collector.email,
          phone: collector.phone,
          isAvailable: collector.isAvailable || true, // Default to available if not specified
          vehicleCapacity:
            collector.truckCapacity ||
            (collector as any).vehicleCapacity ||
            100,
          currentLoad: collector.currentLoad || 0,
        })
      );

      setAvailableCollectors(formattedCollectors);

      toast({
        title: "Data refreshed",
        description: "Pickup requests and collectors have been updated",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setCollectorsLoading(false);
    }
  };

  const assignCollector = async (pickupId: string, collectorId: string) => {
    const collector = availableCollectors.find((c) => c.id === collectorId);

    if (!collector) {
      toast({
        title: "Error",
        description: "Selected collector not found",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update the pickup request in Firebase
      await pickupService.assignCollector(
        pickupId,
        collectorId,
        collector.name
      );

      // Update the local state to reflect the change
      setPickupRequests(
        pickupRequests.map((request) =>
          request.id === pickupId
            ? {
                ...request,
                status: "assigned",
                collectorId,
                collectorName: collector.name,
              }
            : request
        )
      );

      // Refresh available collectors to get updated availability
      const updatedCollectorsData =
        await collectorService.getAvailableCollectors();
      const formattedUpdatedCollectors: AvailableCollector[] =
        updatedCollectorsData.map((collector) => ({
          id: collector.id,
          name: collector.name,
          email: collector.email,
          phone: collector.phone,
          isAvailable: collector.isAvailable || true,
        }));
      setAvailableCollectors(formattedUpdatedCollectors);

      toast({
        title: "Collector assigned",
        description: `${collector.name} has been assigned to this pickup request.`,
      });
    } catch (error) {
      console.error("Error assigning collector:", error);
      toast({
        title: "Error",
        description: "Failed to assign collector. Please try again.",
        variant: "destructive",
      });
    }
  };

  const viewPickupDetails = (pickup: (typeof pickupRequests)[0]) => {
    setCurrentPickup(pickup);
    setIsViewDialogOpen(true);
  };

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

  const filteredRequests = pickupRequests.filter((request) => {
    const matchesSearch =
      request.industryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.wasteType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.location?.address &&
        request.location.address
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pickup Requests</h1>
          <p className="text-gray-600 mt-2">
            Manage and assign waste pickup requests
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{filteredRequests.length} requests</Badge>
          <Badge variant="outline" className="text-green-600 border-green-200">
            {availableCollectors.filter((c) => c.isAvailable).length} available
            collectors
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by industry, waste type, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="on-way">On The Way</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pickup Requests List */}
      <div className="space-y-4">
        {pickupRequestsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">
                Loading pickup requests...
              </p>
            </div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No pickup requests found
            </h3>
            <p className="text-gray-600">
              No pickup requests match your current filters.
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <Card
              key={request.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <h3 className="text-lg font-semibold">
                        {request.industryName}
                      </h3>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.replace("-", " ")}
                      </Badge>
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4" />
                          <span>
                            {request.wasteType} - {request.weight}kg
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {request.location?.address ||
                              "Address not available"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            Requested:{" "}
                            {new Date(request.requestedAt).toLocaleString()}
                          </span>
                        </div>
                        {request.collectorName && (
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>Collector: {request.collectorName}</span>
                          </div>
                        )}
                        {request.completedAt && (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              Completed:{" "}
                              {new Date(request.completedAt).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    {request.status === "pending" && (
                      <Select
                        onValueChange={(value) =>
                          assignCollector(request.id, value)
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Assign Collector" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCollectors
                            .filter((c) => c.isAvailable)
                            .map((collector) => (
                              <SelectItem
                                key={collector.id}
                                value={collector.id}
                              >
                                {collector.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewPickupDetails(request)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Pickup Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pickup Request Details</DialogTitle>
          </DialogHeader>
          {currentPickup && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">
                    {currentPickup.industryName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Request ID: {currentPickup.id}
                  </p>
                </div>
                <Badge className={getStatusColor(currentPickup.status)}>
                  {currentPickup.status.replace("-", " ")}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Waste Information
                  </h4>
                  <div className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4" />
                      <span className="text-sm">{currentPickup.wasteType}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        Weight: {currentPickup.weight}kg
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={getPriorityColor(currentPickup.priority)}
                      >
                        {currentPickup.priority} priority
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Location
                  </h4>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 mt-0.5" />
                      <span className="text-sm">
                        {currentPickup?.location?.address ||
                          "Address not available"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Timeline
                  </h4>
                  <div className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">
                        Requested:{" "}
                        {new Date(currentPickup.requestedAt).toLocaleString()}
                      </span>
                    </div>
                    {currentPickup.completedAt && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">
                          Completed:{" "}
                          {new Date(currentPickup.completedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Assigned Collector
                  </h4>
                  <div className="p-3 border rounded-lg">
                    {currentPickup.collectorName ? (
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span className="text-sm">
                          {currentPickup.collectorName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">
                        No collector assigned
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
                {currentPickup.status === "pending" && (
                  <Select
                    onValueChange={(value) =>
                      assignCollector(currentPickup.id, value)
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue
                        placeholder={
                          collectorsLoading
                            ? "Loading..."
                            : availableCollectors.filter((c) => c.isAvailable)
                                .length === 0
                            ? "No Collectors"
                            : "Assign Collector"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {collectorsLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading collectors...
                        </SelectItem>
                      ) : availableCollectors.filter((c) => c.isAvailable)
                          .length === 0 ? (
                        <SelectItem value="no-collectors" disabled>
                          No available collectors
                        </SelectItem>
                      ) : (
                        availableCollectors
                          .filter((c) => c.isAvailable)
                          .map((collector) => (
                            <SelectItem key={collector.id} value={collector.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{collector.name}</span>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                    Available
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground">
                                      {collector.currentLoad || 0}/
                                      {collector.vehicleCapacity || 100}kg
                                    </span>
                                    <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full transition-all duration-300 ${
                                          (collector.currentLoad || 0) /
                                            (collector.vehicleCapacity || 100) >
                                          0.8
                                            ? "bg-red-500"
                                            : (collector.currentLoad || 0) /
                                                (collector.vehicleCapacity ||
                                                  100) >
                                              0.6
                                            ? "bg-yellow-500"
                                            : "bg-green-500"
                                        }`}
                                        ref={(el) => {
                                          if (el) {
                                            const loadPercentage = Math.min(
                                              ((collector.currentLoad || 0) /
                                                (collector.vehicleCapacity ||
                                                  100)) *
                                                100,
                                              100
                                            );
                                            el.style.width = `${loadPercentage}%`;
                                          }
                                        }}
                                      />
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {Math.round(
                                        ((collector.currentLoad || 0) /
                                          (collector.vehicleCapacity || 100)) *
                                          100
                                      )}
                                      %
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
