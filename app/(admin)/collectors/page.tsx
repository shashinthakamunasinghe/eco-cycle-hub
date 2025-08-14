"use client";

import { useState, useEffect, useCallback } from "react";
import { onSnapshot, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Truck,
  Phone,
  Mail,
  Search,
  UserPlus,
  Eye,
  Loader2,
  Trash2,
  FileText,
  Edit,
  UserX,
  Download,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collectorService, userService } from "@/lib/firebase-services";
import type { CollectorProfile, User as UserType } from "@/types";

interface UserWithCollectorFields extends UserType {
  licenseNumber?: string;
  vehicleType?: string;
  vehicleModel?: string;
  truckCapacity?: number;
  experience?: string;
  isAvailable?: boolean;
  rating?: number;
  completedPickups?: number;
  emergencyContact?: string;
  workingHours?: string;
  specializations?: string[];
}

type CollectorWithUser = CollectorProfile & { userInfo?: UserType };

export default function AdminCollectorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();
  const { register } = useFirebaseAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewCollector, setViewCollector] = useState<CollectorWithUser | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [collectorToBlock, setCollectorToBlock] =
    useState<CollectorWithUser | null>(null);
  const [collectorToDelete, setCollectorToDelete] =
    useState<CollectorWithUser | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [collectors, setCollectors] = useState<CollectorWithUser[]>([]);
  const [pickups, setPickups] = useState<any[]>([]);

  const [newCollector, setNewCollector] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    vehicleCapacity: "",
    vehicleType: "Truck",
    vehicleModel: "",
    licenseNumber: "",
    experience: "0-1 years",
    emergencyContact: "",
    password: "",
    confirmPassword: "",
  });

  // Load collectors from Firebase with real-time updates
  const loadCollectors = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🔄 Loading collectors with real-time data...");

      // Get collector profiles which have the most up-to-date availability data
      const collectorProfiles =
        await collectorService.getAllCollectorProfiles();
      console.log("📊 Collector profiles loaded:", collectorProfiles.length);

      // Also get user data for additional information
      const userData = await collectorService.getAllCollectors();
      console.log("👥 User data loaded:", userData.length);

      // Merge collector profiles with user data
      const mergedCollectors = collectorProfiles.map((profile) => {
        const user = userData.find(
          (u) => u.id === profile.id || u.email === profile.email
        );
        const mergedCollector = {
          ...profile,
          // Use profile data as primary source, fall back to user data
          isAvailable:
            profile.isAvailable !== undefined
              ? profile.isAvailable
              : user?.isAvailable || false,
          truckCapacity: profile.vehicleCapacity || user?.truckCapacity || 0,
          currentLoad: user?.currentLoad || 0,
          assignedRequests: user?.assignedRequests || [],
          // Ensure address is preserved from profile (collector profile takes precedence)
          address: profile.address || user?.address || "",
          userInfo: user,
        };

        // Log address data for debugging
        if (!mergedCollector.address) {
          console.warn(
            `⚠️ Missing address for collector: ${profile.name} (ID: ${profile.id})`
          );
          console.log("Profile address:", profile.address);
          console.log("User address:", user?.address);
        }

        return mergedCollector;
      }) as CollectorWithUser[];

      console.log(
        "✅ Merged collector data:",
        mergedCollectors.map((c) => ({
          id: c.id,
          name: c.name,
          isAvailable: c.isAvailable,
          lastActivity: c.lastActivity,
          address: c.address, // Added address to debug logging
        }))
      );

      setCollectors(mergedCollectors);
    } catch (error) {
      console.error("❌ Error loading collectors:", error);
      toast({
        title: "Error",
        description: "Failed to load collectors data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Set up real-time listeners for collector availability updates
  useEffect(() => {
    if (!db) return;

    console.log("🔄 Setting up real-time listeners for collector data...");

    // Listen to collector profiles for real-time availability updates
    const collectorProfilesQuery = query(collection(db, "collectorProfiles"));
    const unsubscribeProfiles = onSnapshot(
      collectorProfilesQuery,
      (snapshot) => {
        console.log("📡 Real-time update received for collector profiles");
        setLastUpdate(new Date());

        snapshot.docChanges().forEach((change) => {
          const profileData = {
            id: change.doc.id,
            ...change.doc.data(),
          } as CollectorProfile;

          if (change.type === "modified") {
            console.log("🔄 Collector profile updated:", {
              id: profileData.id,
              name: profileData.name,
              isAvailable: profileData.isAvailable,
              lastActivity: profileData.lastActivity,
            });

            // Update the specific collector in our state
            setCollectors((prevCollectors) =>
              prevCollectors.map((collector) =>
                collector.id === profileData.id
                  ? {
                      ...collector,
                      isAvailable:
                        profileData.isAvailable !== undefined
                          ? profileData.isAvailable
                          : collector.isAvailable,
                      lastActivity:
                        profileData.lastActivity || collector.lastActivity,
                      status: (
                        profileData.isAvailable !== undefined
                          ? profileData.isAvailable
                          : collector.isAvailable
                      )
                        ? "active"
                        : "inactive",
                    }
                  : collector
              )
            );
          }
        });
      },
      (error) => {
        console.error("❌ Error in real-time listener:", error);
      }
    );

    // Listen to users collection for additional real-time updates
    const usersQuery = query(
      collection(db, "users"),
      where("role", "==", "collector")
    );
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "modified") {
          const userData = {
            id: change.doc.id,
            ...change.doc.data(),
          } as UserType;
          console.log("👥 User data updated:", {
            id: userData.id,
            name: userData.name,
            isAvailable: userData.isAvailable,
          });

          // Update collector data with user info
          setCollectors((prevCollectors) =>
            prevCollectors.map((collector) =>
              collector.id === userData.id
                ? {
                    ...collector,
                    currentLoad: userData.currentLoad || collector.currentLoad,
                    assignedRequests:
                      userData.assignedRequests || collector.assignedRequests,
                    userInfo: userData,
                  }
                : collector
            )
          );
        }
      });
    });

    // Cleanup listeners on unmount
    return () => {
      console.log("🧹 Cleaning up real-time listeners");
      unsubscribeProfiles();
      unsubscribeUsers();
    };
  }, []);

  // Auto-refresh data every 30 seconds as backup
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("🔄 Auto-refresh collector data (backup)");
      loadCollectors();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [loadCollectors]);

  useEffect(() => {
    loadCollectors();
  }, [loadCollectors]);

  const toggleAvailability = async (
    collectorId: string,
    currentStatus: boolean
  ) => {
    const newStatus = !currentStatus;
    try {
      console.log(
        `🔄 Updating availability for collector ${collectorId}: ${currentStatus} -> ${newStatus}`
      );

      // Update both user record and collector profile for consistency
      await Promise.all([
        collectorService.updateCollectorAvailability(collectorId, newStatus),
        collectorService.updateCollectorProfile(collectorId, {
          isAvailable: newStatus,
          lastActivity: new Date().toISOString(),
        }),
      ]);

      // Update local state immediately for responsive UI
      setCollectors((prevCollectors) =>
        prevCollectors.map((collector) =>
          collector.id === collectorId
            ? {
                ...collector,
                isAvailable: newStatus,
                status: newStatus ? "active" : "inactive",
                lastActivity: new Date().toISOString(),
              }
            : collector
        )
      );

      toast({
        title: "Availability updated",
        description: `Collector is now ${newStatus ? "available" : "offline"}.`,
      });

      console.log(
        `✅ Availability updated successfully for collector ${collectorId}`
      );
    } catch (error) {
      console.error("❌ Error updating availability:", error);
      toast({
        title: "Error",
        description: "Failed to update collector availability.",
        variant: "destructive",
      });
    }
  };

  const handleAddCollector = async () => {
    if (
      !newCollector.name ||
      !newCollector.email ||
      !newCollector.password ||
      !newCollector.vehicleCapacity
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields including password.",
        variant: "destructive",
      });
      return;
    }

    if (!newCollector.address || newCollector.address.trim() === "") {
      toast({
        title: "Validation Error",
        description:
          "Address is required for proper navigation and pickup assignments.",
        variant: "destructive",
      });
      return;
    }

    if (newCollector.password !== newCollector.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const newUser = await register(
        newCollector.email,
        newCollector.password,
        {
          name: newCollector.name,
          email: newCollector.email,
          phone: newCollector.phone,
          address: newCollector.address, // Ensure address is saved to user record
          role: "collector" as const,
          isAvailable: true,
          truckCapacity: Number.parseInt(newCollector.vehicleCapacity),
          currentLoad: 0,
          assignedRequests: [],
          createdAt: new Date(),
        }
      );

      // Create comprehensive collector profile with all necessary data
      const collectorProfile: CollectorProfile = {
        id: newUser.id,
        name: newCollector.name,
        email: newCollector.email,
        phone: newCollector.phone,
        address: newCollector.address, // Ensure address is saved to collector profile
        licenseNumber: newCollector.licenseNumber,
        vehicleType: newCollector.vehicleType as "truck" | "van" | "motorcycle",
        vehicleModel: newCollector.vehicleModel,
        vehicleCapacity: Number.parseInt(newCollector.vehicleCapacity),
        experience: newCollector.experience,
        status: "active" as const,
        rating: 0,
        completedPickups: 0,
        avatar: "/placeholder-user.jpg",
        joinedDate: new Date().toISOString().split("T")[0],
        emergencyContact: newCollector.emergencyContact,
        workingHours: "8:00 AM - 6:00 PM",
        specializations: [],
        isAvailable: true,
        lastActivity: new Date().toISOString(),
      };

      // Save collector profile
      await collectorService.setCollectorProfile(newUser.id, collectorProfile);

      // Also update the user record to ensure address consistency for navigation
      await userService.updateUser(newUser.id, {
        address: newCollector.address,
        phone: newCollector.phone,
      });

      console.log("✅ New collector created:", {
        id: newUser.id,
        name: newCollector.name,
        address: newCollector.address,
        email: newCollector.email,
      });

      await loadCollectors();

      setIsAddDialogOpen(false);
      setNewCollector({
        name: "",
        email: "",
        phone: "",
        address: "",
        vehicleCapacity: "",
        vehicleType: "Truck",
        vehicleModel: "",
        licenseNumber: "",
        experience: "0-1 years",
        emergencyContact: "",
        password: "",
        confirmPassword: "",
      });

      toast({
        title: "Collector added",
        description: `${newCollector.name} has been successfully added as a collector.`,
      });
    } catch (error) {
      console.error("Error adding collector:", error);
      toast({
        title: "Error adding collector",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewCollector = (collector: CollectorWithUser) => {
    setViewCollector(collector);
    setIsViewDialogOpen(true);
  };

  const handleSuspendCollector = (collector: CollectorWithUser) => {
    setCollectorToBlock(collector);
    setIsConfirmDialogOpen(true);
  };

  const handleDeleteCollector = (collector: CollectorWithUser) => {
    setCollectorToDelete(collector);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCollector = async () => {
    if (!collectorToDelete) return;

    if (confirmText.toLowerCase() !== "confirm") {
      toast({
        title: "Confirmation Required",
        description: "Please type 'confirm' to proceed with deletion.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log(
        `🗑️ Attempting to delete collector: ${collectorToDelete.name} (${collectorToDelete.id})`
      );

      await collectorService.deleteCollector(collectorToDelete.id);

      // Remove from local state
      setCollectors(collectors.filter((c) => c.id !== collectorToDelete.id));

      // Close dialog and reset state
      setIsDeleteDialogOpen(false);
      setCollectorToDelete(null);

      toast({
        title: "Collector deleted",
        description: `${collectorToDelete.name} has been permanently deleted from the system. All assigned pickup requests have been reset to pending.`,
        variant: "destructive",
      });

      console.log(
        `✅ Collector ${collectorToDelete.name} deleted successfully`
      );
    } catch (error) {
      console.error("❌ Error deleting collector:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      const errorCode = (error as any)?.code || "unknown";
      console.error("❌ Error details:", {
        message: errorMessage,
        code: errorCode,
        error: error
      });
      toast({
        title: "Error deleting collector",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete collector. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmBlockCollector = async () => {
    if (!collectorToBlock) return;

    try {
      await toggleAvailability(
        collectorToBlock.id,
        collectorToBlock.isAvailable || false
      );
      setIsConfirmDialogOpen(false);
      setCollectorToBlock(null);
    } catch (error) {
      console.error("Error blocking collector:", error);
    }
  };

  const filteredCollectors = collectors.filter(
    (collector) => {
      // First ensure collector has required data
      if (!collector.name || !collector.email || !collector.id) {
        return false;
      }
      
      // Then apply search filter
      return (
        collector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collector.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatLastActivity = (timestamp?: Date | string) => {
    if (!timestamp) return "Never";

    const date =
      typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading collector data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Collectors Management
          </h1>
          <div className="flex items-center space-x-2">
            <p className="text-gray-600">
              Manage waste collectors and their assignments
            </p>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600">Live Updates</span>
              <span className="text-xs text-gray-400">
                (Last: {lastUpdate.toLocaleTimeString()})
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadCollectors}
            disabled={loading}
          >
            <RotateCcw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Syncing..." : "Sync Data"}
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Collector
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Register New Collector</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={newCollector.name}
                    onChange={(e) =>
                      setNewCollector((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Enter collector's full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCollector.email}
                    onChange={(e) =>
                      setNewCollector((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newCollector.phone}
                    onChange={(e) =>
                      setNewCollector((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={newCollector.address}
                    onChange={(e) =>
                      setNewCollector((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    placeholder="Enter complete address for navigation"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Required for pickup navigation and assignments
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleCapacity">
                    Vehicle Capacity (kg) *
                  </Label>
                  <Input
                    id="vehicleCapacity"
                    type="number"
                    value={newCollector.vehicleCapacity}
                    onChange={(e) =>
                      setNewCollector((prev) => ({
                        ...prev,
                        vehicleCapacity: e.target.value,
                      }))
                    }
                    placeholder="Enter vehicle capacity in kg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newCollector.password}
                    onChange={(e) =>
                      setNewCollector((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Enter password (min. 6 characters)"
                    minLength={6}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={newCollector.confirmPassword}
                    onChange={(e) =>
                      setNewCollector((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Confirm password"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddCollector} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Add Collector"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Collectors
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectors.length}</div>
            <p className="text-xs text-muted-foreground">
              Registered collectors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Online
            </CardTitle>
            <Truck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {collectors.filter((c) => c.isAvailable === true).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for new pickups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Offline Collectors
            </CardTitle>
            <FileText className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {collectors.filter((c) => c.isAvailable === false).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently offline</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search collectors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status message */}
      {!loading && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredCollectors.length} of {collectors.length} collectors from database
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      )}

      {/* Collectors Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Collector</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vehicle Details</TableHead>
                <TableHead>Current Assignments</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCollectors.map((collector) => (
                <TableRow key={collector.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={collector.avatar || "/placeholder-user.jpg"}
                          alt={collector.name}
                        />
                        <AvatarFallback>
                          {collector.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{collector.name}</div>
                        <div className="text-sm text-gray-500">
                          ID: {collector.id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{collector.email}</div>
                      <div className="text-sm text-gray-500">
                        {collector.phone || "No phone"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {collector.address || "No address"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            collector.isAvailable ? "default" : "secondary"
                          }
                          className={
                            collector.isAvailable
                              ? "bg-green-100 text-green-800 border-green-300"
                              : "bg-red-100 text-red-800 border-red-300"
                          }
                        >
                          <div
                            className={`w-2 h-2 rounded-full mr-1 ${
                              collector.isAvailable
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          {collector.isAvailable ? "Available" : "Offline"}
                        </Badge>
                        {collector.isAvailable && (
                          <div
                            className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                            title="Real-time status"
                          ></div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Joined {formatDate(collector.joinedDate)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Last activity:{" "}
                        {formatLastActivity(collector.lastActivity)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        Type: {collector.vehicleType || "Not specified"}
                      </div>
                      <div className="text-sm">
                        Model: {collector.vehicleModel || "Not specified"}
                      </div>
                      <div className="text-sm font-medium">Truck Capacity</div>
                      <div className="text-sm text-gray-600">
                        {collector.currentLoad || 0}kg /{" "}
                        {collector.vehicleCapacity || 0}kg
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              ((collector.currentLoad || 0) /
                                (collector.vehicleCapacity || 1)) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {collector.assignedRequests?.length || 0} pickups
                        assigned
                      </div>
                      <div className="text-sm text-gray-500">
                        {collector.completedPickups || 0} pickups completed
                      </div>
                      {(collector.assignedRequests?.length || 0) > 0 ? (
                        <Badge variant="outline" className="text-xs">
                          On-way
                        </Badge>
                      ) : (
                        <div className="text-xs text-green-600">
                          No current assignments
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewCollector(collector)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setViewCollector(collector);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSuspendCollector(collector)}
                        className={
                          collector.isAvailable
                            ? "text-red-600 hover:text-red-700"
                            : "text-green-600 hover:text-green-700"
                        }
                      >
                        {collector.isAvailable ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCollector(collector)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredCollectors.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No collectors found matching your search.
          </p>
        </div>
      )}

      {/* View Collector Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Collector Details</DialogTitle>
            <DialogDescription>
              View detailed information about the collector.
            </DialogDescription>
          </DialogHeader>
          {viewCollector && (
            <div className="space-y-6 py-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={viewCollector.avatar || "/placeholder-user.jpg"}
                    alt={viewCollector.name}
                  />
                  <AvatarFallback>
                    {viewCollector.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {viewCollector.name}
                  </h3>
                  <Badge
                    variant={
                      viewCollector.isAvailable ? "default" : "secondary"
                    }
                  >
                    {viewCollector.isAvailable ? "Available" : "Offline"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <p className="text-sm text-gray-600">{viewCollector.email}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="text-sm text-gray-600">{viewCollector.phone}</p>
                </div>
                <div>
                  <Label>Address</Label>
                  <p className="text-sm text-gray-600">
                    {viewCollector.address}
                  </p>
                </div>
                <div>
                  <Label>Vehicle Capacity</Label>
                  <p className="text-sm text-gray-600">
                    {viewCollector.vehicleCapacity}kg
                  </p>
                </div>
                <div>
                  <Label>Completed Pickups</Label>
                  <p className="text-sm text-gray-600">
                    {viewCollector.completedPickups || 0}
                  </p>
                </div>
                <div>
                  <Label>Joined Date</Label>
                  <p className="text-sm text-gray-600">
                    {formatDate(viewCollector.joinedDate)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enhanced Edit Collector Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Collector Profile</DialogTitle>
            <DialogDescription>
              Update collector information and vehicle details.
            </DialogDescription>
          </DialogHeader>
          {viewCollector && (
            <div className="space-y-6 py-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={viewCollector.avatar || "/placeholder-user.jpg"}
                    alt={viewCollector.name}
                  />
                  <AvatarFallback>
                    {viewCollector.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {viewCollector.name}
                  </h3>
                  <Badge
                    variant={
                      viewCollector.isAvailable ? "default" : "secondary"
                    }
                  >
                    {viewCollector.isAvailable ? "Available" : "Offline"}
                  </Badge>
                </div>
              </div>

              <Tabs defaultValue="details" className="w-full">
                <TabsList>
                  <TabsTrigger value="details">Basic Details</TabsTrigger>
                  <TabsTrigger value="vehicle">Vehicle Info</TabsTrigger>
                  <TabsTrigger value="assignments">Assignments</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Full Name</Label>
                      <Input
                        id="edit-name"
                        defaultValue={viewCollector.name}
                        placeholder="Enter collector's full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        defaultValue={viewCollector.email}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">Phone</Label>
                      <Input
                        id="edit-phone"
                        defaultValue={viewCollector.phone}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-address">Address</Label>
                      <Input
                        id="edit-address"
                        defaultValue={viewCollector.address}
                        placeholder="Enter address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-experience">Experience</Label>
                      <Input
                        id="edit-experience"
                        defaultValue={viewCollector.experience}
                        placeholder="e.g., 2 years"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-emergency">Emergency Contact</Label>
                      <Input
                        id="edit-emergency"
                        defaultValue={viewCollector.emergencyContact}
                        placeholder="Emergency contact number"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="vehicle" className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-vehicle-type">Vehicle Type</Label>
                      <Input
                        id="edit-vehicle-type"
                        defaultValue={viewCollector.vehicleType}
                        placeholder="e.g., Truck, Van"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-vehicle-model">Vehicle Model</Label>
                      <Input
                        id="edit-vehicle-model"
                        defaultValue={viewCollector.vehicleModel}
                        placeholder="Vehicle model"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-vehicle-capacity">
                        Vehicle Capacity (kg)
                      </Label>
                      <Input
                        id="edit-vehicle-capacity"
                        type="number"
                        defaultValue={viewCollector.vehicleCapacity}
                        placeholder="Vehicle capacity in kg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-license">License Number</Label>
                      <Input
                        id="edit-license"
                        defaultValue={viewCollector.licenseNumber}
                        placeholder="Driving license number"
                      />
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Current Load Status</h4>
                    <div className="text-sm text-gray-600">
                      Current Load: {viewCollector.currentLoad || 0}kg /{" "}
                      {viewCollector.vehicleCapacity || 0}kg
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            ((viewCollector.currentLoad || 0) /
                              (viewCollector.vehicleCapacity || 1)) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="assignments" className="py-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Current Assignments</Label>
                        <p className="text-sm text-gray-600">
                          {viewCollector.assignedRequests?.length || 0} active
                          pickups
                        </p>
                      </div>
                      <div>
                        <Label>Completed Pickups</Label>
                        <p className="text-sm text-gray-600">
                          {viewCollector.completedPickups || 0} total completed
                        </p>
                      </div>
                    </div>

                    {(viewCollector.assignedRequests?.length || 0) > 0 ? (
                      <div className="space-y-2">
                        <Label>Active Assignments:</Label>
                        {viewCollector.assignedRequests?.map(
                          (requestId: string) => (
                            <div key={requestId} className="p-3 border rounded">
                              <p className="text-sm">Request ID: {requestId}</p>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">No current assignments</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-between pt-4 border-t">
                <div className="flex space-x-2">
                  <Button
                    variant={
                      viewCollector.isAvailable ? "destructive" : "default"
                    }
                    onClick={() => {
                      toggleAvailability(
                        viewCollector.id,
                        viewCollector.isAvailable || false
                      );
                      setViewCollector({
                        ...viewCollector,
                        isAvailable: !viewCollector.isAvailable,
                      });
                    }}
                  >
                    {viewCollector.isAvailable
                      ? "Suspend Collector"
                      : "Activate Collector"}
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button>Save Changes</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Suspend/Block Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {collectorToBlock?.isAvailable
                ? "Suspend Collector"
                : "Activate Collector"}
            </DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to{" "}
            {collectorToBlock?.isAvailable ? "suspend" : "activate"}{" "}
            <span className="font-semibold">{collectorToBlock?.name}</span>?
            {collectorToBlock?.isAvailable && (
              <span className="block mt-2 text-sm text-gray-600">
                The collector will be set to offline and won't receive new
                assignments.
              </span>
            )}
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={
                collectorToBlock?.isAvailable ? "destructive" : "default"
              }
              onClick={confirmBlockCollector}
            >
              {collectorToBlock?.isAvailable ? "Suspend" : "Activate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setConfirmText("");
            setCollectorToDelete(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              <span>Delete Collector</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>⚠️ This action cannot be undone!</strong>
              </p>
              <p className="text-sm text-red-700 mt-2">
                This will permanently delete{" "}
                <span className="font-semibold">{collectorToDelete?.name}</span>{" "}
                and:
              </p>
              <ul className="text-sm text-red-700 mt-2 list-disc list-inside">
                <li>All collector profile data</li>
                <li>Assigned pickup requests (will be reset to pending)</li>
                <li>All notifications</li>
                <li>Account access</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-text" className="text-sm font-medium">
                Type{" "}
                <span className="font-mono bg-gray-100 px-1 rounded">
                  confirm
                </span>{" "}
                to proceed:
              </Label>
              <Input
                id="confirm-text"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type 'confirm' here"
                className={`font-mono ${
                  confirmText && confirmText.toLowerCase() !== "confirm"
                    ? "border-red-300 focus:border-red-500"
                    : confirmText.toLowerCase() === "confirm"
                    ? "border-green-300 focus:border-green-500"
                    : ""
                }`}
                autoComplete="off"
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    confirmText.toLowerCase() === "confirm"
                  ) {
                    confirmDeleteCollector();
                  }
                }}
              />
              {confirmText && confirmText.toLowerCase() !== "confirm" && (
                <p className="text-xs text-red-600">
                  Please type exactly "confirm" to enable deletion
                </p>
              )}
              {confirmText.toLowerCase() === "confirm" && (
                <p className="text-xs text-green-600">
                  ✓ Confirmation text verified
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setConfirmText("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteCollector}
              disabled={loading || confirmText.toLowerCase() !== "confirm"}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Permanently
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
