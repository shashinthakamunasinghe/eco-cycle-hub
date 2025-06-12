"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Bell, User, Recycle, ShoppingCart, Package, Heart, ArrowLeft, Settings, LogOut } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export function Navbar() {
  const { user, logout: authLogout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const getDashboardLabel = () => {
    if (pathname.startsWith("/industry")) return "Industry Dashboard"
    if (pathname.startsWith("/admin")) return "Admin Dashboard"
    if (pathname.startsWith("/shop")) return "Eco Shop"
    if (pathname.startsWith("/collector")) return "Collector Dashboard"
    return null
  }

  const dashboardLabel = getDashboardLabel()
  const isShopPage = pathname.startsWith("/shop")
  const isLandingPage = pathname === "/"
  const isDashboard = !!dashboardLabel
  const isAdminPage = pathname.startsWith("/admin")
  const isCollectorPage = pathname.startsWith("/collector")
  const isIndustryPage = pathname.startsWith("/industry")

  const getNotificationLink = () => {
    if (pathname.startsWith("/admin")) return "/admin/notifications"
    if (pathname.startsWith("/industry")) return "/industry/notifications"
    if (pathname.startsWith("/collector")) return "/collector/notifications"
    if (pathname.startsWith("/shop")) return "/shop/notifications"
    return "#"
  }

  const getProfileLink = () => {
    if (pathname.startsWith("/shop")) return "/shop/profile"
    if (user?.role) return `/${user.role}/profile`
    return "#"
  }

  const handleLogout = async () => {
    try {
      await authLogout()

      if (typeof window !== "undefined") {
        localStorage.removeItem("userRole")
        localStorage.removeItem("userId")
        localStorage.removeItem("authToken")
      }

      toast.success("Logged out successfully")

      if (isShopPage) {
        router.push("/")
      } else {
        router.push("/auth/login")
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Error logging out")
    }
  }

  // Landing Page Navbar (Custom)
  if (isLandingPage) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Features and How it Works */}
            <div className="flex items-center space-x-8">
              <Link href="#features" className="text-gray-700 hover:text-green-600 transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-gray-700 hover:text-green-600 transition-colors">
                How it Works
              </Link>
            </div>

            {/* Center - Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <Recycle className="text-white h-5 w-5" />
                </div>
                <span className="text-xl font-bold text-gray-900">EcoCycle Hub</span>
              </Link>
            </div>

            {/* Right side - About and Contact */}
            <div className="flex items-center space-x-8">
              <Link href="#about" className="text-gray-700 hover:text-green-600 transition-colors">
                About
              </Link>
              <Link href="#contact" className="text-gray-700 hover:text-green-600 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  // Shop Navbar (Custom)
  if (isShopPage) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center">
              <Button variant="ghost" asChild>
                <Link href="/" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back Home
                </Link>
              </Button>
            </div>

            {/* Center - Logo and Label */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <Recycle className="text-white h-5 w-5" />
                </div>
                <span className="text-xl font-bold text-gray-900">EcoCycle Hub</span>
              </Link>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Eco Shop
              </Badge>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Button variant="ghost" size="icon" className="relative" asChild>
                    <Link href="/shop/cart">
                      <ShoppingCart className="h-5 w-5" />
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full text-xs text-white flex items-center justify-center">
                        4
                      </span>
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/shop/orders">
                      <Package className="h-4 w-4 mr-2" />
                      Orders
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/shop/wishlist">
                      <Heart className="h-4 w-4 mr-2" />
                      Wishlist
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="relative" asChild>
                    <Link href="/shop/notifications">
                      <Bell className="h-5 w-5" />
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                        3
                      </span>
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium">{user.name}</p>
                          <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/shop/profile" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/auth/register?type=customer">Register</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/auth/login">Login</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    )
  }

  // Admin, Collector, Industry Navbar (Left-aligned)
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Label */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <Recycle className="text-white h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-gray-900">EcoCycle Hub</span>
            </Link>
            {dashboardLabel && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {dashboardLabel}
              </Badge>
            )}
          </div>

          {/* Right side - Notifications and Profile */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href={getNotificationLink()}>
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name || "User"} />
                    <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={getProfileLink()} className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {user?.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
