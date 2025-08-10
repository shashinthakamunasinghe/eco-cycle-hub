// Script to create sample collectors in Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

// Firebase configuration (you may need to adjust this based on your environment)
const firebaseConfig = {
  // Add your Firebase config here
  // This is a sample script - you should run this from the Firebase Console or use your actual config
};

const sampleCollectors = [
  {
    name: "John Doe",
    email: "john.collector@example.com",
    role: "collector",
    phone: "+94771234567",
    isAvailable: true,
    currentLocation: { lat: 6.9271, lng: 79.8612 },
    truckCapacity: 1200,
    currentLoad: 300,
    assignedRequests: ["req1", "req2"],
    createdAt: new Date(),
  },
  {
    name: "Jane Smith",
    email: "jane.collector@example.com",
    role: "collector", 
    phone: "+94771234568",
    isAvailable: false,
    currentLocation: { lat: 6.9344, lng: 79.8428 },
    truckCapacity: 1500,
    currentLoad: 800,
    assignedRequests: ["req3"],
    createdAt: new Date(),
  },
  {
    name: "Mike Johnson",
    email: "mike.collector@example.com",
    role: "collector",
    phone: "+94771234569", 
    isAvailable: true,
    currentLocation: { lat: 6.9147, lng: 79.8731 },
    truckCapacity: 800,
    currentLoad: 0,
    assignedRequests: [],
    createdAt: new Date(),
  },
  {
    name: "Sarah Wilson",
    email: "sarah.collector@example.com",
    role: "collector",
    phone: "+94771234570",
    isAvailable: true,
    currentLocation: { lat: 6.9022, lng: 79.8550 },
    truckCapacity: 1000,
    currentLoad: 450,
    assignedRequests: ["req4", "req5"],
    createdAt: new Date(),
  }
];

async function createSampleCollectors() {
  try {
    console.log('🔄 Creating sample collectors...');
    
    // Initialize Firebase (you'd need to configure this properly)
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    const promises = sampleCollectors.map(collector => 
      addDoc(collection(db, "users"), {
        ...collector,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
    );
    
    await Promise.all(promises);
    console.log('✅ Sample collectors created successfully!');
  } catch (error) {
    console.error('❌ Error creating sample collectors:', error);
  }
}

// Uncomment to run (make sure to configure Firebase first)
// createSampleCollectors();

console.log(`
📋 Sample Collectors Data:
${JSON.stringify(sampleCollectors, null, 2)}

To use this script:
1. Configure your Firebase project settings above
2. Uncomment the createSampleCollectors() call at the bottom
3. Run: node scripts/create-sample-collectors.js

Or manually add these users to your Firestore 'users' collection via Firebase Console.
`);
