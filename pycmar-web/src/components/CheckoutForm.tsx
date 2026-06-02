import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  mode: 'buy' | 'quote';
}

const stripePromise = loadStripe(import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

const T = {
  es: {
    order:      'Tu pedido',
    igv:        'IGV (18%)',
    total:      'Total a pagar',
    pay:        'Pagar ahora',
    processing: 'Procesando…',
    secure:     'Pago seguro con cifrado SSL',
    back:       'Volver al carrito',
    empty:      'Tu carrito de compra está vacío.',
    go_catalog: 'Ir al catálogo',
    loading:    'Preparando el pago…',
    per_kg:     'kg',
  },
  en: {
    order:      'Your order',
    igv:        'Tax (18%)',
    total:      'Total',
    pay:        'Pay now',
    processing: 'Processing…',
    secure:     'Secure SSL payment',
    back:       'Back to cart',
    empty:      'Your cart is empty.',
    go_catalog: 'Browse catalog',
    loading:    'Preparing payment…',
    per_kg:     'kg',
  },
  zh: {
    order:      '您的订单',
    igv:        '税 (18%)',
    total:      '总计',
    pay:        '立即支付',
    processing: '处理中…',
    secure:     'SSL 安全支付',
    back:       '返回购物车',
    empty:      '您的购物车是空的。',
    go_catalog: '浏览目录',
    loading:    '准备付款…',
    per_kg:     '千克',
  },
};

/* ---- Inner payment form (needs Stripe context) ---- */
function PaymentForm({ items, lang, subtotal }: { items: CartItem[]; lang: string; subtotal: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = T[lang as keyof typeof T] ?? T.es;

  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    const { error: stripeErr } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (stripeErr) {
      setError(stripeErr.message ?? 'Error al procesar el pago');
      setLoading(false);
    }
    // On success Stripe redirects automatically → no need to setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
      {/* Right col: payment */}
      <div className="co-right">
        <h2 className="co-section-title">Datos de pago</h2>
        <PaymentElement options={{ layout: 'tabs' }} />

        {error && (
          <div className="co-error">{error}</div>
        )}

        <button
          type="submit"
          className="btn btn-accent btn-block co-pay-btn"
          disabled={loading || !stripe || !elements}
        >
          {loading ? (
            <>
              <span className="co-spinner" />
              {t.processing}
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              {t.pay} · S/ {total.toFixed(2)}
            </>
          )}
        </button>

        <p className="co-secure">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          {t.secure}
        </p>
      </div>

      {/* Summary col */}
      <div className="co-left">
        <h2 className="co-section-title">{t.order}</h2>
        <div className="co-items">
          {items.map(item => (
            <div key={item.id} className="co-item">
              <div className="co-item-info">
                <span className="co-item-name">{item.name}</span>
                <span className="co-item-qty">{item.qty} {t.per_kg}</span>
              </div>
              <span className="co-item-price">S/ {(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="co-totals">
          <div className="co-total-row">
            <span>Subtotal</span>
            <span>S/ {subtotal.toFixed(2)}</span>
          </div>
          <div className="co-total-row co-igv">
            <span>{t.igv}</span>
            <span>S/ {igv.toFixed(2)}</span>
          </div>
          <div className="co-total-row co-grand">
            <span>{t.total}</span>
            <span>S/ {total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </form>
  );
}

/* ---- Main checkout component ---- */
export default function CheckoutForm({ lang = 'es' }: { lang?: string }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const t = T[lang as keyof typeof T] ?? T.es;

  useEffect(() => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem('pycmar_cart') || '[]');
    const buyItems = cart.filter(i => i.mode === 'buy');
    setItems(buyItems);

    if (buyItems.length === 0) return;

    fetch('/api/stripe/payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: buyItems }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setApiError(data.error); return; }
        setClientSecret(data.clientSecret);
      })
      .catch(() => setApiError('No se pudo conectar con el servicio de pagos.'));
  }, []);

  if (items.length === 0 && !clientSecret) {
    return (
      <div className="co-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        <p>{t.empty}</p>
        <a href="/catalogo" className="btn btn-accent">{t.go_catalog}</a>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="co-empty">
        <p style={{ color: '#ef4444', fontWeight: 600 }}>{apiError}</p>
        <a href="/catalogo" className="btn btn-outline" style={{ marginTop: 16 }}>← {t.back}</a>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="co-loading">
        <div className="co-spinner" />
        <span>{t.loading}</span>
      </div>
    );
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#10B981',
            colorBackground: '#ffffff',
            colorText: '#0B1F3B',
            colorDanger: '#ef4444',
            fontFamily: '"Hanken Grotesk", -apple-system, sans-serif',
            borderRadius: '9px',
            spacingUnit: '5px',
          },
        },
      }}
    >
      <div className="co-grid">
        <PaymentForm items={items} lang={lang} subtotal={subtotal} />
      </div>
    </Elements>
  );
}
