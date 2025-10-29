"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { MapPin } from "lucide-react"
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth"
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function IndustryProfilePage() {
  const { user } = useFirebaseAuth()
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    contactPerson: "",
    wasteTypes: "",
    businessRegNumber: "",
    industryType: "",
    operatingHours: "",
    certifications: "",
    annualWasteVolume: "",
  })
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationInfo, setLocationInfo] = useState({
    currentLocation: "Not set",
    autoLocation: false,
    coordinates: null as { lat: number; lng: number } | null
  })
  const { toast } = useToast()

  // Load industry profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return

      try {
        const industryDoc = await getDoc(doc(db, "industryProfiles", user.id))
        if (industryDoc.exists()) {
          const data = industryDoc.data()
          setFormData({
            companyName: data.companyName || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            description: data.description || "",
            contactPerson: data.contactPerson || "",
            wasteTypes: data.wasteTypes || "",
            businessRegNumber: data.businessRegNumber || "",
            industryType: data.industryType || "",
            operatingHours: data.operatingHours || "",
            certifications: data.certifications || "",
            annualWasteVolume: data.annualWasteVolume || "",
          })

          // Load location information
          if (data.location) {
            setLocationInfo({
              currentLocation: data.locationAddress || "Location set",
              autoLocation: true,
              coordinates: data.location
            })
          }
        }
      } catch (error) {
        console.error("Error loading industry profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive",
        })
      }
    }

    loadProfile()
  }, [user?.id, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted. User:", user)
    console.log("Form data:", formData)
    
    if (!user?.id) {
      console.log("No user ID found")
      toast({
        title: "Authentication Error",
        description: "Please log in to update your profile.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Prepare the update data for industryProfiles collection
      const updateData = {
        companyName: formData.companyName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        description: formData.description,
        contactPerson: formData.contactPerson,
        wasteTypes: formData.wasteTypes,
        businessRegNumber: formData.businessRegNumber,
        industryType: formData.industryType,
        operatingHours: formData.operatingHours,
        certifications: formData.certifications,
        annualWasteVolume: formData.annualWasteVolume,
        userId: user.id,
        updatedAt: new Date(),
        createdAt: new Date() // Will be ignored if document already exists
      }

      console.log("Updating industry profile with data:", updateData)

      // Save to industryProfiles collection
      const industryRef = doc(db, "industryProfiles", user.id)
      await setDoc(industryRef, updateData, { merge: true })

      console.log("Industry profile updated successfully")
      toast({
        title: "Success",
        description: "Industry profile updated successfully",
      })
    } catch (error) {
      console.error("Industry profile update error:", error)
      toast({
        title: "Error",
        description: `Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        console.warn("Google Maps API key not found, using coordinates as fallback")
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.status === "OK" && data.results.length > 0) {
        // Get the most appropriate address (usually the first one)
        const address = data.results[0].formatted_address
        return address
      } else if (data.status === "ZERO_RESULTS") {
        return `${lat.toFixed(6)}, ${lng.toFixed(6)} (No address found)`
      } else {
        console.warn("Geocoding API error:", data.status, data.error_message)
        throw new Error(`Geocoding failed: ${data.status}`)
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error)
      // Fallback to coordinates display
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  }

  const updateLocation = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in to update your location.",
        variant: "destructive",
      })
      return
    }

    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      })
      return
    }

    setLocationLoading(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          
          console.log(`Getting location: ${lat}, ${lng}`)
          
          // Get human-readable address using Google Maps Geocoding API
          const address = await reverseGeocode(lat, lng)
          console.log(`Resolved address: ${address}`)
          
          // Update Firestore with location data
          const industryRef = doc(db, "industryProfiles", user.id)
          await setDoc(industryRef, {
            location: {
              lat: lat,
              lng: lng
            },
            locationAddress: address,
            locationUpdatedAt: new Date(),
            updatedAt: new Date(),
            userId: user.id
          }, { merge: true })

          console.log("Location saved to Firestore successfully")

          // Update local state
          setLocationInfo({
            currentLocation: address,
            autoLocation: true,
            coordinates: { lat, lng }
          })

          toast({
            title: "Location updated successfully",
            description: `Your location has been set to: ${address}`,
          })
        } catch (error) {
          console.error("Error updating location:", error)
          toast({
            title: "Error",
            description: "Failed to update location. Please try again.",
            variant: "destructive",
          })
        } finally {
          setLocationLoading(false)
        }
      },
      (error) => {
        setLocationLoading(false)
        let errorMessage = "Unable to get your location. Please try again."
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable."
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again."
            break
        }
        
        toast({
          title: "Location error",
          description: errorMessage,
          variant: "destructive",
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  const handleCancel = () => {
    // Reset form to original values
    setFormData({
      companyName: "",
      email: "",
      phone: "",
      address: "",
      description: "",
      contactPerson: "",
      wasteTypes: "",
      businessRegNumber: "",
      industryType: "",
      operatingHours: "",
      certifications: "",
      annualWasteVolume: "",
    })

    toast({
      title: "Changes cancelled",
      description: "All changes have been reverted.",
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
        <p className="text-gray-600 mt-2">Manage your company information and settings</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Location Info */}
        <Card>
          <CardHeader>
            <CardTitle>Location Information</CardTitle>
            <CardDescription>Your current location settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Auto-location:</span>
              <span className={`text-sm font-medium ${locationInfo.autoLocation ? 'text-green-600' : 'text-gray-500'}`}>
                {locationInfo.autoLocation ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-sm text-gray-600">Current location:</span>
              <span className="text-sm text-right max-w-48">
                {locationInfo.currentLocation}
              </span>
            </div>
            {locationInfo.coordinates && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Coordinates:</span>
                <span className="text-sm text-gray-500">
                  {locationInfo.coordinates.lat.toFixed(6)}, {locationInfo.coordinates.lng.toFixed(6)}
                </span>
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={updateLocation} 
              className="w-full"
              disabled={locationLoading}
            >
              <MapPin className="mr-2 h-4 w-4" />
              {locationLoading ? "Updating..." : "Update Location"}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Account Type:</span>
              <span className="text-sm font-medium">Industry</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Member Since:</span>
              <span className="text-sm">Jan 2024</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <span className="text-sm font-medium text-green-600">Active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Update your company details and contact information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessRegNumber">Business Registration Number</Label>
                <Input
                  id="businessRegNumber"
                  value={formData.businessRegNumber}
                  onChange={(e) => handleInputChange("businessRegNumber", e.target.value)}
                  placeholder="e.g., BRC123456789"
                />
              </div>
              <div>
                <Label htmlFor="industryType">Industry Type</Label>
                <Input
                  id="industryType"
                  value={formData.industryType}
                  onChange={(e) => handleInputChange("industryType", e.target.value)}
                  placeholder="e.g., Manufacturing, Textile, Food Processing"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Company Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="operatingHours">Operating Hours</Label>
                <Input
                  id="operatingHours"
                  value={formData.operatingHours}
                  onChange={(e) => handleInputChange("operatingHours", e.target.value)}
                  placeholder="e.g., Monday - Friday: 8:00 AM - 6:00 PM"
                />
              </div>
              <div>
                <Label htmlFor="annualWasteVolume">Annual Waste Volume</Label>
                <Input
                  id="annualWasteVolume"
                  value={formData.annualWasteVolume}
                  onChange={(e) => handleInputChange("annualWasteVolume", e.target.value)}
                  placeholder="e.g., 500-1000 tons"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="wasteTypes">Waste Types Generated</Label>
              <Input
                id="wasteTypes"
                value={formData.wasteTypes}
                onChange={(e) => handleInputChange("wasteTypes", e.target.value)}
                placeholder="e.g., Organic Waste, Plastic Waste, Paper Waste"
              />
            </div>

            <div>
              <Label htmlFor="certifications">Environmental Certifications</Label>
              <Input
                id="certifications"
                value={formData.certifications}
                onChange={(e) => handleInputChange("certifications", e.target.value)}
                placeholder="e.g., ISO 14001, ISO 9001, LEED Certification"
              />
            </div>

            <div>
              <Label htmlFor="description">Company Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                placeholder="Brief description of your company and operations"
              />
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Profile"}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
