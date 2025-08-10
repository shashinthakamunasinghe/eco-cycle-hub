import { NextResponse } from "next/server"
import { signInWithEmailAndPassword, signOut } from "firebase/auth"
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    console.log(`🔍 Testing authentication flow for: ${email}`)
    
    // Step 1: Test Firebase Auth login
    console.log("🔐 Step 1: Testing Firebase Auth...")
    const authResult = await signInWithEmailAndPassword(auth, email, password)
    const authUID = authResult.user.uid
    console.log("✅ Firebase Auth successful, UID:", authUID)
    
    // Step 2: Check user document with Auth UID
    console.log("📄 Step 2: Checking user document with Auth UID...")
    const userDocByUID = await getDoc(doc(db, "users", authUID))
    console.log("📄 User document exists with Auth UID:", userDocByUID.exists())
    
    if (userDocByUID.exists()) {
      console.log("✅ User document data:", userDocByUID.data())
    }
    
    // Step 3: Check all users to find matching email
    console.log("📊 Step 3: Searching all users for matching email...")
    const usersSnapshot = await getDocs(collection(db, "users"))
    const allUsers = usersSnapshot.docs.map(doc => ({ 
      docId: doc.id, 
      ...doc.data() 
    }))
    
    const userByEmail = allUsers.find((u: any) => u.email === email)
    console.log("📄 User found by email search:", !!userByEmail)
    
    if (userByEmail) {
      console.log("📄 User data by email:", {
        docId: userByEmail.docId,
        email: userByEmail.email,
        name: userByEmail.name,
        role: userByEmail.role
      })
      console.log("🔗 UID match:", authUID === userByEmail.docId)
    }
    
    // Step 4: Check collector profile
    console.log("👷 Step 4: Checking collector profile...")
    const collectorDoc = await getDoc(doc(db, "collectorProfiles", authUID))
    console.log("👷 Collector profile exists with Auth UID:", collectorDoc.exists())
    
    if (collectorDoc.exists()) {
      console.log("✅ Collector profile data:", collectorDoc.data())
    }
    
    // Sign out to clean up
    await signOut(auth)
    
    return NextResponse.json({
      success: true,
      results: {
        authUID: authUID,
        userDocByUID: userDocByUID.exists() ? userDocByUID.data() : null,
        userByEmail: userByEmail || null,
        uidMatch: userByEmail ? authUID === userByEmail.docId : false,
        collectorProfile: collectorDoc.exists() ? collectorDoc.data() : null
      },
      analysis: {
        authWorking: true,
        userDocExists: userDocByUID.exists(),
        emailMatch: !!userByEmail,
        uidMatches: userByEmail ? authUID === userByEmail.docId : false,
        issue: !userDocByUID.exists() ? "User document not found with Auth UID" : null
      }
    })
    
  } catch (error: any) {
    console.error("❌ Error in auth test:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        code: error.code
      },
      { status: 500 }
    )
  }
}
