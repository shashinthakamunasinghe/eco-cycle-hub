import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/firebase-services';

export async function GET(request: NextRequest) {
  try {
    // Get user counts efficiently without fetching all user data
    const [totalUsers, usersByRole] = await Promise.all([
      userService.getUserCount(),
      userService.getUserCountByRole()
    ]);

    const stats = {
      totalUsers,
      usersByRole
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
