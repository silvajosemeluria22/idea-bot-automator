import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const stripe = new Stripe(Deno.env.get('stripe_development_secret_key') as string, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

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
      Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!,
      undefined,
      cryptoProvider
    );
  } catch (err) {
    console.error('Error verifying webhook signature:', err);
    return new Response(err.message, { status: 400 });
  }

  try {
    console.log('Processing webhook event:', event.type);
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Checkout session completed:', session.id);
        
        // Fetch the payment intent to get the latest status and capture info
        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
        console.log('Payment intent status:', paymentIntent.status);
        
        // Update order status and add payment intent ID
        const { error } = await supabaseClient
          .from('orders')
          .update({ 
            stripe_payment_status: paymentIntent.status,
            payment_intent_id: session.payment_intent,
            stripe_payment_captured: paymentIntent.status === 'succeeded' && paymentIntent.amount_received > 0,
            metadata: {
              payment_status: paymentIntent.status,
              payment_intent: session.payment_intent,
              session_id: session.id,
              customer: session.customer,
              customer_email: session.customer_email,
              captured: paymentIntent.status === 'succeeded' && paymentIntent.amount_received > 0,
            }
          })
          .eq('stripe_session_id', session.id);

        if (error) {
          console.error('Error updating order:', error);
          throw error;
        }
        
        console.log('Order updated successfully');
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object;
        console.log('Checkout session expired:', session.id);
        
        // Update order status
        const { error } = await supabaseClient
          .from('orders')
          .update({ 
            stripe_payment_status: 'expired',
            stripe_payment_captured: false,
            metadata: {
              session_id: session.id,
              expired_at: new Date().toISOString(),
              captured: false,
            }
          })
          .eq('stripe_session_id', session.id);

        if (error) {
          console.error('Error updating expired order:', error);
          throw error;
        }
        
        console.log('Order marked as expired');
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