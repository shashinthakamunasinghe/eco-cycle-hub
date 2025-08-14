"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  Package,
  Search,
  Calendar,
  MapPin,
  Truck,
  X,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { pickupService } from "@/lib/firebase-services";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import type { PickupRequest } from "@/types";

export default function PickupHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const { user } = useFirebaseAuth();

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentPickup, setCurrentPickup] = useState<PickupRequest | null>(
    null
  );
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
  const [pickupToCancel, setPickupToCancel] = useState<PickupRequest | null>(
    null
  );
  const [pickupHistory, setPickupHistory] = useState<PickupRequest[]>([]);

  // Filter pickups based on search term and status
  const filteredPickups = pickupHistory.filter((item) => {
    const matchesSearch =
      item.wasteType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "all") {
      return matchesSearch;
    }
    return matchesSearch && item.status === statusFilter;
  });

  // Load requests from Firestore
  const loadRequests = useCallback(async () => {
    if (!user?.id) return;

    try {
      const requests = await pickupService.getPickupRequestsByIndustry(user.id);
      setPickupHistory(requests);
    } catch (error) {
      console.error("Error loading requests:", error);
      toast({
        title: "Error",
        description: "Failed to load request history. Please try again.",
        variant: "destructive",
      });
    }
  }, [user?.id, toast]);


  useEffect(() => {
    if (user?.id) {
      loadRequests();
    }
  }, [user?.id]);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "on-way":
        return <Truck className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <X className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const viewPickupDetails = (pickup: PickupRequest) => {
    setCurrentPickup(pickup);
    setIsViewDialogOpen(true);
  };

  const confirmCancelPickup = (pickup: PickupRequest) => {
    setPickupToCancel(pickup);
    setIsConfirmCancelOpen(true);
  };

  const cancelPickupConfirmed = async () => {
    if (!pickupToCancel) return;

    try {
      await pickupService.updatePickupRequest(pickupToCancel.id, {
        status: "cancelled",
        cancelledAt: new Date(),
      });

      // Create notification for cancellation
      await pickupService.createPickupNotification(
        { ...pickupToCancel, status: "cancelled" },
        "cancelled"
      );

      toast({
        title: "Pickup cancelled",
        description: `Request ${pickupToCancel.id} has been cancelled successfully.`,
      });

      await loadRequests(); // Refresh the list from Firestore
      setIsConfirmCancelOpen(false);
      setPickupToCancel(null);
    } catch (error) {
      console.error("Error cancelling pickup:", error);
      toast({
        title: "Error",
        description: "Failed to cancel request. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Render functions
  const renderPickupList = () => {
    return filteredPickups.map((item) => (
      <Card key={item.id} className="mb-4">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{item.wasteType}</span>
                <Badge
                  variant="secondary"
                  className={getStatusColor(item.status)}
                >
                  <span className="flex items-center gap-1">
                    {getStatusIcon(item.status)}
                    {item.status}
                  </span>
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(item.requestedAt).toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{item.location.address}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span>{item.collectorName || "Not assigned"}</span>
                </div>

                {item.cancelledAt && (
                  <div className="flex items-center gap-2 text-red-500">
                    <X className="h-4 w-4" />
                    <span>
                      Cancelled: {new Date(item.cancelledAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => viewPickupDetails(item)}
              >
                View Details
              </Button>

              {item.status === "pending" && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => confirmCancelPickup(item)}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  };

  // Render pickup details dialog
  const renderPickupDetailsDialog = () => {
    if (!currentPickup) return null;

    return (
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pickup Request Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Status Information</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Current Status:</strong>{" "}
                  <Badge
                    variant="secondary"
                    className={getStatusColor(currentPickup.status)}
                  >
                    {currentPickup.status}
                  </Badge>
                </div>
                <div>
                  <strong>Requested:</strong>{" "}
                  {new Date(currentPickup.requestedAt).toLocaleString()}
                </div>
                {currentPickup.completedAt && (
                  <div>
                    <strong>Completed:</strong>{" "}
                    {new Date(currentPickup.completedAt).toLocaleString()}
                  </div>
                )}
                {currentPickup.cancelledAt && (
                  <div className="text-red-500">
                    <strong>Cancelled:</strong>{" "}
                    {new Date(currentPickup.cancelledAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Pickup Details</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Waste Type:</strong> {currentPickup.wasteType}
                </div>
                <div>
                  <strong>Weight:</strong> {currentPickup.weight} kg
                </div>
                <div>
                  <strong>Address:</strong> {currentPickup.location.address}
                </div>
                <div>
                  <strong>Collector:</strong>{" "}
                  {currentPickup.collectorName || "Not assigned"}
                </div>
                {currentPickup.notes && (
                  <div>
                    <strong>Notes:</strong> {currentPickup.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pickup History</h1>
        <p className="text-gray-600 mt-2">
          View and manage your waste pickup requests
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by waste type, address, or request ID..."
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

      {/* History List */}
      <div className="space-y-4">{renderPickupList()}</div>

      {filteredPickups.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {pickupHistory.length === 0
              ? "No pickup requests found. Create your first request to get started."
              : "No pickup requests found matching your criteria."}
          </p>
        </div>
      )}

      {/* View Details Dialog */}
      {renderPickupDetailsDialog()}

      {/* Confirm Cancel Dialog */}
      <Dialog open={isConfirmCancelOpen} onOpenChange={setIsConfirmCancelOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Pickup Request</DialogTitle>
          </DialogHeader>
          {pickupToCancel && (
            <div className="py-4">
              <p className="mb-4">
                Are you sure you want to cancel the pickup request{" "}
                <strong>{pickupToCancel.id}</strong> for{" "}
                <strong>{pickupToCancel.wasteType}</strong>?
              </p>
              <p className="text-sm text-gray-600 mb-4">
                The request will be marked as cancelled but will remain in your
                history.
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsConfirmCancelOpen(false)}
                >
                  No, Keep Request
                </Button>
                <Button variant="destructive" onClick={cancelPickupConfirmed}>
                  Yes, Cancel Request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
