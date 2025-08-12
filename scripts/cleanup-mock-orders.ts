// Utility script to clean up mock orders from Firebase
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA7VsrLIYlt0sFxrrB5YANFh5qUWgUTCX8",
  authDomain: "eco-cycle-hub-4406b.firebaseapp.com",
  projectId: "eco-cycle-hub-4406b",
  storageBucket: "eco-cycle-hub-4406b.firebasestorage.app",
  messagingSenderId: "716398706069",
  appId: "1:716398706069:web:5082a6873af32932ff8a9c",
};

// Known mock order IDs and patterns
const MOCK_ORDER_PATTERNS = [
  "Jane Customer", // Mock customer name
  "4", // Mock customer ID
  "Green Street, Eco City", // Mock address pattern
];

async function cleanupMockOrders(): Promise<void> {
  try {
    console.log("🧹 Starting cleanup of mock orders from Firebase...\n");

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Get all orders
    const ordersSnapshot = await getDocs(collection(db, "orders"));

    let mockOrdersFound = 0;
    let mockOrdersDeleted = 0;

    console.log(
      `📊 Found ${ordersSnapshot.docs.length} total orders in Firebase`
    );
    console.log("🔍 Scanning for mock orders...\n");

    for (const orderDoc of ordersSnapshot.docs) {
      const orderData = orderDoc.data();
      let isMockOrder = false;
      let reason = "";

      // Check if this looks like a mock order
      if (orderData.customerId === "4") {
        isMockOrder = true;
        reason = 'Mock customer ID "4"';
      } else if (orderData.customerName === "Jane Customer") {
        isMockOrder = true;
        reason = 'Mock customer name "Jane Customer"';
      } else if (
        orderData.shippingAddress &&
        orderData.shippingAddress.includes("Green Street, Eco City")
      ) {
        isMockOrder = true;
        reason = "Mock shipping address pattern";
      } else if (orderDoc.id === "1") {
        isMockOrder = true;
        reason = 'Mock order ID "1"';
      }

      if (isMockOrder) {
        mockOrdersFound++;
        console.log(`🔍 Found mock order: ${orderDoc.id}`);
        console.log(
          `   Customer: ${orderData.customerName} (${orderData.customerId})`
        );
        console.log(`   Reason: ${reason}`);
        console.log(`   Total: $${orderData.total}`);

        try {
          await deleteDoc(doc(db, "orders", orderDoc.id));
          mockOrdersDeleted++;
          console.log(`   ✅ Deleted successfully\n`);
        } catch (deleteError) {
          console.log(`   ❌ Failed to delete: ${deleteError}\n`);
        }
      }
    }

    console.log("📈 Cleanup Summary:");
    console.log("=".repeat(30));
    console.log(`📊 Total orders scanned: ${ordersSnapshot.docs.length}`);
    console.log(`🔍 Mock orders found: ${mockOrdersFound}`);
    console.log(`🗑️  Mock orders deleted: ${mockOrdersDeleted}`);
    console.log(
      `📋 Real orders remaining: ${
        ordersSnapshot.docs.length - mockOrdersDeleted
      }`
    );

    if (mockOrdersFound === 0) {
      console.log("\n🎉 No mock orders found! Your database is clean.");
    } else if (mockOrdersDeleted === mockOrdersFound) {
      console.log("\n✅ All mock orders successfully removed!");
    } else {
      console.log(
        `\n⚠️  ${
          mockOrdersFound - mockOrdersDeleted
        } mock orders could not be deleted.`
      );
    }

    // Show remaining orders
    const remainingSnapshot = await getDocs(collection(db, "orders"));
    if (remainingSnapshot.docs.length > 0) {
      console.log("\n📋 Remaining orders in Firebase:");
      console.log("-".repeat(50));

      remainingSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(
          `${index + 1}. ${doc.id} - ${data.customerName} ($${data.total})`
        );
      });
    }
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  }
}

// Run the cleanup
cleanupMockOrders();
