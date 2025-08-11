"use client"

import Link from "next/link"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Package, Eye, Calendar } from "lucide-react"
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth"

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  status: string
  createdAt: string
  userEmail?: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const { user } = useFirebaseAuth();

  useEffect(() => {
    // Get orders from localStorage and filter out any invalid orders
    const customerOrders = JSON.parse(localStorage.getItem("customerOrders") || "[]")
    
    // Filter for valid orders
    const validOrders = customerOrders.filter((order: Order) => {
      // Only include orders that have items and a total value greater than 0
      return order.total && order.total > 0 && order.items && order.items.length > 0;
    });
    
    // If we filtered out some orders, update localStorage to only contain valid orders
    if (validOrders.length !== customerOrders.length) {
      localStorage.setItem("customerOrders", JSON.stringify(validOrders));
      console.log(`Removed ${customerOrders.length - validOrders.length} invalid or zero-value orders`);
    }
    
    // Filter for current user's orders only
    if (user && user.email) {
      const userOrders = validOrders.filter((order: Order) => {
        // If order has userEmail field, check if it matches current user
        if (order.userEmail) {
          return order.userEmail === user.email;
        }
        // For backward compatibility with orders that don't have userEmail field
        // (these old orders won't be displayed to any user)
        return false;
      });
      
      setOrders(userOrders);
    } else {
      // No user logged in or no email available
      setOrders([]);
    }
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (orders.length === 0 && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start shopping to see your orders here!</p>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Orders</h1>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">Order {order.id}</CardTitle>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    ${(order.total || 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">{order.items?.length || 0} items</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex items-center justify-between">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Order Details - {order.id}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Order Date</p>
                          <p className="text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="font-medium">Status</p>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-4">Items Ordered</h4>
                        <div className="space-y-3">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                              <div className="relative w-16 h-16">
                                <Image
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  fill
                                  className="object-cover rounded"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                              </div>
                              <p className="font-medium">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>${(order.subtotal || 0).toFixed(2)}</span>
                          </div>
                          
                          {/* Only show shipping details in the dialog */}
                          <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>{order.shipping === 0 ? "Free" : `$${(order.shipping || 0).toFixed(2)}`}</span>
                          </div>
                          
                          {/* Only show tax details in the dialog */}
                          <div className="flex justify-between">
                            <span>Tax</span>
                            <span>${(order.tax !== undefined ? order.tax : 0).toFixed(2)}</span>
                          </div>
                          
                          <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Total</span>
                            <span>${(order.total || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
