import { NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    const collectorId = 'xDolpHlBysSwHlfpFGDEoPrZPko1'; // Correct collector ID

    console.log('🔍 Checking data for collector:', collectorId);

    // Check completed pickups in completedPickups collection
    const completedPickupsRef = collection(db, 'completedPickups');
    const completedQuery = query(completedPickupsRef, where('collectorId', '==', collectorId));
    const completedSnapshot = await getDocs(completedQuery);

    console.log('📦 Completed pickups found:', completedSnapshot.size);

    const completedPickups = completedSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Check pickups with completed status in pickupRequests collection
    const pickupRequestsRef = collection(db, 'pickupRequests');
    const pickupQuery = query(pickupRequestsRef, where('collectorId', '==', collectorId));
    const pickupSnapshot = await getDocs(pickupQuery);

    console.log('📋 All pickup requests found:', pickupSnapshot.size);

    const allPickups = pickupSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const completedInPickups = allPickups.filter(pickup => pickup.status === 'completed');
    const assignedPickups = allPickups.filter(pickup => ['assigned', 'on-way', 'picked-up'].includes(pickup.status));

    console.log('✅ Completed status in pickupRequests:', completedInPickups.length);
    console.log('📌 Active pickups:', assignedPickups.length);

    return NextResponse.json({
      success: true,
      collectorId,
      completedPickupsCollection: {
        count: completedPickups.length,
        data: completedPickups
      },
      pickupRequestsCollection: {
        total: allPickups.length,
        completed: completedInPickups.length,
        active: assignedPickups.length,
        completedData: completedInPickups,
        activeData: assignedPickups
      }
    });

  } catch (error) {
    console.error('❌ Error checking data:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
