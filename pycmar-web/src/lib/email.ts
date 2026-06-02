import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY as string);

interface OrderEmailParams {
  orderId: string;
  billing: {
    name: string;
    lastName: string;
    email: string;
    country: string;
    address: string;
    phone: string;
  };
  items: Array<{ name: string; qty: number; price: number }>;
  paymentMethod: 'stripe' | 'yape' | 'transfer';
  totalCents: number;
}

const METHOD_LABEL: Record<string, string> = {
  stripe: 'Tarjeta / Stripe',
  yape: 'Yape',
  transfer: 'Transferencia bancaria',
};

export async function sendOrderConfirmation(p: OrderEmailParams) {
  const total = (p.totalCents / 100).toFixed(2);
  const isPending = p.paymentMethod !== 'stripe';
  const statusText = isPending
    ? '⏳ Pendiente de verificación de pago'
    : '✅ Pago confirmado';

  const itemsHtml = p.items
    .map(
      i =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #e4e9f0">${i.name}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e4e9f0;text-align:center">${i.qty} kg</td>
          <td style="padding:8px 0;border-bottom:1px solid #e4e9f0;text-align:right">S/ ${(i.price * i.qty).toFixed(2)}</td>
        </tr>`,
    )
    .join('');

  const pendingNote = isPending
    ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 16px;margin:20px 0;font-size:14px;color:#92400e">
        <strong>Próximo paso:</strong> Nuestro equipo verificará tu comprobante de pago y confirmará tu pedido en un plazo de 24 horas.
      </div>`
    : '';

  await resend.emails.send({
    from: import.meta.env.RESEND_FROM as string,
    to: p.billing.email,
    subject: `Pedido recibido #${p.orderId.replace(/-/g, '').slice(0, 8).toUpperCase()} — Pycmar`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:40px 20px">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e4e9f0;overflow:hidden">

      <!-- Header -->
      <tr>
        <td style="background:#0B1F3B;padding:24px 32px">
          <span style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-.02em">🐟 Pycmar</span>
        </td>
      </tr>

      <!-- Body -->
      <tr><td style="padding:32px">
        <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#0B1F3B">¡Pedido recibido!</h1>
        <p style="margin:0 0 20px;color:#6B7280;font-size:15px">
          Hola ${p.billing.name}, gracias por tu pedido.
        </p>

        <div style="background:#f5f7fa;border-radius:8px;padding:12px 16px;margin-bottom:20px;font-size:13px;color:#6B7280">
          <strong style="color:#0B1F3B">N.° de pedido:</strong> <span style="font-family:monospace;font-size:15px;font-weight:800;color:#0B1F3B;letter-spacing:.08em">#${p.orderId.replace(/-/g, '').slice(0, 8).toUpperCase()}</span><br>
          <strong style="color:#0B1F3B">Estado:</strong> ${statusText}<br>
          <strong style="color:#0B1F3B">Método de pago:</strong> ${METHOD_LABEL[p.paymentMethod] ?? p.paymentMethod}
        </div>

        ${pendingNote}

        <!-- Items -->
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#0B1F3B">
          <tr style="border-bottom:2px solid #0B1F3B">
            <th style="padding-bottom:8px;text-align:left;font-weight:700">Producto</th>
            <th style="padding-bottom:8px;text-align:center;font-weight:700">Cant.</th>
            <th style="padding-bottom:8px;text-align:right;font-weight:700">Subtotal</th>
          </tr>
          ${itemsHtml}
        </table>

        <div style="margin-top:16px;border-top:2px solid #0B1F3B;padding-top:12px;text-align:right;font-size:16px;font-weight:800;color:#0B1F3B">
          Total: S/ ${total}
        </div>

        <!-- Billing -->
        <div style="margin-top:24px;background:#f5f7fa;border-radius:8px;padding:14px 16px;font-size:13px;color:#6B7280">
          <strong style="color:#0B1F3B;display:block;margin-bottom:6px">Datos de facturación</strong>
          ${p.billing.name} ${p.billing.lastName}<br>
          ${p.billing.email} · ${p.billing.phone}<br>
          ${p.billing.address}, ${p.billing.country}
        </div>

      </td></tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f5f7fa;padding:20px 32px;font-size:12px;color:#9aa3b0;text-align:center">
          © Pycmar — Exportadores de productos del mar peruanos
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`,
  });
}
