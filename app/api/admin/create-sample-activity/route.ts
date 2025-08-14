import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    console.log('Creating recent activity data...');
    
    const now = new Date();
    const results = [];
    
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
      requestedAt: Timestamp.fromDate(new Date(now.getTime() - 5 * 60 * 1000)),
      notes: 'Electronic components and old computers'
    };
    
    const pickupRef = await addDoc(collection(db, 'pickupRequests'), pickupData);
    results.push({ type: 'pickup', id: pickupRef.id });
    
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
      createdAt: Timestamp.fromDate(new Date(now.getTime() - 15 * 60 * 1000))
    };
    
    const orderRef = await addDoc(collection(db, 'orders'), orderData);
    results.push({ type: 'order', id: orderRef.id });
    
    // 3. Create a collector profile with recent activity (30 minutes ago)
    const collectorData = {
      name: 'Mike Wilson',
      email: 'mike.wilson@eco-cycle.com',
      phone: '+94 77 123 4567',
      address: '789 Collector Lane, Galle, Sri Lanka',
      isAvailable: false, // Went offline
      currentLocation: { lat: 6.0535, lng: 80.2210 },
      truckCapacity: 500,
      currentLoad: 200,
      lastActivity: Timestamp.fromDate(new Date(now.getTime() - 30 * 60 * 1000)),
      createdAt: Timestamp.fromDate(new Date(now.getTime() - 24 * 60 * 60 * 1000)) // Created yesterday
    };
    
    const collectorRef = await addDoc(collection(db, 'collectorProfiles'), collectorData);
    results.push({ type: 'collector', id: collectorRef.id });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Recent activity data created successfully',
      created: results
    });
    
  } catch (error) {
    console.error('Error creating recent activity data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create recent activity data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
