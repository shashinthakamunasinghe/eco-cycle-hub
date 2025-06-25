"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"
import { LayoutDashboard, MapPin, Package, Bell, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

const navigation = [
  { name: "Dashboard", href: "/collectordash", icon: LayoutDashboard },
  { name: "Assigned Pickups", href: "/assigned-pickups", icon: Package },
  { name: "Map View", href: "/collector-map", icon: MapPin },
  { name: "Profile", href: "/collector-profile", icon: User },
  { name: "Notifications", href: "/collector-notifications", icon: Bell },
]

export function CollectorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      // Clear all collector-related data
      localStorage.removeItem("collectorProfile");
      localStorage.removeItem("collectorPickups");
      localStorage.removeItem("collectorNotifications");
      localStorage.removeItem("collectorAvailable");

      // Call auth logout
      await logout();

      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your collector account.",
      });

      // Redirect to login
      router.push("/login");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="fixed left-0 top-16 bottom-0 w-64 bg-white shadow-sm border-r overflow-y-auto lg:block md:hidden">
      <nav className="px-3 py-6 h-full flex flex-col">
        <div className="flex-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors",
                  isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="pt-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </nav>
    </div>
  )
}
