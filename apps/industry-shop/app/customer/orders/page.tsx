"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Recycle, Package, Truck, CheckCircle, Clock, User, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function OrdersPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    const customer = localStorage.getItem("currentCustomer")
    if (!customer) {
      router.push("/customer/auth/login?redirect=/customer/orders")
      return
    }

    const userData = JSON.parse(customer)
    setCurrentUser(userData)

    // Load orders
    const savedOrders = localStorage.getItem(`orders_${userData.id}`)
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders))
    } else {
      // Demo orders
      const demoOrders = [
        {
          id: "ORD-1234567890",
          customerId: userData.id,
          items: [
            { id: 1, name: "Organic Compost", quantity: 2, price: 25 },
            { id: 4, name: "Recycled Paper Notebooks", quantity: 3, price: 15 },
          ],
          total: 95,
          status: "Delivered",
          orderDate: "2024-01-10T10:00:00Z",
          estimatedDelivery: "2024-01-17T10:00:00Z",
          trackingNumber: "TRK123456789",
        },
        {
          id: "ORD-1234567891",
          customerId: userData.id,
          items: [{ id: 2, name: "Recycled Plastic Planters", quantity: 1, price: 35 }],
          total: 44.99,
          status: "Shipped",
          orderDate: "2024-01-15T14:30:00Z",
          estimatedDelivery: "2024-01-22T14:30:00Z",
          trackingNumber: "TRK123456790",
        },
      ]
      setOrders(demoOrders)
      localStorage.setItem(`orders_${userData.id}`, JSON.stringify(demoOrders))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("currentCustomer")
    router.push("/shop")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Processing":
        return "bg-yellow-100 text-yellow-800"
      case "Shipped":
        return "bg-blue-100 text-blue-800"
      case "Delivered":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Processing":
        return <Clock className="h-4 w-4" />
      case "Shipped":
        return <Truck className="h-4 w-4" />
      case "Delivered":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
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
                Customer Portal
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">{currentUser.name}</span>
              </div>
              <Link href="/shop">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Shop
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">Track your orders and view order history</p>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-600 mb-4">Start shopping to see your orders here.</p>
                  <Link href="/shop">
                    <Button className="bg-green-600 hover:bg-green-700">Start Shopping</Button>
                  </Link>
                </div>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Order {order.id}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            Placed on {new Date(order.orderDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Order Items */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Items ({order.items.length})</h4>
                          <div className="space-y-2">
                            {order.items.map((item: any) => (
                              <div key={item.id} className="flex justify-between items-center text-sm">
                                <span>
                                  {item.name} × {item.quantity}
                                </span>
                                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Summary */}
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="font-medium">Total</span>
                          <span className="font-bold text-green-600">${order.total.toFixed(2)}</span>
                        </div>

                        {/* Tracking Info */}
                        {order.trackingNumber && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm font-medium text-gray-900">Tracking Number</p>
                                <p className="text-sm text-gray-600">{order.trackingNumber}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">Estimated Delivery</p>
                                <p className="text-sm text-gray-600">
                                  {new Date(order.estimatedDelivery).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Order Actions */}
                        <div className="flex space-x-3 pt-2">
                          <Link href={`/customer/orders/${order.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                          {order.status === "Delivered" && (
                            <Link href={`/shop/product/${order.items[0].id}?review=true`}>
                              <Button variant="outline" size="sm">
                                Write Review
                              </Button>
                            </Link>
                          )}
                          {order.status === "Shipped" && (
                            <Button variant="outline" size="sm">
                              Track Package
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="processing">
            <div className="space-y-6">
              {orders
                .filter((order) => order.status === "Processing")
                .map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Order {order.id}</h3>
                          <p className="text-sm text-gray-600">Processing your order...</p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          <Clock className="h-4 w-4 mr-1" />
                          Processing
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="shipped">
            <div className="space-y-6">
              {orders
                .filter((order) => order.status === "Shipped")
                .map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Order {order.id}</h3>
                          <p className="text-sm text-gray-600">On its way to you!</p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          <Truck className="h-4 w-4 mr-1" />
                          Shipped
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="delivered">
            <div className="space-y-6">
              {orders
                .filter((order) => order.status === "Delivered")
                .map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Order {order.id}</h3>
                          <p className="text-sm text-gray-600">Delivered successfully!</p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Delivered
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
