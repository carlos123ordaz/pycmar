import { useState, useCallback, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createClient } from '@supabase/supabase-js';

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  mode: 'buy' | 'quote';
}

interface BillingInfo {
  name: string;
  lastName: string;
  country: string;
  email: string;
  address: string;
  phone: string;
}

type PaymentMethod = 'stripe' | 'yape' | 'transfer' | 'contraentrega';

const stripePromise = loadStripe(import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL as string,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string,
);

const STRIPE_APPEARANCE = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#25C7CA',
    colorBackground: '#ffffff',
    colorText: '#0B1F3B',
    colorDanger: '#ef4444',
    fontFamily: '"Hanken Grotesk", -apple-system, sans-serif',
    borderRadius: '9px',
    spacingUnit: '5px',
  },
};

const WHATSAPP = (import.meta.env.PUBLIC_WHATSAPP_NUMBER as string) ?? '51999999999';

/* ──────────────────────────────────────────────
   Translations
────────────────────────────────────────────── */
const CHECKOUT_T = {
  es: {
    sectionBilling: 'Detalles de facturación',
    name: 'Nombre', lastName: 'Apellido', email: 'Correo electrónico',
    phone: 'Teléfono', address: 'Dirección', country: 'País',
    namePh: 'Juan', lastNamePh: 'Pérez', emailPh: 'juan@empresa.com',
    phonePh: '+51 999 999 999', addressPh: 'Av. Principal 123, Lima', countryPh: 'Perú',
    required: 'Requerido', emailInvalid: 'Email inválido',
    sectionSummary: 'Resumen del pedido',
    subtotal: 'Subtotal', igv: 'IGV (18%)', total: 'Total', kg: 'kg',
    sectionPayment: 'Método de pago', tabTransfer: 'Transferencia', tabCod: 'Contraentrega',
    codTotal: 'Total a pagar',
    codNote: 'Pagarás en efectivo al momento de recibir tu pedido. Nuestro equipo coordinará la entrega contigo.',
    codConfirm: 'Confirmar pedido',
    codPending: 'El pago se realiza al recibir el pedido',
    stripeLoading: 'Preparando formulario de pago…',
    stripePay: 'Pagar', stripeSecure: 'Pago seguro cifrado SSL · Stripe',
    processing: 'Procesando…',
    fillBillingFirst: 'Completa los datos de facturación antes de pagar.',
    yapeNumber: 'Número Yape', yapeAmount: 'Monto a transferir',
    yapeNote: 'Envía el pago al número indicado y adjunta el comprobante.',
    bank: 'Banco', account: 'N.° de cuenta', cci: 'CCI (interbancario)',
    exactAmount: 'Monto exacto',
    transferNote: 'Realiza la transferencia y adjunta el voucher como comprobante.',
    voucherLabel: 'Comprobante de pago', voucherUpload: 'Haz clic para subir imagen o PDF',
    voucherRequired: 'El comprobante de pago es obligatorio.',
    submitting: 'Enviando pedido…', confirmOrder: 'Confirmar pedido',
    pendingNote: 'Tu pedido quedará pendiente hasta verificar el comprobante',
    fillBilling: 'Completa los datos de facturación.',
    uploadError: 'No se pudo subir el comprobante: ',
    emptyCart: 'Tu carrito de compra está vacío.', toCatalog: 'Ir al catálogo',
    successHeading: '¡Pedido enviado!',
    successSub: 'Tu pedido fue registrado. Revisaremos tu comprobante y te confirmaremos por correo en un plazo de 24 horas.',
    backCatalog: 'Volver al catálogo',
    noEmail: '¿No llegó el correo de confirmación?', contactWa: 'Contáctanos por WhatsApp',
  },
  en: {
    sectionBilling: 'Billing details',
    name: 'First name', lastName: 'Last name', email: 'Email',
    phone: 'Phone', address: 'Address', country: 'Country',
    namePh: 'John', lastNamePh: 'Doe', emailPh: 'john@company.com',
    phonePh: '+1 555 000 0000', addressPh: '123 Main St, City', countryPh: 'United States',
    required: 'Required', emailInvalid: 'Invalid email',
    sectionSummary: 'Order summary',
    subtotal: 'Subtotal', igv: 'Tax (18%)', total: 'Total', kg: 'kg',
    sectionPayment: 'Payment method', tabTransfer: 'Bank transfer', tabCod: 'Cash on delivery',
    codTotal: 'Total to pay',
    codNote: 'You will pay in cash when your order is delivered. Our team will coordinate the delivery with you.',
    codConfirm: 'Confirm order',
    codPending: 'Payment is collected upon delivery',
    stripeLoading: 'Preparing payment form…',
    stripePay: 'Pay', stripeSecure: 'Secure SSL payment · Stripe',
    processing: 'Processing…',
    fillBillingFirst: 'Please complete your billing details before paying.',
    yapeNumber: 'Yape number', yapeAmount: 'Amount to send',
    yapeNote: 'Send payment to the number above and attach the receipt.',
    bank: 'Bank', account: 'Account number', cci: 'Interbank code (CCI)',
    exactAmount: 'Exact amount',
    transferNote: 'Make the transfer and attach the voucher as proof.',
    voucherLabel: 'Payment receipt', voucherUpload: 'Click to upload image or PDF',
    voucherRequired: 'Payment receipt is required.',
    submitting: 'Sending order…', confirmOrder: 'Confirm order',
    pendingNote: 'Your order will be pending until we verify your receipt',
    fillBilling: 'Please complete your billing details.',
    uploadError: 'Could not upload receipt: ',
    emptyCart: 'Your cart is empty.', toCatalog: 'Browse catalog',
    successHeading: 'Order submitted!',
    successSub: 'Your order has been registered. We will review your receipt and confirm by email within 24 hours.',
    backCatalog: 'Back to catalog',
    noEmail: "Didn't receive the confirmation email?", contactWa: 'Contact us on WhatsApp',
  },
  zh: {
    sectionBilling: '账单详情',
    name: '名字', lastName: '姓氏', email: '电子邮件',
    phone: '电话', address: '地址', country: '国家',
    namePh: '张', lastNamePh: '伟', emailPh: 'zhang@company.com',
    phonePh: '+86 xxx xxxx xxxx', addressPh: '北京市朝阳区xxx路', countryPh: '中国',
    required: '必填', emailInvalid: '邮件格式无效',
    sectionSummary: '订单摘要',
    subtotal: '小计', igv: '税 (18%)', total: '总计', kg: '千克',
    sectionPayment: '支付方式', tabTransfer: '银行转账', tabCod: '货到付款',
    codTotal: '应付总额',
    codNote: '您将在收到货物时以现金付款。我们的团队将与您协调送货事宜。',
    codConfirm: '确认订单',
    codPending: '货到付款',
    stripeLoading: '准备支付表单…',
    stripePay: '支付', stripeSecure: 'Stripe SSL 安全支付',
    processing: '处理中…',
    fillBillingFirst: '请先填写账单信息。',
    yapeNumber: 'Yape 号码', yapeAmount: '转账金额',
    yapeNote: '发送付款至上述号码并上传收据。',
    bank: '银行', account: '账号', cci: '联行号',
    exactAmount: '精确金额',
    transferNote: '完成转账后请上传汇款凭证。',
    voucherLabel: '付款凭证', voucherUpload: '点击上传图片或PDF',
    voucherRequired: '付款凭证为必填项。',
    submitting: '提交订单中…', confirmOrder: '确认订单',
    pendingNote: '您的订单将在我们验证凭证后生效',
    fillBilling: '请填写账单信息。',
    uploadError: '无法上传凭证：',
    emptyCart: '您的购物车是空的。', toCatalog: '浏览目录',
    successHeading: '订单已提交！',
    successSub: '您的订单已登记。我们将在24小时内审核凭证并通过电子邮件确认。',
    backCatalog: '返回目录',
    noEmail: '未收到确认邮件？', contactWa: '通过 WhatsApp 联系我们',
  },
} as const;

