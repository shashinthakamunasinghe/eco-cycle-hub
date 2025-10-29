export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "industry" | "collector" | "customer";
  avatar?: string;
  phone?: string;
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  // Collector-specific properties
  isAvailable?: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  truckCapacity?: number;
  currentLoad?: number;
  assignedRequests?: string[];
  suspendedAt?: Date;
  createdAt: Date;
}

export interface PickupRequest {
  id: string;
  industryId: string;
  industryName: string;
  wasteType: string;
  weight: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status:
    | "pending"
    | "assigned"
    | "on-way"
    | "picked-up"
    | "completed"
    | "cancelled";
  collectorId?: string;
  collectorName?: string;
  priority: "high" | "medium" | "low";
  requestedAt: Date;
  scheduledAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  notes?: string;
}

export interface Collector {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAvailable: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  truckCapacity: number;
  currentLoad: number;
  assignedRequests: string[];
}

export interface CollectorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  licenseNumber: string;
  vehicleType: string;
  vehicleModel: string;
  vehicleCapacity: number;
  experience: string;
  status: string;
  rating: number;
  completedPickups: number;
  avatar?: string;
  joinedDate: string;
  emergencyContact: string;
  workingHours: string;
  specializations: string[];
  // Admin dashboard specific fields
  isAvailable?: boolean;
  currentLoad?: number;
  assignedRequests?: string[];
  currentLocation?: {
    lat: number;
    lng: number;
  };
  lastActivity?: string; // ISO date string of last activity/availability change
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  rating: number;
  reviews: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  subtotal?: number;
  shipping?: number;
  tax?: number;
  total: number;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: string;
  createdAt: Date;
  deliveredAt?: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: Date;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  recipients: "all" | "admins" | "industries" | "collectors" | "customers";
  status: "draft" | "sent" | "scheduled";
  createdAt: Date;
  sentAt?: Date;
  scheduledAt?: Date;
  createdBy: string; // Admin user ID
}
