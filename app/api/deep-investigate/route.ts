import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
  try {
    console.log("🔍 Deep investigation of document structure");
    
    // Get all documents and inspect their raw structure
    const collectionRef = collection(db, "pickupRequests");
    const querySnapshot = await getDocs(collectionRef);
    
    const allDocs = querySnapshot.docs.map(doc => ({
      firestoreId: doc.id,  // Actual Firestore document ID
      docData: doc.data(),  // Raw document data
      hasIdField: 'id' in doc.data(),  // Check if data has 'id' field
      dataId: doc.data().id  // The 'id' field in the data
    }));
    
    console.log("📄 Total documents:", allDocs.length);
    
    // Find documents where the data.id doesn't match the Firestore doc.id
    const mismatchedDocs = allDocs.filter(doc => doc.firestoreId !== doc.dataId);
    console.log("🔍 Documents with ID mismatch:", mismatchedDocs.length);
    
    // Find documents where data.id is "1"
    const dataId1Docs = allDocs.filter(doc => doc.dataId === "1");
    console.log("📄 Documents with data.id = '1':", dataId1Docs.length);
    
    // Find documents where Firestore ID is "1"
    const firestoreId1Docs = allDocs.filter(doc => doc.firestoreId === "1");
    console.log("📄 Documents with Firestore ID = '1':", firestoreId1Docs.length);
    
    return NextResponse.json({
      success: true,
      totalDocuments: allDocs.length,
      mismatchedDocuments: mismatchedDocs.length,
      dataId1Documents: dataId1Docs.length,
      firestoreId1Documents: firestoreId1Docs.length,
      sampleMismatchedDocs: mismatchedDocs.slice(0, 5),
      sampleDataId1Docs: dataId1Docs.slice(0, 5),
      sampleAll: allDocs.slice(0, 10).map(doc => ({
        firestoreId: doc.firestoreId,
        dataId: doc.dataId,
        industryName: doc.docData.industryName
      }))
    });
    
  } catch (error) {
    console.error("❌ Error investigating document structure:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to investigate document structure",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
