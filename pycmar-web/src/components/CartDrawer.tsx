import { useState, useEffect } from 'react';
import type { Lang } from '../lib/i18n';

interface CartItem {
  id: string;
  name: string;
  sci?: string;
  price: number;
  qty: number;
  mode: 'buy' | 'quote';
}

interface Props {
  lang?: Lang;
}

const T: Record<string, Record<string, string>> = {
  title:           { es:'Tu selección',            en:'Your selection',           zh:'您的选择' },
  seg_buy:         { es:'Compra',                   en:'Buy',                      zh:'购买' },
  seg_quote:       { es:'Cotización',               en:'Quote',                    zh:'报价' },
  empty:           { es:'Aún no hay productos.',    en:'No products yet.',         zh:'尚无产品。' },
  catalog:         { es:'Explorar catálogo',        en:'Explore catalog',          zh:'浏览目录' },
  subtotal:        { es:'Subtotal',                 en:'Subtotal',                 zh:'小计' },
  checkout:        { es:'Ir a pagar',               en:'Go to checkout',           zh:'去结账' },
  continue:        { es:'Continuar comprando',      en:'Continue shopping',        zh:'继续购物' },
  quote_note:      { es:'Para volumen y exportación: arma tu lista y solicita precio FOB/CFR.',
                     en:'For volume & export: build your list and request FOB/CFR pricing.',
                     zh:'批量及出口订单：建立清单并申请FOB/CFR报价。' },
  req_quote:       { es:'Enviar solicitud de cotización', en:'Send quote request', zh:'发送报价请求' },
  whatsapp:        { es:'WhatsApp',                 en:'WhatsApp',                 zh:'WhatsApp' },
  remove:          { es:'Quitar',                   en:'Remove',                   zh:'删除' },
  quote_title:     { es:'Solicitar cotización',     en:'Request a quote',          zh:'申请报价' },
  products_label:  { es:'Productos a cotizar',      en:'Products to quote',        zh:'报价产品' },
  form_name:       { es:'Nombre y apellido',        en:'Full name',                zh:'姓名' },
  form_company:    { es:'Empresa',                  en:'Company',                  zh:'公司' },
  form_email:      { es:'Correo',                   en:'Email',                    zh:'电子邮件' },
  form_country:    { es:'País',                     en:'Country',                  zh:'国家' },
  form_type:       { es:'Tipo de cliente',          en:'Client type',              zh:'客户类型' },
  form_type_b2c:   { es:'Local / Minorista',        en:'Local / Retail',           zh:'本地 / 零售' },
  form_type_b2b:   { es:'Exportación / Mayorista',  en:'Export / Wholesale',       zh:'出口 / 批发' },
  form_message:    { es:'Mensaje',                  en:'Message',                  zh:'留言' },
  form_send:       { es:'Enviar solicitud',         en:'Send request',             zh:'发送请求' },
  quote_ok:        { es:'¡Solicitud enviada!',      en:'Request sent!',            zh:'请求已发送！' },
  quote_ok_sub:    { es:'Nuestro equipo comercial te contactará en menos de 24 h.',
                     en:'Our sales team will contact you within 24 h.',
                     zh:'我们的销售团队将在24小时内与您联系。' },
  close:           { es:'Cerrar',                   en:'Close',                    zh:'关闭' },
  dest_placeholder:{ es:'Destino, Incoterm, frecuencia…', en:'Destination, Incoterm, frequency…', zh:'目的地、贸易术语、频率…' },
};

const tl = (key: string, lang: Lang) => T[key]?.[lang] ?? T[key]?.['es'] ?? key;

