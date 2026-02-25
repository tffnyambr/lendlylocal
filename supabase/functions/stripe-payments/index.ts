import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("Not authenticated");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const { action, paymentMethodId } = await req.json();

    // Get or create Stripe customer
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: profile } = await serviceClient
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.user_metadata?.display_name || user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await serviceClient
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id);
    }

    // Route actions
    switch (action) {
      case "create-setup-intent": {
        // Creates a SetupIntent for securely saving a card
        const setupIntent = await stripe.setupIntents.create({
          customer: customerId,
          payment_method_types: ["card"],
        });
        return new Response(
          JSON.stringify({ clientSecret: setupIntent.client_secret }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "list-payment-methods": {
        const methods = await stripe.paymentMethods.list({
          customer: customerId,
          type: "card",
        });
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const defaultPmId = customer.invoice_settings?.default_payment_method;
        const cards = methods.data.map((pm) => ({
          id: pm.id,
          brand: pm.card?.brand || "unknown",
          last4: pm.card?.last4 || "****",
          expMonth: pm.card?.exp_month,
          expYear: pm.card?.exp_year,
          isDefault: pm.id === defaultPmId,
        }));
        return new Response(JSON.stringify({ cards }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "detach-payment-method": {
        if (!paymentMethodId) throw new Error("paymentMethodId required");
        await stripe.paymentMethods.detach(paymentMethodId);
        return new Response(JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "pre-authorize": {
        // Card pre-authorization (hold) for security deposits
        const { amount, currency = "usd" } = await req.json().catch(() => ({}));
        if (!amount) throw new Error("amount required for pre-authorization");

        // Get default payment method
        const customer = await stripe.customers.retrieve(customerId);
        const defaultPm = (customer as Stripe.Customer).invoice_settings?.default_payment_method;
        if (!defaultPm) throw new Error("No default payment method set");

        const paymentIntent = await stripe.paymentIntents.create({
          amount, // in cents
          currency,
          customer: customerId,
          payment_method: defaultPm as string,
          capture_method: "manual", // This creates a hold, not a charge
          confirm: true,
          off_session: true,
        });

        return new Response(
          JSON.stringify({
            paymentIntentId: paymentIntent.id,
            status: paymentIntent.status,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "capture-payment": {
        // Capture a previously authorized payment
        const { paymentIntentId: captureId, captureAmount } = await req.json().catch(() => ({}));
        if (!captureId) throw new Error("paymentIntentId required");

        const captured = await stripe.paymentIntents.capture(captureId, {
          ...(captureAmount ? { amount_to_capture: captureAmount } : {}),
        });

        return new Response(
          JSON.stringify({ status: captured.status }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "cancel-authorization": {
        const { paymentIntentId: cancelId } = await req.json().catch(() => ({}));
        if (!cancelId) throw new Error("paymentIntentId required");

        const canceled = await stripe.paymentIntents.cancel(cancelId);
        return new Response(
          JSON.stringify({ status: canceled.status }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "refund": {
        const { paymentIntentId: refundPiId, refundAmount, reason } = await req.json().catch(() => ({}));
        if (!refundPiId) throw new Error("paymentIntentId required");

        const refund = await stripe.refunds.create({
          payment_intent: refundPiId,
          ...(refundAmount ? { amount: refundAmount } : {}),
          ...(reason ? { reason } : {}),
        });

        return new Response(
          JSON.stringify({ refundId: refund.id, status: refund.status }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "set-default-payment-method": {
        if (!paymentMethodId) throw new Error("paymentMethodId required");
        await stripe.customers.update(customerId, {
          invoice_settings: { default_payment_method: paymentMethodId },
        });
        return new Response(JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error("Stripe payment error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
