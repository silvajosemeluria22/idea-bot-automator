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

const getOrderStatus = (stripeEvent: string, status: string): string => {
  switch (stripeEvent) {
    case 'checkout.session.completed':
      return status === 'complete' ? 'paid' : 'pending';
    case 'payment_intent.payment_failed':
    case 'charge.failed':
      return 'failed';
    default:
      return 'pending';
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('Stripe-Signature');
    const body = await req.text();
    
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature!,
        Deno.env.get('Stripe_webhook_secret')!,
        undefined,
        Stripe.createSubtleCryptoProvider()
      );
    } catch (err) {
      console.error('Error verifying webhook signature:', err);
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Processing webhook event:', event.type, 'Event ID:', event.id);
    
    // First, find the order based on session ID
    let orderId = null;
    if (event.type === 'checkout.session.completed') {
      const { data: order, error: orderError } = await supabaseClient
        .from('orders')
        .select('id')
        .eq('stripe_session_id', event.data.object.id)
        .single();

      if (orderError) {
        console.error('Error finding order:', orderError);
      } else {
        orderId = order.id;
      }
    }
    
    // Log the stripe event with order reference if found
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
        raw_event: event.data.object,
        order_id: orderId // Link to order if found
      });

    if (logError) {
      console.error('Error logging stripe event:', logError);
      throw logError;
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Processing checkout.session.completed:', session.id);

        const orderStatus = getOrderStatus(event.type, session.status);
        
        // Update order status
        const { error: updateError } = await supabaseClient
          .from('orders')
          .update({
            stripe_payment_status: orderStatus,
            payment_intent_id: session.payment_intent,
            stripe_payment_captured: orderStatus === 'paid',
            metadata: {
              payment_status: orderStatus,
              payment_intent: session.payment_intent,
              captured: orderStatus === 'paid',
              last_updated: new Date().toISOString(),
            }
          })
          .eq('stripe_session_id', session.id);

        if (updateError) {
          console.error('Error updating order:', updateError);
          throw updateError;
        }

        // If payment is successful, set discount for pro upgrade
        if (orderStatus === 'paid') {
          const { data: order } = await supabaseClient
            .from('orders')
            .select('solution_id, amount')
            .eq('stripe_session_id', session.id)
            .single();

          if (order) {
            // Set the premium amount as discount for pro
            const { error: discountError } = await supabaseClient
              .from('solutions')
              .update({ discount: order.amount })
              .eq('id', order.solution_id);

            if (discountError) {
              console.error('Error setting discount:', discountError);
            }
          }
        }
        break;
      }

      case 'payment_intent.payment_failed':
      case 'charge.failed': {
        const paymentIntent = event.data.object.payment_intent || event.data.object.id;
        console.log('Processing payment failure:', paymentIntent);

        const { error: updateError } = await supabaseClient
          .from('orders')
          .update({
            stripe_payment_status: 'failed',
            stripe_payment_captured: false,
            metadata: {
              payment_status: 'failed',
              failure_message: event.data.object.failure_message,
              failure_code: event.data.object.failure_code,
              last_updated: new Date().toISOString(),
            }
          })
          .eq('payment_intent_id', paymentIntent);

        if (updateError) {
          console.error('Error updating order:', updateError);
          throw updateError;
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(
      JSON.stringify({ received: true }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});