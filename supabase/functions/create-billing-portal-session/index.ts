import { serve } from "https://deno.land/std/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0";

serve(async (req) => {
  const { customerId } = await req.json();

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${Deno.env.get("SITE_URL")}/settings/billing`,
  });

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { "Content-Type": "application/json" },
  });
});
