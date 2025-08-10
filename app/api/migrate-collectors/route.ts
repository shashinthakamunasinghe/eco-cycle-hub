import { NextResponse } from 'next/server';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export async function POST() {
  try {
    console.log('🔧 Starting migration of existing collectors...');
    
    // Get all collector profiles
    const collectorsSnapshot = await getDocs(collection(db, 'collectorProfiles'));
    const collectors = collectorsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Array<{
      id: string;
      email: string;
      name: string;
      phone?: string;
      address?: string;
      [key: string]: unknown;
    }>;
    
    console.log(`📋 Found ${collectors.length} collector profiles`);
    
    const results = [];
    const defaultPassword = 'collector123'; // Default password for migration
    
    for (const collector of collectors) {
      try {
        console.log(`🔄 Processing collector: ${collector.email}`);
        
        // Try to create Firebase Auth account
        const authResult = await createUserWithEmailAndPassword(
          auth,
          collector.email,
          defaultPassword
        );
        
        // Create/update user document
        await setDoc(doc(db, 'users', authResult.user.uid), {
          id: authResult.user.uid,
          email: collector.email,
          name: collector.name,
          role: 'collector',
          phone: collector.phone || '',
          address: collector.address || '',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log(`✅ Created auth account for: ${collector.email}`);
        results.push({ 
          email: collector.email, 
          success: true, 
          uid: authResult.user.uid,
          password: defaultPassword
        });
        
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`⚠️ Skipping ${collector.email}: ${errorMessage}`);
        results.push({ 
          email: collector.email, 
          success: false, 
          error: errorMessage 
        });
      }
    }
    
    return NextResponse.json({ 
      success: true,
      message: `Migration completed. Processed ${collectors.length} collectors.`,
      results,
      defaultPassword
    });
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
