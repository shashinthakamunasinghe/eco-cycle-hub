// Script to add additional orders for different time periods to test analytics
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, Timestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA7VsrLIYlt0sFxrrB5YANFh5qUWgUTCX8",
  authDomain: "eco-cycle-hub-4406b.firebaseapp.com",
  projectId: "eco-cycle-hub-4406b",
  storageBucket: "eco-cycle-hub-4406b.firebasestorage.app",
  messagingSenderId: "716398706069",
  appId: "1:716398706069:web:5082a6873af32932ff8a9c"
};

async function addOrdersForDifferentPeriods() {
  try {
    console.log('🔄 Adding orders for different time periods...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Get existing products
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const products = [];
    
    productsSnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    if (products.length === 0) {
      console.log('No products found!');
      return;
    }
    
    const now = new Date();
    
    // Orders for last 7 days
    const recentOrders = [
      {
        id: 'ORD-RECENT-001',
        customerId: 'recent1@example.com',
        customerName: 'Recent Customer 1',
        items: [
          {
            productId: products[0].id,
            productName: products[0].name,
            quantity: 4,
            price: products[0].price
          }
        ],
        total: products[0].price * 4,
        status: 'delivered',
        shippingAddress: 'Recent Address 1',
        createdAt: Timestamp.fromDate(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)) // 2 days ago
      },
      {
        id: 'ORD-RECENT-002',
        customerId: 'recent2@example.com',
        customerName: 'Recent Customer 2',
        items: [
          {
            productId: products[1].id,
            productName: products[1].name,
            quantity: 3,
            price: products[1].price
          }
        ],
        total: products[1].price * 3,
        status: 'shipped',
        shippingAddress: 'Recent Address 2',
        createdAt: Timestamp.fromDate(new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)) // 1 day ago
      }
    ];
    
    // Orders for last 90 days but not in last 30 days
    const olderOrders = [
      {
        id: 'ORD-OLD-001',
        customerId: 'old1@example.com',
        customerName: 'Old Customer 1',
        items: [
          {
            productId: products[2].id,
            productName: products[2].name,
            quantity: 10,
            price: products[2].price
          }
        ],
        total: products[2].price * 10,
        status: 'delivered',
        shippingAddress: 'Old Address 1',
        createdAt: Timestamp.fromDate(new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000)) // 45 days ago
      },
      {
        id: 'ORD-OLD-002',
        customerId: 'old2@example.com',
        customerName: 'Old Customer 2',
        items: [
          {
            productId: products[3].id,
            productName: products[3].name,
            quantity: 5,
            price: products[3].price
          }
        ],
        total: products[3].price * 5,
        status: 'delivered',
        shippingAddress: 'Old Address 2',
        createdAt: Timestamp.fromDate(new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)) // 60 days ago
      }
    ];
    
    console.log('Adding recent orders (last 7 days)...');
    for (const order of recentOrders) {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...order,
        createdAt: order.createdAt,
        updatedAt: Timestamp.now(),
      });
      console.log(`Added recent order: ${order.id} - $${order.total.toFixed(2)}`);
    }
    
    console.log('Adding older orders (45-60 days ago)...');
    for (const order of olderOrders) {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...order,
        createdAt: order.createdAt,
        updatedAt: Timestamp.now(),
      });
      console.log(`Added old order: ${order.id} - $${order.total.toFixed(2)}`);
    }
    
    console.log('✅ Orders for different time periods added successfully!');
    console.log('\nNow you can test analytics with different time periods:');
    console.log('- Last 7 days: Should show recent orders');
    console.log('- Last 30 days: Should show recent + original orders');
    console.log('- Last 90 days: Should show all orders including old ones');
    
  } catch (error) {
    console.error('❌ Error adding orders:', error);
  }
}

// Run the function
addOrdersForDifferentPeriods();
