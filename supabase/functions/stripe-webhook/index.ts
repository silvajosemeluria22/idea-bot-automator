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

const cryptoProvider = Stripe.createSubtleCryptoProvider();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const signature = req.headers.get('Stripe-Signature');
  const body = await req.text();
  
  let event;
  try {
    console.log('Received webhook. Verifying signature...');
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('Stripe_webhook_secret')!,
      undefined,
      cryptoProvider
    );
  } catch (err) {
    console.error('Error verifying webhook signature:', err);
    return new Response(err.message, { status: 400 });
  }

  try {
    console.log('Processing webhook event:', event.type, 'Event ID:', event.id);
    
    // Find the corresponding order based on the session ID or payment intent ID
    let orderId = null;
    let orderUpdate = {};

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Processing completed checkout session:', session.id);

      // Find order by session ID
      const { data: order, error: orderError } = await supabaseClient
        .from('orders')
        .select('id')
        .eq('stripe_session_id', session.id)
        .single();

      if (orderError) {
        console.error('Error finding order:', orderError);
        throw orderError;
      }

      if (order) {
        orderId = order.id;
        orderUpdate = {
          payment_intent_id: session.payment_intent,
          stripe_payment_status: session.payment_status,
          stripe_payment_captured: true,
          metadata: {
            ...order.metadata,
            payment_status: session.payment_status,
            payment_intent_id: session.payment_intent,
            last_updated: new Date().toISOString(),
          }
        };

        // Update the order with payment information
        const { error: updateError } = await supabaseClient
          .from('orders')
          .update(orderUpdate)
          .eq('id', orderId);

        if (updateError) {
          console.error('Error updating order:', updateError);
          throw updateError;
        }

        console.log('Successfully updated order:', orderId);
      }
    }

    // Log the stripe event
    const { error: logError } = await supabaseClient
      .from('stripe_logs')
      .insert({
        event_type: event.type,
        event_id: event.id,
        payment_intent_id: event.data.object.payment_intent,
        session_id: event.data.object.id,
        order_id: orderId,
        status: event.data.object.status,
        amount: event.data.object.amount,
        metadata: event.data.object.metadata,
        raw_event: event.data.object
      });

    if (logError) {
      console.error('Error logging stripe event:', logError);
      throw logError;
    }

    console.log('Successfully logged event to stripe_logs');

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});