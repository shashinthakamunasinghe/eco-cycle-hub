// Script to clean up duplicate products in Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA7VsrLIYlt0sFxrrB5YANFh5qUWgUTCX8",
  authDomain: "eco-cycle-hub-4406b.firebaseapp.com",
  projectId: "eco-cycle-hub-4406b",
  storageBucket: "eco-cycle-hub-4406b.firebasestorage.app",
  messagingSenderId: "716398706069",
  appId: "1:716398706069:web:5082a6873af32932ff8a9c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupDuplicateProducts() {
  try {
    console.log('Starting cleanup of duplicate products...');
    
    const querySnapshot = await getDocs(collection(db, 'products'));
    const products = [];
    const seenNames = new Map();
    const duplicates = [];
    
    // Collect all products
    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        ...data
      });
    });
    
    console.log(`Found ${products.length} total products`);
    
    // Identify duplicates based on name and description
    products.forEach((product) => {
      const key = `${product.name}-${product.description}`;
      
      if (seenNames.has(key)) {
        // This is a duplicate
        const original = seenNames.get(key);
        duplicates.push({
          id: product.id,
          name: product.name,
          originalId: original.id
        });
        console.log(`Found duplicate: ${product.name} (ID: ${product.id}, Original: ${original.id})`);
      } else {
        seenNames.set(key, product);
      }
    });
    
    console.log(`Found ${duplicates.length} duplicate products`);
    
    if (duplicates.length === 0) {
      console.log('No duplicates found!');
      return;
    }
    
    // Delete duplicates
    console.log('Deleting duplicates...');
    for (const duplicate of duplicates) {
      try {
        await deleteDoc(doc(db, 'products', duplicate.id));
        console.log(`✅ Deleted duplicate: ${duplicate.name} (ID: ${duplicate.id})`);
      } catch (error) {
        console.error(`❌ Failed to delete ${duplicate.name} (ID: ${duplicate.id}):`, error);
      }
    }
    
    console.log('✅ Cleanup completed!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

cleanupDuplicateProducts();
