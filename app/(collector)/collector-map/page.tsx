"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PickupRequest {
  id: string
  industryName: string
  wasteType: string
  weight: number
  status: "assigned" | "on-way" | "picked-up" | "completed"
  address: string
  coordinates: { lat: number; lng: number }
}

export default function CollectorMapPage() {
  const [assignedPickups, setAssignedPickups] = useState<PickupRequest[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Load pickup requests from localStorage
    const savedPickups = localStorage.getItem("collectorPickups")
    if (savedPickups) {
      setAssignedPickups(JSON.parse(savedPickups))
    }
  }, [])

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Map View</h1>
        <p className="text-gray-600 mt-2">Navigate to your assigned pickup locations</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Pickup Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Interactive map will be displayed here</p>
                  <p className="text-sm text-gray-400">Google Maps integration required</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pickup List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Pickups</h2>
          {assignedPickups.map((pickup) => (
            <Card key={pickup.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{pickup.industryName}</h3>
                    <Badge variant={pickup.status === "on-way" ? "default" : "secondary"}>
                      {pickup.status.replace("-", " ")}
                    </Badge>
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
                      <span>{pickup.address}</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full" onClick={() => navigateToLocation(pickup)}>
                    <Navigation className="h-4 w-4 mr-2" />
                    Navigate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {assignedPickups.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No assigned pickups</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
