import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

export async function POST() {
  try {
    console.log("🧹 Starting cleanup of duplicate pickup requests with ID '1'");
    
    // Get all pickup requests
    const pickupsRef = collection(db, "pickupRequests");
    const querySnapshot = await getDocs(pickupsRef);
    
    console.log(`📦 Total documents: ${querySnapshot.docs.length}`);
    
    // Find all documents with ID "1"
    const id1Docs = querySnapshot.docs.filter(doc => doc.id === "1");
    console.log(`🔍 Found ${id1Docs.length} documents with ID '1'`);
    
    if (id1Docs.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No duplicate documents with ID '1' found",
        deletedCount: 0
      });
    }
    
    // Delete all documents with ID "1"
    let deletedCount = 0;
    for (const docSnapshot of id1Docs) {
      try {
        await deleteDoc(doc(db, "pickupRequests", docSnapshot.id));
        deletedCount++;
        console.log(`✅ Deleted document with ID: ${docSnapshot.id}`);
      } catch (error) {
        console.error(`❌ Error deleting document ${docSnapshot.id}:`, error);
      }
    }
    
    console.log(`🎉 Cleanup complete! Deleted ${deletedCount} duplicate documents`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount} duplicate pickup requests with ID '1'`,
      deletedCount
    });
    
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to cleanup duplicate documents",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
