"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Recycle,
  Leaf,
  ShoppingCart,
  Star,
  Search,
  Heart,
  Eye,
  ChevronLeft,
  ChevronRight,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

const advertisements = [
  {
    id: 1,
    title: "50% Off Organic Compost",
    description: "Limited time offer on premium organic compost",
    image: "/placeholder.svg?height=200&width=800",
    color: "bg-green-600",
  },
  {
    id: 2,
    title: "New Recycled Furniture Collection",
    description: "Discover our latest eco-friendly furniture line",
    image: "/placeholder.svg?height=200&width=800",
    color: "bg-blue-600",
  },
  {
    id: 3,
    title: "Free Shipping on Orders Over $100",
    description: "Get free delivery on all eco-products",
    image: "/placeholder.svg?height=200&width=800",
    color: "bg-purple-600",
  },
];

const products = [
  {
    id: 1,
    name: "Organic Compost",
    shortDescription: "Premium organic compost for gardens",
    description:
      "High-quality organic compost made from recycled organic waste. Perfect for gardens, lawns, and potted plants. Rich in nutrients and beneficial microorganisms.",
    price: 25,
    originalPrice: 35,
    image: "/placeholder.svg?height=300&width=300",
    category: "Organic",
    rating: 4.8,
    reviewCount: 124,
    inStock: true,
    isOnSale: true,
    features: [
      "100% Organic",
      "Rich in Nutrients",
      "Eco-Friendly",
      "Ready to Use",
    ],
  },
  {
    id: 2,
    name: "Recycled Plastic Planters",
    shortDescription: "Durable planters from recycled plastic",
    description:
      "Beautiful and durable planters made from 100% recycled plastic waste. Weather-resistant and perfect for both indoor and outdoor use.",
    price: 35,
    originalPrice: null,
    image: "/placeholder.svg?height=300&width=300",
    category: "Plastic",
    rating: 4.6,
    reviewCount: 89,
    inStock: true,
    isOnSale: false,
    features: [
      "100% Recycled",
      "Weather Resistant",
      "Multiple Sizes",
      "UV Protected",
    ],
  },
  {
    id: 3,
    name: "Eco-Friendly Storage Boxes",
    shortDescription: "Storage solutions from recycled materials",
    description:
      "Versatile storage solutions crafted from recycled materials. Perfect for organizing your home while supporting sustainability.",
    price: 45,
    originalPrice: null,
    image: "/placeholder.svg?height=300&width=300",
    category: "Mixed",
    rating: 4.7,
    reviewCount: 67,
    inStock: false,
    isOnSale: false,
    features: [
      "Recycled Materials",
      "Stackable Design",
      "Durable",
      "Multiple Colors",
    ],
  },
  {
    id: 4,
    name: "Recycled Paper Notebooks",
    shortDescription: "High-quality notebooks from recycled paper",
    description:
      "Premium notebooks made from 100% recycled paper waste. Perfect for students, professionals, and eco-conscious writers.",
    price: 15,
    originalPrice: 20,
    image: "/placeholder.svg?height=300&width=300",
    category: "Paper",
    rating: 4.9,
    reviewCount: 203,
    inStock: true,
    isOnSale: true,
    features: [
      "100% Recycled Paper",
      "Smooth Writing",
      "Durable Binding",
      "Various Sizes",
    ],
  },
  {
    id: 5,
    name: "Recycled Glass Vases",
    shortDescription: "Beautiful vases from recycled glass",
    description:
      "Elegant vases handcrafted from recycled glass. Each piece is unique and adds a touch of sustainability to your home decor.",
    price: 28,
    originalPrice: null,
    image: "/placeholder.svg?height=300&width=300",
    category: "Glass",
    rating: 4.5,
    reviewCount: 45,
    inStock: true,
    isOnSale: false,
    features: ["Handcrafted", "Unique Design", "Recycled Glass", "Home Decor"],
  },
  {
    id: 6,
    name: "Eco Tote Bags",
    shortDescription: "Reusable bags from recycled textiles",
    description:
      "Stylish and durable tote bags made from recycled textile waste. Perfect for shopping, work, or everyday use.",
    price: 18,
    originalPrice: 25,
    image: "/placeholder.svg?height=300&width=300",
    category: "Textile",
    rating: 4.7,
    reviewCount: 156,
    inStock: true,
    isOnSale: true,
    features: [
      "Recycled Textiles",
      "Strong Handles",
      "Machine Washable",
      "Multiple Colors",
    ],
  },
];

