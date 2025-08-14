import { NextRequest, NextResponse } from 'next/server';
import { collection, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const recentActivities: any[] = [];
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago

    // 1. Recent pickup requests (industry requests pickup)
    const pickupQuery = query(
      collection(db, 'pickupRequests'),
      where('requestedAt', '>=', Timestamp.fromDate(oneHourAgo)),
      orderBy('requestedAt', 'desc'),
      limit(10)
    );
    const pickupSnapshot = await getDocs(pickupQuery);
    
    pickupSnapshot.forEach((doc) => {
      const data = doc.data();
      recentActivities.push({
        id: `pickup-${doc.id}`,
        type: 'pickup',
        message: `New pickup request from ${data.industryName}`,
        time: data.requestedAt.toDate(),
        status: data.status === 'pending' ? 'pending' : 'completed',
        details: {
          industryName: data.industryName,
          wasteType: data.wasteType,
          weight: data.weight
        }
      });
    });

    // 2. Recent collector status changes (collectors going offline/online)
    const collectorQuery = query(
      collection(db, 'collectorProfiles'),
      where('lastActivity', '>=', Timestamp.fromDate(oneHourAgo)),
      orderBy('lastActivity', 'desc'),
      limit(10)
    );
    const collectorSnapshot = await getDocs(collectorQuery);
    
    collectorSnapshot.forEach((doc) => {
      const data = doc.data();
      const isOffline = !data.isAvailable;
      recentActivities.push({
        id: `collector-${doc.id}`,
        type: 'collector',
        message: `Collector ${data.name} went ${isOffline ? 'offline' : 'online'}`,
        time: data.lastActivity.toDate(),
        status: isOffline ? 'warning' : 'completed',
        details: {
          collectorName: data.name,
          isAvailable: data.isAvailable
        }
      });
    });

    // 3. Recent orders (customers buying products)
    const orderQuery = query(
      collection(db, 'orders'),
      where('createdAt', '>=', Timestamp.fromDate(oneHourAgo)),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const orderSnapshot = await getDocs(orderQuery);
    
    orderSnapshot.forEach((doc) => {
      const data = doc.data();
      recentActivities.push({
        id: `order-${doc.id}`,
        type: 'order',
        message: `Order #${doc.id.substring(0, 6)} ${data.status === 'completed' ? 'completed and shipped' : 'placed'}`,
        time: data.createdAt.toDate(),
        status: data.status === 'completed' ? 'completed' : 'pending',
        details: {
          customerId: data.customerId,
          customerName: data.customerName,
          total: data.total,
          status: data.status
        }
      });
    });

    // Sort all activities by time (most recent first) and limit to 3
    const sortedActivities = recentActivities
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 3)
      .map(activity => ({
        ...activity,
        time: getRelativeTime(activity.time)
      }));

    return NextResponse.json(sortedActivities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    );
  }
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
}
