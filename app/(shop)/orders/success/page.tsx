"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ShoppingBag } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { productService } from "@/lib/firebase-services"

// Define cart item interface for type safety
interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  stock?: number;
}

export default function SuccessPage() {
  const searchParams = useSearchParams() || new URLSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [orderNumber, setOrderNumber] = useState("")
  const { clearCart } = useCart()

  const success = searchParams?.get("success") || ""
  const sessionId = searchParams?.get("session_id") || ""

  useEffect(() => {
    // If there's no success query param or session ID, redirect to orders
    if (!success || !sessionId) {
      router.push("/orders")
      return
    }

    async function processOrder() {
      try {
        setIsLoading(true)

        // Create a unique order ID
        const newOrderId = `ORD-${Date.now()}`
        setOrderNumber(newOrderId)

        // Get cart items from localStorage
        const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]") as CartItem[];

        // Check if cart is empty or has only zero-value items
        if (!cartItems.length || !cartItems.some(item => (item.price || 0) > 0)) {
          console.warn("No valid items in cart, but attempting to create order");
          // We'll still continue to handle the case, but log a warning
        }

        // Calculate order totals with safety checks for undefined or non-numeric values
        const subtotal = cartItems.reduce((sum: number, item: CartItem) => {
          // Ensure price and quantity are valid numbers
          const price = typeof item.price === 'number' ? item.price : 0;
          const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
          return sum + (price * quantity);
        }, 0);
        const shipping = subtotal > 50 ? 0 : 5.99;
        const tax = subtotal * 0.08;
        const total = subtotal + shipping + tax;

        // Ensure each item has valid properties
        const validatedItems = cartItems.map((item: CartItem) => ({
          ...item,
          price: typeof item.price === 'number' ? item.price : 0,
          quantity: typeof item.quantity === 'number' ? item.quantity : 1,
          name: item.name || "Product",
          image: item.image || "/placeholder.svg"
        }));

        // Get the current user info from localStorage
        const userInfo = localStorage.getItem("userInfo");
        let userEmail = "";

        if (userInfo) {
          try {
            const parsedUserInfo = JSON.parse(userInfo);
            userEmail = parsedUserInfo.email || "";
          } catch (e) {
            console.error("Failed to parse user info:", e);
          }
        }

        // Create order object with all required fields and user email
        const order = {
          id: newOrderId,
          items: validatedItems,
          status: "paid",
          paymentId: sessionId,
          createdAt: new Date().toISOString(),
          subtotal: subtotal,  // Price of items only
          shipping: shipping,  // Shipping cost
          tax: tax,            // Tax amount
          total: total,        // Total with shipping and tax
          userEmail: userEmail // Associate with the logged-in user
        }

        // Only save the order if it has items and a total value greater than 0
        if (validatedItems.length > 0 && total > 0) {
          // Reduce product stock for each item in the order
          try {
            const stockReductionItems = validatedItems.map(item => ({
              productId: item.id,
              quantity: item.quantity
            }));
            
            await productService.reduceMultipleProductsStock(stockReductionItems);
            console.log("Stock reduced successfully for", stockReductionItems.length, "products");
          } catch (stockError) {
            console.error("Error reducing stock:", stockError);
            // Note: In a real-world scenario, you might want to handle this differently
            // For now, we'll log the error but still complete the order since payment was successful
          }
          
          // Save to orders in localStorage
          const orders = JSON.parse(localStorage.getItem("customerOrders") || "[]")
          orders.unshift(order)
          localStorage.setItem("customerOrders", JSON.stringify(orders))

          // Add order success notification to localStorage
          const notifications = JSON.parse(localStorage.getItem("shopNotifications") || "[]")
          notifications.unshift({
            id: `notif-${Date.now()}`,
            title: "Order Successful",
            message: `Your order ${newOrderId} was placed successfully!`,
            type: "order",
            read: false,
            createdAt: new Date().toISOString()
          })
          localStorage.setItem("shopNotifications", JSON.stringify(notifications))
        } else {
          console.log("Skipped saving invalid order (empty items or zero value)")
        }

        // Clear cart
        clearCart()

        setIsLoading(false)
      } catch (error) {
        console.error("Error processing order:", error)
        setIsLoading(false)
      }
    }

    processOrder()
  }, [success, sessionId, router])

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto my-20 p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto"></div>
              <p>Processing your order...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto my-20 p-6">
      <Card className="border-green-100">
        <CardHeader className="pb-4">
          <div className="mx-auto rounded-full bg-green-100 p-3 mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4 pb-6">
          <p>
            Thank you for your purchase. Your order has been processed successfully.
          </p>
          <p className="text-gray-600">
            Order number: <span className="font-medium">{orderNumber}</span>
          </p>
          <p className="text-sm text-gray-500">
            A confirmation email has been sent to your email address.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href="/orders">
              <ShoppingBag className="mr-2 h-4 w-4" />
              View My Orders
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
