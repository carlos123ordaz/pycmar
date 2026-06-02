import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const POST: APIRoute = async ({ request }) => {
  const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY as string);
  const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET as string;

  const body = await request.text();
  const signature = request.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return new Response('Webhook signature invalid', { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent;

    const supabase = createClient(
      import.meta.env.PUBLIC_SUPABASE_URL as string,
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string,
    );

    let parsedItems: unknown[] = [];
    try {
      const raw = pi.metadata?.items ?? '[]';
      // items was stored as a string summary, not JSON — keep as fallback
      parsedItems = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
    } catch { /* keep empty */ }

    await supabase.from('orders').upsert(
      {
        payment_intent_id: pi.id,
        amount: pi.amount,
        currency: pi.currency,
        status: 'paid',
        customer_email: pi.receipt_email ?? null,
        items: parsedItems,
      },
      { onConflict: 'payment_intent_id' },
    );
  }

  return new Response('OK', { status: 200 });
};
