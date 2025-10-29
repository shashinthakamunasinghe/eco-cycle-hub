import { NextRequest, NextResponse } from 'next/server';
import { collectorService } from '@/lib/firebase-services';

export async function GET(request: NextRequest) {
  try {
    const availableCollectorsCount = await collectorService.getAvailableCollectorsCount();

    return NextResponse.json({ 
      availableCollectors: availableCollectorsCount 
    });
  } catch (error) {
    console.error('Error fetching available collectors count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available collectors count' },
      { status: 500 }
    );
  }
}
