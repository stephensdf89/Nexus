import { serve } from "https://deno.land/std/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );
  } catch (err) {
    return new Response(`Webhook error: ${err.message}`, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
      const sub = event.data.object;

      await supabase.from("subscriptions").upsert({
        id: sub.id,
        user_id: sub.metadata.userId,
        stripe_customer_id: sub.customer,
        stripe_subscription_id: sub.id,
        status: sub.status,
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      });
      break;

    case "customer.subscription.deleted":
      const deleted = event.data.object;

      await supabase
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("stripe_subscription_id", deleted.id);
      break;
  }

  return new Response("OK", { status: 200 });
});
