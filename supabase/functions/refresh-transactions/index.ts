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

  try {
    console.log('Fetching balance transactions from Stripe');
    
    // Get balance transactions from Stripe
    const transactions = await stripe.balanceTransactions.list({
      limit: 100,
    });

    console.log(`Found ${transactions.data.length} transactions`);

    // Get all orders that need updating
    const { data: orders, error: ordersError } = await supabaseClient
      .from('orders')
      .select('*')
      .in('stripe_payment_status', ['succeeded', 'processing']);

    if (ordersError) throw ordersError;
    
    const updates = [];
    let updatedCount = 0;
    
    // Match transactions with orders and prepare updates
    for (const order of orders || []) {
      if (!order.payment_intent_id) continue;
      
      const transaction = transactions.data.find(t => 
        t.source === order.payment_intent_id
      );
      
      if (transaction) {
        updates.push({
          id: order.id,
          stripe_payment_captured: transaction.status === 'available',
          metadata: {
            ...order.metadata,
            transaction_id: transaction.id,
            transaction_status: transaction.status,
            transaction_available: transaction.available_on,
            last_updated: new Date().toISOString(),
          }
        });
      }
    }

    console.log(`Preparing to update ${updates.length} orders`);

    // Update orders in batches
    for (const update of updates) {
      const { error: updateError } = await supabaseClient
        .from('orders')
        .update(update)
        .eq('id', update.id);

      if (updateError) {
        console.error(`Error updating order ${update.id}:`, updateError);
      } else {
        updatedCount++;
      }
    }

    return new Response(
      JSON.stringify({ updated: updatedCount }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});