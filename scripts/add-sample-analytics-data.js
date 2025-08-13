import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBhk6GN8PkZKbYILGTQyJQYg6X6LQ2Y1qk",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "eco-cycle-hub.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "eco-cycle-hub",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "eco-cycle-hub.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abc123def456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addSampleAnalyticsData() {
  try {
    console.log('Adding sample analytics data...');
    
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Sample completed pickup requests with different waste types
    const samplePickups = [
      {
        industryId: 'green-industries-123',
        industryName: 'Green Industries Ltd',
        wasteType: 'Organic Waste',
        weight: 150,
        location: {
          lat: 6.9271,
          lng: 79.8612,
          address: '123 Industrial Park, Colombo, Sri Lanka'
        },
        status: 'completed',
        collectorId: 'collector-1',
        collectorName: 'John Collector',
        priority: 'high',
        requestedAt: Timestamp.fromDate(new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)),
        completedAt: Timestamp.fromDate(new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)),
        notes: 'Food waste and organic materials'
      },
      {
        industryId: 'tech-corp-456',
        industryName: 'Tech Corporation',
        wasteType: 'Electronic Waste',
        weight: 85,
        location: {
          lat: 6.9344,
          lng: 79.8428,
          address: '456 Tech Park, Mount Lavinia, Sri Lanka'
        },
        status: 'completed',
        collectorId: 'collector-2',
        collectorName: 'Sarah Wilson',
        priority: 'medium',
        requestedAt: Timestamp.fromDate(new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)),
        completedAt: Timestamp.fromDate(new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000)),
        notes: 'Old computers and electronic components'
      },
      {
        industryId: 'plastic-co-789',
        industryName: 'Plastic Manufacturing Co',
        wasteType: 'Plastic Waste',
        weight: 220,
        location: {
          lat: 6.9147,
          lng: 79.8731,
          address: '789 Industrial Zone, Nugegoda, Sri Lanka'
        },
        status: 'completed',
        collectorId: 'collector-1',
        collectorName: 'John Collector',
        priority: 'high',
        requestedAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)),
        completedAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)),
        notes: 'Plastic bottles and packaging materials'
      },
      {
        industryId: 'metal-works-101',
        industryName: 'Metal Works Ltd',
        wasteType: 'Metal Waste',
        weight: 180,
        location: {
          lat: 6.9022,
          lng: 79.8550,
          address: '101 Factory Lane, Wellawatte, Sri Lanka'
        },
        status: 'completed',
        collectorId: 'collector-3',
        collectorName: 'Mike Johnson',
        priority: 'medium',
        requestedAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)),
        completedAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000)),
        notes: 'Aluminum scraps and steel waste'
      },
      {
        industryId: 'paper-mill-202',
        industryName: 'Paper Mill Industries',
        wasteType: 'Paper Waste',
        weight: 300,
        location: {
          lat: 6.9111,
          lng: 79.8640,
          address: '202 Mill Road, Dehiwala, Sri Lanka'
        },
        status: 'completed',
        collectorId: 'collector-2',
        collectorName: 'Sarah Wilson',
        priority: 'low',
        requestedAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000)),
        completedAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 24 * 24 * 60 * 60 * 1000)),
        notes: 'Used paper and cardboard waste'
      },
      {
        industryId: 'chemical-plant-303',
        industryName: 'Chemical Processing Plant',
        wasteType: 'Chemical Waste',
        weight: 50,
        location: {
          lat: 6.9200,
          lng: 79.8700,
          address: '303 Chemical Zone, Ratmalana, Sri Lanka'
        },
        status: 'completed',
        collectorId: 'collector-1',
        collectorName: 'John Collector',
        priority: 'high',
        requestedAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000)),
        completedAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000)),
        notes: 'Hazardous chemical containers'
      },
      {
        industryId: 'mixed-factory-404',
        industryName: 'Mixed Manufacturing',
        wasteType: 'Mixed Waste',
        weight: 120,
        location: {
          lat: 6.9088,
          lng: 79.8590,
          address: '404 Factory Complex, Moratuwa, Sri Lanka'
        },
        status: 'completed',
        collectorId: 'collector-3',
        collectorName: 'Mike Johnson',
        priority: 'medium',
        requestedAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)),
        completedAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)),
        notes: 'Various mixed waste materials'
      },
      // Add more samples for better analytics
      {
        industryId: 'green-industries-123',
        industryName: 'Green Industries Ltd',
        wasteType: 'Organic Waste',
        weight: 200,
        location: {
          lat: 6.9271,
          lng: 79.8612,
          address: '123 Industrial Park, Colombo, Sri Lanka'
        },
        status: 'completed',
        collectorId: 'collector-2',
        collectorName: 'Sarah Wilson',
        priority: 'medium',
        requestedAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)),
        completedAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)),
        notes: 'Composting materials'
      },
      {
        industryId: 'plastic-co-789',
        industryName: 'Plastic Manufacturing Co',
        wasteType: 'Plastic Waste',
        weight: 175,
        location: {
          lat: 6.9147,
          lng: 79.8731,
          address: '789 Industrial Zone, Nugegoda, Sri Lanka'
        },
        status: 'completed',
        collectorId: 'collector-1',
        collectorName: 'John Collector',
        priority: 'high',
        requestedAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)),
        completedAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)),
        notes: 'Plastic containers and bags'
      }
    ];
    
    console.log(`Adding ${samplePickups.length} sample pickup requests...`);
    
    for (const pickup of samplePickups) {
      const docRef = await db.collection('pickupRequests').add(pickup);
      console.log(`✅ Added completed pickup: ${docRef.id} - ${pickup.industryName} (${pickup.wasteType}, ${pickup.weight}kg)`);
    }
    
    console.log('🎉 All sample analytics data added successfully!');
    
    // Summary of data added
    const wasteTypeSummary = {};
    let totalWeight = 0;
    
    samplePickups.forEach(pickup => {
      wasteTypeSummary[pickup.wasteType] = (wasteTypeSummary[pickup.wasteType] || 0) + pickup.weight;
      totalWeight += pickup.weight;
    });
    
    console.log('\n📊 Summary of data added:');
    console.log('Total weight:', totalWeight, 'kg');
    console.log('Waste types breakdown:');
    Object.entries(wasteTypeSummary).forEach(([type, weight]) => {
      console.log(`  ${type}: ${weight}kg (${((weight / totalWeight) * 100).toFixed(1)}%)`);
    });
    
  } catch (error) {
    console.error('❌ Error adding sample analytics data:', error);
  }
}

// Run the script
addSampleAnalyticsData().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
