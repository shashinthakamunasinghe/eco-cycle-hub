// Quick test script to add a product
import { productService } from './lib/firebase-services';

const testProduct = {
  name: "Test Product",
  description: "This is a test product for delete functionality",
  price: 10.99,
  category: "tools",
  image: "/placeholder.svg?height=300&width=300",
  stock: 5,
  rating: 4.0,
  reviews: 1,
};

async function addTestProduct() {
  try {
    const id = await productService.addProduct(testProduct);
    console.log('Test product added with ID:', id);
  } catch (error) {
    console.error('Error adding test product:', error);
  }
}

addTestProduct();
