"use client";

import { Label } from "@/components/ui/label";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Recycle,
  Plus,
  MapPin,
  Clock,
  User,
  LogOut,
  Calendar,
  Package,
  TrendingUp,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PickupRequest {
  id: string;
  wasteType: string;
  amount: number;
  preferredDate: string;
  preferredTime: string;
  status: "Pending" | "Assigned" | "Picked Up";
  requestDate: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      router.push("/auth/login");
      return;
    }

    const userData = JSON.parse(currentUser);
    setUser(userData);
    setEditForm(userData);

    // Load pickup requests from localStorage
    const storedRequests = localStorage.getItem(
      `pickupRequests_${userData.id}`
    );
    if (storedRequests) {
      setPickupRequests(JSON.parse(storedRequests));
    } else {
      // Demo data
      const demoRequests: PickupRequest[] = [
        {
          id: "1",
          wasteType: "Plastic",
          amount: 50,
          preferredDate: "2024-01-15",
          preferredTime: "10:00",
          status: "Picked Up",
          requestDate: "2024-01-10",
        },
        {
          id: "2",
          wasteType: "Organic",
          amount: 30,
          preferredDate: "2024-01-20",
          preferredTime: "14:00",
          status: "Assigned",
          requestDate: "2024-01-12",
        },
      ];
      setPickupRequests(demoRequests);
      localStorage.setItem(
        `pickupRequests_${userData.id}`,
        JSON.stringify(demoRequests)
      );
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Assigned":
        return "bg-blue-100 text-blue-800";
      case "Picked Up":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCancelRequest = (id: string) => {
    if (!user) return;
    const updatedRequests = pickupRequests.filter((req) => req.id !== id);
    setPickupRequests(updatedRequests);
    localStorage.setItem(
      `pickupRequests_${user.id}`,
      JSON.stringify(updatedRequests)
    );
  };

  const handleEditInputChange = (field: string, value: string) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    setUser(editForm);
    localStorage.setItem("currentUser", JSON.stringify(editForm));
    setEditMode(false);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const stats = {
    totalRequests: pickupRequests.length,
    pendingRequests: pickupRequests.filter((r) => r.status === "Pending")
      .length,
    completedRequests: pickupRequests.filter((r) => r.status === "Picked Up")
      .length,
    totalWasteCollected: pickupRequests
      .filter((r) => r.status === "Picked Up")
      .reduce((sum, r) => sum + r.amount, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Recycle className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">
                  EcoCycleHub
                </span>
              </div>
              <Badge
                variant="outline"
                className="text-green-600 border-green-600"
              >
                Industry Dashboard
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">
                  {user.contactPerson}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.industryName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your waste pickup requests and track your environmental
            impact.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Requests
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalRequests}
                  </p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {stats.pendingRequests}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.completedRequests}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Waste Collected
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.totalWasteCollected}kg
                  </p>
                </div>
                <Recycle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requests">Pickup Requests</TabsTrigger>
            <TabsTrigger value="new-request">New Request</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Pickup Requests Tab */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Pickup Requests</CardTitle>
                    <CardDescription>
                      Track your waste pickup requests and their status
                    </CardDescription>
                  </div>
                  <Link href="/dashboard/new-request">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      New Request
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {pickupRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No pickup requests yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Create your first waste pickup request to get started.
                    </p>
                    <Link href="/dashboard/new-request">
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Request
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pickupRequests.map((request) => (
                      <div
                        key={request.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {request.wasteType} Waste
                            </h3>
                            <p className="text-sm text-gray-600">
                              Amount: {request.amount} kg
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                            {(request.status === "Pending" ||
                              request.status === "Assigned") && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancelRequest(request.id)}
                              >
                                Cancel Request
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            Requested: {request.requestDate}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Industry Profile</CardTitle>
                <CardDescription>
                  Manage your industry information and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {editMode ? (
                  <form
                    className="space-y-6"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveProfile();
                    }}
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4">
                          Basic Information
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium text-gray-600">
                              Industry Name
                            </Label>
                            <input
                              className="w-full border rounded p-2"
                              value={editForm.industryName}
                              onChange={(e) =>
                                handleEditInputChange(
                                  "industryName",
                                  e.target.value
                                )
                              }
                              required
                              placeholder="Industry Name"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">
                              Contact Person
                            </Label>
                            <input
                              className="w-full border rounded p-2"
                              value={editForm.contactPerson}
                              onChange={(e) =>
                                handleEditInputChange(
                                  "contactPerson",
                                  e.target.value
                                )
                              }
                              required
                              placeholder="Contact Person"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">
                              Email
                            </Label>
                            <input
                              className="w-full border rounded p-2"
                              type="email"
                              value={editForm.email}
                              onChange={(e) =>
                                handleEditInputChange("email", e.target.value)
                              }
                              required
                              placeholder="Email"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">
                              Phone
                            </Label>
                            <input
                              className="w-full border rounded p-2"
                              value={editForm.phone}
                              onChange={(e) =>
                                handleEditInputChange("phone", e.target.value)
                              }
                              required
                              placeholder="Phone"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4">
                          Location & Waste Types
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium text-gray-600">
                              Address
                            </Label>
                            <input
                              className="w-full border rounded p-2"
                              value={editForm.address}
                              onChange={(e) =>
                                handleEditInputChange("address", e.target.value)
                              }
                              required
                              placeholder="Address"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">
                              Waste Types (comma separated)
                            </Label>
                            <input
                              className="w-full border rounded p-2"
                              value={editForm.wasteTypes?.join(", ")}
                              onChange={(e) =>
                                handleEditInputChange(
                                  "wasteTypes",
                                  e.target.value
                                    .split(",")
                                    .map((t: string) => t.trim())
                                )
                              }
                              required
                              placeholder="Waste Types (comma separated)"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t flex gap-2">
                      <Button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditMode(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4">
                          Basic Information
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium text-gray-600">
                              Industry Name
                            </Label>
                            <p className="text-gray-900">{user.industryName}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">
                              Contact Person
                            </Label>
                            <p className="text-gray-900">
                              {user.contactPerson}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">
                              Email
                            </Label>
                            <p className="text-gray-900">{user.email}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">
                              Phone
                            </Label>
                            <p className="text-gray-900">{user.phone}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4">
                          Location & Waste Types
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium text-gray-600">
                              Address
                            </Label>
                            <p className="text-gray-900">{user.address}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">
                              Waste Types
                            </Label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {user.wasteTypes?.map((type: string) => (
                                <Badge
                                  key={type}
                                  variant="outline"
                                  className="text-green-600 border-green-600"
                                >
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setEditForm(user);
                          setEditMode(true);
                        }}
                      >
                        Edit Profile
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* New Request Tab */}
          <TabsContent value="new-request">
            <Card>
              <CardHeader>
                <CardTitle>Create New Pickup Request</CardTitle>
                <CardDescription>
                  Request waste pickup for your industry
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Create Pickup Request
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Fill out the form to request waste pickup services.
                  </p>
                  <Link href="/dashboard/new-request">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Go to Request Form
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
