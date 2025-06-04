"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Loader2, ArrowLeft, Recycle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [formData, setFormData] = useState({
    industryName: "",
    contactPerson: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    wasteTypes: [] as string[],
    address: "",
    latitude: "",
    longitude: "",
    description: "",
  })

  const wasteTypeOptions = ["Plastic", "Organic", "Metal", "Paper", "Glass", "Electronic", "Textile", "Chemical"]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleWasteTypeChange = (wasteType: string) => {
    setFormData((prev) => ({
      ...prev,
      wasteTypes: prev.wasteTypes.includes(wasteType)
        ? prev.wasteTypes.filter((type) => type !== wasteType)
        : [...prev.wasteTypes, wasteType],
    }))
  }

  const detectLocation = async () => {
    setLocationLoading(true)
    try {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by this browser.")
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          // Reverse geocoding using a free service
          try {
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`,
            )
            const data = await response.json()

            if (data.results && data.results[0]) {
              const address = data.results[0].formatted
              setFormData((prev) => ({
                ...prev,
                latitude: latitude.toString(),
                longitude: longitude.toString(),
                address: address,
              }))
            } else {
              // Fallback to coordinates only
              setFormData((prev) => ({
                ...prev,
                latitude: latitude.toString(),
                longitude: longitude.toString(),
                address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
              }))
            }
          } catch (error) {
            // Fallback to coordinates only
            setFormData((prev) => ({
              ...prev,
              latitude: latitude.toString(),
              longitude: longitude.toString(),
              address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
            }))
          }

          setLocationLoading(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Unable to retrieve your location. Please enter your address manually.")
          setLocationLoading(false)
        },
      )
    } catch (error) {
      console.error("Location detection error:", error)
      setLocationLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match")
      setLoading(false)
      return
    }

    if (formData.wasteTypes.length === 0) {
      alert("Please select at least one waste type")
      setLoading(false)
      return
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Store user data in localStorage for demo
      localStorage.setItem(
        "industryUser",
        JSON.stringify({
          ...formData,
          id: Date.now().toString(),
          registeredAt: new Date().toISOString(),
        }),
      )

      alert("Registration successful! Redirecting to dashboard...")
      router.push("/dashboard")
    } catch (error) {
      console.error("Registration error:", error)
      alert("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Recycle className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">EcoCycleHub</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Industry Registration</h1>
          <p className="text-gray-600 mt-2">Join our waste management network</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Register Your Industry</CardTitle>
            <CardDescription>Fill in your industry details to start requesting waste pickup services</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="industryName">Industry Name *</Label>
                    <Input
                      id="industryName"
                      value={formData.industryName}
                      onChange={(e) => handleInputChange("industryName", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPerson">Contact Person *</Label>
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
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
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
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Location</h3>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Enter address or use auto-detect"
                    />
                    <Button
                      type="button"
                      onClick={detectLocation}
                      disabled={locationLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {locationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                      {locationLoading ? "Detecting..." : "Auto-Detect"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Waste Types */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Waste Types *</h3>
                <p className="text-sm text-gray-600">Select the types of waste your industry generates</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {wasteTypeOptions.map((wasteType) => (
                    <label
                      key={wasteType}
                      className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.wasteTypes.includes(wasteType)
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.wasteTypes.includes(wasteType)}
                        onChange={() => handleWasteTypeChange(wasteType)}
                        className="text-green-600"
                      />
                      <span className="text-sm">{wasteType}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Industry Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Brief description of your industry and waste generation..."
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register Industry"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-green-600 hover:text-green-700 font-medium">
                  Login here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
