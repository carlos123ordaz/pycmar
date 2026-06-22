/* =========================================================================
   PYCMAR · Cart drawer + Checkout + Quote modals  →  window
   ========================================================================= */
const { Icon: K_Icon, Btn: K_Btn, ProductImg: K_Img, DividerChev: K_Div } = window;

function CartItem({ it, t, lang, updateQty, removeItem }) {
  return (
    <div className="cart-item">
      <div className="ci-img"><K_Img id={it.id} label={it[lang]} /></div>
      <div className="ci-body">
        <h4>{it[lang]}</h4>
        {it.sci !== 'Mix' && <div className="ci-sci">{it.sci}</div>}
        <div className="ci-foot">
          <div className="qty-sm">
            <button onClick={()=>updateQty(it.id,it.mode,-1)}><K_Icon name="minus" style={{width:14,height:14}} /></button>
            <span>{it.qty}</span>
            <button onClick={()=>updateQty(it.id,it.mode,1)}><K_Icon name="plus" style={{width:14,height:14}} /></button>
          </div>
          {it.mode==='buy'
            ? <span className="ci-price">S/ {(it.price*it.qty).toFixed(2)}</span>
            : <span className="ci-price" style={{fontSize:'.82rem',color:'var(--gray)'}}>{it.qty} kg</span>}
        </div>
        <button className="ci-remove" onClick={()=>removeItem(it.id,it.mode)}>{t('remove')}</button>
      </div>
    </div>
  );
}

