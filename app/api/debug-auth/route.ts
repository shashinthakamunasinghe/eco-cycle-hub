import { NextRequest, NextResponse } from 'next/server';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();
    
    console.log('🔧 Debug: Creating test user...', { email, name });
    
    // Test Firebase Auth connection
    console.log('📡 Auth instance:', !!auth);
    console.log('📡 DB instance:', !!db);
    
    // Create Firebase Auth user
    const authResult = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Auth user created:', authResult.user.uid);
    
    // Create Firestore user document
    const userData = {
      id: authResult.user.uid,
      email: email,
      name: name,
      role: 'collector',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await setDoc(doc(db, 'users', authResult.user.uid), userData);
    console.log('✅ Firestore document created');
    
    // Verify document was created
    const userDoc = await getDoc(doc(db, 'users', authResult.user.uid));
    console.log('✅ Document exists:', userDoc.exists());
    
    if (userDoc.exists()) {
      console.log('✅ Document data:', userDoc.data());
    }
    
    return NextResponse.json({ 
      success: true, 
      uid: authResult.user.uid,
      userData: userDoc.exists() ? userDoc.data() : null
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      code: (error as { code?: string })?.code
    }, { status: 500 });
  }
}
