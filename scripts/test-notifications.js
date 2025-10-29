// Test script for admin notifications
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase config (you may need to adjust this based on your setup)
const firebaseConfig = {
  // Add your firebase config here if needed
  projectId: "eco-cycle-hub" // Assuming this is your project ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testNotifications() {
  try {
    console.log("🧪 Testing notification services...");
    
    // Check if adminNotifications collection exists
    const notificationsRef = collection(db, "adminNotifications");
    const snapshot = await getDocs(notificationsRef);
    
    console.log(`📊 Found ${snapshot.size} admin notifications in database`);
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📝 Notification: ${data.title} | Status: ${data.status} | Recipients: ${data.recipients}`);
    });
    
    if (snapshot.empty) {
      console.log("📝 No admin notifications found. This is expected for a fresh database.");
    }
    
  } catch (error) {
    console.error("❌ Error testing notifications:", error);
  }
}

testNotifications();
