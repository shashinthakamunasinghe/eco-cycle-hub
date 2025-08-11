"use client"

import Link from "next/link"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WishlistItem {
  id: string
  name: string
  price: number
  image: string
  category: string
  stock: number
  rating: number
}

interface CartItem extends WishlistItem {
  quantity: number
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("wishlistItems") || "[]")
    setWishlistItems(items)
  }, [])

  const removeFromWishlist = (id: string, name: string) => {
    const updatedItems = wishlistItems.filter((item) => item.id !== id)
    setWishlistItems(updatedItems)
    localStorage.setItem("wishlistItems", JSON.stringify(updatedItems))
    toast({
      title: "Removed from wishlist",
      description: `${name} has been removed from your wishlist.`,
    })
  }

  const addToCart = (item: WishlistItem) => {
    const cartItems: CartItem[] = JSON.parse(localStorage.getItem("cartItems") || "[]")
    const existingItem = cartItems.find((cartItem) => cartItem.id === item.id)

    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cartItems.push({ ...item, quantity: 1 })
    }

    localStorage.setItem("cartItems", JSON.stringify(cartItems))

    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    })
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">Save items you love for later!</p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((item) => (
          <Card key={item.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              <div className="relative aspect-square overflow-hidden rounded-t-lg">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 bg-white/80 hover:bg-white"
                    onClick={() => removeFromWishlist(item.id, item.name)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
                {item.stock < 10 && <Badge className="absolute top-2 left-2 bg-red-500">Low Stock</Badge>}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Badge variant="secondary" className="text-xs">
                  {item.category}
                </Badge>
                <CardTitle className="text-lg line-clamp-2">{item.name}</CardTitle>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">${item.price}</span>
                  <span className="text-sm text-gray-500">{item.stock} in stock</span>
                </div>
                <Button size="sm" className="w-full" onClick={() => addToCart(item)} disabled={item.stock === 0}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
