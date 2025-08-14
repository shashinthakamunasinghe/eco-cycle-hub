import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env.local' });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function removeSampleAnalyticsData() {
  try {
    console.log('🧹 Removing sample analytics data...');
    
    // Industry IDs that were used in the sample data
    const sampleIndustryIds = [
      'green-industries-123',
      'tech-corp-456',
      'plastic-co-789',
      'metal-works-101',
      'paper-mill-202',
      'chemical-plant-303',
      'mixed-factory-404'
    ];
    
    let totalDeleted = 0;
    
    // Query and delete documents for each sample industry
    for (const industryId of sampleIndustryIds) {
      console.log(`🔍 Looking for pickup requests from ${industryId}...`);
      
      const q = query(
        collection(db, 'pickupRequests'), 
        where('industryId', '==', industryId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log(`   No documents found for ${industryId}`);
        continue;
      }
      
      console.log(`   Found ${querySnapshot.size} documents for ${industryId}`);
      
      // Delete each document
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        console.log(`   🗑️  Deleting: ${docSnapshot.id} - ${data.industryName} (${data.wasteType}, ${data.weight}kg)`);
        
        await deleteDoc(doc(db, 'pickupRequests', docSnapshot.id));
        totalDeleted++;
      }
    }
    
    // Also check for any documents with the specific collector IDs used in sample data
    const sampleCollectorIds = ['collector-1', 'collector-2', 'collector-3'];
    
    for (const collectorId of sampleCollectorIds) {
      console.log(`🔍 Looking for pickup requests assigned to ${collectorId}...`);
      
      const q = query(
        collection(db, 'pickupRequests'), 
        where('collectorId', '==', collectorId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log(`   No documents found for collector ${collectorId}`);
        continue;
      }
      
      console.log(`   Found ${querySnapshot.size} additional documents for collector ${collectorId}`);
      
      // Delete each document (if not already deleted)
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        
        // Check if this is one of our sample industry IDs (already deleted)
        if (sampleIndustryIds.includes(data.industryId)) {
          console.log(`   ⏭️  Skipping already deleted: ${docSnapshot.id}`);
          continue;
        }
        
        console.log(`   🗑️  Deleting: ${docSnapshot.id} - ${data.industryName} (${data.wasteType}, ${data.weight}kg)`);
        
        await deleteDoc(doc(db, 'pickupRequests', docSnapshot.id));
        totalDeleted++;
      }
    }
    
    console.log(`\n✅ Successfully removed ${totalDeleted} sample analytics documents!`);
    
    if (totalDeleted === 0) {
      console.log('ℹ️  No sample data found to remove. It may have already been deleted.');
    }
    
  } catch (error) {
    console.error('❌ Error removing sample analytics data:', error);
  }
}

// Run the script
removeSampleAnalyticsData().then(() => {
  console.log('🎉 Cleanup script completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Cleanup script failed:', error);
  process.exit(1);
});
