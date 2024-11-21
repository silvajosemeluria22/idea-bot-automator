import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const stripe = new Stripe(Deno.env.get('stripe_development_secret_key') as string, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();
    console.log('Refreshing payment status for order:', orderId);
    
    // Get order details from database
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;
    if (!order) throw new Error('Order not found');

    // Get latest payment status from Stripe
    let paymentData;
    if (order.payment_intent_id) {
      const paymentIntent = await stripe.paymentIntents.retrieve(order.payment_intent_id);
      paymentData = {
        stripe_payment_status: paymentIntent.status,
        metadata: {
          ...order.metadata,
          payment_status: paymentIntent.status,
          last_updated: new Date().toISOString(),
        }
      };
    } else if (order.stripe_session_id) {
      const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
      const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
      paymentData = {
        payment_intent_id: session.payment_intent,
        stripe_payment_status: paymentIntent.status,
        metadata: {
          ...order.metadata,
          payment_status: paymentIntent.status,
          payment_intent: session.payment_intent,
          last_updated: new Date().toISOString(),
        }
      };
    } else {
      throw new Error('No payment information found');
    }

    // Update order in database
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update(paymentData)
      .eq('id', orderId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});