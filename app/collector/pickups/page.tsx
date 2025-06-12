"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, MapPin, Navigation, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PickupRequest {
  id: string
  industryName: string
  wasteType: string
  weight: number
  status: "assigned" | "on-way" | "picked-up" | "completed"
  address: string
  distance: string
  priority: "high" | "medium" | "low"
  requestedAt: string
  coordinates?: { lat: number; lng: number }
}

export default function CollectorPickupsPage() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [pickups, setPickups] = useState<PickupRequest[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Load pickup requests from localStorage
    const savedPickups = localStorage.getItem("collectorPickups")
    if (savedPickups) {
      setPickups(JSON.parse(savedPickups))
    }
  }, [])

  const updateStatus = (id: string, newStatus: "assigned" | "on-way" | "picked-up" | "completed") => {
    const updatedPickups = pickups.map((pickup) => (pickup.id === id ? { ...pickup, status: newStatus } : pickup))
    setPickups(updatedPickups)
    localStorage.setItem("collectorPickups", JSON.stringify(updatedPickups))

    // Also update in industry requests
    const industryRequests = localStorage.getItem("industryRequests")
    if (industryRequests) {
      const requests = JSON.parse(industryRequests)
      const updatedRequests = requests.map((req: any) =>
        req.id === id ? { ...req, status: newStatus, updatedAt: new Date().toISOString() } : req,
      )
      localStorage.setItem("industryRequests", JSON.stringify(updatedRequests))
    }

    const statusMessages = {
      "on-way": "started your journey",
      "picked-up": "marked as picked up",
      completed: "completed successfully",
    }

    toast({
      title: "Status updated",
      description: `Pickup has been ${statusMessages[newStatus] || "updated"}.`,
    })
  }

  const navigateToLocation = (pickup: PickupRequest) => {
    if (pickup.coordinates) {
      const { lat, lng } = pickup.coordinates
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
      window.open(googleMapsUrl, "_blank")
      toast({
        title: "Navigation started",
        description: `Opening Google Maps navigation to ${pickup.industryName}`,
      })
    } else {
      // Fallback to address search
      const encodedAddress = encodeURIComponent(pickup.address)
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
      window.open(googleMapsUrl, "_blank")
      toast({
        title: "Navigation started",
        description: `Opening Google Maps search for ${pickup.address}`,
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

  const filteredPickups = pickups.filter((pickup) => statusFilter === "all" || pickup.status === statusFilter)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assigned Pickups</h1>
          <p className="text-gray-600 mt-2">Manage your pickup assignments and update status</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="on-way">On The Way</SelectItem>
            <SelectItem value="picked-up">Picked Up</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredPickups.map((pickup) => (
          <Card key={pickup.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-lg">{pickup.industryName}</h3>
                    <Badge className={getStatusColor(pickup.status)}>{pickup.status.replace("-", " ")}</Badge>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
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
                    <div className="flex items-center space-x-2">
                      <Navigation className="h-4 w-4" />
                      <span>{pickup.distance} away</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Requested: {new Date(pickup.requestedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  {pickup.status === "assigned" && (
                    <Button size="sm" onClick={() => updateStatus(pickup.id, "on-way")}>
                      Start Journey
                    </Button>
                  )}
                  {pickup.status === "on-way" && (
                    <Button size="sm" onClick={() => updateStatus(pickup.id, "picked-up")}>
                      Mark Picked Up
                    </Button>
                  )}
                  {pickup.status === "picked-up" && (
                    <Button size="sm" onClick={() => updateStatus(pickup.id, "completed")}>
                      Complete
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => navigateToLocation(pickup)}>
                    Navigate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPickups.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No pickups found for the selected filter.</p>
        </div>
      )}
    </div>
  )
}
