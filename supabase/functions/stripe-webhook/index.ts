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
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('Payment intent succeeded:', paymentIntent.id);
        
        // Update order status in database
        const { error } = await supabaseClient
          .from('orders')
          .update({ 
            stripe_payment_status: 'succeeded',
            stripe_payment_captured: true,
            metadata: {
              payment_intent_id: paymentIntent.id,
              payment_status: 'succeeded',
              captured: true,
              last_updated: new Date().toISOString(),
            }
          })
          .eq('payment_intent_id', paymentIntent.id);

        if (error) {
          console.error('Error updating order:', error);
          throw error;
        }
        
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log('Payment intent failed:', paymentIntent.id);
        
        const { error } = await supabaseClient
          .from('orders')
          .update({ 
            stripe_payment_status: 'failed',
            stripe_payment_captured: false,
            metadata: {
              payment_intent_id: paymentIntent.id,
              payment_status: 'failed',
              captured: false,
              last_updated: new Date().toISOString(),
            }
          })
          .eq('payment_intent_id', paymentIntent.id);

        if (error) {
          console.error('Error updating order:', error);
          throw error;
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