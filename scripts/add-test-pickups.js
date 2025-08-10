const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // You might need to add your project ID here
  });
}

const db = admin.firestore();

async function addTestPickupRequests() {
  try {
    // Sample pickup requests that will be assigned to collectors
    const testPickups = [
      {
        industryId: "industry-1",
        industryName: "Green Industries Ltd",
        wasteType: "Organic Waste",
        weight: 150,
        location: {
          lat: 6.9271,
          lng: 79.8612,
          address: "123 Industrial Ave, Colombo 03, Sri Lanka"
        },
        status: "assigned",
        collectorId: "hasith-collector-id", // Replace with actual collector ID
        collectorName: "Hasith Fernando",
        priority: "high",
        requestedAt: admin.firestore.Timestamp.now(),
        scheduledAt: admin.firestore.Timestamp.now(),
        notes: "Handle with care - organic waste"
      },
      {
        industryId: "industry-2", 
        industryName: "Eco Manufacturing",
        wasteType: "Plastic Waste",
        weight: 200,
        location: {
          lat: 6.9344,
          lng: 79.8428,
          address: "456 Factory St, Mount Lavinia, Sri Lanka"
        },
        status: "assigned",
        collectorId: "nadun-collector-id", // Replace with actual collector ID
        collectorName: "Nadun Silva", 
        priority: "medium",
        requestedAt: admin.firestore.Timestamp.now(),
        scheduledAt: admin.firestore.Timestamp.now(),
        notes: "Plastic bottles and containers"
      },
      {
        industryId: "industry-3",
        industryName: "Tech Solutions Corp",
        wasteType: "Electronic Waste", 
        weight: 75,
        location: {
          lat: 6.9147,
          lng: 79.8731,
          address: "789 Tech Park, Nugegoda, Sri Lanka"
        },
        status: "pending",
        priority: "low",
        requestedAt: admin.firestore.Timestamp.now(),
        notes: "Old computers and electronic components"
      }
    ];

    console.log('Adding test pickup requests...');
    
    for (const pickup of testPickups) {
      const docRef = await db.collection('pickupRequests').add(pickup);
      console.log(`✅ Added pickup request: ${docRef.id} - ${pickup.industryName}`);
    }

    console.log('🎉 All test pickup requests added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding test pickup requests:', error);
  }
}

// Run the script
addTestPickupRequests().then(() => {
  console.log('Script completed');
  process.exit(0);
});
