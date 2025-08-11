"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Star, ShoppingCart, Heart, Search, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { productService } from "@/lib/firebase-services";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/types";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();
  const { user } = useFirebaseAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await productService.getAllProducts();
        
        // Check for duplicate IDs and make them unique
        const productMap = new Map<string, boolean>();
        const uniqueProducts: Product[] = [];
        
        fetchedProducts.forEach((product, index) => {
          if (!productMap.has(product.id)) {
            productMap.set(product.id, true);
            uniqueProducts.push(product);
          } else {
            // Create a new unique ID for duplicate
            const uniqueId = `${product.id}-${index}`;
            console.log(`Found duplicate product ID: ${product.id}, assigning new ID: ${uniqueId}`);
            uniqueProducts.push({ ...product, id: uniqueId });
          }
        });
        
        setProducts(uniqueProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
      }
    };
    fetchProducts();
  }, [toast]);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "home items", label: "Home Items" },
    { value: "mulch", label: "Mulch" },
    { value: "compost", label: "Compost" },
    { value: "tools", label: "Garden Supplies" },
    { value: "seeds", label: "Seeds" },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      product.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const { addToCart: addItemToCart } = useCart();
  
  const addToCart = (productId: string, productName: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login or register to add items to cart.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (product) {
      addItemToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || "/placeholder.svg",
        quantity: 1,
        stock: product.stock
      });
      
      toast({
        title: "Added to cart",
        description: `${productName} has been added to your cart.`,
      });
    }
  };

  // Removed wishlist functionality
  const addToWishlist = (productId: string, productName: string) => {
    // Function left as a placeholder to avoid breaking existing UI elements
    // This will be removed in future updates
    console.log("Wishlist functionality has been removed");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Eco-Friendly Products
        </h1>
        <p className="text-gray-600 mt-2">
          Discover sustainable products made from recycled materials
        </p>
      </div>

      {/* Search and Filters Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Buttons */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.value}
            variant={
              selectedCategory === category.value ? "default" : "outline"
            }
            size="sm"
            onClick={() => setSelectedCategory(category.value)}
            className={
              selectedCategory === category.value
                ? "bg-green-600 hover:bg-green-700"
                : ""
            }
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {(() => {
          // Debug products IDs
          console.log("Rendering products with IDs:", sortedProducts.map(p => p.id));
          return null;
        })()}
        {sortedProducts.map((product, idx) => (
          <Card
            key={`${product.id}-${idx}`}
            className="group hover:shadow-lg transition-shadow"
            onMouseEnter={() => setHoveredProduct(product.id)}
            onMouseLeave={() => setHoveredProduct(null)}
          >
            <CardHeader className="p-0">
              <div className="relative aspect-square overflow-hidden rounded-t-lg">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Wishlist button removed */}
                {product.stock < 10 && (
                  <Badge className="absolute top-2 left-2 bg-red-500">
                    Low Stock
                  </Badge>
                )}

                {/* Details button on hover */}
                {hoveredProduct === product.id && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="secondary">
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{product.name}</DialogTitle>
                          <DialogDescription>Product Details</DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="relative aspect-square">
                            <Image
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div className="space-y-4">
                            <Badge variant="secondary">
                              {product.category}
                            </Badge>
                            <p className="text-gray-600">
                              {product.description}
                            </p>
                            <div className="flex items-center space-x-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={`detail-star-${product.id}-${i}`}
                                    className={`h-4 w-4 ${
                                      i < Math.floor(product.rating)
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">
                                {product.rating} ({product.reviews} reviews)
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="text-3xl font-bold text-green-600">
                                ${product.price}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.stock} in stock
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Button
                                className="w-full"
                                onClick={() =>
                                  addToCart(product.id, product.name)
                                }
                                disabled={product.stock === 0}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Add to Cart
                              </Button>
                              {/* Wishlist button removed */}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Badge variant="secondary" className="text-xs">
                  {product.category}
                </Badge>
                <CardTitle className="text-lg line-clamp-2">
                  {product.name}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {product.description}
                </CardDescription>
                <div className="flex items-center space-x-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={`card-star-${product.id}-${i}`}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviews})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">
                    ${product.price}
                  </span>
                  <span className="text-sm text-gray-500">
                    {product.stock} in stock
                  </span>
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => addToCart(product.id, product.name)}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No products found matching your criteria.
          </p>
        </div>
      )}

      {/* Join the Circular Economy Section */}
      <section className="mt-16 py-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
        <div className="text-center px-8">
          <div className="flex items-center justify-center space-x-8 md:space-x-16 mb-8">
            <div className="flex items-center space-x-4 text-white">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="h-8 w-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
                </svg>
              </div>
              <span className="text-2xl font-bold">Industries</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                <svg
                  className="h-3 w-3 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>

            <div className="flex items-center space-x-4 text-white">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="h-8 w-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </div>
              <span className="text-2xl font-bold">Customers</span>
            </div>
          </div>

          <div className="text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Join the Circular Economy
            </h2>
            <p className="text-xl md:text-2xl opacity-90 mb-8">
              Every product you purchase helps transform waste into valuable
              resources. Together, we are building a more sustainable future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-100"
              >
                Learn More About Our Process
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-600"
              >
                Become an Industry Partner
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
