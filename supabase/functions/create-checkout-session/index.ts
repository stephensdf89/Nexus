import { serve } from "https://deno.land/std/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0";

serve(async (req) => {
  const { userId, priceId } = await req.json();

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);

  // Create or fetch Stripe customer
  const customer = await stripe.customers.create({
    metadata: { userId },
  });

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customer.id,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${Deno.env.get("SITE_URL")}/billing/success`,
    cancel_url: `${Deno.env.get("SITE_URL")}/billing/cancel`,
  });

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { "Content-Type": "application/json" },
  });
});
