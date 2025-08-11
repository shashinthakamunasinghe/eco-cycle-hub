"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ShoppingBag } from "lucide-react"

export default function CancelPage() {
  return (
    <div className="max-w-md mx-auto my-20 p-6">
      <Card className="border-red-100">
        <CardHeader className="pb-4">
          <div className="mx-auto rounded-full bg-red-100 p-3 mb-4">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Payment Cancelled</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4 pb-6">
          <p>
            Your checkout process was cancelled and no payment was made.
          </p>
          <p className="text-sm text-gray-500">
            Your items are still in your cart if you like to try again.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href="/cart">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Return to Cart
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
