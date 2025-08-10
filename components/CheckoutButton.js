import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutButton() {
  const handleClick = async () => {
    const stripe = await stripePromise;

    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
    });

    const session = await res.json();

    await stripe.redirectToCheckout({
      sessionId: session.id,
    });
  };

  return (
    <button onClick={handleClick} className="px-4 py-2 bg-green-600 text-white rounded">
      Pay Now
    </button>
  );
}
