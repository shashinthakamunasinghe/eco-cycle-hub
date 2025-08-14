import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  Firestore,
  getCountFromServer,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import type {
  User,
  Product,
  Order,
  PickupRequest,
  Notification,
  CollectorProfile,
} from "@/types";

// Helper function to ensure we have a valid Firestore instance
function getDb(): Firestore {
  if (!db) {
    throw new Error(
      "Firestore is not initialized. Check your Firebase configuration."
    );
  }
  return db;
}

// Product operations
export const productService = {
  async getAllProducts(): Promise<Product[]> {
    const querySnapshot = await getDocs(collection(db, "products"));
    const products: Product[] = [];

    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
      } as unknown as Product);
    });

    return products;
  },

  async getProduct(id: string): Promise<Product | null> {
    const docRef = doc(getDb(), "products", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate(),
    } as unknown as Product;
  },

  async addProduct(product: Omit<Product, "id">): Promise<string> {
    // Check for existing product with same name and description to prevent duplicates
    const existingQuery = query(
      collection(db, "products"),
      where("name", "==", product.name),
      where("description", "==", product.description)
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      throw new Error(
        "A product with this name and description already exists"
      );
    }

    const docRef = await addDoc(collection(db, "products"), {
      ...product,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<void> {
    const docRef = doc(getDb(), "products", id);
    await updateDoc(docRef, {
      ...product,
      updatedAt: Timestamp.now(),
    });
  },

  async deleteProduct(id: string): Promise<void> {
    const docRef = doc(getDb(), "products", id);
    await deleteDoc(docRef);
  },

  async getProductsByCategory(category: string): Promise<Product[]> {
    const q = query(
      collection(getDb(), "products"),
      where("category", "==", category)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
      } as unknown as Product;
    });
  },

  async reduceProductStock(productId: string, quantity: number): Promise<void> {
    const docRef = doc(db, "products", productId);

    // Get the current product to check stock
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    const product = docSnap.data() as Product;
    const currentStock = product.stock || 0;

    if (currentStock < quantity) {
      throw new Error(
        `Insufficient stock for product ${product.name}. Available: ${currentStock}, Requested: ${quantity}`
      );
    }

    const newStock = currentStock - quantity;

    // Update the product stock
    await updateDoc(docRef, {
      stock: newStock,
      updatedAt: Timestamp.now(),
    });
  },

  async reduceMultipleProductsStock(
    items: { productId: string; quantity: number }[]
  ): Promise<void> {
    // Use batch operations for better performance and consistency
    const batch = writeBatch(db);

    // First, validate all products have sufficient stock
    const stockValidations = await Promise.all(
      items.map(async (item) => {
        const docRef = doc(db, "products", item.productId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        const product = docSnap.data() as Product;
        const currentStock = product.stock || 0;

        if (currentStock < item.quantity) {
          throw new Error(
            `Insufficient stock for product ${product.name}. Available: ${currentStock}, Requested: ${item.quantity}`
          );
        }

        return {
          docRef,
          newStock: currentStock - item.quantity,
        };
      })
    );

    // If all validations pass, update all products in a batch
    stockValidations.forEach(({ docRef, newStock }) => {
      batch.update(docRef, {
        stock: newStock,
        updatedAt: Timestamp.now(),
      });
    });

    await batch.commit();
  },
};

// User operations
export const userService = {
  async getUser(id: string): Promise<User | null> {
    const docRef = doc(getDb(), "users", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate(),
    } as unknown as User;
  },

  async getAllUsers(): Promise<User[]> {
    const querySnapshot = await getDocs(collection(getDb(), "users"));
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
      } as unknown as User;
    });
  },

  async getUserCount(): Promise<number> {
    try {
      const snapshot = await getCountFromServer(collection(getDb(), "users"));
      return snapshot.data().count;
    } catch (error) {
      console.error("Error getting user count:", error);
      // Fallback to counting all documents if getCountFromServer fails
      const querySnapshot = await getDocs(collection(getDb(), "users"));
      return querySnapshot.size;
    }
  },

  async getUserCountByRole(): Promise<Record<string, number>> {
    try {
      const roles = ['admin', 'industry', 'collector', 'customer'];
      const counts: Record<string, number> = {};
      
      for (const role of roles) {
        try {
          const q = query(collection(getDb(), "users"), where("role", "==", role));
          const snapshot = await getCountFromServer(q);
          counts[role] = snapshot.data().count;
        } catch (error) {
          console.error(`Error getting count for role ${role}:`, error);
          // Fallback to manual count
          const querySnapshot = await getDocs(query(collection(getDb(), "users"), where("role", "==", role)));
          counts[role] = querySnapshot.size;
        }
      }
      
      return counts;
    } catch (error) {
      console.error("Error getting user counts by role:", error);
      // Fallback to getting all users and counting manually
      const allUsers = await this.getAllUsers();
      return {
        admin: allUsers.filter(user => user.role === 'admin').length,
        industry: allUsers.filter(user => user.role === 'industry').length,
        collector: allUsers.filter(user => user.role === 'collector').length,
        customer: allUsers.filter(user => user.role === 'customer').length,
      };
    }
  },

  async getAvailableCollectorsCount(): Promise<number> {
    try {
      const q = query(
        collection(getDb(), "users"), 
        where("role", "==", "collector"),
        where("isAvailable", "==", true)
      );
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    } catch (error) {
      console.error("Error getting available collectors count:", error);
      // Fallback to manual count
      const q = query(
        collection(getDb(), "users"), 
        where("role", "==", "collector"),
        where("isAvailable", "==", true)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    }
  },

  async getUsersByRole(role: User["role"]): Promise<User[]> {
    const q = query(collection(getDb(), "users"), where("role", "==", role));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
      } as unknown as User;
    });
  },

  async updateUser(id: string, data: Partial<User>): Promise<void> {
    const docRef = doc(getDb(), "users", id);
    await updateDoc(docRef, data);
  },

  async deleteUser(id: string): Promise<void> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");

    // Delete the user document from Firestore
    const docRef = doc(getDb(), "users", id);
    await deleteDoc(docRef);

    console.log(`✅ User ${id} deleted successfully from Firestore`);
  },
};