/* ---- Quote Modal -------------------------------------------------------- */
function QuoteModal({ items, lang, close }: { items: CartItem[], lang: Lang, close: () => void }) {
  const quoteItems = items.filter(i => i.mode === 'quote');
  const [type, setType] = useState<'b2c'|'b2b'>('b2b');
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form));
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, items: quoteItems.map(i => `${i.qty}kg ${i.name}`).join(', ') }),
      });
    } catch {}
    setSent(true);
  };

  return (
    <div className="modal-ov" onClick={close}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {sent ? (
          <div className="success-state">
            <div className="success-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="38" height="38"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h3>{tl('quote_ok', lang)}</h3>
            <p>{tl('quote_ok_sub', lang)}</p>
            <button className="btn btn-navy" onClick={close}>{tl('close', lang)}</button>
          </div>
        ) : (
          <>
            <div className="modal-head">
              <h3>{tl('quote_title', lang)}</h3>
              <button className="icon-btn" onClick={close}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form className="modal-body" onSubmit={submit}>
              <div style={{ background: 'var(--mist)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
                <div style={{ fontSize: '.78rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: 8 }}>
                  {tl('products_label', lang)} ({quoteItems.length})
                </div>
                {quoteItems.map(i => (
                  <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.88rem', padding: '4px 0', gap: 12 }}>
                    <span>{i.name}</span><b style={{ whiteSpace: 'nowrap' }}>{i.qty} kg</b>
                  </div>
                ))}
              </div>
              <div className="field-row">
                <div className="field"><label>{tl('form_name', lang)} <span className="req">*</span></label><input name="nombre" required /></div>
                <div className="field"><label>{tl('form_company', lang)}</label><input name="empresa" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>{tl('form_email', lang)} <span className="req">*</span></label><input name="email" type="email" required /></div>
                <div className="field">
                  <label>{tl('form_country', lang)} <span className="req">*</span></label>
                  <select name="pais" required defaultValue="Perú">
                    {['Perú','China','Estados Unidos','España','Japón','Italia','Corea del Sur','Otro'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="field">
                <label>{tl('form_type', lang)}</label>
                <div className="seg-radio">
                  <label><input type="radio" name="tipo" checked={type === 'b2c'} onChange={() => setType('b2c')} /><span>{tl('form_type_b2c', lang)}</span></label>
                  <label><input type="radio" name="tipo" checked={type === 'b2b'} onChange={() => setType('b2b')} /><span>{tl('form_type_b2b', lang)}</span></label>
                </div>
              </div>
              <div className="field">
                <label>{tl('form_message', lang)}</label>
                <textarea name="mensaje" placeholder={tl('dest_placeholder', lang)}></textarea>
              </div>
              <button type="submit" className="btn btn-accent btn-block btn-lg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                {tl('form_send', lang)}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ---- Main CartDrawer --------------------------------------------------- */
export default function CartDrawer({ lang = 'es' }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [seg, setSeg] = useState<'buy'|'quote'>('buy');
  const [modal, setModal] = useState<'quote'|null>(null);

  const loadCart = () => {
    try { setItems(JSON.parse(localStorage.getItem('pycmar_cart') || '[]')); }
    catch { setItems([]); }
  };

  useEffect(() => {
    loadCart();
    const cartBtn = document.getElementById('cart-open-btn');
    const openHandler = () => setOpen(true);
    const openEvtHandler = () => setOpen(true);
    cartBtn?.addEventListener('click', openHandler);
    document.addEventListener('cart-updated', loadCart as EventListener);
    document.addEventListener('cart-open', openEvtHandler);
    return () => {
      cartBtn?.removeEventListener('click', openHandler);
      document.removeEventListener('cart-updated', loadCart as EventListener);
      document.removeEventListener('cart-open', openEvtHandler);
    };
  }, []);

  useEffect(() => {
    const buyItems = items.filter(i => i.mode === 'buy');
    const quoteItems = items.filter(i => i.mode === 'quote');
    const total = items.reduce((s, i) => s + i.qty, 0);
    const badge = document.getElementById('cart-count');
    if (badge) { badge.textContent = String(total); badge.style.display = total > 0 ? 'flex' : 'none'; }
    if (seg === 'buy' && buyItems.length === 0 && quoteItems.length > 0) setSeg('quote');
    if (seg === 'quote' && quoteItems.length === 0 && buyItems.length > 0) setSeg('buy');
  }, [items]);

  const updateQty = (id: string, mode: 'buy'|'quote', delta: number) => {
    const updated = items
      .map(i => i.id === id && i.mode === mode ? { ...i, qty: i.qty + delta } : i)
      .filter(i => i.qty > 0);
    setItems(updated);
    localStorage.setItem('pycmar_cart', JSON.stringify(updated));
    document.dispatchEvent(new CustomEvent('cart-updated'));
  };

  const removeItem = (id: string, mode: 'buy'|'quote') => {
    const updated = items.filter(i => !(i.id === id && i.mode === mode));
    setItems(updated);
    localStorage.setItem('pycmar_cart', JSON.stringify(updated));
    document.dispatchEvent(new CustomEvent('cart-updated'));
  };

  const buyItems = items.filter(i => i.mode === 'buy');
  const quoteItems = items.filter(i => i.mode === 'quote');
  const segItems = seg === 'buy' ? buyItems : quoteItems;
  const subtotal = buyItems.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <>
      {open && (
        <>
          <div className="overlay" onClick={() => setOpen(false)} />
          <aside className="drawer">
            {/* Head */}
            <div className="drawer-head">
              <h3>{tl('title', lang)}</h3>
              <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Cerrar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Segment tabs */}
            <div className="drawer-segs">
              <button className={`drawer-seg${seg === 'buy' ? ' on' : ''}`} onClick={() => setSeg('buy')}>
                {tl('seg_buy', lang)}
                {buyItems.length > 0 && <span className="b">{buyItems.length}</span>}
              </button>
              <button className={`drawer-seg${seg === 'quote' ? ' on' : ''}`} onClick={() => setSeg('quote')}>
                {tl('seg_quote', lang)}
                {quoteItems.length > 0 && <span className="b">{quoteItems.length}</span>}
              </button>
            </div>

            {/* Body */}
            <div className="drawer-body">
              {segItems.length === 0 ? (
                <div className="cart-empty">
                  <div className="ic">
                    {seg === 'buy' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="30" height="30">
                        <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 01-8 0"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="30" height="30">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                    )}
                  </div>
                  <p style={{ marginBottom: 18 }}>{tl('empty', lang)}</p>
                  <a href="/catalogo" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>
                    {tl('catalog', lang)}
                  </a>
                </div>
              ) : (
                segItems.map(item => (
                  <div key={item.id + item.mode} className="cart-item">
                    <div className="ci-img">
                      <div className="ph" style={{ height: '100%' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <path d="m21 15-5-5L5 21"/>
                        </svg>
                      </div>
                    </div>
                    <div className="ci-body">
                      <h4>{item.name}</h4>
                      {item.sci && item.sci !== 'Mix' && <div className="ci-sci">{item.sci}</div>}
                      <div className="ci-foot">
                        <div className="qty-sm">
                          <button onClick={() => updateQty(item.id, item.mode, -1)}>−</button>
                          <span>{item.qty}</span>
                          <button onClick={() => updateQty(item.id, item.mode, 1)}>+</button>
                        </div>
                        {item.mode === 'buy'
                          ? <span className="ci-price">S/ {(item.price * item.qty).toFixed(2)}</span>
                          : <span className="ci-price" style={{ fontSize: '.82rem', color: 'var(--gray)' }}>{item.qty} kg</span>
                        }
                      </div>
                      <button className="ci-remove" onClick={() => removeItem(item.id, item.mode)}>
                        {tl('remove', lang)}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {segItems.length > 0 && (
              <div className="drawer-foot">
                {seg === 'buy' ? (
                  <>
                    <div className="drawer-total">
                      <span style={{ fontWeight: 600, color: 'var(--gray)' }}>{tl('subtotal', lang)}</span>
                      <span className="v">S/ {subtotal.toFixed(2)}</span>
                    </div>
                    <a
                      href="/checkout"
                      className="btn btn-accent btn-block btn-lg"
                      onClick={() => setOpen(false)}
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 01-8 0"/>
                      </svg>
                      {tl('checkout', lang)}
                    </a>
                    <button
                      className="btn btn-outline btn-block btn-sm"
                      style={{ marginTop: 10 }}
                      onClick={() => setOpen(false)}
                    >
                      {tl('continue', lang)}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="muted" style={{ fontSize: '.86rem', marginBottom: 14 }}>{tl('quote_note', lang)}</p>
                    <button
                      className="btn btn-navy btn-block btn-lg"
                      onClick={() => setModal('quote')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                      {tl('req_quote', lang)}
                    </button>
                    <a
                      className="btn btn-wa btn-block btn-sm"
                      style={{ marginTop: 10 }}
                      href="https://wa.me/51987486981"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      {tl('whatsapp', lang)}
                    </a>
                  </>
                )}
              </div>
            )}
          </aside>
        </>
      )}

      {modal === 'quote' && (
        <QuoteModal items={items} lang={lang} close={() => setModal(null)} />
      )}
    </>
  );
}
