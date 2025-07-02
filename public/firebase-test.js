// Simple test utility - paste this in browser console to test Firebase connection
// Usage: testFirebaseConnection()

window.testFirebaseConnection = async function () {
  try {
    console.log("🧪 Testing Firebase connection...");

    // Test Firebase import
    const { auth, db } = await import("/lib/firebase.js");
    console.log("✅ Firebase imports successful");

    // Test current auth state
    console.log("Current auth user:", auth.currentUser);

    // Test Firestore connection
    const { collection, getDocs } = await import("firebase/firestore");
    try {
      const snapshot = await getDocs(collection(db, "users"));
      console.log(`✅ Firestore connected. Found ${snapshot.size} users.`);

      snapshot.forEach((doc) => {
        console.log("User:", doc.id, doc.data());
      });
    } catch (firestoreError) {
      console.error("❌ Firestore error:", firestoreError);
    }
  } catch (error) {
    console.error("❌ Firebase connection test failed:", error);
  }
};

console.log("🧪 Firebase test utility loaded. Run: testFirebaseConnection()");