// Order operations
export const orderService = {
  async getUserOrders(userId: string): Promise<Order[]> {
    const q = query(
      collection(getDb(), "orders"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as Order)
    );
  },

  async getAllOrders(): Promise<Order[]> {
    const q = query(
      collection(getDb(), "orders"),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as Order)
    );
  },

  async createOrder(
    order: Omit<Order, "id"> & { id?: string }
  ): Promise<string> {
    // If an ID is provided (like ORD-123456), use it as the document ID
    if (order.id) {
      const docRef = doc(getDb(), "orders", order.id);
      await setDoc(docRef, {
        ...order,
        createdAt: Timestamp.now(),
      });
      return order.id;
    } else {
      // Otherwise, let Firebase auto-generate the ID
      const docRef = await addDoc(collection(getDb(), "orders"), {
        ...order,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    }
  },

  async updateOrderStatus(id: string, status: Order["status"]): Promise<void> {
    const docRef = doc(getDb(), "orders", id);
    await updateDoc(docRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  },
};

// Pickup Request operations
export const pickupService = {
  async getAllPickupRequests(): Promise<PickupRequest[]> {
    const q = query(
      collection(getDb(), "pickupRequests"),
      orderBy("requestedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id, // Ensure Firestore document ID takes precedence
        requestedAt: data.requestedAt?.toDate() || new Date(),
        scheduledAt: data.scheduledAt?.toDate(),
        completedAt: data.completedAt?.toDate(),
        cancelledAt: data.cancelledAt?.toDate(),
      } as PickupRequest;
    });
  },

  async getPickupRequestsByStatus(
    status: PickupRequest["status"]
  ): Promise<PickupRequest[]> {
    const q = query(
      collection(getDb(), "pickupRequests"),
      where("status", "==", status),
      orderBy("requestedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        requestedAt: data.requestedAt?.toDate() || new Date(),
        scheduledAt: data.scheduledAt?.toDate(),
        completedAt: data.completedAt?.toDate(),
        cancelledAt: data.cancelledAt?.toDate(),
      } as PickupRequest;
    });
  },

  async getPickupRequestsByIndustry(
    industryId: string
  ): Promise<PickupRequest[]> {
    const q = query(
      collection(getDb(), "pickupRequests"),
      where("industryId", "==", industryId),
      orderBy("requestedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        requestedAt: data.requestedAt?.toDate() || new Date(),
        scheduledAt: data.scheduledAt?.toDate(),
        completedAt: data.completedAt?.toDate(),
        cancelledAt: data.cancelledAt?.toDate(),
      } as PickupRequest;
    });
  },

  async getPickupRequestsByCollector(
    collectorId: string
  ): Promise<PickupRequest[]> {
    const q = query(
      collection(db, "pickupRequests"),
      where("collectorId", "==", collectorId)
    );
    const querySnapshot = await getDocs(q);
    const pickups = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        requestedAt: data.requestedAt?.toDate() || new Date(),
        scheduledAt: data.scheduledAt?.toDate(),
        completedAt: data.completedAt?.toDate(),
        cancelledAt: data.cancelledAt?.toDate(),
      } as PickupRequest;
    });

    // Sort in memory instead of requiring an index
    return pickups.sort(
      (a, b) => b.requestedAt.getTime() - a.requestedAt.getTime()
    );
  },

  async createPickupRequest(
    request: Omit<PickupRequest, "id">
  ): Promise<string> {
    const docRef = await addDoc(collection(getDb(), "pickupRequests"), {
      ...request,
      requestedAt: Timestamp.fromDate(request.requestedAt),
      scheduledAt: request.scheduledAt
        ? Timestamp.fromDate(request.scheduledAt)
        : null,
      completedAt: request.completedAt
        ? Timestamp.fromDate(request.completedAt)
        : null,
      cancelledAt: request.cancelledAt
        ? Timestamp.fromDate(request.cancelledAt)
        : null,
    });

    // Create notification for pickup request sent
    await this.createPickupNotification(
      { ...request, id: docRef.id } as PickupRequest,
      "pending"
    );

    return docRef.id;
  },

  async updatePickupRequest(
    id: string,
    updates: Partial<PickupRequest>
  ): Promise<void> {
    const docRef = doc(getDb(), "pickupRequests", id);
    // Create a shallow copy of the updates without explicit any
    const updateData: Record<string, unknown> = { ...updates };

    // Convert dates to Firestore Timestamps
    if (updateData.scheduledAt) {
      updateData.scheduledAt = Timestamp.fromDate(
        updateData.scheduledAt as Date
      );
    }
    if (updateData.completedAt) {
      updateData.completedAt = Timestamp.fromDate(
        updateData.completedAt as Date
      );
    }
    if (updateData.cancelledAt) {
      updateData.cancelledAt = Timestamp.fromDate(
        updateData.cancelledAt as Date
      );
    }

    await updateDoc(docRef, updateData);
  },

  async assignCollector(
    id: string,
    collectorId: string,
    collectorName: string
  ): Promise<void> {
    const docRef = doc(getDb(), "pickupRequests", id);
    await updateDoc(docRef, {
      collectorId,
      collectorName,
      status: "assigned",
      scheduledAt: Timestamp.now(),
    });
  },

  async updateStatus(
    id: string,
    status: PickupRequest["status"]
  ): Promise<void> {
    // Get the pickup request first to access industry info
    const docRef = doc(getDb(), "pickupRequests", id);
    const pickupDoc = await getDoc(docRef);
    
    if (!pickupDoc.exists()) {
      throw new Error("Pickup request not found");
    }
    
    const pickupData = pickupDoc.data() as PickupRequest;
    
    const updateData: Record<string, string | Timestamp> = { status };

    if (status === "completed") {
      updateData.completedAt = Timestamp.now();
    } else if (status === "cancelled") {
      updateData.cancelledAt = Timestamp.now();
    }

    await updateDoc(docRef, updateData);

    // Create notification for industry user
    if (pickupData.industryId) {
      await this.createPickupNotification(pickupData, status);
    }
  },

  async assignCollectorWithNotification(
    id: string,
    collectorId: string,
    collectorName: string
  ): Promise<void> {
    // Get the pickup request first
    const docRef = doc(getDb(), "pickupRequests", id);
    const pickupDoc = await getDoc(docRef);
    
    if (!pickupDoc.exists()) {
      throw new Error("Pickup request not found");
    }
    
    const pickupData = pickupDoc.data() as PickupRequest;
    
    await updateDoc(docRef, {
      collectorId,
      collectorName,
      status: "assigned",
      scheduledAt: Timestamp.now(),
    });

    // Create notification for industry user
    if (pickupData.industryId) {
      await notificationService.createNotification({
        userId: pickupData.industryId,
        title: "Pickup Request Collected",
        message: `Your pickup request for ${pickupData.wasteType} (${pickupData.weight}kg) has been assigned to ${collectorName}. Collection will be scheduled soon.`,
        type: "pickup" as const,
        read: false,
        createdAt: new Date(),
      });
    }
  },

  async createPickupNotification(
    pickup: PickupRequest,
    status: string
  ): Promise<void> {
    let title = "";
    let message = "";
    let type: "info" | "success" | "warning" | "error" | "pickup" | "collector" | "pending" = "info";

    const requestInfo = `${pickup.wasteType} (${pickup.weight}kg)`;
    const pickupId = pickup.id.substring(0, 8); // Short ID for display
    const locationInfo = pickup.location?.address || "your location";

    switch (status) {
      case "pending":
        title = "Pickup Request Sent";
        message = `Your pickup request for ${requestInfo} has been submitted successfully. Request ID: ${pickupId}. Awaiting assignment.`;
        type = "pending";
        break;
      case "assigned":
        title = "Pickup Request Collected";
        message = `Your pickup request for ${requestInfo} has been assigned to ${pickup.collectorName || "a collector"}. Request ID: ${pickupId}.`;
        type = "pickup";
        break;
      case "on-way":
        title = "Collector On The Way";
        message = `${pickup.collectorName || "The collector"} is on the way to ${locationInfo} for ${requestInfo} pickup. Request ID: ${pickupId}.`;
        type = "pickup";
        break;
      case "completed":
        title = "Pickup Completed";
        message = `Your waste pickup has been completed successfully. ${pickup.weight}kg of ${pickup.wasteType} collected. Request ID: ${pickupId}.`;
        type = "success";
        break;
      case "cancelled":
        title = "Pickup Request Rejected";
        message = `Your pickup request for ${requestInfo} has been cancelled or rejected. Request ID: ${pickupId}.`;
        type = "error";
        break;
      default:
        return;
    }

    await notificationService.createNotification({
      userId: pickup.industryId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date(),
    });
  },

  async deletePickupRequest(id: string): Promise<void> {
    const docRef = doc(getDb(), "pickupRequests", id);
    await deleteDoc(docRef);
  },


  async getPendingPickupsCount(): Promise<number> {
    const q = query(
      collection(getDb(), "pickupRequests"),
      where("status", "==", "pending")
    );
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
    
    

  // Sync notifications with pickup history
  async syncPickupNotifications(industryId: string): Promise<void> {
    try {
      const pickupRequests = await this.getPickupRequestsByIndustry(industryId);
      const existingNotifications = await notificationService.getUserNotifications(industryId);
      
      for (const pickup of pickupRequests) {
        // Check if notification already exists for this specific pickup request and status
        const notificationKey = `${pickup.id}-${pickup.status}`;
        const hasNotification = existingNotifications.some(notification => 
          notification.message.includes(pickup.id) || 
          (notification.message.includes(pickup.wasteType) && 
           notification.message.includes(pickup.weight.toString()) &&
           this.getNotificationTypeFromStatus(pickup.status) === notification.type)
        );

        if (!hasNotification) {
          // Create notification based on current status
          await this.createPickupNotification(pickup, pickup.status);
        }
      }
    } catch (error) {
      console.error("Error syncing pickup notifications:", error);
    }
  },

  // Helper function to map pickup status to notification type
  getNotificationTypeFromStatus(status: string): "info" | "success" | "warning" | "error" | "pickup" | "collector" | "pending" {
    switch (status) {
      case "pending":
        return "pending";
      case "assigned":
        return "pickup";
      case "on-way":
        return "pickup";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "info";
    }

  },
};

