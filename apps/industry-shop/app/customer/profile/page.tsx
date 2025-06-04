"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Recycle, User, MapPin, Loader2, Edit, Save, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CustomerProfilePage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
  })

  useEffect(() => {
    const customer = localStorage.getItem("currentCustomer")
    if (!customer) {
      router.push("/customer/auth/login?redirect=/customer/profile")
      return
    }

    const userData = JSON.parse(customer)
    setCurrentUser(userData)
    setFormData({
      name: userData.name || "",
      email: userData.email || "",
      phone: userData.phone || "",
      address: userData.address || "",
      city: userData.city || "",
      zipCode: userData.zipCode || "",
    })
  }, [router])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedUser = { ...currentUser, ...formData }
      setCurrentUser(updatedUser)
      localStorage.setItem("currentCustomer", JSON.stringify(updatedUser))
      localStorage.setItem(`customer_${updatedUser.id}`, JSON.stringify(updatedUser))

      setIsEditing(false)
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Update error:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: currentUser.name || "",
      email: currentUser.email || "",
      phone: currentUser.phone || "",
      address: currentUser.address || "",
      city: currentUser.city || "",
      zipCode: currentUser.zipCode || "",
    })
    setIsEditing(false)
  }

  if (!currentUser) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Recycle className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">EcoCycleHub</span>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Customer Profile
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/shop">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Shop
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Personal Information
                  </CardTitle>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleSave}
                        disabled={loading}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                        />
                      ) : (
                        <p className="text-gray-900 mt-1">{currentUser.name}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                        />
                      ) : (
                        <p className="text-gray-900 mt-1">{currentUser.email}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                        />
                      ) : (
                        <p className="text-gray-900 mt-1">{currentUser.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address" className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        Address
                      </Label>
                      {isEditing ? (
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                        />
                      ) : (
                        <p className="text-gray-900 mt-1">{currentUser.address}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        {isEditing ? (
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => handleInputChange("city", e.target.value)}
                          />
                        ) : (
                          <p className="text-gray-900 mt-1">{currentUser.city}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        {isEditing ? (
                          <Input
                            id="zipCode"
                            value={formData.zipCode}
                            onChange={(e) => handleInputChange("zipCode", e.target.value)}
                          />
                        ) : (
                          <p className="text-gray-900 mt-1">{currentUser.zipCode}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>Member Since</Label>
                      <p className="text-gray-900 mt-1">
                        {currentUser.registeredAt ? new Date(currentUser.registeredAt).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">View your complete order history</p>
                  <Link href="/customer/orders">
                    <Button className="bg-green-600 hover:bg-green-700">View All Orders</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Account Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Email Notifications</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="text-green-600" />
                      <span className="text-sm">Order updates and shipping notifications</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="text-green-600" />
                      <span className="text-sm">New product announcements</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="text-green-600" />
                      <span className="text-sm">Promotional offers and discounts</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Privacy Settings</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="text-green-600" />
                      <span className="text-sm">Allow order history for personalized recommendations</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="text-green-600" />
                      <span className="text-sm">Share environmental impact data</span>
                    </label>
                  </div>
                </div>

                <Button className="bg-green-600 hover:bg-green-700">Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
