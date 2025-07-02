"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Package } from "lucide-react"
import { industryRequestService } from "@/lib/firebase-services"
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth"
import type { PickupRequest, User } from "@/types"

export default function RequestPickupPage() {
  const [formData, setFormData] = useState({
    wasteType: "",
    weight: "",
    notes: "",
    address: "",
    location: {
      lat: 0,
      lng: 0,
    },
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useFirebaseAuth()

  const wasteTypes = [
    "Organic Waste",
    "Plastic Waste",
    "Metal Waste",
    "Paper Waste",
    "Electronic Waste",
    "Chemical Waste",
    "Mixed Waste",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !user.id) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a request",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const requestData: Omit<PickupRequest, "id"> = {
        industryId: user.id,
        industryName: user.name || "",
        wasteType: formData.wasteType,
        weight: Number.parseInt(formData.weight),
        status: "pending",
        location: {
          lat: formData.location.lat,
          lng: formData.location.lng,
          address: formData.address,
        },
        notes: formData.notes,
        requestedAt: new Date(),
      }

      await industryRequestService.createRequest(requestData)

      toast({
        title: "Success",
        description: "Your pickup request has been submitted",
      })

      router.push("/industrydash")
    } catch (error) {
      console.error("Error submitting request:", error)
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Mock reverse geocoding
          const mockAddresses = [
            "123 Industrial Avenue, Colombo 03, Sri Lanka",
            "456 Factory Street, Kandy, Sri Lanka",
            "789 Manufacturing Road, Galle, Sri Lanka",
            "321 Plant Avenue, Negombo, Sri Lanka",
          ]
          const mockAddress = mockAddresses[Math.floor(Math.random() * mockAddresses.length)]
          handleInputChange("address", mockAddress)
          toast({
            title: "Location detected",
            description: "Your current location has been automatically filled.",
          })
        },
        (error) => {
          toast({
            title: "Location error",
            description: "Unable to get your location. Please enter manually.",
            variant: "destructive",
          })
        },
      )
    } else {
      toast({
        title: "Location not supported",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Request Pickup</h1>
        <p className="text-gray-600 mt-2">
          Submit a new waste pickup request. Our system will automatically assign an available collector.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Pickup Details</span>
          </CardTitle>
          <CardDescription>Provide details about the waste you need collected</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wasteType">Waste Type *</Label>
                <Select value={formData.wasteType} onValueChange={(value) => handleInputChange("wasteType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select waste type" />
                  </SelectTrigger>
                  <SelectContent>
                    {wasteTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="weight">Estimated Weight (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  min="1"
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  placeholder="Enter weight in kg"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Pickup Address *</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter pickup address"
                  required
                />
                <Button type="button" variant="outline" size="icon" onClick={getCurrentLocation}>
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Click the map icon to use your current location</p>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Any special instructions or additional information"
                rows={3}
              />
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Location Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Location Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Auto-location detection:</span>
              <span className="text-sm font-medium text-green-600">Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current location:</span>
              <span className="text-sm">Colombo, Sri Lanka</span>
            </div>
            <p className="text-xs text-gray-500">
              Your location is automatically detected to help assign the nearest available collector.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