// Notification operations
export const notificationService = {
  async getUserNotifications(userId: string): Promise<Notification[]> {
    const q = query(
      collection(getDb(), "notifications"),
      where("userId", "==", userId),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    const notifications = querySnapshot.docs.map(
      (doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Notification;
      }
    );
    
    // Sort by createdAt in JavaScript to avoid composite index requirement
    return notifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async createNotification(
    notification: Omit<Notification, "id">
  ): Promise<string> {
    const docRef = await addDoc(collection(getDb(), "notifications"), {
      ...notification,
      createdAt: Timestamp.now(),
    });
    
    // Trigger notification count update
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("notificationUpdated"));
    }
    
    return docRef.id;
  },

  async markAsRead(id: string): Promise<void> {
    const docRef = doc(getDb(), "notifications", id);
    await updateDoc(docRef, {
      read: true,
      updatedAt: Timestamp.now(),
    });
    
    // Trigger notification count update
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("notificationUpdated"));
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    const q = query(
      collection(getDb(), "notifications"),
      where("userId", "==", userId),
      where("read", "==", false)
    );
    const querySnapshot = await getDocs(q);

    const updatePromises = querySnapshot.docs.map((doc) =>
      updateDoc(doc.ref, {
        read: true,
        updatedAt: Timestamp.now(),
      })
    );

    await Promise.all(updatePromises);
    
    // Trigger notification count update
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("notificationUpdated"));
    }
  },

  async deleteNotification(id: string): Promise<void> {
    const docRef = doc(getDb(), "notifications", id);
    await deleteDoc(docRef);
  },

  async getUnreadCount(userId: string): Promise<number> {
    const q = query(
      collection(getDb(), "notifications"),
      where("userId", "==", userId),
      where("read", "==", false)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  },
};

