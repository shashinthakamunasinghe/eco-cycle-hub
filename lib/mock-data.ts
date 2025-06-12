import type { User, PickupRequest, Collector, Product, Order, Notification } from "@/types"

export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@ecocycle.com",
    name: "Admin User",
    role: "admin",
    createdAt: new Date(),
  },
  {
    id: "2",
    email: "industry@example.com",
    name: "Green Industries Ltd",
    role: "industry",
    location: { lat: 6.9271, lng: 79.8612 },
    createdAt: new Date(),
  },
  {
    id: "3",
    email: "collector@example.com",
    name: "John Collector",
    role: "collector",
    createdAt: new Date(),
  },
  {
    id: "4",
    email: "customer@example.com",
    name: "Jane Customer",
    role: "customer",
    createdAt: new Date(),
  },
]

export const mockPickupRequests: PickupRequest[] = [
  {
    id: "1",
    industryId: "2",
    industryName: "Green Industries Ltd",
    wasteType: "Organic Waste",
    weight: 150,
    location: {
      lat: 6.9271,
      lng: 79.8612,
      address: "Colombo, Sri Lanka",
    },
    status: "pending",
    requestedAt: new Date(),
  },
  {
    id: "2",
    industryId: "2",
    industryName: "Green Industries Ltd",
    wasteType: "Plastic Waste",
    weight: 200,
    location: {
      lat: 6.9271,
      lng: 79.8612,
      address: "Colombo, Sri Lanka",
    },
    status: "completed",
    collectorId: "3",
    collectorName: "John Collector",
    requestedAt: new Date(Date.now() - 86400000),
    completedAt: new Date(),
  },
]

export const mockCollectors: Collector[] = [
  {
    id: "3",
    name: "John Collector",
    email: "collector@example.com",
    phone: "+94771234567",
    isAvailable: true,
    currentLocation: { lat: 6.9271, lng: 79.8612 },
    truckCapacity: 1000,
    currentLoad: 200,
    assignedRequests: ["1"],
  },
]

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Organic Compost Fertilizer",
    description: "Premium organic compost made from recycled organic waste",
    price: 25.99,
    category: "Fertilizers",
    image: "/placeholder.svg?height=300&width=300",
    stock: 100,
    rating: 4.8,
    reviews: 124,
  },
  {
    id: "2",
    name: "Bio-Degradable Plant Pots",
    description: "Eco-friendly plant pots made from recycled materials",
    price: 12.99,
    category: "Garden Supplies",
    image: "/placeholder.svg?height=300&width=300",
    stock: 50,
    rating: 4.6,
    reviews: 89,
  },
  {
    id: "3",
    name: "Recycled Paper Mulch",
    description: "Natural mulch made from recycled paper waste",
    price: 18.99,
    category: "Mulch",
    image: "/placeholder.svg?height=300&width=300",
    stock: 75,
    rating: 4.7,
    reviews: 156,
  },
]

export const mockOrders: Order[] = [
  {
    id: "1",
    customerId: "4",
    customerName: "Jane Customer",
    items: [
      {
        productId: "1",
        productName: "Organic Compost Fertilizer",
        quantity: 2,
        price: 25.99,
      },
    ],
    total: 51.98,
    status: "processing",
    shippingAddress: "123 Green Street, Eco City",
    createdAt: new Date(),
  },
]

export const mockNotifications: Notification[] = [
  {
    id: "1",
    userId: "2",
    title: "Pickup Request Submitted",
    message: "Your pickup request for Organic Waste has been submitted successfully.",
    type: "success",
    read: false,
    createdAt: new Date(),
  },
  {
    id: "2",
    userId: "3",
    title: "New Pickup Assignment",
    message: "You have been assigned a new pickup request.",
    type: "info",
    read: false,
    createdAt: new Date(),
  },
]
