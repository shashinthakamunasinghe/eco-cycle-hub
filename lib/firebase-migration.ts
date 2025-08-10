import { collection, addDoc, Timestamp, Firestore } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  mockUsers,
  mockProducts,
  mockOrders,
  mockPickupRequests,
  mockNotifications,
} from "@/lib/mock-data";

// Helper function to ensure we have a valid Firestore instance
function getDb(): Firestore {
  if (!db) {
    throw new Error(
      "Firestore is not initialized. Check your Firebase configuration."
    );
  }
  return db;
}

export class FirebaseMigration {
  static async migrateUsers() {
    console.log("Migrating users...");
    try {
      const promises = mockUsers.map((user) =>
        addDoc(collection(getDb(), "users"), {
          ...user,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        })
      );
      await Promise.all(promises);
      console.log("✅ Users migrated successfully");
    } catch (error) {
      console.error("❌ Error migrating users:", error);
    }
  }

  static async migrateProducts() {
    console.log("Migrating products...");
    try {
      const promises = mockProducts.map((product) =>
        addDoc(collection(getDb(), "products"), {
          ...product,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        })
      );
      await Promise.all(promises);
      console.log("✅ Products migrated successfully");
    } catch (error) {
      console.error("❌ Error migrating products:", error);
    }
  }

  static async migrateOrders() {
    console.log("Migrating orders...");
    try {
      const promises = mockOrders.map((order) =>
        addDoc(collection(getDb(), "orders"), {
          ...order,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        })
      );
      await Promise.all(promises);
      console.log("✅ Orders migrated successfully");
    } catch (error) {
      console.error("❌ Error migrating orders:", error);
    }
  }

  static async migratePickupRequests() {
    console.log("Migrating pickup requests...");
    try {
      const promises = mockPickupRequests.map((request) =>
        addDoc(collection(getDb(), "pickupRequests"), {
          ...request,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        })
      );
      await Promise.all(promises);
      console.log("✅ Pickup requests migrated successfully");
    } catch (error) {
      console.error("❌ Error migrating pickup requests:", error);
    }
  }

  static async migrateNotifications() {
    console.log("Migrating notifications...");
    try {
      const promises = mockNotifications.map((notification) =>
        addDoc(collection(getDb(), "notifications"), {
          ...notification,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        })
      );
      await Promise.all(promises);
      console.log("✅ Notifications migrated successfully");
    } catch (error) {
      console.error("❌ Error migrating notifications:", error);
    }
  }

  static async migrateAll() {
    console.log("🚀 Starting Firebase migration...");

    await this.migrateUsers();
    await this.migrateProducts();
    await this.migrateOrders();
    await this.migratePickupRequests();
    await this.migrateNotifications();

    console.log("🎉 Migration completed!");
  }

  static async clearCollection(collectionName: string) {
    console.log(`Clearing ${collectionName} collection...`);
    // Note: In production, you'd want to use batch deletes
    // This is a simplified version for development
    console.log(
      `⚠️  Manual deletion required for ${collectionName} in Firebase Console`
    );
  }
}
