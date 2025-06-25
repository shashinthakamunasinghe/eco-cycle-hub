"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Recycle, Users, ShoppingBag, Shield } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await login(email, password)
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      })

      // Redirect based on role
      switch (user.role) {
        case "admin":
          router.push("/admindash")
          break
        case "industry":
          router.push("/industrydash")
          break
        case "collector":
          router.push("/collectordash")
          break
        case "customer":
          router.push("/products")
          break
        default:
          router.push("/")
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative z-10 w-full max-w-md">
        <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Recycle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
            <CardDescription className="text-gray-600 mt-2">Sign in to your EcoCycle Hub account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="bg-white/80"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="text-center text-sm text-gray-600 mb-4">Demo credentials:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 p-2 rounded flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-red-600" />
                  <div>
                    <div className="font-medium">Admin</div>
                    <div className="text-gray-500">admin@ecocycle.com</div>
                  </div>
                </div>
                <div className="bg-gray-50 p-2 rounded flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium">Industry</div>
                    <div className="text-gray-500">industry@example.com</div>
                  </div>
                </div>
                <div className="bg-gray-50 p-2 rounded flex items-center space-x-2">
                  <Recycle className="h-4 w-4 text-purple-600" />
                  <div>
                    <div className="font-medium">Collector</div>
                    <div className="text-gray-500">collector@example.com</div>
                  </div>
                </div>
                <div className="bg-gray-50 p-2 rounded flex items-center space-x-2">
                  <ShoppingBag className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-medium">Customer</div>
                    <div className="text-gray-500">customer@example.com</div>
                  </div>
                </div>
              </div>
              <div className="text-center text-xs text-gray-500 mt-2">
                Password: <span className="font-mono">password</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600">Do not have an account? </span>
              <div className="flex space-x-2 mt-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href="/register?type=customer">
                    <ShoppingBag className="h-4 w-4 mr-1" />
                    Customer
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href="/register?type=industry">
                    <Users className="h-4 w-4 mr-1" />
                    Industry
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
