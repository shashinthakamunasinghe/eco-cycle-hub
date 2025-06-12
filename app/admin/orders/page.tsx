"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { mockOrders } from "@/lib/mock-data"
import { Package, User, Calendar, DollarSign, Search, Eye, Truck, Home } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<any>(null)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const { toast } = useToast()

  // Extended mock orders for demo
  const [orders, setOrders] = useState([
    ...mockOrders,
    {
      id: "2",
      customerId: "4",
      customerName: "John Smith",
      items: [
        { productId: "2", productName: "Bio-Degradable Plant Pots", quantity: 3, price: 12.99 },
        { productId: "3", productName: "Recycled Paper Mulch", quantity: 1, price: 18.99 },
      ],
      total: 57.96,
      status: "shipped" as const,
      shippingAddress: "456 Green Avenue, Eco City",
      createdAt: new Date(Date.now() - 86400000),
    },
    {
      id: "3",
      customerId: "5",
      customerName: "Sarah Johnson",
      items: [{ productId: "1", productName: "Organic Compost Fertilizer", quantity: 5, price: 25.99 }],
      total: 129.95,
      status: "delivered" as const,
      shippingAddress: "789 Sustainable Street, Green Town",
      createdAt: new Date(Date.now() - 172800000),
      deliveredAt: new Date(Date.now() - 86400000),
    },
  ])

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(
      orders.map((order) => {
        if (order.id === orderId) {
          const updatedOrder = { ...order, status: newStatus }
          if (newStatus === "delivered") {
            updatedOrder.deliveredAt = new Date()
          }
          return updatedOrder
        }
        return order
      }),
    )

    if (currentOrder && currentOrder.id === orderId) {
      setCurrentOrder({
        ...currentOrder,
        status: newStatus,
        ...(newStatus === "delivered" ? { deliveredAt: new Date() } : {}),
      })
    }

    toast({
      title: "Order status updated",
      description: `Order #${orderId} status has been updated to ${newStatus}.`,
    })
  }

  const handlePaymentProcessed = () => {
    if (!currentOrder) return

    toast({
      title: "Payment processed",
      description: `Payment for Order #${currentOrder.id} has been processed successfully.`,
    })

    setIsPaymentDialogOpen(false)

    // Send notification to customer
    toast({
      title: "Notification sent",
      description: `Payment confirmation notification sent to ${currentOrder.customerName}.`,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const viewOrderDetails = (order: any) => {
    setCurrentOrder(order)
    setIsViewDialogOpen(true)
  }

  const openPaymentDialog = () => {
    setIsPaymentDialogOpen(true)
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) => item.productName.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-2">Track and manage customer orders</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{filteredOrders.length} orders</Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by order ID, customer, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{order.customerName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4" />
                        <span>{order.items.length} item(s)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold">${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Ordered: {order.createdAt.toLocaleDateString()}</span>
                      </div>
                      {order.deliveredAt && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Delivered: {order.deliveredAt.toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        <span>Ship to: {order.shippingAddress}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <h4 className="text-sm font-medium mb-2">Items:</h4>
                    <div className="space-y-1">
                      {order.items.map((item: any, index: number) => (
                        <div key={index} className="text-sm text-gray-600">
                          {item.quantity}x {item.productName} - ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  {order.status === "processing" && (
                    <Button size="sm" onClick={() => updateOrderStatus(order.id, "shipped")}>
                      Mark as Shipped
                    </Button>
                  )}
                  {order.status === "shipped" && (
                    <Button size="sm" onClick={() => updateOrderStatus(order.id, "delivered")}>
                      Mark as Delivered
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => viewOrderDetails(order)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No orders found matching your criteria.</p>
        </div>
      )}

      {/* View Order Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {currentOrder && (
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Order Details</TabsTrigger>
                <TabsTrigger value="customer">Customer Info</TabsTrigger>
                <TabsTrigger value="payment">Payment</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">Order #{currentOrder.id}</h3>
                    <p className="text-sm text-gray-500">
                      Placed on {currentOrder.createdAt.toLocaleDateString()} at{" "}
                      {currentOrder.createdAt.toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(currentOrder.status)}>{currentOrder.status}</Badge>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Product
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Quantity
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Price
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentOrder.items.map((item: any, index: number) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.productName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                          Total
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${currentOrder.total.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Shipping Information</h4>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Home className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{currentOrder.customerName}</p>
                          <p className="text-sm text-gray-600">{currentOrder.shippingAddress}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Order Timeline</h4>
                    <div className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <p className="text-sm">
                          <span className="font-medium">Order Placed</span> -{" "}
                          {currentOrder.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      {currentOrder.status !== "processing" && (
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          <p className="text-sm">
                            <span className="font-medium">Shipped</span> - {new Date().toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {currentOrder.status === "delivered" && (
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <p className="text-sm">
                            <span className="font-medium">Delivered</span> -{" "}
                            {currentOrder.deliveredAt.toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  {currentOrder.status === "processing" && (
                    <Button onClick={() => updateOrderStatus(currentOrder.id, "shipped")}>
                      <Truck className="h-4 w-4 mr-1" />
                      Mark as Shipped
                    </Button>
                  )}
                  {currentOrder.status === "shipped" && (
                    <Button onClick={() => updateOrderStatus(currentOrder.id, "delivered")}>
                      <Package className="h-4 w-4 mr-1" />
                      Mark as Delivered
                    </Button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="customer" className="space-y-4 py-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{currentOrder.customerName}</h3>
                      <p className="text-sm text-gray-500">Customer ID: {currentOrder.customerId}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h4>
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm">Email: customer@example.com</p>
                        <p className="text-sm">Phone: +94 77 123 4567</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Order History</h4>
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm">Total Orders: 5</p>
                        <p className="text-sm">Total Spent: $245.67</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="payment" className="space-y-4 py-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Payment Information</h3>
                    <Button onClick={openPaymentDialog}>Process Payment</Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Payment Method</h4>
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm">Credit Card ending in ****1234</p>
                        <p className="text-sm text-gray-500">Visa</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Payment Status</h4>
                      <div className="p-3 border rounded-lg">
                        <Badge className="bg-green-100 text-green-800">Paid</Badge>
                        <p className="text-sm text-gray-500 mt-1">
                          Processed on {currentOrder.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Transaction Details</h4>
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>${(currentOrder.total * 0.9).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax:</span>
                        <span>${(currentOrder.total * 0.1).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium border-t pt-2 mt-2">
                        <span>Total:</span>
                        <span>${currentOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Processing Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              Process payment for Order #{currentOrder?.id} - ${currentOrder?.total.toFixed(2)}
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePaymentProcessed}>Process Payment</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
