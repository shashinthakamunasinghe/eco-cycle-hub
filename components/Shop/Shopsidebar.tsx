"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ShoppingBag, ShoppingCart, Package, User, Star } from "lucide-react"

const navigation = [
  { name: "Products", href: "/products", icon: ShoppingBag },
  { name: "Cart", href: "/cart", icon: ShoppingCart },
  { name: "Orders", href: "/orders", icon: Package },
  { name: "Reviews", href: "/reviews", icon: Star },
  { name: "Profile", href: "/customer-profile", icon: User },
]

const categories = ["Fertilizers", "Garden Supplies", "Mulch", "Compost", "Seeds",]

export function ShopSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white shadow-sm border-r">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">EcoCycle Shop</h2>
      </div>

      <nav className="px-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors",
                isActive ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 mt-6">
        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categories</h3>
        <div className="mt-2 space-y-1">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/products?category=${category.toLowerCase()}`}
              className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
            >
              {category}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
