import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request) {
  try {
    console.log("App Router API: Received checkout request");
    
    // Check if Stripe secret key is configured
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error("App Router API: Stripe secret key is missing");
      return NextResponse.json(
        { error: "Stripe secret key is not configured" },
        { status: 500 }
      );
    }
    
    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey);
    
    // Get cart data from request body
    const body = await request.json();
    const { items, shipping, tax, userEmail } = body;
    
    console.log("App Router API: Request body:", JSON.stringify({
      itemsCount: items?.length,
      shipping,
      tax
    }));
    
    // Validate input data
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("App Router API: Invalid cart data: no items found");
      return NextResponse.json(
        { error: "Invalid cart data: no items found" },
        { status: 400 }
      );
    }
    
    // Format line items for Stripe
    const lineItems = items.map(item => {
      // Ensure the price is a valid number and convert to cents
      const unitAmount = item.price ? Math.round(parseFloat(item.price) * 100) : 0;
      
      if (unitAmount <= 0) {
        console.warn(`App Router API: Invalid price for item ${item.name}: ${item.price}`);
      }
      
      // Ensure item has a valid quantity
      const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;
      
      console.log(`App Router API: Processing item: ${item.name}, price: $${item.price}, quantity: ${quantity}`);
      
      // Stripe requires fully-qualified URLs for images
      let imageArray;
      if (item.image) {
        // Check if the image URL is already absolute
        if (item.image.startsWith('http://') || item.image.startsWith('https://')) {
          imageArray = [item.image];
        } else {
          // Skip images that aren't absolute URLs to avoid Stripe errors
          imageArray = undefined;
        }
      } else {
        imageArray = undefined;
      }
      
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name || "Product",
            // Only include images if they're valid URLs
            ...(imageArray && { images: imageArray }),
          },
          unit_amount: Math.max(unitAmount, 50), // Minimum 50 cents as per Stripe requirements
        },
        quantity: quantity,
      };
    });
    
    // Add shipping as a separate line item if it's not free
    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shipping",
          },
          unit_amount: Math.round(shipping * 100), // Convert to cents
        },
        quantity: 1,
      });
    }
    
    // Add tax as a separate line item
    if (tax > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Tax",
          },
          unit_amount: Math.round(tax * 100), // Convert to cents
        },
        quantity: 1,
      });
    }
    
    console.log("App Router API: Creating Stripe checkout session with line items:", 
      JSON.stringify({ itemsCount: lineItems.length }));
    
    try {
      // Get the origin for success/cancel URLs
      const origin = request.headers.get('origin') || 'http://localhost:3000';
      
      // Create the Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: lineItems,
        metadata: {
          orderTime: new Date().toISOString(),
          userEmail: userEmail || ''
        },
        success_url: `${origin}/orders/success?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/cart/cancel`,
      });
      
      console.log("App Router API: Stripe session created successfully with ID:", session.id);
      
      // Return the session ID
      return NextResponse.json({ id: session.id });
    } catch (stripeError) {
      console.error("App Router API: Stripe session creation failed:", stripeError);
      return NextResponse.json(
        { 
          error: stripeError.message || "Error creating Stripe checkout session",
          code: stripeError.type || 'stripe_error'
        },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("App Router API: Unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
