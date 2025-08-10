import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
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
    const docRef = doc(db, "products", id);
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
      throw new Error("A product with this name and description already exists");
    }
    
    const docRef = await addDoc(collection(db, "products"), {
      ...product,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<void> {
    const docRef = doc(db, "products", id);
    await updateDoc(docRef, {
      ...product,
      updatedAt: Timestamp.now(),
    });
  },

  async deleteProduct(id: string): Promise<void> {
    const docRef = doc(db, "products", id);
    await deleteDoc(docRef);
  },

  async getProductsByCategory(category: string): Promise<Product[]> {
    const q = query(
      collection(db, "products"),
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
};

// User operations
export const userService = {
  async getUser(id: string): Promise<User | null> {
    const docRef = doc(db, "users", id);
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
    const querySnapshot = await getDocs(collection(db, "users"));
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

  async getUsersByRole(role: User["role"]): Promise<User[]> {
    const q = query(collection(db, "users"), where("role", "==", role));
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
    const docRef = doc(db, "users", id);
    await updateDoc(docRef, data);
  },

  async deleteUser(id: string): Promise<void> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    
    // Delete the user document from Firestore
    const docRef = doc(db, "users", id);
    await deleteDoc(docRef);
    
    console.log(`✅ User ${id} deleted successfully from Firestore`);
  },
};

// Order operations
export const orderService = {
  async getUserOrders(userId: string): Promise<Order[]> {
    const q = query(
      collection(db, "orders"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as Order)
    );
  },

  async getAllOrders(): Promise<Order[]> {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as Order)
    );
  },

  async createOrder(order: Omit<Order, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "orders"), {
      ...order,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async updateOrderStatus(id: string, status: Order["status"]): Promise<void> {
    const docRef = doc(db, "orders", id);
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
      collection(db, "pickupRequests"),
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
      collection(db, "pickupRequests"),
      orderBy("createdAt", "desc")
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
      collection(db, "pickupRequests"),
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
    return pickups.sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  },

  async createPickupRequest(
    request: Omit<PickupRequest, "id">
  ): Promise<string> {
    const docRef = await addDoc(collection(db, "pickupRequests"), {
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
    return docRef.id;
  },

  async updatePickupRequest(
    id: string,
    updates: Partial<PickupRequest>
  ): Promise<void> {
    const docRef = doc(db, "pickupRequests", id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = { ...updates };

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
    const docRef = doc(db, "pickupRequests", id);
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
    const docRef = doc(db, "pickupRequests", id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = { status };

    if (status === "completed") {
      updateData.completedAt = Timestamp.now();
    } else if (status === "cancelled") {
      updateData.cancelledAt = Timestamp.now();
    }

    await updateDoc(docRef, updateData);
  },

  async deletePickupRequest(id: string): Promise<void> {
    const docRef = doc(db, "pickupRequests", id);
    await deleteDoc(docRef);
  },
};

// Notification operations
export const notificationService = {
  async getUserNotifications(userId: string): Promise<Notification[]> {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as Notification)
    );
  },

  async createNotification(
    notification: Omit<Notification, "id">
  ): Promise<string> {
    const docRef = await addDoc(collection(db, "notifications"), {
      ...notification,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async markAsRead(id: string): Promise<void> {
    const docRef = doc(db, "notifications", id);
    await updateDoc(docRef, {
      read: true,
      updatedAt: Timestamp.now(),
    });
  },

  async markAllAsRead(userId: string): Promise<void> {
    const q = query(
      collection(db, "notifications"),
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
  },
};

// Collector operations
export const collectorService = {
  async getAllCollectors(): Promise<User[]> {
    return await userService.getUsersByRole("collector");
  },

  async getCollector(id: string): Promise<User | null> {
    const collector = await userService.getUser(id);
    return collector?.role === "collector" ? collector : null;
  },

  async getAvailableCollectors(): Promise<User[]> {
    const q = query(
      collection(db, "users"),
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

  async updateCollectorAvailability(id: string, isAvailable: boolean): Promise<void> {
    const docRef = doc(db, "users", id);
    await updateDoc(docRef, {
      isAvailable,
      updatedAt: Timestamp.now(),
    });
  },

  async updateCollectorLocation(id: string, location: { lat: number; lng: number }): Promise<void> {
    const docRef = doc(db, "users", id);
    await updateDoc(docRef, {
      currentLocation: location,
      updatedAt: Timestamp.now(),
    });
  },

  async updateCollectorCapacity(id: string, truckCapacity: number, currentLoad?: number): Promise<void> {
    const updateData: any = {
      truckCapacity,
      updatedAt: Timestamp.now(),
    };
    if (currentLoad !== undefined) {
      updateData.currentLoad = currentLoad;
    }
    const docRef = doc(db, "users", id);
    await updateDoc(docRef, updateData);
  },

  async assignRequestToCollector(collectorId: string, requestId: string): Promise<void> {
    const collector = await this.getCollector(collectorId);
    if (!collector) throw new Error("Collector not found");
    
    const assignedRequests = (collector as any).assignedRequests || [];
    const docRef = doc(db, "users", collectorId);
    await updateDoc(docRef, {
      assignedRequests: [...assignedRequests, requestId],
      updatedAt: Timestamp.now(),
    });
  },

  async removeRequestFromCollector(collectorId: string, requestId: string): Promise<void> {
    const collector = await this.getCollector(collectorId);
    if (!collector) throw new Error("Collector not found");
    
    const assignedRequests = (collector as any).assignedRequests || [];
    const docRef = doc(db, "users", collectorId);
    await updateDoc(docRef, {
      assignedRequests: assignedRequests.filter((id: string) => id !== requestId),
      updatedAt: Timestamp.now(),
    });
  },

  async deleteCollector(id: string): Promise<void> {
    const collector = await this.getCollector(id);
    if (!collector) throw new Error("Collector not found");
    
    // Delete the collector document from Firestore
    const docRef = doc(db, "users", id);
    await deleteDoc(docRef);
    
    console.log(`✅ Collector ${id} deleted successfully from Firestore`);
  },
};