type CT = typeof CHECKOUT_T.es;

function shortCode(id: string) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

function validateBilling(b: BillingInfo): Partial<Record<keyof BillingInfo, string>> {
  const e: Partial<Record<keyof BillingInfo, string>> = {};
  if (!b.name.trim()) e.name = 'Requerido';
  if (!b.lastName.trim()) e.lastName = 'Requerido';
  if (!b.country.trim()) e.country = 'Requerido';
  if (!b.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(b.email)) e.email = 'Email inválido';
  if (!b.address.trim()) e.address = 'Requerido';
  if (!b.phone.trim()) e.phone = 'Requerido';
  return e;
}

/* ──────────────────────────────────────────────
   Stripe inner form (requires Elements context)
────────────────────────────────────────────── */
function StripeInner({
  billing,
  subtotal,
  onBillingError,
  t,
}: {
  billing: BillingInfo;
  subtotal: number;
  onBillingError: () => void;
  t: CT;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = subtotal * 1.18;

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    const errs = validateBilling(billing);
    if (Object.keys(errs).length) {
      onBillingError();
      setError(t.fillBillingFirst);
      return;
    }
    setLoading(true);
    setError(null);
    const { error: stripeErr } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
        payment_method_data: {
          billing_details: {
            name: `${billing.name} ${billing.lastName}`,
            email: billing.email,
            phone: billing.phone,
            address: { line1: billing.address, country: billing.country.slice(0, 2).toUpperCase() },
          },
        },
      },
    });
    if (stripeErr) {
      setError(stripeErr.message ?? 'Error');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handlePay} style={{ marginTop: 16 }}>
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && <div className="co-error" style={{ marginTop: 12 }}>{error}</div>}
      <button type="submit" className="co-pay-btn" style={{ marginTop: 16 }} disabled={loading || !stripe || !elements}>
        {loading ? (
          <><span className="co-spinner" />{t.processing}</>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            {t.stripePay} S/ {total.toFixed(2)}
          </>
        )}
      </button>
      <p className="co-secure" style={{ marginTop: 10 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        {t.stripeSecure}
      </p>
    </form>
  );
}

