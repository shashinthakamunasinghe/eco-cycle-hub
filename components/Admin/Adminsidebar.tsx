"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Truck,
  Package,
  ShoppingCart,
  Users,
  MapPin,
  Bell,
  BarChart3,
  LogOut,
  Database,
} from "lucide-react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/admindash", icon: LayoutDashboard },
  { name: "Pickup Requests", href: "/industry-pickups", icon: Truck },
  { name: "Products", href: "/add-products", icon: Package },
  { name: "Orders", href: "/view-orders", icon: ShoppingCart },
  { name: "Collectors", href: "/collectors", icon: Truck },
  { name: "Users", href: "/users", icon: Users },
  { name: "Map View", href: "/admin-map", icon: MapPin },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Notifications", href: "/admin-notifications", icon: Bell },
  { name: "Database Cleanup", href: "/database-cleanup", icon: Database },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useFirebaseAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="fixed left-0 top-16 bottom-0 w-64 pt-6 bg-white shadow-sm border-r overflow-y-auto">
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
    </div>
  );
}
