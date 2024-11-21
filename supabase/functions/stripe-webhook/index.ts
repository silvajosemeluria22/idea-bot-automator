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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const signature = req.headers.get('Stripe-Signature');
  const body = await req.text();
  
  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('Stripe_webhook_secret')!,
      undefined,
      stripe.createSubtleCryptoProvider()
    );
  } catch (err) {
    console.error('Error verifying webhook signature:', err);
    return new Response(err.message, { status: 400 });
  }

  try {
    console.log('Processing webhook event:', event.type, 'Event ID:', event.id);
    
    // Log the stripe event
    const { error: logError } = await supabaseClient
      .from('stripe_logs')
      .insert({
        event_type: event.type,
        event_id: event.id,
        payment_intent_id: event.data.object.payment_intent || event.data.object.id,
        session_id: event.data.object.id,
        status: event.data.object.status,
        amount: event.data.object.amount,
        metadata: event.data.object.metadata,
        raw_event: event.data.object
      });

    if (logError) {
      console.error('Error logging stripe event:', logError);
      throw logError;
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.created': {
        const paymentIntent = event.data.object;
        console.log('Processing payment_intent.created:', paymentIntent.id);

        // Find order by payment_intent_id
        const { data: orders, error: orderError } = await supabaseClient
          .from('orders')
          .update({
            stripe_payment_status: paymentIntent.status,
            metadata: {
              ...paymentIntent.metadata,
              payment_status: paymentIntent.status,
              last_updated: new Date().toISOString(),
            }
          })
          .eq('payment_intent_id', paymentIntent.id)
          .select();

        if (orderError) {
          console.error('Error updating order:', orderError);
          throw orderError;
        }

        console.log('Updated orders with payment intent status:', orders?.length);
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Processing checkout.session.completed:', session.id);

        // Update order with completed session information
        const { error: updateError } = await supabaseClient
          .from('orders')
          .update({
            stripe_payment_status: session.payment_status,
            payment_intent_id: session.payment_intent,
            stripe_payment_captured: session.payment_status === 'paid',
            metadata: {
              payment_status: session.payment_status,
              payment_intent: session.payment_intent,
              captured: session.payment_status === 'paid',
              last_updated: new Date().toISOString(),
            }
          })
          .eq('stripe_session_id', session.id);

        if (updateError) {
          console.error('Error updating order:', updateError);
          throw updateError;
        }

        console.log('Successfully updated order with completed session');
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
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