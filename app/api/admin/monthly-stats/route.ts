import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    // Get current month start and end dates
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Query orders for current month
    const ordersQuery = query(
      collection(db, 'orders'),
      where('createdAt', '>=', Timestamp.fromDate(monthStart)),
      where('createdAt', '<=', Timestamp.fromDate(monthEnd))
    );
    const ordersSnapshot = await getDocs(ordersQuery);
    
    // Calculate monthly order stats
    let monthlyOrderCount = 0;
    let monthlyRevenue = 0;
    
    ordersSnapshot.forEach((doc) => {
      const orderData = doc.data();
      monthlyOrderCount++;
      monthlyRevenue += orderData.total || 0;
    });

    // Query pickup requests for current month to calculate waste collected
    // Include both completed pickups and all pickups that were requested this month
    const pickupsQuery = query(
      collection(db, 'pickupRequests'),
      where('requestedAt', '>=', Timestamp.fromDate(monthStart)),
      where('requestedAt', '<=', Timestamp.fromDate(monthEnd))
    );
    const pickupsSnapshot = await getDocs(pickupsQuery);
    
    // Calculate monthly waste collected (only from completed pickups)
    let monthlyWasteCollected = 0;
    
    pickupsSnapshot.forEach((doc) => {
      const pickupData = doc.data();
      // Only count completed pickups for waste collected
      if (pickupData.status === 'completed') {
        monthlyWasteCollected += pickupData.weight || 0;
      }
    });

    const monthlyStats = {
      monthlyOrderCount,
      monthlyRevenue,
      monthlyWasteCollected,
      currentMonth: now.toLocaleString('default', { month: 'long', year: 'numeric' })
    };

    return NextResponse.json(monthlyStats);
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monthly statistics' },
      { status: 500 }
    );
  }
}
