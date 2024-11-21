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
    if (event.data.object.client_reference_id) {
      const { data: order } = await supabaseClient
        .from('orders')
        .select('id')
        .eq('stripe_session_id', event.data.object.client_reference_id)
        .single();
      
      if (order) {
        orderId = order.id;
      }
    } else if (event.data.object.payment_intent) {
      const { data: order } = await supabaseClient
        .from('orders')
        .select('id')
        .eq('payment_intent_id', event.data.object.payment_intent)
        .single();
      
      if (order) {
        orderId = order.id;
      }
    }

    // Log the event with the order ID if found
    const { error: logError } = await supabaseClient
      .from('stripe_logs')
      .insert({
        event_type: event.type,
        event_id: event.id,
        payment_intent_id: event.data.object.payment_intent || event.data.object.id,
        session_id: event.data.object.client_reference_id,
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

    // Handle specific events
    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('Checkout session completed:', event.data.object.id);
        
        if (orderId) {
          const session = event.data.object;
          const { error } = await supabaseClient
            .from('orders')
            .update({ 
              stripe_payment_status: 'succeeded',
              stripe_payment_captured: true,
              payment_intent_id: session.payment_intent,
              metadata: {
                payment_status: 'succeeded',
                captured: true,
                last_updated: new Date().toISOString(),
              }
            })
            .eq('id', orderId);

          if (error) {
            console.error('Error updating order:', error);
            throw error;
          }
          console.log('Successfully updated order status for session:', session.id);
        }
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('Payment intent succeeded:', paymentIntent.id);
        
        if (orderId) {
          const { error } = await supabaseClient
            .from('orders')
            .update({ 
              stripe_payment_status: 'succeeded',
              stripe_payment_captured: true,
              payment_intent_id: paymentIntent.id,
              metadata: {
                payment_status: 'succeeded',
                captured: true,
                last_updated: new Date().toISOString(),
              }
            })
            .eq('id', orderId);

          if (error) {
            console.error('Error updating order:', error);
            throw error;
          }
          console.log('Successfully updated order status for payment:', paymentIntent.id);
        }
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log('Payment intent failed:', paymentIntent.id);
        
        if (orderId) {
          const { error } = await supabaseClient
            .from('orders')
            .update({ 
              stripe_payment_status: 'failed',
              stripe_payment_captured: false,
              payment_intent_id: paymentIntent.id,
              metadata: {
                payment_status: 'failed',
                captured: false,
                last_updated: new Date().toISOString(),
              }
            })
            .eq('id', orderId);

          if (error) {
            console.error('Error updating order:', error);
            throw error;
          }
          console.log('Successfully updated order status as failed for payment:', paymentIntent.id);
        }
        break;
      }
    }

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