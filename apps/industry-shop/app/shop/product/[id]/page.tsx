"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Recycle, Star, ShoppingCart, Heart, Share2, Leaf } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams, useSearchParams } from "next/navigation"

const products = [
  {
    id: 1,
    name: "Organic Compost",
    shortDescription: "Premium organic compost for gardens",
    description:
      "High-quality organic compost made from recycled organic waste. Perfect for gardens, lawns, and potted plants. Rich in nutrients and beneficial microorganisms that promote healthy plant growth. This compost is created through a carefully controlled decomposition process that transforms organic waste into valuable soil amendment.",
    price: 25,
    originalPrice: 35,
    image: "/placeholder.svg?height=400&width=400",
    category: "Organic",
    rating: 4.8,
    reviewCount: 124,
    inStock: true,
    isOnSale: true,
    features: ["100% Organic", "Rich in Nutrients", "Eco-Friendly", "Ready to Use"],
    specifications: {
      Weight: "25 lbs",
      Coverage: "Up to 50 sq ft",
      "pH Level": "6.5-7.0",
      "Moisture Content": "40-50%",
    },
  },
  // Add other products here...
]

const reviews = [
  {
    id: 1,
    productId: 1,
    customerName: "Sarah Johnson",
    rating: 5,
    title: "Excellent quality compost!",
    comment:
      "This compost has transformed my garden. My plants are thriving and the soil quality has improved dramatically. Highly recommend!",
    date: "2024-01-15",
    verified: true,
  },
  {
    id: 2,
    productId: 1,
    customerName: "Mike Chen",
    rating: 4,
    title: "Great product, fast delivery",
    comment:
      "Good quality compost that arrived quickly. My vegetables are growing better than ever. Will definitely order again.",
    date: "2024-01-10",
    verified: true,
  },
]

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const productId = Number.parseInt(params.id as string)
  const showReview = searchParams.get("review") === "true"

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [product, setProduct] = useState<any>(null)
  const [productReviews, setProductReviews] = useState<any[]>([])
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showReviewForm, setShowReviewForm] = useState(showReview)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
  })

  useEffect(() => {
    const customer = localStorage.getItem("currentCustomer")
    if (customer) {
      setCurrentUser(JSON.parse(customer))
    }

    const foundProduct = products.find((p) => p.id === productId)
    if (foundProduct) {
      setProduct(foundProduct)
    }

    const productReviewsData = reviews.filter((r) => r.productId === productId)
    setProductReviews(productReviewsData)
  }, [productId])

  const addToCart = () => {
    if (!currentUser) {
      router.push(`/customer/auth/login?redirect=/shop/product/${productId}`)
      return
    }

    const cart = JSON.parse(localStorage.getItem("customerCart") || "[]")
    const existingItem = cart.find((item: any) => item.id === product.id)

    let newCart
    if (existingItem) {
      newCart = cart.map((item: any) =>
        item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
      )
    } else {
      newCart = [...cart, { ...product, quantity }]
    }

    localStorage.setItem("customerCart", JSON.stringify(newCart))
    alert("Product added to cart!")
  }

  const submitReview = () => {
    if (!currentUser) {
      router.push(`/customer/auth/login?redirect=/shop/product/${productId}?review=true`)
      return
    }

    const newReview = {
      id: Date.now(),
      productId: productId,
      customerName: currentUser.name,
      rating: reviewForm.rating,
      title: reviewForm.title,
      comment: reviewForm.comment,
      date: new Date().toISOString().split("T")[0],
      verified: true,
    }

    setProductReviews([newReview, ...productReviews])
    setShowReviewForm(false)
    setReviewForm({ rating: 5, title: "", comment: "" })
    alert("Review submitted successfully!")
  }

  if (!product) {
    return <div>Product not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Recycle className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">EcoCycleHub</span>
            </div>
            <Link href="/shop">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shop
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <Leaf className="h-32 w-32 text-green-400" />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-2">
                {product.category}
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-gray-600 mt-2">{product.shortDescription}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-green-600">${product.price}</span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">${product.originalPrice}</span>
              )}
              {product.isOnSale && <Badge className="bg-red-500 text-white">Sale</Badge>}
            </div>

            {/* Features */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Key Features</h3>
              <div className="flex flex-wrap gap-2">
                {product.features.map((feature: string) => (
                  <Badge key={feature} variant="outline" className="text-green-600 border-green-600">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="font-medium text-gray-900">Quantity:</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number.parseInt(e.target.value))}
                  className="border rounded-md px-3 py-2"
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={addToCart}
                  disabled={!product.inStock}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16 space-y-8">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Product Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b">
                    <span className="font-medium text-gray-900">{key}</span>
                    <span className="text-gray-600">{value as string}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Customer Reviews ({productReviews.length})</CardTitle>
                <Button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  variant="outline"
                  className="text-green-600 border-green-600"
                >
                  Write a Review
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Review Form */}
              {showReviewForm && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold mb-4">Write Your Review</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= reviewForm.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Review Title</label>
                      <input
                        type="text"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))}
                        className="w-full border rounded-md px-3 py-2"
                        placeholder="Summarize your experience"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                      <Textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                        placeholder="Share your thoughts about this product..."
                        rows={4}
                      />
                    </div>

                    <div className="flex space-x-3">
                      <Button onClick={submitReview} className="bg-green-600 hover:bg-green-700">
                        Submit Review
                      </Button>
                      <Button onClick={() => setShowReviewForm(false)} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {productReviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{review.customerName}</span>
                          {review.verified && (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    <h4 className="font-medium mb-2">{review.title}</h4>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}

                {productReviews.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
