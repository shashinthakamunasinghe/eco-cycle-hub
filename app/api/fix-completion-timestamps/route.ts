import { NextResponse } from 'next/server';
import { collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST() {
  try {
    const collectorId = 'xDolpHlBysSwHlfpFGDEoPrZPko1'; // Correct collector ID
    
    console.log('🕐 Fixing completion timestamps for collector:', collectorId);

    // Get all pickup requests for this collector
    const pickupRequestsRef = collection(db, 'pickupRequests');
    const allPickupsSnapshot = await getDocs(pickupRequestsRef);
    
    const completedPickups = allPickupsSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.collectorId === collectorId && data.status === 'completed';
    });

    console.log('📦 Found completed pickups to fix:', completedPickups.length);

    // Update each completed pickup with different completion times
    const promises = completedPickups.map(async (docSnap, index) => {
      const docRef = doc(db, 'pickupRequests', docSnap.id);
      
      // Create different completion times (spread over the last few days)
      const hoursAgo = (index + 1) * 8; // 8, 16, 24, 32, etc. hours ago
      const completionTime = new Date();
      completionTime.setHours(completionTime.getHours() - hoursAgo);
      
      await updateDoc(docRef, {
        completedAt: Timestamp.fromDate(completionTime)
      });

      console.log(`✅ Updated pickup ${docSnap.id} with completion time: ${completionTime.toLocaleString()}`);
      
      return {
        id: docSnap.id,
        completedAt: completionTime.toLocaleString()
      };
    });

    const results = await Promise.all(promises);

    return NextResponse.json({
      success: true,
      message: `Fixed completion timestamps for ${results.length} pickups`,
      updatedPickups: results
    });

  } catch (error) {
    console.error('❌ Error fixing completion timestamps:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