// Collector operations
export const collectorService = {
  async getAllCollectors(): Promise<User[]> {
    return await userService.getUsersByRole("collector");
  },

  async getValidCollectorsWithProfiles(): Promise<{ collectors: User[], profiles: CollectorProfile[] }> {
    // Get all collector users and profiles in parallel
    const [collectorUsers, collectorProfiles] = await Promise.all([
      userService.getUsersByRole("collector"),
      this.getAllCollectorProfiles()
    ]);

    // Filter to only include collectors that have both user record and profile
    const validCollectorIds = new Set();
    const validUsers: User[] = [];
    const validProfiles: CollectorProfile[] = [];

    // First pass: identify collectors with both records
    collectorUsers.forEach(user => {
      const hasProfile = collectorProfiles.some(profile => 
        profile.id === user.id || profile.email === user.email
      );
      if (hasProfile && user.name && user.email) {
        validCollectorIds.add(user.id);
        validUsers.push(user);
      }
    });

    // Second pass: get matching profiles
    collectorProfiles.forEach(profile => {
      if (validCollectorIds.has(profile.id) && profile.name && profile.email) {
        validProfiles.push(profile);
      }
    });

    return { collectors: validUsers, profiles: validProfiles };
  },

  async getCollector(id: string): Promise<User | null> {
    const collector = await userService.getUser(id);
    return collector?.role === "collector" ? collector : null;
  },

  async getAvailableCollectors(): Promise<User[]> {
    const q = query(
      collection(getDb(), "users"),
      where("role", "==", "collector"),
      where("isAvailable", "==", true)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
      } as unknown as User;
    });
  },

  async updateCollectorAvailability(
    id: string,
    isAvailable: boolean
  ): Promise<void> {
    const docRef = doc(getDb(), "users", id);
    await updateDoc(docRef, {
      isAvailable,
      updatedAt: Timestamp.now(),
    });
  },

  async updateCollectorLocation(
    id: string,
    location: { lat: number; lng: number }
  ): Promise<void> {
    const docRef = doc(getDb(), "users", id);
    await updateDoc(docRef, {
      currentLocation: location,
      updatedAt: Timestamp.now(),
    });
  },

  async updateCollectorCapacity(
    id: string,
    truckCapacity: number,
    currentLoad?: number
  ): Promise<void> {
    const updateData: Record<string, number | Timestamp> = {
      truckCapacity,
      updatedAt: Timestamp.now(),
    };
    if (currentLoad !== undefined) {
      updateData.currentLoad = currentLoad;
    }
    const docRef = doc(getDb(), "users", id);
    await updateDoc(docRef, updateData);
  },

  async assignRequestToCollector(
    collectorId: string,
    requestId: string
  ): Promise<void> {
    const collector = await this.getCollector(collectorId);
    if (!collector) throw new Error("Collector not found");

    const assignedRequests = collector.assignedRequests || [];
    const docRef = doc(getDb(), "users", collectorId);
    await updateDoc(docRef, {
      assignedRequests: [...assignedRequests, requestId],
      updatedAt: Timestamp.now(),
    });
  },

  async removeRequestFromCollector(
    collectorId: string,
    requestId: string
  ): Promise<void> {
    const collector = await this.getCollector(collectorId);
    if (!collector) throw new Error("Collector not found");

    const assignedRequests = collector.assignedRequests || [];
    const docRef = doc(getDb(), "users", collectorId);
    await updateDoc(docRef, {
      assignedRequests: assignedRequests.filter(
        (id: string) => id !== requestId
      ),
      updatedAt: Timestamp.now(),
    });
  },

  async deleteCollector(id: string): Promise<void> {
    const collector = await this.getCollector(id);
    if (!collector) throw new Error("Collector not found");

    // Use a batch to delete from both collections atomically
    const batch = writeBatch(getDb());
    
    // Get all pickup requests assigned to this collector
    const pickupQuery = query(
      collection(getDb(), "pickupRequests"),
      where("collectorId", "==", id)
    );
    const pickupSnapshot = await getDocs(pickupQuery);
    
    // Update pickup requests to remove collector assignment
    pickupSnapshot.docs.forEach((pickup) => {
      const pickupData = pickup.data();
      // Only update if the pickup is not completed or cancelled
      if (!["completed", "cancelled"].includes(pickupData.status)) {
        const pickupRef = doc(getDb(), "pickupRequests", pickup.id);
        batch.update(pickupRef, {
          collectorId: null,
          status: "pending", // Reset to pending so it can be reassigned
          updatedAt: Timestamp.now(),
        });
      }
    });
    
    // Delete the collector document from users collection
    const userDocRef = doc(getDb(), "users", id);
    batch.delete(userDocRef);
    
    // Delete the collector profile from collectorProfiles collection
    const profileDocRef = doc(getDb(), "collectorProfiles", id);
    batch.delete(profileDocRef);
    
    // Execute the batch
    await batch.commit();

    console.log(`✅ Collector ${id} deleted successfully from both users and collectorProfiles collections, and related pickup requests updated`);
  },

  // Collector Profile operations (separate collection)
  async getAllCollectorProfiles(): Promise<CollectorProfile[]> {
    const querySnapshot = await getDocs(collection(db, "collectorProfiles"));
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
        // joinedDate is stored as a string, not a Timestamp
        joinedDate: data.joinedDate || new Date().toISOString(),
      } as unknown as CollectorProfile;
    });
  },

  async getCollectorProfile(id: string): Promise<CollectorProfile | null> {
    const docRef = doc(db, "collectorProfiles", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate(),
      // joinedDate is stored as a string, not a Timestamp
      joinedDate: data.joinedDate || new Date().toISOString(),
    } as unknown as CollectorProfile;
  },

  async setCollectorProfile(
    id: string,
    profileData: Partial<CollectorProfile>
  ): Promise<void> {
    const docRef = doc(db, "collectorProfiles", id);
    const updateData = {
      ...profileData,
      updatedAt: Timestamp.now(),
    };

    await setDoc(docRef, updateData, { merge: true });
  },

  async updateCollectorProfile(
    id: string,
    updates: Partial<CollectorProfile>
  ): Promise<void> {
    const docRef = doc(db, "collectorProfiles", id);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(docRef, updateData);
  },

  async deleteCollectorProfile(id: string): Promise<void> {
    const docRef = doc(db, "collectorProfiles", id);
    await deleteDoc(docRef);
    console.log(
      `✅ Collector profile ${id} deleted successfully from Firestore`
    );
  },
};

// Industry operations
export const industryService = {
  async getIndustryProfile(industryId: string): Promise<any> {
    const docRef = doc(db, "industryProfiles", industryId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    }
    return null;
  },

  async getIndustryLocation(industryId: string): Promise<{
    location: { lat: number; lng: number } | null;
    locationAddress: string | null;
    autoLocation: boolean;
  }> {
    const profile = await this.getIndustryProfile(industryId);
    
    if (profile && profile.location) {
      return {
        location: profile.location,
        locationAddress: profile.locationAddress || null,
        autoLocation: true,
      };
    }
    
    return {
      location: null,
      locationAddress: null,
      autoLocation: false,
    };
  },

  async updateIndustryLocation(
    industryId: string,
    location: { lat: number; lng: number },
    locationAddress: string
  ): Promise<void> {
    const docRef = doc(db, "industryProfiles", industryId);
    await setDoc(docRef, {
      location,
      locationAddress,
      locationUpdatedAt: new Date(),
      updatedAt: new Date(),
      userId: industryId
    }, { merge: true });
  },
};
