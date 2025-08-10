import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export async function GET() {
  try {
    console.log("🔍 Investigating ID '1' documents");
    
    // Try to get the specific document with ID "1"
    const docRef = doc(db, "pickupRequests", "1");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log("📄 Document with ID '1' exists:", docSnap.data());
      
      // Get all documents to see the structure
      const collectionRef = collection(db, "pickupRequests");
      const querySnapshot = await getDocs(collectionRef);
      
      const allDocs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      }));
      
      // Filter by ID "1"
      const id1Docs = allDocs.filter(doc => doc.id === "1");
      
      console.log(`Found ${id1Docs.length} documents with ID '1'`);
      
      return NextResponse.json({
        success: true,
        directDocument: docSnap.data(),
        allId1Documents: id1Docs,
        documentExists: docSnap.exists(),
        totalDocuments: allDocs.length
      });
    } else {
      console.log("📄 No document with ID '1' found");
      
      // Still get all documents to see what's happening
      const collectionRef = collection(db, "pickupRequests");
      const querySnapshot = await getDocs(collectionRef);
      
      const allDocs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      }));
      
      return NextResponse.json({
        success: true,
        directDocument: null,
        documentExists: false,
        totalDocuments: allDocs.length,
        sampleDocuments: allDocs.slice(0, 5)
      });
    }
    
  } catch (error) {
    console.error("❌ Error investigating documents:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to investigate documents",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
