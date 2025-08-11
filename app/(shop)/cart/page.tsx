"use client"

import Image from "next/image"
import Link from "next/link"
import { getStripe } from "@/lib/stripe"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus, Minus, ShoppingBag, LogIn } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/contexts/CartContext"
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth"
import { useRouter } from "next/navigation"
import { productService } from "@/lib/firebase-services"

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart } = useCart()
  const { toast } = useToast()
  const { user } = useFirebaseAuth()
  const router = useRouter()

  const removeItem = (id: string, name: string) => {
    removeFromCart(id)
    toast({
      title: "Item removed",
      description: `${name} has been removed from your cart.`,
    })
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 50 ? 0 : 5.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handleCheckout = async () => {
    // Check if user is logged in
    if (!user || !user.email) {
      toast({
        title: "Login Required",
        description: "Please login before proceeding to checkout.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart before checkout.",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("Starting checkout process");
      
      // Validate stock availability for all cart items
      console.log("Validating stock for cart items...");
      const stockValidationPromises = cartItems.map(async (cartItem) => {
        try {
          const currentProduct = await productService.getProduct(cartItem.id);
          if (!currentProduct) {
            throw new Error(`Product ${cartItem.name} no longer exists`);
          }
          
          if (currentProduct.stock < cartItem.quantity) {
            throw new Error(`Insufficient stock for ${cartItem.name}. Available: ${currentProduct.stock}, In cart: ${cartItem.quantity}`);
          }
          
          return { valid: true, product: currentProduct };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          return { valid: false, error: errorMessage, productName: cartItem.name };
        }
      });
      
      const validationResults = await Promise.all(stockValidationPromises);
      const invalidItems = validationResults.filter(result => !result.valid);
      
      if (invalidItems.length > 0) {
        const errorMessages = invalidItems.map(item => item.error).join("; ");
        toast({
          title: "Stock validation failed",
          description: errorMessages,
          variant: "destructive",
        });
        return;
      }
      
      console.log("Stock validation passed for all items");
      
      // Save user info in localStorage for order association
      if (user) {
        const userInfo = {
          email: user.email
        };
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
      }
      
      // Process cart items to ensure proper URLs for Stripe
      const processedCartItems = cartItems.map(item => {
        // Process image URLs to be fully qualified for Stripe
        let imageUrl = item.image;
        if (imageUrl && !imageUrl.startsWith('http')) {
          // Convert relative URLs to absolute URLs
          const baseUrl = window.location.origin;
          imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
        }
        
        return {
          ...item,
          image: imageUrl
        };
      });
      
      // Create order data to send to API
      const orderData = {
        items: processedCartItems,
        subtotal,
        shipping,
        tax,
        total,
        userEmail: user.email // Include user email in order data
      }
      
      console.log(`Sending order data: ${cartItems.length} items, total: $${total.toFixed(2)}`);

      // Call the Stripe API to create a checkout session (using App Router API route)
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      console.log(`Response status: ${response.status}`);
      
      // Get the response body regardless of status
      const responseText = await response.text();
      console.log(`Response body: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
      
      if (!response.ok) {
        // Try to parse the error message from the response
        let errorMessage = "Network response was not ok";
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          console.error("Failed to parse error response:", e);
        }
        
        throw new Error(errorMessage);
      }

      // Parse the successful response
      const session = responseText ? JSON.parse(responseText) : {};
      
      // Initialize Stripe
      const stripe = await getStripe()
      
      if (!stripe) {
        throw new Error("Failed to initialize Stripe")
      }
      
      // Redirect to checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      })

      if (result.error) {
        // If redirectToCheckout fails
        toast({
          title: "Checkout error",
          description: result.error.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error:", error);
      let errorMessage = "There was a problem processing your order. Please try again.";
      let actionMessage = "";
      
      // More specific error messages
      if (error instanceof Error) {
        if (error.message.includes("Stripe") && error.message.includes("key")) {
          errorMessage = "Payment configuration error: Stripe API keys are not properly set up.";
          actionMessage = "Please ensure valid Stripe API keys are in .env.local file.";
        } else if (error.message.includes("NetworkError") || error.message.includes("Network")) {
          errorMessage = "Network error when connecting to payment service.";
          actionMessage = "Please check your internet connection and try again.";
        } else if (error.message.includes("URL") || error.message.includes("url")) {
          errorMessage = "Invalid URL detected in product data.";
          actionMessage = "Please report this issue to support.";
        } else if (error.message.includes("Failed to fetch") || error.message.includes("CORS")) {
          errorMessage = "Could not connect to the payment service.";
          actionMessage = "This may be due to network issues or server configuration.";
        } else {
          errorMessage = error.message || errorMessage;
        }
      }
      
      toast({
        title: "Checkout failed",
        description: actionMessage ? `${errorMessage}\n${actionMessage}` : errorMessage,
        variant: "destructive",
      });
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some eco-friendly products to get started!</p>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="relative w-20 h-20">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-green-600 font-bold">${item.price}</p>
                    <p className="text-sm text-gray-500">{item.stock} in stock</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                      className="w-16 text-center"
                      min="1"
                      max={item.stock}
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeItem(item.id, item.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-sm text-gray-600">Add ${(50 - subtotal).toFixed(2)} more for free shipping!</p>
              )}
              <Button className="w-full" onClick={handleCheckout} disabled={cartItems.length === 0}>
                {user ? (
                  <>Proceed to Stripe Checkout</>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Login to Checkout
                  </>
                )}
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
