"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Recycle, Users, ShoppingBag } from "lucide-react"

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const accountType = searchParams.get("type") || "customer"

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: accountType,
    phone: "",
    address: "",
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Mock registration
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Registration successful",
        description: "Your account has been created successfully!",
      })

      router.push("/auth/login")
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Something went wrong. Please try again.",
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
          const mockAddress = "123 Industrial Avenue, Colombo 03, Sri Lanka"
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
    }
  }

  const getAccountTypeInfo = () => {
    switch (accountType) {
      case "industry":
        return {
          title: "Join as Industry Partner",
          description: "Register your company to request waste pickup services",
          icon: <Users className="h-8 w-8 text-blue-600" />,
          bgGradient: "from-blue-500 to-indigo-600",
        }
      case "customer":
        return {
          title: "Join EcoCycle Hub",
          description: "Shop eco-friendly products made from recycled materials",
          icon: <ShoppingBag className="h-8 w-8 text-green-600" />,
          bgGradient: "from-green-500 to-emerald-600",
        }
      default:
        return {
          title: "Join EcoCycle Hub",
          description: "Create your account to get started",
          icon: <Recycle className="h-8 w-8 text-green-600" />,
          bgGradient: "from-green-500 to-emerald-600",
        }
    }
  }

  const accountInfo = getAccountTypeInfo()

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${accountInfo.bgGradient} flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8`}
    >
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative z-10 w-full max-w-md">
        <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
              {accountInfo.icon}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">{accountInfo.title}</CardTitle>
            <CardDescription className="text-gray-600 mt-2">{accountInfo.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">{accountType === "industry" ? "Company Name" : "Full Name"}</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  placeholder={accountType === "industry" ? "Enter company name" : "Enter your full name"}
                  className="bg-white/80"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="bg-white/80"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  placeholder="Create a password"
                  className="bg-white/80"
                />
              </div>

              {/* Account type is fixed and cannot be changed */}
              <div>
                <Label htmlFor="role">Account Type</Label>
                <Select value={accountType} disabled>
                  <SelectTrigger className="bg-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="industry">Industry</SelectItem>
                    <SelectItem value="collector">Collector</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Account type cannot be changed after registration</p>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter your phone number"
                  className="bg-white/80"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Enter your address"
                    className="bg-white/80"
                  />
                  {accountType === "industry" && (
                    <Button type="button" variant="outline" size="icon" onClick={getCurrentLocation}>
                      <MapPin className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {accountType === "industry" && (
                  <p className="text-sm text-gray-500 mt-1">Click the map icon to auto-detect location</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-green-600 hover:text-green-500 font-medium">
                  Sign in
                </Link>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
