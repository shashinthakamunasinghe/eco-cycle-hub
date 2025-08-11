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

  const updateLocation = async () => {
    if (!user?.id) return

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const industryRef = doc(db, "industryProfiles", user.id)
            await updateDoc(industryRef, {
              location: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              },
              updatedAt: new Date()
            })

            toast({
              title: "Location updated",
              description: "Your location has been updated successfully.",
            })
          } catch (error) {
            console.error("Error updating location:", error)
            toast({
              title: "Error",
              description: "Failed to update location. Please try again.",
              variant: "destructive",
            })
          }
        },
        (_error) => {
          toast({
            title: "Location error",
            description: "Unable to get your location. Please try again.",
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
              <span className="text-sm font-medium text-green-600">Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current location:</span>
              <span className="text-sm">Colombo, Sri Lanka</span>
            </div>
            <Button variant="outline" size="sm" onClick={updateLocation} className="w-full">
              <MapPin className="mr-2 h-4 w-4" />
              Update Location
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