export default function ShopPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  useEffect(() => {
    // Check if customer is logged in
    const customer = localStorage.getItem("currentCustomer");
    if (customer) {
      setCurrentUser(JSON.parse(customer));
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem("customerCart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Auto-slide advertisements
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % advertisements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const addToCart = (product: any) => {
    if (!currentUser) {
      router.push("/customer/auth/login?redirect=/shop");
      return;
    }

    const existingItem = cart.find((item) => item.id === product.id);
    let newCart;

    if (existingItem) {
      newCart = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }

    setCart(newCart);
    localStorage.setItem("customerCart", JSON.stringify(newCart));
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  const nextAd = () => {
    setCurrentAdIndex((prev) => (prev + 1) % advertisements.length);
  };

  const prevAd = () => {
    setCurrentAdIndex(
      (prev) => (prev - 1 + advertisements.length) % advertisements.length
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Recycle className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">
                  EcoCycleHub
                </span>
              </Link>
              <Badge
                variant="outline"
                className="text-green-600 border-green-600"
              >
                Eco Shop
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              {currentUser ? (
                <>
                  <span className="text-sm text-gray-600">
                    Welcome, {currentUser.name}
                  </span>
                  <Link href="/customer/profile">
                    <Button variant="ghost" size="sm">
                      Profile
                    </Button>
                  </Link>
                  <Link href="/customer/orders">
                    <Button variant="ghost" size="sm">
                      Orders
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/customer/auth/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/customer/auth/signup">
                    <Button variant="outline" size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  toast({
                    title: "Notifications",
                    description: "You have no new notifications.",
                  })
                }
              >
                <Bell className="h-4 w-4" />
              </Button>

              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>

              <Link href="/customer/cart">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 relative"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart
                  {getCartItemCount() > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 min-w-[20px] h-5 flex items-center justify-center rounded-full">
                      {getCartItemCount()}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Advertisement Slideshow */}
      <div className="relative bg-gray-900 overflow-hidden">
        <div className="relative h-48 md:h-64">
          {advertisements.map((ad, index) => (
            <div
              key={ad.id}
              className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                index === currentAdIndex
                  ? "translate-x-0"
                  : index < currentAdIndex
                  ? "-translate-x-full"
                  : "translate-x-full"
              }`}
            >
              <div
                className={`${ad.color} h-full flex items-center justify-center text-white`}
              >
                <div className="text-center px-4">
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">
                    {ad.title}
                  </h2>
                  <p className="text-lg md:text-xl opacity-90">
                    {ad.description}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Buttons */}
          <button
            onClick={prevAd}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextAd}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {advertisements.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentAdIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentAdIndex
                    ? "bg-white"
                    : "bg-white bg-opacity-50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="hover:shadow-lg transition-all duration-300 relative group"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <CardHeader className="p-0 relative">
                <div className="aspect-square bg-gray-100 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                  <Leaf className="h-16 w-16 text-green-400" />

                  {/* Sale Badge */}
                  {product.isOnSale && (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                      Sale
                    </Badge>
                  )}

                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="secondary" className="p-2">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Link href={`/shop/product/${product.id}`}>
                      <Button size="sm" variant="secondary" className="p-2">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>

                  {/* Hover Description */}
                  {hoveredProduct === product.id && (
                    <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 transition-all">
                      <div className="text-white text-center">
                        <p className="text-sm mb-3">
                          {product.shortDescription}
                        </p>
                        <Link href={`/shop/product/${product.id}`}>
                          <Button size="sm" variant="secondary">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="h-3 w-3 text-yellow-400 mr-1 fill-current" />
                    {product.rating} ({product.reviewCount})
                  </div>
                </div>

                <CardTitle className="text-lg mb-2 line-clamp-2">
                  {product.name}
                </CardTitle>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-green-600">
                    ${product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>

                <Button
                  onClick={() => addToCart(product)}
                  disabled={!product.inStock}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                >
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16 bg-green-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Join the Circular Economy
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Every product you purchase helps transform waste into valuable
            resources. Together, we're building a more sustainable future.
          </p>
          <div className="flex justify-center space-x-4">
            <Button className="bg-green-600 hover:bg-green-700">
              <Recycle className="h-4 w-4 mr-2" />
              Learn More About Our Process
            </Button>
            <Link href="/">
              <Button variant="outline">Become an Industry Partner</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
