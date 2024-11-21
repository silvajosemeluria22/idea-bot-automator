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

serve(async (req) => {
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
    return new Response(err.message, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Update order status and add payment intent ID
        const { error } = await supabaseClient
          .from('orders')
          .update({ 
            stripe_payment_status: 'completed',
            payment_intent_id: session.payment_intent,
            metadata: {
              ...session,
              payment_status: session.payment_status,
              payment_intent: session.payment_intent,
            }
          })
          .eq('stripe_session_id', session.id);

        if (error) throw error;
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object;
        
        // Update order status
        const { error } = await supabaseClient
          .from('orders')
          .update({ 
            stripe_payment_status: 'expired',
            metadata: {
              ...session
            }
          })
          .eq('stripe_session_id', session.id);

        if (error) throw error;
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});