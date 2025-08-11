"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, Star, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/types";
import { productService } from "@/lib/firebase-services";

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: "/placeholder.svg?height=300&width=300",
  });

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
            console.log(
              `Admin: Found duplicate product ID: ${product.id}, assigning new ID: ${uniqueId}`
            );
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
    "all",
    "fertilizers",
    "garden supplies",
    "mulch",
    "compost",
    "tools",
    "seeds",
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" ||
      product.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = async () => {
    if (
      !newProduct.name ||
      !newProduct.description ||
      !newProduct.price ||
      !newProduct.category ||
      !newProduct.stock
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicates
    const existingProduct = products.find(
      (product) =>
        product.name.toLowerCase() === newProduct.name.toLowerCase() &&
        product.description.toLowerCase() ===
          newProduct.description.toLowerCase()
    );

    if (existingProduct) {
      toast({
        title: "Duplicate Product",
        description: "A product with this name and description already exists.",
        variant: "destructive",
      });
      return;
    }

    try {
      const productToAdd = {
        name: newProduct.name,
        description: newProduct.description,
        price: Number.parseFloat(newProduct.price),
        category: newProduct.category,
        image: newProduct.image,
        stock: Number.parseInt(newProduct.stock),
        rating: 5.0,
        reviews: 0,
      };

      console.log("Adding product:", productToAdd);
      await productService.addProduct(productToAdd);

      const updatedProducts = await productService.getAllProducts();
      setProducts(updatedProducts);
      setIsAddDialogOpen(false);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        image: "/placeholder.svg?height=300&width=300",
      });

      toast({
        title: "Success",
        description: "Product added successfully",
      });
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = async () => {
    if (!currentProduct) return;

    try {
      await productService.updateProduct(currentProduct.id, currentProduct);
      const updatedProducts = await productService.getAllProducts();
      setProducts(updatedProducts);
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!currentProduct) return;

    try {
      await productService.deleteProduct(currentProduct.id);

      const updatedProducts = await productService.getAllProducts();
      setProducts(updatedProducts);
      setIsDeleteDialogOpen(false);
      setCurrentProduct(null);

      toast({
        title: "Product deleted",
        description: `${currentProduct.name} has been removed from the catalog.`,
      });
    } catch (error: unknown) {
      console.error("Error deleting product:", error);

      let errorMessage = "Failed to delete product. Please try again.";

      if (error && typeof error === "object") {
        if ("code" in error && error.code === "permission-denied") {
          errorMessage =
            "Permission denied. Please ensure you're logged in as an admin.";
        } else if ("code" in error && error.code === "unauthenticated") {
          errorMessage = "Authentication required. Please log in as an admin.";
        } else if ("message" in error && typeof error.message === "string") {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (product: Product) => {
    setCurrentProduct({ ...product });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Product Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your eco-friendly product catalog
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  onValueChange={(value) =>
                    setNewProduct((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((c) => c !== "all")
                      .map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        stock: e.target.value,
                      }))
                    }
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={newProduct.image}
                  onChange={(e) =>
                    setNewProduct((prev) => ({
                      ...prev,
                      image: e.target.value,
                    }))
                  }
                  placeholder="Enter image URL"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use default placeholder. For demo, use
                  /placeholder.svg?height=300&width=300
                </p>
              </div>
              <Button onClick={handleAddProduct} className="w-full">
                Add Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category === "all"
                  ? "All Categories"
                  : category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              <div className="relative aspect-square overflow-hidden rounded-t-lg">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                {product.stock < 10 && (
                  <Badge className="absolute top-2 left-2 bg-red-500">
                    Low Stock
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Badge variant="secondary" className="text-xs">
                  {product.category}
                </Badge>
                <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center space-x-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={`star-${product.id}-${i}`}
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
                  <span className="text-xl font-bold text-green-600">
                    ${product.price}
                  </span>
                  <span className="text-sm text-gray-500">
                    {product.stock} in stock
                  </span>
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openEditDialog(product)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => openDeleteDialog(product)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No products found matching your criteria.
          </p>
        </div>
      )}

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {currentProduct && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Product Name</Label>
                <Input
                  id="edit-name"
                  value={currentProduct.name}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={currentProduct.category.toLowerCase()}
                  onValueChange={(value) =>
                    setCurrentProduct({ ...currentProduct, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((c) => c !== "all")
                      .map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price">Price ($)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={currentProduct.price}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        price:
                          Number.parseFloat(e.target.value) ||
                          currentProduct.price,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-stock">Stock</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={currentProduct.stock}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        stock:
                          Number.parseInt(e.target.value) ||
                          currentProduct.stock,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={currentProduct.description}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-image">Image URL</Label>
                <Input
                  id="edit-image"
                  value={currentProduct.image}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      image: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditProduct}>
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          {currentProduct && (
            <div className="py-4">
              <p className="mb-4">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{currentProduct.name}</span>?
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteProduct}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Product
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