function CartDrawer({ cart, t, lang, nav, close, updateQty, removeItem, openCheckout, openQuote }) {
  const buyItems = cart.filter(i => i.mode==='buy');
  const quoteItems = cart.filter(i => i.mode==='quote');
  const [seg, setSeg] = React.useState(buyItems.length ? 'buy' : (quoteItems.length ? 'quote' : 'buy'));
  const items = seg==='buy' ? buyItems : quoteItems;
  const subtotal = buyItems.reduce((s,i)=>s+i.price*i.qty,0);

  return (
    <div className="overlay" onClick={close}>
      <div className="drawer" onClick={(e)=>e.stopPropagation()}>
        <div className="drawer-head">
          <h3>{t('cart_title')}</h3>
          <button className="icon-btn" onClick={close}><K_Icon name="x" /></button>
        </div>
        <div className="drawer-segs">
          <button className={`drawer-seg ${seg==='buy'?'on':''}`} onClick={()=>setSeg('buy')}>
            {t('cart_buy')} {buyItems.length>0 && <span className="b">{buyItems.length}</span>}
          </button>
          <button className={`drawer-seg ${seg==='quote'?'on':''}`} onClick={()=>setSeg('quote')}>
            {t('cart_quote')} {quoteItems.length>0 && <span className="b">{quoteItems.length}</span>}
          </button>
        </div>
        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="ic"><K_Icon name={seg==='buy'?'cart':'doc'} /></div>
              <p style={{marginBottom:18}}>{t('cart_empty')}</p>
              <K_Btn variant="outline" onClick={()=>{close();nav('catalog');}}>{t('cart_empty_cta')}</K_Btn>
            </div>
          ) : items.map(it => (
            <CartItem key={it.id+it.mode} it={it} t={t} lang={lang} updateQty={updateQty} removeItem={removeItem} />
          ))}
        </div>
        {items.length > 0 && (
          <div className="drawer-foot">
            {seg==='buy' ? (
              <>
                <div className="drawer-total">
                  <span style={{fontWeight:600,color:'var(--gray)'}}>{t('subtotal')}</span>
                  <span className="v">S/ {subtotal.toFixed(2)}</span>
                </div>
                <K_Btn variant="accent" block size="lg" icon="cart" onClick={openCheckout}>{t('checkout')}</K_Btn>
                <button className="btn btn-outline btn-block btn-sm" style={{marginTop:10}} onClick={()=>{close();nav('catalog');}}>{t('continue')}</button>
              </>
            ) : (
              <>
                <p className="muted" style={{fontSize:'.86rem',marginBottom:14}}>{t('quote_note')}</p>
                <K_Btn variant="navy" block size="lg" icon="doc" onClick={openQuote}>{t('request_quote')}</K_Btn>
                <a className="btn btn-wa btn-block btn-sm" style={{marginTop:10}} href={`https://wa.me/${window.PY.company.phoneRaw}`} target="_blank" rel="noreferrer">
                  <K_Icon name="whatsapp" /> WhatsApp
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- Checkout modal ----------------------------------------------------- */
function CheckoutModal({ cart, t, lang, close, onPaid }) {
  const buyItems = cart.filter(i => i.mode==='buy');
  const subtotal = buyItems.reduce((s,i)=>s+i.price*i.qty,0);
  const igv = subtotal * 0.18;
  const [method, setMethod] = React.useState('card');
  const [paid, setPaid] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const pay = (e) => { e.preventDefault(); setLoading(true); setTimeout(()=>{ setLoading(false); setPaid(true); onPaid(); }, 1100); };

  const methods = [
    { id:'card',   t:t('pay_card'),   s:'Visa · Mastercard · Amex', ic:'CARD' },
    { id:'wallet', t:t('pay_wallet'), s:'Yape · PLIN',              ic:'YAPE' },
    { id:'intl',   t:t('pay_intl'),   s:'PayPal · Wire / SWIFT',    ic:'INTL' },
  ];

  return (
    <div className="modal-ov" onClick={close}>
      <div className="modal" onClick={(e)=>e.stopPropagation()}>
        {paid ? (
          <div className="success-state">
            <div className="success-ic"><K_Icon name="check" /></div>
            <h3>{t('order_ok')}</h3>
            <p>{t('order_ok_sub')}</p>
            <K_Btn variant="navy" onClick={close}>{lang==='es'?'Seguir comprando':'Continue shopping'}</K_Btn>
          </div>
        ) : (
          <>
            <div className="modal-head">
              <h3>{t('checkout_title')}</h3>
              <button className="icon-btn" onClick={close}><K_Icon name="x" /></button>
            </div>
            <form className="modal-body" onSubmit={pay}>
              <div style={{background:'var(--mist)',borderRadius:12,padding:'14px 16px',marginBottom:20}}>
                {buyItems.map(i => (
                  <div key={i.id} className="row" style={{justifyContent:'space-between',fontSize:'.88rem',padding:'4px 0',gap:12}}>
                    <span style={{color:'var(--gray)'}}>{i[lang]} <b style={{color:'var(--navy)'}}>×{i.qty}kg</b></span>
                    <span style={{fontWeight:700,whiteSpace:'nowrap'}}>S/ {(i.price*i.qty).toFixed(2)}</span>
                  </div>
                ))}
                <div className="row" style={{justifyContent:'space-between',fontSize:'.84rem',padding:'4px 0',color:'var(--gray)',borderTop:'1px solid var(--line)',marginTop:6,paddingTop:8}}>
                  <span>IGV 18%</span><span>S/ {igv.toFixed(2)}</span>
                </div>
                <div className="row" style={{justifyContent:'space-between',padding:'6px 0 0',fontWeight:800,fontSize:'1.05rem',gap:12}}>
                  <span>Total</span><span style={{whiteSpace:'nowrap'}}>S/ {(subtotal+igv).toFixed(2)}</span>
                </div>
              </div>

              <div className="pay-methods">
                {methods.map(m => (
                  <label className="pay-method" key={m.id}>
                    <input type="radio" name="pm" checked={method===m.id} onChange={()=>setMethod(m.id)} />
                    <div className="pm-ic">{m.ic}</div>
                    <div><div className="pm-t">{m.t}</div><div className="pm-s">{m.s}</div></div>
                  </label>
                ))}
              </div>

              {method==='card' && (
                <div style={{marginBottom:8}}>
                  <div className="field"><label>{lang==='es'?'Número de tarjeta':'Card number'}</label><input placeholder="4242 4242 4242 4242" /></div>
                  <div className="field-row">
                    <div className="field"><label>{lang==='es'?'Vencimiento':'Expiry'}</label><input placeholder="MM / AA" /></div>
                    <div className="field"><label>CVV</label><input placeholder="123" /></div>
                  </div>
                </div>
              )}
              {method==='wallet' && (
                <div style={{background:'var(--accent-050)',borderRadius:11,padding:16,marginBottom:8,textAlign:'center'}}>
                  <p style={{fontSize:'.9rem',color:'var(--accent-600)',fontWeight:600}}>{lang==='es'?'Escanea el QR con Yape o PLIN para completar el pago.':'Scan the QR with Yape or PLIN to complete payment.'}</p>
                </div>
              )}
              {method==='intl' && (
                <div style={{background:'var(--mist)',borderRadius:11,padding:16,marginBottom:8,textAlign:'center'}}>
                  <p style={{fontSize:'.9rem',color:'var(--gray)'}}>{lang==='es'?'Serás redirigido a PayPal o recibirás los datos para transferencia internacional.':'You will be redirected to PayPal or receive international wire details.'}</p>
                </div>
              )}

              <K_Btn variant="accent" block size="lg" type="submit" disabled={loading}>
                {loading ? (lang==='es'?'Procesando…':'Processing…') : `${t('pay_pay')} · S/ ${(subtotal+igv).toFixed(2)}`}
              </K_Btn>
              <p className="muted center" style={{fontSize:'.78rem',marginTop:12}}>
                <K_Icon name="shield" style={{width:13,height:13,display:'inline',verticalAlign:'-2px',marginRight:4}} />
                {lang==='es'?'Pago cifrado y seguro':'Encrypted, secure payment'}
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ---- Quote modal -------------------------------------------------------- */
function QuoteModal({ cart, t, lang, close, onSent }) {
  const quoteItems = cart.filter(i => i.mode==='quote');
  const [type, setType] = React.useState('b2b');
  const [sent, setSent] = React.useState(false);
  const submit = (e) => { e.preventDefault(); setSent(true); onSent(); };
  return (
    <div className="modal-ov" onClick={close}>
      <div className="modal" onClick={(e)=>e.stopPropagation()}>
        {sent ? (
          <div className="success-state">
            <div className="success-ic"><K_Icon name="check" /></div>
            <h3>{t('quote_ok')}</h3>
            <p>{t('quote_ok_sub')}</p>
            <K_Btn variant="navy" onClick={close}>{lang==='es'?'Cerrar':'Close'}</K_Btn>
          </div>
        ) : (
          <>
            <div className="modal-head">
              <h3>{t('request_quote')}</h3>
              <button className="icon-btn" onClick={close}><K_Icon name="x" /></button>
            </div>
            <form className="modal-body" onSubmit={submit}>
              <div style={{background:'var(--mist)',borderRadius:12,padding:'14px 16px',marginBottom:20}}>
                <div style={{fontSize:'.78rem',fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--gray)',marginBottom:8}}>
                  {lang==='es'?'Productos a cotizar':'Products to quote'} ({quoteItems.length})
                </div>
                {quoteItems.map(i => (
                  <div key={i.id} className="row" style={{justifyContent:'space-between',fontSize:'.88rem',padding:'4px 0',gap:12}}>
                    <span>{i[lang]}</span><b style={{whiteSpace:'nowrap'}}>{i.qty} kg</b>
                  </div>
                ))}
              </div>
              <div className="field-row">
                <div className="field"><label>{t('form_name')} <span className="req">*</span></label><input required /></div>
                <div className="field"><label>{t('form_company')}</label><input /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>{t('form_email')} <span className="req">*</span></label><input type="email" required /></div>
                <div className="field"><label>{t('form_country')} <span className="req">*</span></label>
                  <select required defaultValue="Perú">{['Perú','Estados Unidos','España','China','Japón','Italia','Otro'].map(c=><option key={c}>{c}</option>)}</select>
                </div>
              </div>
              <div className="field">
                <label>{t('form_type')}</label>
                <div className="seg-radio">
                  <label><input type="radio" name="qt" checked={type==='b2c'} onChange={()=>setType('b2c')} /><span>{t('form_type_b2c')}</span></label>
                  <label><input type="radio" name="qt" checked={type==='b2b'} onChange={()=>setType('b2b')} /><span>{t('form_type_b2b')}</span></label>
                </div>
              </div>
              <div className="field"><label>{t('form_message')}</label><textarea placeholder={lang==='es'?'Destino, Incoterm, frecuencia…':'Destination, Incoterm, frequency…'}></textarea></div>
              <K_Btn variant="accent" block size="lg" iconRight="arrowR" type="submit">{t('form_send')}</K_Btn>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { CartDrawer, CheckoutModal, QuoteModal });
