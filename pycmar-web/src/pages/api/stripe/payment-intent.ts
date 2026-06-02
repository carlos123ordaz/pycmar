import type { APIRoute } from 'astro';
import Stripe from 'stripe';

export const POST: APIRoute = async ({ request }) => {
  const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY as string);

  try {
    const { items, billing } = await request.json() as {
      items: Array<{ price: number; qty: number; name: string }>;
      billing?: {
        name: string;
        lastName: string;
        email: string;
        country: string;
        address: string;
        phone: string;
      };
    };

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ error: 'No items' }), { status: 400 });
    }

    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const total = Math.round(subtotal * 1.18 * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'pen',
      automatic_payment_methods: { enabled: true },
      receipt_email: billing?.email ?? undefined,
      metadata: {
        source: 'pycmar-web',
        items: JSON.stringify(items.map(i => `${i.qty}kg ${i.name}`).join(', ')).slice(0, 500),
        billing_name: billing?.name ?? '',
        billing_last_name: billing?.lastName ?? '',
        billing_email: billing?.email ?? '',
        billing_country: billing?.country ?? '',
        billing_address: billing?.address ?? '',
        billing_phone: billing?.phone ?? '',
      },
    });

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno';
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
};
