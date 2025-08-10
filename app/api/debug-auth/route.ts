import { NextRequest, NextResponse } from 'next/server';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json();
    
    console.log(`🔧 Debug action: ${action} for email: ${email}`);
    
    // Test Firebase Auth connection
    console.log('📡 Auth instance:', !!auth);
    console.log('📡 DB instance:', !!db);
    
    if (action === 'test-login') {
      // Test login with existing credentials
      try {
        const authResult = await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ Auth login successful:', authResult.user.uid);
        
        // Check Firestore user document
        const userDoc = await getDoc(doc(db, 'users', authResult.user.uid));
        console.log('✅ User document exists:', userDoc.exists());
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('✅ User data:', userData);
          return NextResponse.json({ 
            success: true, 
            message: 'Login successful',
            uid: authResult.user.uid,
            userData: userData
          });
        } else {
          return NextResponse.json({ 
            success: false, 
            message: 'Auth successful but no user document found',
            uid: authResult.user.uid
          });
        }
      } catch (authError: any) {
        console.error('❌ Auth login failed:', authError.code, authError.message);
        return NextResponse.json({ 
          success: false, 
          message: `Login failed: ${authError.code} - ${authError.message}`,
          code: authError.code
        });
      }
    } else if (action === 'create-user') {
      // Create new Firebase Auth user
      try {
        const authResult = await createUserWithEmailAndPassword(auth, email, password);
        console.log('✅ Auth user created:', authResult.user.uid);
        
        // Get collector profile to use for user data
        const collectorDoc = await getDoc(doc(db, 'collectorProfiles', 'SU7w4UU8nnlgjZZB9fVg'));
        let userData;
        
        if (collectorDoc.exists()) {
          const collectorData = collectorDoc.data();
          userData = {
            id: authResult.user.uid,
            email: email,
            name: collectorData.name || 'Hasith',
            role: 'collector',
            phone: collectorData.phone || '',
            address: collectorData.address || '',
            isAvailable: true,
            truckCapacity: collectorData.vehicleCapacity || 500,
            currentLoad: 0,
            assignedRequests: [],
            currentLocation: { lat: 6.9271, lng: 79.8612 },
            createdAt: new Date(),
            updatedAt: new Date()
          };
        } else {
          userData = {
            id: authResult.user.uid,
            email: email,
            name: 'Hasith',
            role: 'collector',
            createdAt: new Date(),
            updatedAt: new Date()
          };
        }
        
        await setDoc(doc(db, 'users', authResult.user.uid), userData);
        console.log('✅ Firestore document created');
        
        return NextResponse.json({ 
          success: true, 
          message: 'User created successfully',
          uid: authResult.user.uid,
          userData: userData
        });
        
      } catch (authError: any) {
        console.error('❌ User creation failed:', authError.code, authError.message);
        return NextResponse.json({ 
          success: false, 
          message: `Creation failed: ${authError.code} - ${authError.message}`,
          code: authError.code
        });
      }
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Invalid action. Use "test-login" or "create-user"'
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
