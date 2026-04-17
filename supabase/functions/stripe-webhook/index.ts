import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const log = (step: string, details?: Record<string, unknown>) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${d}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!stripeKey || !webhookSecret) {
    log("Missing Stripe secrets");
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "Missing signature" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    log("Signature verification failed", { error: String(err) });
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  log("Event received", { type: event.type, id: event.id });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // One-time session purchase (mode=payment with metadata)
        if (session.mode === "payment" && session.metadata?.type === "session_purchase") {
          const userId = session.metadata.user_id;
          const quantity = parseInt(session.metadata.quantity ?? "1", 10);
          if (userId && quantity > 0) {
            const { error } = await supabase.rpc("add_purchased_sessions", {
              p_user_id: userId,
              p_count: quantity,
            });
            if (error) log("add_purchased_sessions error", { error: error.message });
            else log("Sessions credited via webhook", { userId, quantity });
          }
        }

        // Subscription checkout — flag premium immediately
        if (session.mode === "subscription" && session.customer_email) {
          const { error } = await supabase
            .from("profiles")
            .update({ is_premium: true })
            .eq("email", session.customer_email);
          if (error) log("premium upgrade error", { error: error.message });
          else log("Premium activated via webhook", { email: session.customer_email });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const isActive = sub.status === "active" || sub.status === "trialing";
        const customer = await stripe.customers.retrieve(sub.customer as string);
        if (!("deleted" in customer) && customer.email) {
          const { error } = await supabase
            .from("profiles")
            .update({ is_premium: isActive })
            .eq("email", customer.email);
          if (error) log("subscription sync error", { error: error.message });
          else log("Subscription synced", { email: customer.email, isActive });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(sub.customer as string);
        if (!("deleted" in customer) && customer.email) {
          const { error } = await supabase
            .from("profiles")
            .update({ is_premium: false })
            .eq("email", customer.email);
          if (error) log("subscription cancel error", { error: error.message });
          else log("Subscription cancelled", { email: customer.email });
        }
        break;
      }

      default:
        log("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    log("Handler error", { error: err instanceof Error ? err.message : String(err) });
    return new Response(JSON.stringify({ error: "Handler failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
