import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    // Fetch all users from the database
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc')
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    
    const users = usersSnapshot.docs.map((doc) => {
      const data = doc.data();
      
      // Check if user is active (logged in within last 30 days)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const lastLogin = data.lastLogin?.toDate();
      const isActive = lastLogin && lastLogin >= thirtyDaysAgo;
      
      return {
        id: doc.id,
        name: data.name || data.displayName || 'Unknown User',
        email: data.email || 'No email',
        role: data.role || 'customer',
        lastLogin: lastLogin,
        createdAt: data.createdAt?.toDate(),
        isActive: Boolean(isActive)
      };
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
