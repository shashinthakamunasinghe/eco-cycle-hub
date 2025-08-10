import Stripe from "stripe";

console.log("Initializing Stripe with key:", 
  process.env.STRIPE_SECRET_KEY ? 
  `${process.env.STRIPE_SECRET_KEY.substring(0, 8)}...` : 
  "MISSING KEY");

const stripe = process.env.STRIPE_SECRET_KEY ? 
  new Stripe(process.env.STRIPE_SECRET_KEY) : 
  null;

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      console.log("Received checkout request");
      
      // Check if Stripe secret key is configured
      if (!process.env.STRIPE_SECRET_KEY) {
        console.error("Stripe secret key is missing");
        throw new Error("Stripe secret key is not configured");
      } else {
        console.log("Stripe secret key is configured");
      }
      
      // Get cart data from request body
      const { items, shipping, tax } = req.body;
      console.log("Request body:", JSON.stringify({ 
        itemsCount: items?.length,
        shipping,
        tax
      }));
      
      // Validate input data
      if (!items || !Array.isArray(items) || items.length === 0) {
        console.error("Invalid cart data: no items found");
        throw new Error("Invalid cart data: no items found");
      }
      
      // Format line items for Stripe
      const lineItems = items.map(item => {
        // Ensure the price is a valid number and convert to cents
        const unitAmount = item.price ? Math.round(parseFloat(item.price) * 100) : 0;
        
        if (unitAmount <= 0) {
          console.warn(`Invalid price for item ${item.name}: ${item.price}`);
        }
        
        // Ensure item has a valid quantity
        const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;
        
        console.log(`Processing item: ${item.name}, price: $${item.price}, quantity: ${quantity}`);
        
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

      console.log("Creating Stripe checkout session with line items:", 
        JSON.stringify({ itemsCount: lineItems.length }));
        
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          line_items: lineItems,
          metadata: {
            orderTime: new Date().toISOString(),
          },
          success_url: `${req.headers.origin}/orders/success?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${req.headers.origin}/cart/cancel`,
        });
        
        console.log("Stripe session created successfully with ID:", session.id);
        
        // Return the session ID
        res.status(200).json({ id: session.id });
      } catch (stripeError) {
        console.error("Stripe session creation failed:", stripeError);
        throw stripeError;
      }
    } catch (err) {
      console.error("Stripe error:", err);
      
      // Send a more user-friendly error message
      let errorMessage = "An unexpected error occurred";
      let statusCode = 500;
      
      if (err.type && err.type.startsWith('Stripe')) {
        // This is a Stripe API error
        errorMessage = err.message || "Payment processing error";
      } else if (err.message === "Stripe secret key is not configured") {
        errorMessage = "Payment system is not properly configured";
        statusCode = 503; // Service Unavailable
      } else if (err.message === "Invalid cart data: no items found") {
        errorMessage = "Your cart appears to be empty";
        statusCode = 400; // Bad Request
      }
      
      res.status(statusCode).json({ 
        error: errorMessage,
        code: err.type || 'server_error'
      });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
