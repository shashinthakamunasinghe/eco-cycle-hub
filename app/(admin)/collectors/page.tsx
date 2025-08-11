"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Truck,
  MapPin,
  Phone,
  Mail,
  Search,
  UserPlus,
  Eye,
  Ban,
  Loader2,
  Trash2,
  Clock,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
// Commented out unused imports
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collectorService } from "@/lib/firebase-services";
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
  const [isUpdating, setIsUpdating] = useState(false);
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
  const [collectors, setCollectors] = useState<CollectorWithUser[]>([]);
  // Mock pickups data until we can fetch real data
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

  // Load collectors from Firebase
  const loadCollectors = useCallback(async () => {
    try {
      setLoading(true);
      const collectorsData = await collectorService.getAllCollectors();
      // Transform User[] to CollectorWithUser[] by casting to proper type
      const transformedCollectors = collectorsData.map((user) => {
        const userWithCollectorFields = user as UserWithCollectorFields;
        return {
          ...user,
          // Add CollectorProfile specific fields with defaults
          licenseNumber: userWithCollectorFields.licenseNumber || "",
          vehicleType: userWithCollectorFields.vehicleType || "Truck",
          vehicleModel: userWithCollectorFields.vehicleModel || "",
          vehicleCapacity: user.truckCapacity || 0,
          experience: userWithCollectorFields.experience || "",
          status: user.isAvailable ? "active" : "inactive",
          rating: userWithCollectorFields.rating || 0,
          completedPickups: userWithCollectorFields.completedPickups || 0,
          joinedDate: user.createdAt.toISOString(),
          emergencyContact: userWithCollectorFields.emergencyContact || "",
          workingHours: userWithCollectorFields.workingHours || "9 AM - 5 PM",
          specializations: userWithCollectorFields.specializations || [],
          userInfo: user,
        };
      }) as CollectorWithUser[];
      setCollectors(transformedCollectors);
    } catch (error) {
      console.error("Error loading collectors:", error);
      toast({
        title: "Error",
        description: "Failed to load collectors data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Calculate current load for each collector based on assigned pickups
  const getCollectorWithLoad = (collector: CollectorProfile) => {
    // Get all assigned pickups for this collector that are not completed or cancelled
    const collectorPickups = pickups.filter(
      (pickup) =>
        pickup.collectorId === collector.id &&
        !["completed", "cancelled"].includes(pickup.status)
    );

    // Calculate total weight of assigned pickups
    const assignedLoad = collectorPickups.reduce(
      (sum, pickup) => sum + pickup.weight,
      0
    );

    // Get vehicle capacity as a number
    const vehicleCapacity =
      typeof collector.vehicleCapacity === "string"
        ? parseFloat(collector.vehicleCapacity)
        : collector.vehicleCapacity || 0;

    // Calculate capacity percentage
    const capacityPercentage =
      vehicleCapacity > 0 ? (assignedLoad / vehicleCapacity) * 100 : 0;

    return {
      ...collector,
      currentLoad: assignedLoad,
      capacityPercentage: Math.min(capacityPercentage, 100), // Cap at 100%
      assignedPickups: collectorPickups,
    };
  };

  // Apply load calculations to all collectors
  const collectorsWithLoad = collectors.map(getCollectorWithLoad);

  // Calculate total completed pickups from actual pickup data
  const totalCompletedPickups = pickups.filter(
    (pickup) => pickup.status === "completed"
  ).length;

  // Alternative: Calculate by collector profile data
  const totalCompletedFromProfiles = collectors.reduce(
    (sum, c) => sum + (c.completedPickups || 0),
    0
  );

  // Debug logging
  useEffect(() => {
    loadCollectors();
  }, [loadCollectors]);

  const toggleAvailability = async (
    collectorId: string,
    currentStatus: boolean
  ) => {
    const newStatus = !currentStatus;
    try {
      // Update in Firebase
      await collectorService.updateCollectorAvailability(
        collectorId,
        newStatus
      );

      // Update local state
      setCollectors(
        collectors.map((collector) =>
          collector.id === collectorId
            ? { ...collector, isAvailable: newStatus }
            : collector
        )
      );
      toast({
        title: "Availability updated",
        description: `Collector is now ${newStatus ? "available" : "offline"}.`,
      });
    } catch (error) {
      console.error("Error updating availability:", error);
      toast({
        title: "Error",
        description: "Failed to update collector availability.",
        variant: "destructive",
      });
    }
  };

  const handleAddCollector = async () => {
    // Basic validation
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

    // Password confirmation validation
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
      console.log("🔧 Admin: Creating new collector...", {
        name: newCollector.name,
        email: newCollector.email,
        phone: newCollector.phone,
        address: newCollector.address,
        vehicleCapacity: newCollector.vehicleCapacity,
        hasPassword: !!newCollector.password,
      });

      // Register user with Firebase Auth and create user document
      const newUser = await register(newCollector.email, newCollector.password, {
        name: newCollector.name,
        email: newCollector.email,
        phone: newCollector.phone,
        address: newCollector.address,
        role: "collector" as const,
        // Collector specific fields
        isAvailable: true,
        truckCapacity: Number.parseInt(newCollector.vehicleCapacity),
        currentLoad: 0,
        assignedRequests: [],
        createdAt: new Date(),
      });

      // Also create a collector profile in the collectorProfiles collection
      const collectorProfile: CollectorProfile = {
        id: newUser.id,
        name: newCollector.name,
        email: newCollector.email,
        phone: newCollector.phone,
        address: newCollector.address,
        licenseNumber: newCollector.licenseNumber,
        vehicleType: newCollector.vehicleType as 'truck' | 'van' | 'motorcycle',
        vehicleModel: newCollector.vehicleModel,
        vehicleCapacity: Number.parseInt(newCollector.vehicleCapacity),
        experience: newCollector.experience,
        status: 'active' as const,
        rating: 0,
        completedPickups: 0,
        avatar: '/placeholder-user.jpg',
        joinedDate: new Date().toISOString().split('T')[0],
        emergencyContact: newCollector.emergencyContact,
        workingHours: '8:00 AM - 6:00 PM',
        specializations: [],
        isAvailable: true,
        lastActivity: new Date().toISOString(),
      };

      // Save collector profile
      await collectorService.setCollectorProfile(newUser.id, collectorProfile);

      console.log("✅ Collector profile created successfully");

      // Reload collectors from Firebase to get the updated list
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

  const handleSyncCompletedPickups = async () => {
    if (
      !confirm(
        "This will update all collector profiles with their actual completed pickup counts from the database. Continue?"
      )
    )
      return;

    setIsUpdating(true);
    try {
      setLoading(true);

      console.log("🔧 Admin: Creating new collector...", {
        name: newCollector.name,
        email: newCollector.email,
        phone: newCollector.phone,
        address: newCollector.address,
        vehicleCapacity: newCollector.vehicleCapacity,
        hasPassword: !!newCollector.password,
      });

      // Register user with Firebase Auth and create user document
      // Ignoring userCredential return value as we don't need it
      await register(newCollector.email, newCollector.password, {
        name: newCollector.name,
        email: newCollector.email,
        phone: newCollector.phone,
        address: newCollector.address,
        role: "collector" as const,
        // Collector specific fields
        isAvailable: true,
        truckCapacity: Number.parseInt(newCollector.vehicleCapacity),
        currentLoad: 0,
        assignedRequests: [],
        createdAt: new Date(),
      });

      // Reload collectors from Firebase to get the updated list
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

  // Remove the unused function since toggleAvailability is called directly
  // If you want to keep this function, you should replace the direct toggleAvailability calls with it

  const handleDeleteCollector = (collector: CollectorWithUser) => {
    setCollectorToDelete(collector);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCollector = async () => {
    if (!collectorToDelete) return;

    try {
      setLoading(true);
      console.log("🗑️ Deleting collector:", collectorToDelete.id);

      // Delete from Firestore
      await collectorService.deleteCollector(collectorToDelete.id);

      // Update local state
      setCollectors(collectors.filter((c) => c.id !== collectorToDelete.id));
      setIsDeleteDialogOpen(false);
      setCollectorToDelete(null);

      toast({
        title: "Collector deleted",
        description: `${collectorToDelete.name} has been permanently deleted from the system.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error("❌ Error deleting collector:", error);
      toast({
        title: "Error deleting collector",
        description: "Failed to delete collector. Please try again.",
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
    (collector) =>
      collector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collector.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date utility function
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format last activity function
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

  // Show loading state
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Collector Management
          </h1>
          <p className="text-gray-600">
            Manage {filteredCollectors.length} collector
            {filteredCollectors.length !== 1 ? "s" : ""}
          </p>
          <p className="text-gray-600 mt-2">
            Manage waste collectors and their assignments
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Collector
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register New Collector</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
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
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newCollector.address}
                  onChange={(e) =>
                    setNewCollector((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="Enter address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleCapacity">Vehicle Capacity (kg)</Label>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
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
                  placeholder="Enter password"
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Collectors
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectors.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Collectors
            </CardTitle>
            <Truck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{collectors.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Offline Collectors
            </CardTitle>
            <Truck className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {collectors.filter((c) => c.isAvailable === true).length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Ready for new pickups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              With Assignments
            </CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {
                collectors.filter((c) => (c.assignedRequests?.length || 0) > 0)
                  .length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCollectors.map((collector) => (
          <Card
            key={collector.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage
                    src={collector.avatar || "/placeholder-user.jpg"}
                    alt={collector.name}
                  />
                  <AvatarFallback>{collector.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{collector.name}</h3>
                  <Badge
                    variant={collector.isAvailable ? "default" : "secondary"}
                  >
                    {collector.isAvailable ? "Available" : "Offline"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{collector.email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{collector.phone || "No phone"}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="truncate">
                    {collector.address || "No address"}
                  </span>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="font-medium text-sm flex items-center">
                  <Truck className="h-4 w-4 mr-2" />
                  Vehicle Details
                </h4>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div>
                    <p className="text-gray-600">Type:</p>
                    <p>{collector.vehicleType || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Model:</p>
                    <p>{collector.vehicleModel || "Not specified"}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Truck className="h-4 w-4" />
                <span>
                  {collector.currentLoad || 0}kg /{" "}
                  {collector.vehicleCapacity || 0}kg
                </span>
              </div>

              {/* Capacity Gauge */}
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Truck Capacity</span>
                  <span className="font-medium">
                    {collector.currentLoad || 0}kg /{" "}
                    {collector.vehicleCapacity || 0}kg
                  </span>
                </div>
              </div>

              <div className="flex justify-between space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewCollector(collector)}
                >
                  <Eye className="mr-1 h-3 w-3" />
                  View
                </Button>
                <Button
                  variant={collector.isAvailable ? "destructive" : "default"}
                  size="sm"
                  onClick={() =>
                    toggleAvailability(
                      collector.id,
                      collector.isAvailable || false
                    )
                  }
                >
                  <Ban className="mr-1 h-3 w-3" />
                  {collector.isAvailable ? "Offline" : "Online"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteCollector(collector)}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t px-6 py-3">
              <div className="flex justify-between w-full">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  Joined {formatDate(collector.joinedDate)}
                </div>
                <div className="flex items-center text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  {collector.completedPickups || 0} pickups completed
                </div>
              </div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <span
                  className={`w-2 h-2 rounded-full mr-1 ${
                    collector.isAvailable ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></span>
                Last activity: {formatLastActivity(collector.lastActivity)}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredCollectors.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No collectors found matching your search.
          </p>
        </div>
      )}

      {/* Edit Collector Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
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
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="assignments">Assignments</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm text-gray-600">
                        {viewCollector.email}
                      </p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="text-sm text-gray-600">
                        {viewCollector.phone}
                      </p>
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
                  </div>

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
                        ? "Set Offline"
                        : "Set Available"}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="assignments" className="py-4">
                  {(viewCollector.assignedRequests?.length || 0) > 0 ? (
                    <div className="space-y-2">
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
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Block Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to change the availability status of{" "}
            <span className="font-semibold">{collectorToBlock?.name}</span>?
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmBlockCollector}>Confirm</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              <span>Delete Collector</span>
            </DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold">{collectorToDelete?.name}</span>?
            All associated data will be removed and this action cannot be
            undone.
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteCollector}
              disabled={loading}
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
