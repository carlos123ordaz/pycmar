import type { APIRoute } from 'astro';
import Stripe from 'stripe';

export const POST: APIRoute = async ({ request }) => {
  const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY as string);

  try {
    const { items } = await request.json();
    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ error: 'No items' }), { status: 400 });
    }

    const subtotal = items.reduce((s: number, i: { price: number; qty: number }) => s + i.price * i.qty, 0);
    const total = Math.round(subtotal * 1.18 * 100); // centimos de PEN

    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'pen',
      automatic_payment_methods: { enabled: true },
      metadata: {
        source: 'pycmar-web',
        items: JSON.stringify(items.map((i: { qty: number; name: string }) => `${i.qty}kg ${i.name}`).join(', ')).slice(0, 500),
      },
    });

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno';
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
};
