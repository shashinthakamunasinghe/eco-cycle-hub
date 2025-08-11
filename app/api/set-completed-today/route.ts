import { NextResponse } from 'next/server';
import { collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST() {
  try {
    const collectorId = 'xDolpHlBysSwHlfpFGDEoPrZPko1'; // Correct collector ID
    
    console.log('📅 Setting up completed pickups for today for collector:', collectorId);

    // Get all pickup requests for this collector
    const pickupRequestsRef = collection(db, 'pickupRequests');
    const allPickupsSnapshot = await getDocs(pickupRequestsRef);
    
    const collectorPickups = allPickupsSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.collectorId === collectorId;
    });

    console.log('📦 Found collector pickups:', collectorPickups.length);

    // Set some pickups as completed today
    const pickupsToComplete = collectorPickups.slice(0, 3); // Complete first 3 pickups
    
    const todayStart = new Date();
    todayStart.setHours(6, 0, 0, 0); // 6 AM today
    
    const promises = pickupsToComplete.map(async (docSnap, index) => {
      const docRef = doc(db, 'pickupRequests', docSnap.id);
      
      // Create completion times throughout today
      const completionTime = new Date(todayStart);
      completionTime.setHours(todayStart.getHours() + (index * 3)); // 6 AM, 9 AM, 12 PM
      
      await updateDoc(docRef, {
        status: 'completed',
        completedAt: Timestamp.fromDate(completionTime)
      });

      console.log(`✅ Completed pickup ${docSnap.id} at: ${completionTime.toLocaleString()}`);
      
      return {
        id: docSnap.id,
        completedAt: completionTime.toLocaleString(),
        status: 'completed'
      };
    });

    const results = await Promise.all(promises);

    return NextResponse.json({
      success: true,
      message: `Set ${results.length} pickups as completed today`,
      completedPickups: results,
      todayDate: new Date().toDateString()
    });

  } catch (error) {
    console.error('❌ Error setting completed pickups for today:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
