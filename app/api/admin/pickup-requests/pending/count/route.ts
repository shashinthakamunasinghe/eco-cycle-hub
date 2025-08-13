import { NextRequest, NextResponse } from 'next/server';
import { pickupService } from '@/lib/firebase-services';

export async function GET(request: NextRequest) {
  try {
    const pendingCount = await pickupService.getPendingPickupsCount();

    return NextResponse.json({ 
      pendingPickups: pendingCount 
    });
  } catch (error) {
    console.error('Error fetching pending pickups count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending pickups count' },
      { status: 500 }
    );
  }
}
