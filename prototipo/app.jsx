/* =========================================================================
   PYCMAR · App root (routing, state, cart)  →  mounts #root
   ========================================================================= */
const { Header: A_Header, Footer: A_Footer, Home: A_Home, Catalog: A_Catalog, ProductPage: A_PDP,
        AboutPage: A_About, ExportPage: A_Export, ContactPage: A_Contact, CartDrawer: A_Cart,
        CheckoutModal: A_Checkout, QuoteModal: A_Quote, Icon: A_Icon } = window;

const LS = {
  get(k, d){ try{ const v = localStorage.getItem('pycmar_'+k); return v?JSON.parse(v):d; }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem('pycmar_'+k, JSON.stringify(v)); }catch(e){} },
};

const { useTweaks, TweaksPanel, TweakSection, TweakColor, TweakRadio } = window;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#10B981",
  "heroBg": "#0B1F3B",
  "radius": "suave"
}/*EDITMODE-END*/;

const ACCENTS = {
  "#10B981": { c600:"#0c9b6c", c050:"#e7f7f0" },  // esmeralda
  "#14B8A6": { c600:"#0e9a8b", c050:"#e6f7f4" },  // turquesa
  "#0D9488": { c600:"#0a7269", c050:"#e3f3f1" },  // teal marino
};
const RADII = {
  suave:   { r:"14px", lg:"22px", sm:"9px" },
  marcado: { r:"20px", lg:"30px", sm:"13px" },
  recto:   { r:"4px",  lg:"6px",  sm:"3px" },
};

function PycmarTweaks({ t: tw, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Identidad" />
      <TweakColor label="Acento / CTA" value={tw.accent}
        options={Object.keys(ACCENTS)} onChange={(v)=>setTweak('accent', v)} />
      <TweakSection label="Hero" />
      <TweakColor label="Fondo del hero" value={tw.heroBg}
        options={["#0B1F3B","#0E4D64"]} onChange={(v)=>setTweak('heroBg', v)} />
      <TweakSection label="Tarjetas" />
      <TweakRadio label="Esquinas" value={tw.radius}
        options={["recto","suave","marcado"]} onChange={(v)=>setTweak('radius', v)} />
    </TweaksPanel>
  );
}

function App() {
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  React.useEffect(() => {
    const root = document.documentElement.style;
    const a = ACCENTS[tw.accent] || ACCENTS["#10B981"];
    root.setProperty('--accent', tw.accent);
    root.setProperty('--accent-600', a.c600);
    root.setProperty('--accent-050', a.c050);
    root.setProperty('--hero-bg', tw.heroBg);
    const rd = RADII[tw.radius] || RADII.suave;
    root.setProperty('--radius', rd.r);
    root.setProperty('--radius-lg', rd.lg);
    root.setProperty('--radius-sm', rd.sm);
  }, [tw.accent, tw.heroBg, tw.radius]);


  const [lang, setLangState] = React.useState(() => LS.get('lang','es'));
  const [nav, setNav] = React.useState(() => LS.get('nav', { route:'home', params:{} }));
  const [cart, setCart] = React.useState(() => LS.get('cart', []));
  const [cartOpen, setCartOpen] = React.useState(false);
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [quoteOpen, setQuoteOpen] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [addedIds, setAddedIds] = React.useState(new Set());

  React.useEffect(()=>LS.set('lang',lang),[lang]);
  React.useEffect(()=>LS.set('nav',nav),[nav]);
  React.useEffect(()=>LS.set('cart',cart),[cart]);

  const setLang = (l) => setLangState(l);
  const t = React.useCallback((key) => (window.PY.i18n[lang][key] ?? key), [lang]);

  const navigate = (route, params={}) => { setNav({ route, params }); setCartOpen(false); window.scrollTo(0,0); };

  const showToast = (msg) => { setToast(msg); clearTimeout(window.__toastT); window.__toastT = setTimeout(()=>setToast(null), 2200); };

  const addToCart = (p, qty=10, mode='quote') => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.id===p.id && i.mode===mode);
      if (idx >= 0) { const n=[...prev]; n[idx]={...n[idx],qty:n[idx].qty+qty}; return n; }
      return [...prev, { ...p, qty, mode }];
    });
    setAddedIds(s => { const n=new Set(s); n.add(p.id); return n; });
    setTimeout(()=>setAddedIds(s=>{ const n=new Set(s); n.delete(p.id); return n; }), 1500);
    showToast(`${p[lang]} · ${t('added')}`);
  };
  const quickAdd = (p) => addToCart(p, p.cat==='marisco'||p.price>40?5:10, 'quote');

  const updateQty = (id, mode, delta) => setCart(prev => prev.map(i => (i.id===id&&i.mode===mode)?{...i,qty:Math.max(1,i.qty+delta)}:i));
  const removeItem = (id, mode) => setCart(prev => prev.filter(i => !(i.id===id&&i.mode===mode)));

  const cartCount = cart.length;

  const shared = { t, lang, nav: navigate, onAdd: quickAdd, addedIds, addToCart, openCart:()=>setCartOpen(true) };

  let screen;
  if (nav.route==='catalog') screen = <A_Home {...shared} params={nav.params} />;
  else if (nav.route==='product') screen = <A_PDP {...shared} params={nav.params} openCart={()=>setCartOpen(true)} />;
  else if (nav.route==='about') screen = <A_About {...shared} />;
  else if (nav.route==='export') screen = <A_Export {...shared} />;
  else if (nav.route==='contact') screen = <A_Contact {...shared} />;
  else screen = <A_Home {...shared} params={nav.params} />;

  return (
    <>
      <A_Header route={nav.route} nav={navigate} t={t} lang={lang} setLang={setLang} cartCount={cartCount} openCart={()=>setCartOpen(true)} />
      {screen}
      <A_Footer t={t} lang={lang} nav={navigate} />

      {cartOpen && (
        <A_Cart cart={cart} t={t} lang={lang} nav={navigate} close={()=>setCartOpen(false)}
          updateQty={updateQty} removeItem={removeItem}
          openCheckout={()=>{ if(cart.some(i=>i.mode==='buy')){setCartOpen(false);setCheckoutOpen(true);} }}
          openQuote={()=>{ if(cart.some(i=>i.mode==='quote')){setCartOpen(false);setQuoteOpen(true);} }} />
      )}
      {checkoutOpen && (
        <A_Checkout cart={cart} t={t} lang={lang} close={()=>setCheckoutOpen(false)}
          onPaid={()=>setCart(prev=>prev.filter(i=>i.mode!=='buy'))} />
      )}
      {quoteOpen && (
        <A_Quote cart={cart} t={t} lang={lang} close={()=>setQuoteOpen(false)}
          onSent={()=>setCart(prev=>prev.filter(i=>i.mode!=='quote'))} />
      )}

      {/* floating WhatsApp */}
      <a className="wa-fab" href={`https://wa.me/${window.PY.company.phoneRaw}`} target="_blank" rel="noreferrer" aria-label="WhatsApp">
        <A_Icon name="whatsapp" />
      </a>

      {toast && (
        <div className="toast"><span className="tk"><A_Icon name="check" style={{width:14,height:14}} /></span>{toast}</div>
      )}

      <PycmarTweaks t={tw} setTweak={setTweak} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
