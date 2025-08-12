"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { orderService } from "@/lib/firebase-services";
import { addShopNotification } from "@/lib/shop-notification";

// Define interfaces for type safety
interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  subtotal?: number;
  shipping?: number;
  tax?: number;
  total: number;
  status: string;
  shippingAddress: string;
  createdAt: Date;
  deliveredAt?: Date;
}

import {
  Package,
  User,
  Calendar,
  DollarSign,
  Search,
  Eye,
  Truck,
  Home,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Helper function to safely format dates from Firebase Timestamp or Date objects
const formatDate = (date: any): string => {
  if (!date) return "N/A";

  // Handle Firebase Timestamp objects
  if (date && typeof date.toDate === "function") {
    return date.toDate().toLocaleDateString();
  }

  // Handle regular Date objects
  if (date instanceof Date) {
    return date.toLocaleDateString();
  }

  // Handle date strings
  if (typeof date === "string") {
    return new Date(date).toLocaleDateString();
  }

  // Fallback
  return "Invalid Date";
};

// Helper function to safely format time from Firebase Timestamp or Date objects
const formatTime = (date: any): string => {
  if (!date) return "N/A";

  // Handle Firebase Timestamp objects
  if (date && typeof date.toDate === "function") {
    return date.toDate().toLocaleTimeString();
  }

  // Handle regular Date objects
  if (date instanceof Date) {
    return date.toLocaleTimeString();
  }

  // Handle date strings
  if (typeof date === "string") {
    return new Date(date).toLocaleTimeString();
  }

  // Fallback
  return "Invalid Time";
};

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Function to manually refresh orders
  const refreshOrders = async () => {
    setIsLoading(true);
    try {
      console.log("Manually refreshing orders from Firebase...");
      const firebaseOrders = await orderService.getAllOrders();
      console.log("Refreshed orders from Firebase:", firebaseOrders.length);
      setOrders(firebaseOrders);

      toast({
        title: "Orders refreshed",
        description: `Loaded ${firebaseOrders.length} orders from Firebase.`,
      });
    } catch (error) {
      console.error("Error refreshing orders:", error);
      toast({
        title: "Error refreshing orders",
        description: "Could not refresh orders from database.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        console.log("Loading orders from Firebase...");

        // Fetch orders ONLY from Firebase
        const firebaseOrders = await orderService.getAllOrders();
        console.log("Fetched orders from Firebase:", firebaseOrders.length);

        // Set orders directly from Firebase (no localStorage, no mock data)
        setOrders(firebaseOrders);
      } catch (error) {
        console.error("Error fetching orders from Firebase:", error);

        // If Firebase fails, show empty state instead of fallback data
        setOrders([]);

        toast({
          title: "Error loading orders",
          description: "Could not load orders from database. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [toast]);

  // Orders state - loaded exclusively from Firebase
  const [orders, setOrders] = useState<Order[]>([]);

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(
      orders.map((order) => {
        if (order.id === orderId) {
          const updatedOrder = { ...order, status: newStatus };
          if (newStatus === "delivered") {
            updatedOrder.deliveredAt = new Date();
          }
          return updatedOrder;
        }
        return order;
      })
    );

    if (currentOrder && currentOrder.id === orderId) {
      setCurrentOrder({
        ...currentOrder,
        status: newStatus,
        ...(newStatus === "delivered" ? { deliveredAt: new Date() } : {}),
      });
    }

    toast({
      title: "Order status updated",
      description: `Order #${orderId} status has been updated to ${newStatus}.`,
    });

    // Add notification for shipped status
    if (newStatus === "shipped") {
      addShopNotification({
        title: "Order Shipped",
        message: `Your order #${orderId} has been shipped and is on its way!`,
        type: "order",
      });
    }
  };

  const handlePaymentProcessed = () => {
    if (!currentOrder) return;

    toast({
      title: "Payment processed",
      description: `Payment for Order #${currentOrder.id} has been processed successfully.`,
    });

    setIsPaymentDialogOpen(false);

    // Send notification to customer
    toast({
      title: "Notification sent",
      description: `Payment confirmation notification sent to ${currentOrder.customerName}.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const viewOrderDetails = (order: Order) => {
    setCurrentOrder(order);
    setIsViewDialogOpen(true);
  };

  const openPaymentDialog = () => {
    setIsPaymentDialogOpen(true);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-2">Track and manage customer orders</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{filteredOrders.length} orders</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshOrders}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
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

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading orders from Firebase...</p>
        </div>
      )}

      {/* Orders List */}
      {!isLoading && (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <h3 className="text-lg font-semibold">
                        Order #{order.id}
                      </h3>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
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
                          <span className="font-semibold">
                            ${(order.total || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Ordered: {formatDate(order.createdAt)}</span>
                        </div>
                        {order.deliveredAt && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Delivered:{" "}
                              {order.deliveredAt
                                ? formatDate(order.deliveredAt)
                                : "Not delivered yet"}
                            </span>
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
                        {order.items.map((item: OrderItem, index: number) => (
                          <div key={index} className="text-sm text-gray-600">
                            {item.quantity}x {item.productName} - $
                            {(item.price * item.quantity).toFixed(2)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    {order.status === "processing" && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, "shipped")}
                      >
                        Mark as Shipped
                      </Button>
                    )}
                    {order.status === "shipped" && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, "delivered")}
                      >
                        Mark as Delivered
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewOrderDetails(order)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            No orders found matching your criteria.
          </p>
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
                    <h3 className="text-xl font-semibold">
                      Order #{currentOrder.id}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Placed on {formatDate(currentOrder.createdAt)} at{" "}
                      {formatTime(currentOrder.createdAt)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(currentOrder.status)}>
                    {currentOrder.status}
                  </Badge>
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
                      {currentOrder.items.map(
                        (item: OrderItem, index: number) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.productName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${item.price.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${(item.price * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-4 text-right text-sm font-medium text-gray-900"
                        >
                          Total
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${(currentOrder.total || 0).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Shipping Information
                    </h4>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Home className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">
                            {currentOrder.customerName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {currentOrder.shippingAddress}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Order Timeline
                    </h4>
                    <div className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <p className="text-sm">
                          <span className="font-medium">Order Placed</span> -{" "}
                          {formatDate(currentOrder.createdAt)}
                        </p>
                      </div>
                      {currentOrder.status !== "processing" && (
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          <p className="text-sm">
                            <span className="font-medium">Shipped</span> -{" "}
                            {new Date().toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {currentOrder.status === "delivered" && (
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <p className="text-sm">
                            <span className="font-medium">Delivered</span> -{" "}
                            {currentOrder.deliveredAt
                              ? formatDate(currentOrder.deliveredAt)
                              : "Not delivered yet"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  {currentOrder.status === "processing" && (
                    <Button
                      onClick={() =>
                        updateOrderStatus(currentOrder.id, "shipped")
                      }
                    >
                      <Truck className="h-4 w-4 mr-1" />
                      Mark as Shipped
                    </Button>
                  )}
                  {currentOrder.status === "shipped" && (
                    <Button
                      onClick={() =>
                        updateOrderStatus(currentOrder.id, "delivered")
                      }
                    >
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
                      <h3 className="text-lg font-semibold">
                        {currentOrder.customerName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Customer ID: {currentOrder.customerId}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        Contact Information
                      </h4>
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm">Email: customer@example.com</p>
                        <p className="text-sm">Phone: +94 77 123 4567</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        Order History
                      </h4>
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
                    <h3 className="text-lg font-semibold">
                      Payment Information
                    </h3>
                    <Button onClick={openPaymentDialog}>Process Payment</Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        Payment Method
                      </h4>
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm">
                          Credit Card ending in ****1234
                        </p>
                        <p className="text-sm text-gray-500">Visa</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        Payment Status
                      </h4>
                      <div className="p-3 border rounded-lg">
                        <Badge className="bg-green-100 text-green-800">
                          Paid
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">
                          Processed on {formatDate(currentOrder.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Transaction Details
                    </h4>
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>${(currentOrder.subtotal || 0).toFixed(2)}</span>
                      </div>

                      {/* Only show shipping in the details */}
                      {currentOrder.shipping !== undefined &&
                        currentOrder.shipping > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Shipping:</span>
                            <span>${currentOrder.shipping.toFixed(2)}</span>
                          </div>
                        )}

                      {/* Only show tax in the details */}
                      {currentOrder.tax !== undefined &&
                        currentOrder.tax > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Tax:</span>
                            <span>${currentOrder.tax.toFixed(2)}</span>
                          </div>
                        )}

                      <div className="flex justify-between text-sm font-medium border-t pt-2 mt-2">
                        <span>Total:</span>
                        <span>${(currentOrder.total || 0).toFixed(2)}</span>
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
              Process payment for Order #{currentOrder?.id} - $
              {(currentOrder?.total || 0).toFixed(2)}
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsPaymentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handlePaymentProcessed}>Process Payment</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
