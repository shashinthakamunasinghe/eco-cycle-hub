"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MapPin,
  Package,
  Bell,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/collectordash", icon: LayoutDashboard },
  { name: "Assigned Pickups", href: "/assigned-pickups", icon: Package },
  { name: "Map View", href: "/collector-map", icon: MapPin },
  { name: "Profile", href: "/collector-profile", icon: User },
  { name: "Notifications", href: "/collector-notifications", icon: Bell },
];

export function CollectorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useFirebaseAuth();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar');
      const toggle = document.getElementById('mobile-menu-toggle');
      
      if (isMobileMenuOpen && sidebar && toggle && 
          !sidebar.contains(event.target as Node) && 
          !toggle.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const SidebarContent = () => (
    <nav className="px-3 py-6 h-full flex flex-col">
      <div className="flex-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors",
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
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
  );

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <Button
        id="mobile-menu-toggle"
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-sm border"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:left-0 md:top-16 md:bottom-0 md:w-64 md:bg-white md:shadow-sm md:border-r md:overflow-y-auto md:block">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div
        id="mobile-sidebar"
        className={cn(
          "fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg border-r overflow-y-auto z-50 transform transition-transform duration-300 ease-in-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <SidebarContent />
      </div>

      {/* Bottom Navigation for Mobile (Alternative approach) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:hidden z-30">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center px-2 py-2 text-xs font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}