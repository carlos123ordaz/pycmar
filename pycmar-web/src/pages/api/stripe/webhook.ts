import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmation } from '../../../lib/email';

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
      parsedItems = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
    } catch { /* keep empty */ }

    const billing = {
      name: pi.metadata?.billing_name ?? '',
      lastName: pi.metadata?.billing_last_name ?? '',
      email: pi.metadata?.billing_email ?? pi.receipt_email ?? '',
      country: pi.metadata?.billing_country ?? '',
      address: pi.metadata?.billing_address ?? '',
      phone: pi.metadata?.billing_phone ?? '',
    };

    const { data: order } = await supabase.from('orders').upsert(
      {
        payment_intent_id: pi.id,
        payment_method: 'stripe',
        amount: pi.amount,
        currency: pi.currency,
        status: 'paid',
        customer_email: billing.email || pi.receipt_email || null,
        items: parsedItems,
        billing_name: billing.name,
        billing_last_name: billing.lastName,
        billing_email: billing.email,
        billing_country: billing.country,
        billing_address: billing.address,
        billing_phone: billing.phone,
      },
      { onConflict: 'payment_intent_id' },
    ).select('id').single();

    if (order?.id && billing.email) {
      sendOrderConfirmation({
        orderId: order.id,
        billing,
        items: parsedItems as Array<{ name: string; qty: number; price: number }>,
        paymentMethod: 'stripe',
        totalCents: pi.amount,
      }).catch(err => console.error('Email error:', err));
    }
  }

  return new Response('OK', { status: 200 });
};