/* ──────────────────────────────────────────────
   Yape / Transferencia form
────────────────────────────────────────────── */
function ManualPaymentForm({
  method,
  billing,
  items,
  subtotal,
  onSuccess,
  onBillingError,
  t,
}: {
  method: 'yape' | 'transfer';
  billing: BillingInfo;
  items: CartItem[];
  subtotal: number;
  onSuccess: (orderId: string) => void;
  onBillingError: () => void;
  t: CT;
}) {
  const [voucher, setVoucher] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const yapeNumber = (import.meta.env.PUBLIC_YAPE_NUMBER as string) ?? '999 999 999';
  const bankName = (import.meta.env.PUBLIC_BANK_NAME as string) ?? 'BCP';
  const bankAccount = (import.meta.env.PUBLIC_BANK_ACCOUNT as string) ?? '—';
  const bankCCI = (import.meta.env.PUBLIC_BANK_CCI as string) ?? '—';
  const total = subtotal * 1.18;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setVoucher(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateBilling(billing);
    if (Object.keys(errs).length) {
      onBillingError();
      setError(t.fillBilling);
      return;
    }
    if (!voucher) {
      setError(t.voucherRequired);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const ext = voucher.name.split('.').pop() ?? 'jpg';
      const filename = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('vouchers')
        .upload(filename, voucher, { contentType: voucher.type });
      if (uploadErr) throw new Error(t.uploadError + uploadErr.message);
      const { data: { publicUrl } } = supabase.storage.from('vouchers').getPublicUrl(filename);

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billing, items, paymentMethod: method, voucherUrl: publicUrl }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? 'Error');

      const cart = JSON.parse(localStorage.getItem('pycmar_cart') || '[]');
      localStorage.setItem('pycmar_cart', JSON.stringify(cart.filter((i: CartItem) => i.mode === 'quote')));
      document.dispatchEvent(new CustomEvent('cart-updated'));
      onSuccess(data.orderId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
      {method === 'yape' ? (
        <div className="co-payment-info">
          <div className="co-info-row">
            <span className="co-info-label">{t.yapeNumber}</span>
            <span className="co-info-value">+51 {yapeNumber}</span>
          </div>
          <div className="co-info-row">
            <span className="co-info-label">{t.yapeAmount}</span>
            <span className="co-info-value co-info-amount">S/ {total.toFixed(2)}</span>
          </div>
          <p className="co-info-note">{t.yapeNote}</p>
        </div>
      ) : (
        <div className="co-payment-info">
          <div className="co-info-row">
            <span className="co-info-label">{t.bank}</span>
            <span className="co-info-value">{bankName}</span>
          </div>
          <div className="co-info-row">
            <span className="co-info-label">{t.account}</span>
            <span className="co-info-value co-info-mono">{bankAccount}</span>
          </div>
          <div className="co-info-row">
            <span className="co-info-label">{t.cci}</span>
            <span className="co-info-value co-info-mono">{bankCCI}</span>
          </div>
          <div className="co-info-row">
            <span className="co-info-label">{t.exactAmount}</span>
            <span className="co-info-value co-info-amount">S/ {total.toFixed(2)}</span>
          </div>
          <p className="co-info-note">{t.transferNote}</p>
        </div>
      )}

      <div className="co-field" style={{ marginTop: 14 }}>
        <label className="co-label">
          {t.voucherLabel} <span className="co-required">*</span>
        </label>
        <label className="co-upload-area">
          <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} style={{ display: 'none' }} />
          {preview ? (
            <img src={preview} alt="preview" className="co-upload-preview" />
          ) : (
            <div className="co-upload-placeholder">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span>{voucher ? voucher.name : t.voucherUpload}</span>
            </div>
          )}
        </label>
      </div>

      {error && <div className="co-error" style={{ marginTop: 10 }}>{error}</div>}

      <button type="submit" className="co-pay-btn" style={{ marginTop: 14 }} disabled={loading}>
        {loading ? (
          <><span className="co-spinner" />{t.submitting}</>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {t.confirmOrder} · S/ {total.toFixed(2)}
          </>
        )}
      </button>
      <p className="co-secure" style={{ marginTop: 10 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        {t.pendingNote}
      </p>
    </form>
  );
}

/* ──────────────────────────────────────────────
   Resumen del pedido
────────────────────────────────────────────── */
function OrderSummary({ items, t }: { items: CartItem[]; t: CT }) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;
  return (
    <div className="co-card">
      <h2 className="co-section-title">{t.sectionSummary}</h2>
      <div className="co-items">
        {items.map(item => (
          <div key={item.id} className="co-item">
            <div className="co-item-info">
              <span className="co-item-name">{item.name}</span>
              <span className="co-item-qty">{item.qty} {t.kg}</span>
            </div>
            <span className="co-item-price">S/ {(item.price * item.qty).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="co-totals">
        <div className="co-total-row"><span>{t.subtotal}</span><span>S/ {subtotal.toFixed(2)}</span></div>
        <div className="co-total-row co-igv"><span>{t.igv}</span><span>S/ {igv.toFixed(2)}</span></div>
        <div className="co-total-row co-grand"><span>{t.total}</span><span>S/ {total.toFixed(2)}</span></div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Formulario de facturación
────────────────────────────────────────────── */
function BillingForm({
  billing,
  onChange,
  errors,
  formRef,
  t,
}: {
  billing: BillingInfo;
  onChange: (field: keyof BillingInfo, value: string) => void;
  errors: Partial<Record<keyof BillingInfo, string>>;
  formRef?: React.RefObject<HTMLDivElement | null>;
  t: CT;
}) {
  const field = (id: keyof BillingInfo, label: string, type = 'text', placeholder = '') => (
    <div className="co-field">
      <label className="co-label" htmlFor={id}>
        {label} <span className="co-required">*</span>
      </label>
      <input
        id={id}
        type={type}
        value={billing[id]}
        onChange={e => onChange(id, e.target.value)}
        placeholder={placeholder}
        className={`co-input${errors[id] ? ' co-input--error' : ''}`}
      />
      {errors[id] && <span className="co-field-error">{errors[id]}</span>}
    </div>
  );

  return (
    <div className="co-left co-card" ref={formRef}>
      <h2 className="co-section-title">{t.sectionBilling}</h2>
      <div className="co-fields-grid">
        {field('name', t.name, 'text', t.namePh)}
        {field('lastName', t.lastName, 'text', t.lastNamePh)}
      </div>
      {field('email', t.email, 'email', t.emailPh)}
      {field('phone', t.phone, 'tel', t.phonePh)}
      {field('address', t.address, 'text', t.addressPh)}
      {field('country', t.country, 'text', t.countryPh)}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Contraentrega form
────────────────────────────────────────────── */
function CodForm({
  billing,
  items,
  subtotal,
  onSuccess,
  onBillingError,
  t,
}: {
  billing: BillingInfo;
  items: CartItem[];
  subtotal: number;
  onSuccess: (orderId: string) => void;
  onBillingError: () => void;
  t: CT;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const total = subtotal * 1.18;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateBilling(billing);
    if (Object.keys(errs).length) { onBillingError(); setError(t.fillBilling); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billing, items, paymentMethod: 'contraentrega', voucherUrl: null }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? 'Error');
      const cart = JSON.parse(localStorage.getItem('pycmar_cart') || '[]');
      localStorage.setItem('pycmar_cart', JSON.stringify(cart.filter((i: CartItem) => i.mode === 'quote')));
      document.dispatchEvent(new CustomEvent('cart-updated'));
      onSuccess(data.orderId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
      <div className="co-payment-info">
        <div className="co-info-row">
          <span className="co-info-label">{t.codTotal}</span>
          <span className="co-info-value co-info-amount">S/ {total.toFixed(2)}</span>
        </div>
        <p className="co-info-note" style={{ marginTop: 4 }}>{t.codNote}</p>
      </div>
      {error && <div className="co-error" style={{ marginTop: 10 }}>{error}</div>}
      <button type="submit" className="co-pay-btn" style={{ marginTop: 14 }} disabled={loading}>
        {loading ? (
          <><span className="co-spinner" />{t.submitting}</>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            {t.codConfirm} · S/ {total.toFixed(2)}
          </>
        )}
      </button>
      <p className="co-secure" style={{ marginTop: 10 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        {t.codPending}
      </p>
    </form>
  );
}

/* ──────────────────────────────────────────────
   Main checkout component
────────────────────────────────────────────── */
export default function CheckoutForm({ lang = 'es' }: { lang?: string }) {
  const t: CT = CHECKOUT_T[(lang as keyof typeof CHECKOUT_T)] ?? CHECKOUT_T.es;

  const [mounted, setMounted] = useState(false);
  const [items] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const cart: CartItem[] = JSON.parse(localStorage.getItem('pycmar_cart') || '[]');
    return cart.filter(i => i.mode === 'buy');
  });

  useEffect(() => { setMounted(true); }, []);

  const [billing, setBilling] = useState<BillingInfo>({
    name: '', lastName: '', country: '', email: '', address: '', phone: '',
  });
  const [billingErrors, setBillingErrors] = useState<Partial<Record<keyof BillingInfo, string>>>({});
  const billingRef = typeof window !== 'undefined'
    ? { current: null as HTMLDivElement | null }
    : { current: null };

  const [method, setMethod] = useState<PaymentMethod>('stripe');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  // Auto-create Stripe payment intent when Stripe tab is active
  useEffect(() => {
    if (method !== 'stripe' || clientSecret || stripeLoading || items.length === 0) return;
    let active = true;
    setStripeLoading(true);
    setStripeError(null);
    fetch('/api/stripe/payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    })
      .then(r => r.json())
      .then(d => { if (active) { if (d.error) setStripeError(d.error); else setClientSecret(d.clientSecret); } })
      .catch(err => { if (active) setStripeError(err instanceof Error ? err.message : 'Error'); })
      .finally(() => { if (active) setStripeLoading(false); });
    return () => { active = false; };
  }, [method, items.length]);

  const handleBillingChange = useCallback((field: keyof BillingInfo, value: string) => {
    setBilling(prev => ({ ...prev, [field]: value }));
    setBillingErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  function handleBillingError() {
    const errs = validateBilling(billing);
    setBillingErrors(errs);
    billingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function switchMethod(m: PaymentMethod) {
    setMethod(m);
    if (m !== 'stripe') setClientSecret(null);
  }

  if (!mounted) {
    return (
      <div className="co-loading" style={{ justifyContent: 'center', padding: '80px 24px' }}>
        <div className="co-spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
      </div>
    );
  }

  if (items.length === 0 && !successOrderId) {
    return (
      <div className="co-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        <p>{t.emptyCart}</p>
        <a href="/catalogo" className="btn btn-accent">{t.toCatalog}</a>
      </div>
    );
  }

  if (successOrderId) {
    const code = shortCode(successOrderId);
    const waMsg = encodeURIComponent(`Hola, completé mi pedido #${code} y no recibí el correo de confirmación.`);
    return (
      <div className="co-success-card">
        <div className="co-success-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 className="co-success-heading">{t.successHeading}</h2>
        <p className="co-success-sub">{t.successSub}</p>
        <div className="co-order-ref">Pedido #{code}</div>
        <a href="/catalogo" className="co-pay-btn" style={{ display: 'inline-flex', textDecoration: 'none' }}>
          {t.backCatalog}
        </a>
        <p className="co-wa-note">
          {t.noEmail}{' '}
          <a href={`https://wa.me/${WHATSAPP}?text=${waMsg}`} target="_blank" rel="noopener" className="co-wa-link">
            {t.contactWa}
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="co-grid">
      {/* LEFT: billing form */}
      <BillingForm
        billing={billing}
        onChange={handleBillingChange}
        errors={billingErrors}
        formRef={billingRef as React.RefObject<HTMLDivElement>}
        t={t}
      />

      {/* RIGHT: summary + payment methods */}
      <div className="co-right-stack">
        <OrderSummary items={items} t={t} />

        <div className="co-card">
          <h2 className="co-section-title">{t.sectionPayment}</h2>

          <div className="co-method-tabs">
            {(['stripe', 'yape', 'transfer', 'contraentrega'] as PaymentMethod[]).map(m => (
              <button
                key={m}
                type="button"
                className={`co-method-tab${method === m ? ' co-method-tab--active' : ''}`}
                onClick={() => switchMethod(m)}
              >
                {m === 'stripe' && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                )}
                {m === 'yape' && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2"/>
                    <circle cx="12" cy="17" r=".5" fill="currentColor" stroke="none"/>
                    <path d="M15 8.5c.8.8 1 1.9 1 3s-.2 2.2-1 3"/>
                    <path d="M17.5 6c1.5 1.5 2 3.4 2 6s-.5 4.5-2 6"/>
                  </svg>
                )}
                {m === 'transfer' && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 10h2M6 14h2"/>
                  </svg>
                )}
                {m === 'contraentrega' && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/>
                    <rect x="9" y="11" width="14" height="10" rx="1"/>
                    <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  </svg>
                )}
                {m === 'stripe' ? 'Stripe' : m === 'yape' ? 'Yape' : m === 'transfer' ? t.tabTransfer : t.tabCod}
              </button>
            ))}
          </div>

          {/* Stripe tab */}
          {method === 'stripe' && (
            <>
              {stripeLoading && (
                <div className="co-loading" style={{ padding: '24px 0' }}>
                  <div className="co-spinner" />
                  <span>{t.stripeLoading}</span>
                </div>
              )}
              {stripeError && <div className="co-error" style={{ marginTop: 12 }}>{stripeError}</div>}
              {clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: STRIPE_APPEARANCE }}>
                  <StripeInner
                    billing={billing}
                    subtotal={subtotal}
                    onBillingError={handleBillingError}
                    t={t}
                  />
                </Elements>
              )}
            </>
          )}

          {/* Yape / Transfer tab */}
          {(method === 'yape' || method === 'transfer') && (
            <ManualPaymentForm
              method={method}
              billing={billing}
              items={items}
              subtotal={subtotal}
              onSuccess={setSuccessOrderId}
              onBillingError={handleBillingError}
              t={t}
            />
          )}

          {/* Contraentrega tab */}
          {method === 'contraentrega' && (
            <CodForm
              billing={billing}
              items={items}
              subtotal={subtotal}
              onSuccess={setSuccessOrderId}
              onBillingError={handleBillingError}
              t={t}
            />
          )}
        </div>
      </div>
    </div>
  );
}
