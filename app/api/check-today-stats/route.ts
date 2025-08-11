import { NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    const collectorId = 'xDolpHlBysSwHlfpFGDEoPrZPko1'; // Correct collector ID
    
    console.log('📊 Checking today stats for collector:', collectorId);

    // Get all pickup requests for this collector
    const pickupRequestsRef = collection(db, 'pickupRequests');
    const allPickupsSnapshot = await getDocs(pickupRequestsRef);
    
    const allPickups = allPickupsSnapshot.docs
      .filter(doc => {
        const data = doc.data();
        return data.collectorId === collectorId;
      })
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          status: data.status,
          completedAt: data.completedAt?.toDate(),
          industryName: data.industryName,
          weight: data.weight
        };
      });

    console.log('📦 All collector pickups:', allPickups.length);

    const today = new Date().toDateString();
    console.log('📅 Today date string:', today);

    const completedToday = allPickups.filter(p => 
      p.status === 'completed' && 
      p.completedAt && 
      new Date(p.completedAt).toDateString() === today
    );

    console.log('✅ Completed today:', completedToday.length);
    console.log('🕐 Completed today details:', completedToday.map(p => ({
      id: p.id,
      industryName: p.industryName,
      completedAt: p.completedAt?.toLocaleString(),
      completedDateString: new Date(p.completedAt).toDateString()
    })));

    const activePickups = allPickups.filter(p => 
      p.status !== 'completed' && p.status !== 'cancelled'
    );

    return NextResponse.json({
      success: true,
      collectorId,
      todayDateString: today,
      stats: {
        totalPickups: allPickups.length,
        activePickups: activePickups.length,
        completedToday: completedToday.length,
        totalCompleted: allPickups.filter(p => p.status === 'completed').length
      },
      completedTodayDetails: completedToday
    });

  } catch (error) {
    console.error('❌ Error checking today stats:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
