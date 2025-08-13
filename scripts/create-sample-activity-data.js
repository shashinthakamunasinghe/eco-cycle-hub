const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // Add your Firebase project ID here
    projectId: 'your-project-id'
  });
}

const db = admin.firestore();

async function createSampleActivityData() {
  try {
    console.log('Creating sample activity data...');

    // Sample orders
    const sampleOrders = [
      {
        id: 'ORD-001',
        customerId: 'customer1',
        customerName: 'John Doe',
        items: [
          { productId: 'prod1', productName: 'Recycled Paper', quantity: 5, price: 10 }
        ],
        total: 50,
        status: 'delivered',
        shippingAddress: '123 Main St, City, State',
        createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 10 * 60 * 1000)) // 10 minutes ago
      },
      {
        id: 'ORD-002',
        customerId: 'customer2',
        customerName: 'Business Corp',
        items: [
          { productId: 'prod2', productName: 'Eco Bags', quantity: 10, price: 15 }
        ],
        total: 150,
        status: 'shipped',
        shippingAddress: '456 Business Ave, City, State',
        createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 30 * 60 * 1000)) // 30 minutes ago
      },
      {
        id: 'ORD-003',
        customerId: 'customer3',
        customerName: 'Green Solutions Inc',
        items: [
          { productId: 'prod3', productName: 'Compost Bins', quantity: 3, price: 25 }
        ],
        total: 75,
        status: 'processing',
        shippingAddress: '789 Eco Way, City, State',
        createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 60 * 60 * 1000)) // 1 hour ago
      }
    ];

    // Sample pickup requests
    const samplePickups = [
      {
        id: 'PU-001',
        industryId: 'industry1',
        industryName: 'Green Industries Ltd',
        wasteType: 'Electronic Waste',
        weight: 150,
        location: {
          lat: 40.7128,
          lng: -74.0060,
          address: '100 Industrial Blvd, City, State'
        },
        status: 'pending',
        priority: 'high',
        requestedAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 1000)) // 5 minutes ago
      },
      {
        id: 'PU-002',
        industryId: 'industry2',
        industryName: 'Tech Manufacturing Co',
        wasteType: 'Plastic Waste',
        weight: 75,
        location: {
          lat: 40.7589,
          lng: -73.9851,
          address: '200 Tech Park Dr, City, State'
        },
        status: 'assigned',
        collectorId: 'collector1',
        collectorName: 'Mike Johnson',
        priority: 'medium',
        requestedAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 20 * 60 * 1000)) // 20 minutes ago
      },
      {
        id: 'PU-003',
        industryId: 'industry3',
        industryName: 'Eco Manufacturing',
        wasteType: 'Metal Scraps',
        weight: 200,
        location: {
          lat: 40.7505,
          lng: -73.9934,
          address: '300 Factory St, City, State'
        },
        status: 'completed',
        collectorId: 'collector2',
        collectorName: 'Sarah Williams',
        priority: 'low',
        requestedAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 90 * 60 * 1000)), // 1.5 hours ago
        completedAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 45 * 60 * 1000))  // 45 minutes ago
      }
    ];

    // Sample collectors
    const sampleCollectors = [
      {
        id: 'collector1',
        email: 'mike.johnson@eco-cycle.com',
        name: 'Mike Johnson',
        role: 'collector',
        phone: '+1-555-0101',
        address: '123 Collector St, City, State',
        isAvailable: true,
        currentLocation: { lat: 40.7128, lng: -74.0060 },
        truckCapacity: 500,
        currentLoad: 75,
        assignedRequests: ['PU-002'],
        createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 30 * 60 * 1000))
      },
      {
        id: 'collector2',
        email: 'sarah.williams@eco-cycle.com',
        name: 'Sarah Williams',
        role: 'collector',
        phone: '+1-555-0102',
        address: '456 Collector Ave, City, State',
        isAvailable: false,
        currentLocation: { lat: 40.7505, lng: -73.9934 },
        truckCapacity: 400,
        currentLoad: 0,
        assignedRequests: [],
        createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 45 * 60 * 1000))
      }
    ];

    // Create orders
    for (const order of sampleOrders) {
      await db.collection('orders').doc(order.id).set(order);
      console.log(`Created order: ${order.id}`);
    }

    // Create pickup requests
    for (const pickup of samplePickups) {
      await db.collection('pickupRequests').doc(pickup.id).set(pickup);
      console.log(`Created pickup request: ${pickup.id}`);
    }

    // Create collectors
    for (const collector of sampleCollectors) {
      await db.collection('users').doc(collector.id).set(collector);
      console.log(`Created collector: ${collector.id}`);
    }

    console.log('Sample activity data created successfully!');
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
}

// Run the script
createSampleActivityData().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
