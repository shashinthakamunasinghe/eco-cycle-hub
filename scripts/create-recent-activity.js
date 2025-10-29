const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    // Try to initialize with application default credentials
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    console.log('Firebase Admin initialized with application default credentials');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    process.exit(1);
  }
}

const db = admin.firestore();

async function createRecentActivityData() {
  try {
    console.log('Creating recent activity data...');
    
    const now = new Date();
    
    // 1. Create a recent pickup request (5 minutes ago)
    const pickupData = {
      industryId: 'green-industries-123',
      industryName: 'Green Industries Ltd',
      wasteType: 'Electronic Waste',
      weight: 150,
      location: {
        lat: 6.9271,
        lng: 79.8612,
        address: '123 Industrial Park, Colombo, Sri Lanka'
      },
      status: 'pending',
      priority: 'high',
      requestedAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 5 * 60 * 1000)),
      notes: 'Electronic components and old computers'
    };
    
    const pickupRef = await db.collection('pickupRequests').add(pickupData);
    console.log(`✅ Created pickup request: ${pickupRef.id}`);
    
    // 2. Create a recent order (15 minutes ago)
    const orderData = {
      customerId: 'customer-456',
      customerName: 'Sarah Johnson',
      items: [
        { productId: 'prod1', productName: 'Recycled Paper', quantity: 5, price: 10 }
      ],
      total: 50,
      status: 'completed',
      shippingAddress: '456 Eco Street, Kandy, Sri Lanka',
      createdAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 15 * 60 * 1000))
    };
    
    const orderRef = await db.collection('orders').add(orderData);
    console.log(`✅ Created order: ${orderRef.id}`);
    
    // 3. Update a collector to show recent activity (30 minutes ago)
    const collectorData = {
      name: 'Mike Wilson',
      email: 'mike.wilson@eco-cycle.com',
      phone: '+94 77 123 4567',
      address: '789 Collector Lane, Galle, Sri Lanka',
      isAvailable: false, // Went offline
      currentLocation: { lat: 6.0535, lng: 80.2210 },
      truckCapacity: 500,
      currentLoad: 200,
      lastActivity: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 30 * 60 * 1000)),
      createdAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 24 * 60 * 60 * 1000)) // Created yesterday
    };
    
    const collectorRef = await db.collection('collectorProfiles').add(collectorData);
    console.log(`✅ Created collector profile: ${collectorRef.id}`);
    
    // 4. Create another order that was shipped (10 minutes ago)
    const shippedOrderData = {
      customerId: 'business-789',
      customerName: 'Eco Business Solutions',
      items: [
        { productId: 'prod2', productName: 'Compost Bins', quantity: 3, price: 25 }
      ],
      total: 75,
      status: 'completed',
      shippingAddress: '321 Green Avenue, Negombo, Sri Lanka',
      createdAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 10 * 60 * 1000))
    };
    
    const shippedOrderRef = await db.collection('orders').add(shippedOrderData);
    console.log(`✅ Created shipped order: ${shippedOrderRef.id}`);
    
    console.log('🎉 Recent activity data created successfully!');
    console.log('You should now see recent activities in the admin dashboard');
    
  } catch (error) {
    console.error('❌ Error creating recent activity data:', error);
  }
}

// Run the script
createRecentActivityData().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
