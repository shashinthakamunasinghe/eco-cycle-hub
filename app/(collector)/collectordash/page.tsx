"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Truck, Package, CheckCircle, MapPin, Battery, Navigation, User } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth"
import { pickupService, collectorService } from "@/lib/firebase-services"
import type { PickupRequest } from "@/types"

export default function CollectorDashboard() {
  const [isAvailable, setIsAvailable] = useState(true)
  const [assignedPickups, setAssignedPickups] = useState<PickupRequest[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useFirebaseAuth()

  // Stats computed from real data
  const stats = {
    assignedPickups: assignedPickups.filter((p) => p.status === "assigned").length,
    completedToday: assignedPickups.filter((p) => 
      p.status === "completed" && 
      p.completedAt && 
      new Date(p.completedAt).toDateString() === new Date().toDateString()
    ).length,
    totalCapacity: 1000, // kg - could be fetched from collector profile
    currentLoad: assignedPickups
      .filter((p) => p.status === "on-way" || p.status === "picked-up")
      .reduce((sum, p) => sum + p.weight, 0),
  }

  useEffect(() => {
    const loadPickups = async () => {
      console.log("🔄 Loading pickups for user:", user?.id, user?.email);
      
      if (!user?.id) {
        console.log("❌ No user ID found, skipping pickup load");
        setLoading(false);
        return;
      }

      try {
        setLoading(true)
        console.log("📡 Fetching pickups for collector:", user.id);
        
        // Get all pickup requests assigned to this collector
        const pickups = await pickupService.getPickupRequestsByCollector(user.id)
        console.log("📦 Raw pickups from Firebase:", pickups);
        
        // Filter to show only active pickups (not completed or cancelled)
        const activePickups = pickups.filter(
          (p) => p.status !== "completed" && p.status !== "cancelled"
        )
        console.log("✅ Active pickups after filtering:", activePickups);
        
        setAssignedPickups(activePickups)
      } catch (error) {
        console.error("❌ Error loading pickups:", error)
        toast({
          title: "Error",
          description: "Failed to load pickup requests",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadPickups()
  }, [user?.id, user?.email, toast])

  const updatePickupStatus = async (id: string, newStatus: PickupRequest["status"]) => {
    try {
      await pickupService.updateStatus(id, newStatus)
      
      // Update local state
      setAssignedPickups(prevPickups =>
        prevPickups.map((pickup) =>
          pickup.id === id ? { ...pickup, status: newStatus } : pickup
        )
      )

      toast({
        title: "Status updated",
        description: `Pickup status updated to ${newStatus.replace("-", " ")}`,
      })
    } catch (error) {
      console.error("Error updating pickup status:", error)
      toast({
        title: "Error",
        description: "Failed to update pickup status",
        variant: "destructive",
      })
    }
  }

  const handleAvailabilityChange = async (available: boolean) => {
    try {
      setIsAvailable(available)
      
      // Update collector availability in Firebase
      if (user?.id) {
        await collectorService.updateCollectorProfile(user.id, {
          isAvailable: available,
        })
      }

      toast({
        title: available ? "You're now available" : "You're now offline",
        description: available
          ? "You can receive new pickup assignments"
          : "You won't receive new assignments until you go online",
      })
    } catch (error) {
      console.error("Error updating availability:", error)
      toast({
        title: "Error", 
        description: "Failed to update availability status",
        variant: "destructive",
      })
    }
  }

  const acceptPickup = (id: string) => {
    updatePickupStatus(id, "assigned")
    toast({
      title: "Pickup accepted",
      description: "You have accepted the pickup request. You can now start your journey.",
    })
  }

  const rejectPickup = async (id: string) => {
    try {
      // Update status back to pending and remove collector assignment
      await pickupService.updatePickupRequest(id, {
        status: "pending",
        collectorId: undefined,
        collectorName: undefined,
      })

      // Remove from local state
      setAssignedPickups(prevPickups =>
        prevPickups.filter((pickup) => pickup.id !== id)
      )

      toast({
        title: "Pickup rejected",
        description: "The pickup request has been rejected and returned to the pool.",
        variant: "destructive",
      })
    } catch (error) {
      console.error("Error rejecting pickup:", error)
      toast({
        title: "Error",
        description: "Failed to reject pickup request",
        variant: "destructive",
      })
    }
  }

  const navigateToLocation = (pickup: PickupRequest) => {
    if (pickup.location && pickup.location.lat && pickup.location.lng) {
      const { lat, lng } = pickup.location
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
      window.open(googleMapsUrl, "_blank")
      toast({
        title: "Navigation started",
        description: `Opening Google Maps navigation to ${pickup.industryName}`,
      })
    } else if (pickup.location?.address) {
      // Fallback to address search
      const encodedAddress = encodeURIComponent(pickup.location.address)
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
      window.open(googleMapsUrl, "_blank")
      toast({
        title: "Navigation started",
        description: `Opening Google Maps search for ${pickup.location.address}`,
      })
    } else {
      toast({
        title: "Navigation unavailable",
        description: "Location information not available for this pickup",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-blue-100 text-blue-800"
      case "on-way":
        return "bg-purple-100 text-purple-800"
      case "picked-up":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const capacityPercentage = (stats.currentLoad / stats.totalCapacity) * 100

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Collector Dashboard</h1>
          {user && (
            <p className="text-sm text-gray-600 mt-1">
              Logged in as: {user.name} ({user.email}) - ID: {user.id}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-full p-2.5 shadow-lg">
              <User className="h-4 w-4 text-white" />
            </div>
            <Label htmlFor="availability">Available for pickups</Label>
            <Switch id="availability" checked={isAvailable} onCheckedChange={handleAvailabilityChange} />
          </div>
          <Badge variant={isAvailable ? "default" : "secondary"}>{isAvailable ? "Online" : "Offline"}</Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Pickups</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.assignedPickups}</div>
            <p className="text-xs text-muted-foreground">Pending collection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedToday}</div>
            <p className="text-xs text-muted-foreground">Pickups completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Truck Capacity</CardTitle>
            <Truck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{capacityPercentage.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.currentLoad}kg / {stats.totalCapacity}kg
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-orange-600 h-2 rounded-full transition-all"
                style={{ width: `${capacityPercentage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Location Status</CardTitle>
            <MapPin className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">Active</div>
            <p className="text-xs text-muted-foreground">GPS tracking enabled</p>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Pickups */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Pickups</CardTitle>
          <CardDescription>Your current pickup assignments</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading pickup assignments...</p>
              </div>
            </div>
          ) : assignedPickups.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assigned pickups</h3>
              <p className="text-gray-600">You don&apos;t have any pickup assignments at the moment.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {assignedPickups.map((pickup) => (
                  <div key={pickup.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{pickup.industryName}</h3>
                          <Badge className={getStatusColor(pickup.status)}>{pickup.status.replace("-", " ")}</Badge>
                          <Badge className={getPriorityColor(pickup.priority)}>{pickup.priority}</Badge>
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
                            <span>{pickup.location?.address || 'Address not available'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Navigation className="h-4 w-4" />
                            <span>Location coordinates: {pickup.location?.lat ? `${pickup.location.lat.toFixed(4)}, ${pickup.location.lng.toFixed(4)}` : 'Not available'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {pickup.status === "assigned" && (
                          <>
                            <Button size="sm" onClick={() => acceptPickup(pickup.id)}>
                              Accept
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => rejectPickup(pickup.id)}>
                              Reject
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline" onClick={() => navigateToLocation(pickup)}>
                          Navigate
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" asChild>
                  <Link href="/assigned-pickups">View All Pickups</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" asChild>
              <Link href="/collector-map">
                <MapPin className="mr-2 h-4 w-4" />
                View Map & Navigate
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/assigned-pickups">
                <Package className="mr-2 h-4 w-4" />
                Manage Pickups
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/collector-profile">
                <Truck className="mr-2 h-4 w-4" />
                Update Vehicle Info
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Fuel Level:</span>
                <div className="flex items-center space-x-2">
                  <Battery className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">85%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">GPS Status:</span>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Updated:</span>
                <span className="text-sm">2 minutes ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
