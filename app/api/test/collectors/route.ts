import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/firebase-services';

export async function GET(request: NextRequest) {
  try {
    const availableCollectors = await userService.getAvailableCollectorsCount();
    
    return NextResponse.json({ 
      availableCollectors,
      message: "Available collectors count retrieved successfully"
    });
  } catch (error) {
    console.error('Error fetching available collectors count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available collectors count', details: error },
      { status: 500 }
    );
  }
}
