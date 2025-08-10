import type { Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      console.error("Stripe publishable key is missing. Please check your .env.local file.");
      throw new Error("Stripe publishable key is missing");
    }
    
  // Dynamic import to ensure this only runs on the client and avoid SSR import
  stripePromise = import("@stripe/stripe-js").then(({ loadStripe }) => loadStripe(publishableKey));
  }
  return stripePromise;
};
