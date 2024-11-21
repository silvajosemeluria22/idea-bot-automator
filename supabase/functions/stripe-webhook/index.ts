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
        
        // Check if we've already processed this session
        const { data: existingOrder } = await supabaseClient
          .from('orders')
          .select('*')
          .eq('stripe_session_id', session.id)
          .single();

        if (existingOrder) {
          console.log('Order already exists for session:', session.id);
          // If order exists, just update its status
          const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
          
          const { error: updateError } = await supabaseClient
            .from('orders')
            .update({ 
              stripe_payment_status: paymentIntent.status,
              stripe_payment_captured: paymentIntent.status === 'succeeded' && paymentIntent.amount_received > 0,
              metadata: {
                ...existingOrder.metadata,
                payment_status: paymentIntent.status,
                captured: paymentIntent.status === 'succeeded' && paymentIntent.amount_received > 0,
                last_updated: new Date().toISOString(),
              }
            })
            .eq('id', existingOrder.id);

          if (updateError) throw updateError;
          break;
        }

        // If we get here, something went wrong with the initial order creation
        console.error('No order found for completed session:', session.id);
        break;
      }
      
      case 'checkout.session.expired': {
        const session = event.data.object;
        console.log('Checkout session expired:', session.id);
        
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