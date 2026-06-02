import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmation } from '../../../lib/email';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { billing, items, paymentMethod, voucherUrl } = body as {
      billing: {
        name: string;
        lastName: string;
        country: string;
        email: string;
        address: string;
        phone: string;
      };
      items: Array<{ id: string; name: string; price: number; qty: number }>;
      paymentMethod: 'yape' | 'transfer' | 'contraentrega';
      voucherUrl: string | null;
    };

    const needsVoucher = paymentMethod !== 'contraentrega';
    if (!billing?.name || !billing?.email || !items?.length || (needsVoucher && !voucherUrl)) {
      return new Response(JSON.stringify({ error: 'Datos incompletos' }), { status: 400 });
    }

    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const totalCents = Math.round(subtotal * 1.18 * 100);

    const supabase = createClient(
      import.meta.env.PUBLIC_SUPABASE_URL as string,
      import.meta.env.SUPABASE_SERVICE_ROLE_KEY as string,
    );

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        payment_method: paymentMethod,
        status: 'pending_payment',
        amount: totalCents,
        currency: 'pen',
        customer_email: billing.email,
        items,
        voucher_url: voucherUrl,
        billing_name: billing.name,
        billing_last_name: billing.lastName,
        billing_country: billing.country,
        billing_email: billing.email,
        billing_address: billing.address,
        billing_phone: billing.phone,
      })
      .select('id')
      .single();

    if (orderError) {
      console.error('Order insert error:', orderError);
      return new Response(JSON.stringify({ error: 'No se pudo guardar el pedido' }), { status: 500 });
    }

    // Send confirmation email (non-blocking — don't fail the order if email fails)
    sendOrderConfirmation({
      orderId: order.id,
      billing,
      items,
      paymentMethod,
      totalCents,
    }).catch(err => console.error('Email send error:', err));

    return new Response(JSON.stringify({ orderId: order.id }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno';
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
};
