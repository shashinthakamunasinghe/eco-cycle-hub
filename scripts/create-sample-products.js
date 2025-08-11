// Script to create sample products in Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

// Firebase configuration - using environment variables
const firebaseConfig = {
  apiKey: "AIzaSyA7VsrLIYlt0sFxrrB5YANFh5qUWgUTCX8",
  authDomain: "eco-cycle-hub-4406b.firebaseapp.com",
  projectId: "eco-cycle-hub-4406b",
  storageBucket: "eco-cycle-hub-4406b.firebasestorage.app",
  messagingSenderId: "716398706069",
  appId: "1:716398706069:web:5082a6873af32932ff8a9c"
};

const sampleProducts = [
  {
    name: "Organic Compost",
    description: "High-quality organic compost made from recycled food waste. Perfect for gardens and plants.",
    price: 25.99,
    category: "compost",
    image: "/placeholder.svg?height=300&width=300",
    stock: 50,
    rating: 4.5,
    reviews: 23,
  },
  {
    name: "Bio-Fertilizer",
    description: "Eco-friendly fertilizer derived from organic waste. Boosts plant growth naturally.",
    price: 18.50,
    category: "home item",
    image: "/placeholder.svg?height=300&width=300",
    stock: 75,
    rating: 4.7,
    reviews: 41,
  },
  {
    name: "Garden Mulch",
    description: "Premium mulch made from recycled wood waste. Helps retain soil moisture.",
    price: 15.00,
    category: "mulch",
    image: "/placeholder.svg?height=300&width=300",
    stock: 30,
    rating: 4.3,
    reviews: 18,
  },
  {
    name: "Eco Gardening Kit",
    description: "Complete gardening starter kit with sustainable tools and organic seeds.",
    price: 45.99,
    category: "tools",
    image: "/placeholder.svg?height=300&width=300",
    stock: 20,
    rating: 4.8,
    reviews: 35,
  },
  {
    name: "Vegetable Seeds Pack",
    description: "Assorted organic vegetable seeds for sustainable home gardening.",
    price: 12.99,
    category: "seeds",
    image: "/placeholder.svg?height=300&width=300",
    stock: 100,
    rating: 4.6,
    reviews: 67,
  },
  {
    name: "Recycled Planters",
    description: "Beautiful planters made from recycled plastic waste. Various sizes available.",
    price: 22.50,
    category: "home item",
    image: "/placeholder.svg?height=300&width=300",
    stock: 40,
    rating: 4.4,
    reviews: 29,
  },
  {
    name: "Organic Soil Mix",
    description: "Premium soil mixture enriched with recycled organic matter.",
    price: 19.99,
    category: "home item",
    image: "/placeholder.svg?height=300&width=300",
    stock: 60,
    rating: 4.5,
    reviews: 52,
  },
  {
    name: "Eco-Friendly Pruning Shears",
    description: "Durable pruning shears made from recycled steel with bamboo handles.",
    price: 28.99,
    category: "tools",
    image: "/placeholder.svg?height=300&width=300",
    stock: 25,
    rating: 4.7,
    reviews: 31,
  }
];

async function addSampleProducts() {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('Adding sample products to Firestore...');

    for (const product of sampleProducts) {
      const docRef = await addDoc(collection(db, 'products'), {
        ...product,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log(`Product added with ID: ${docRef.id} - ${product.name}`);
    }

    console.log('All sample products have been added successfully!');
  } catch (error) {
    console.error('Error adding products:', error);
  }
}

// Run the script
addSampleProducts();
