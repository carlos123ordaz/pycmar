/* =========================================================================
   PYCMAR · Shop home (hero slider + visual category filter + product grid)
   Merges the old Home + Catalog into a single product-first screen.  → window
   ========================================================================= */
const { Icon: H_Icon, Btn: H_Btn, ChevGlyph: H_Chev, DividerChev: H_Div,
        ProductCard: H_Card, ProductImg: H_Img } = window;

/* ---- Full-bleed image slider (big product imagery, minimal copy) ------- */
function ShopHero({ t, lang, nav, goShop }) {
  const isEs = lang === 'es';
  const slides = [
    { id:'hero-pota', cat:'pota', kicker:isEs?'Línea estrella':'Flagship line',
      title:isEs?'Pota del Pacífico':'Pacific giant squid',
      sub:isEs?'Botones, anillas, filetes y rabas.':'Buttons, rings, fillets and sticks.',
      cta:isEs?'Ver pota':'View squid', label:isEs?'FOTO · Botones y anillas de pota':'PHOTO · Squid buttons & rings' },
    { id:'hero-marisco', cat:'marisco', kicker:isEs?'Selección premium':'Premium selection',
      title:isEs?'Mariscos del norte':'Northern shellfish',
      sub:isEs?'Concha de abanico, pulpo y langosta.':'Scallops, octopus and lobster.',
      cta:isEs?'Ver mariscos':'View shellfish', label:isEs?'FOTO · Concha de abanico':'PHOTO · Scallops' },
    { id:'hero-pescado', cat:'pescado', kicker:isEs?'Pesca del día':'Catch of the day',
      title:isEs?'Pescados congelados':'Frozen fish',
      sub:isEs?'Perico, merluza, bonito y más.':'Mahi, hake, bonito and more.',
      cta:isEs?'Ver pescados':'View fish', label:isEs?'FOTO · Filete de perico':'PHOTO · Mahi fillet' },
  ];
  const [i, setI] = React.useState(0);
  const n = slides.length;
  const go = (d) => setI(p => (p + d + n) % n);
  React.useEffect(() => {
    const id = setInterval(() => setI(p => (p + 1) % n), 6500);
    return () => clearInterval(id);
  }, [n]);

  return (
    <section className="heroF">
      <div className="heroF-slides" style={{transform:`translateX(-${i*100}%)`}}>
        {slides.map(s => (
          <div className="heroF-slide" key={s.id}>
            <H_Img id={s.id} label={s.label} dark />
            <span className="heroF-scrim" />
            <div className="wrap heroF-inner">
              <div className="heroF-copy">
                <span className="heroF-kicker"><H_Chev count={2} /> {s.kicker}</span>
                <h1 className="heroF-title">{s.title}</h1>
                <p className="heroF-sub">{s.sub}</p>
                <H_Btn variant="accent" size="lg" iconRight="arrowR" onClick={()=>goShop(s.cat)}>{s.cta}</H_Btn>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="heroF-arrow left" aria-label="prev" onClick={()=>go(-1)}><H_Icon name="arrowR" /></button>
      <button className="heroF-arrow right" aria-label="next" onClick={()=>go(1)}><H_Icon name="arrowR" /></button>
      <div className="heroF-dots">
        {slides.map((s,k) => (
          <button key={s.id} className={`heroF-dot ${k===i?'on':''}`} aria-label={`slide ${k+1}`} onClick={()=>setI(k)} />
        ))}
      </div>
      <div className="heroF-badge"><b>−18°C</b><span>{isEs?'cadena de frío':'cold chain'}</span></div>
    </section>
  );
}

/* ---- Visual category filter bar ---------------------------------------- */
function CatFilterBar({ lang, cats, sel, setSel }) {
  const isEs = lang === 'es';
  const all = window.PY.products.length;
  const items = [{ id:'all', label: isEs?'Todos':'All', icon:'grid', count: all },
    ...cats.map(c => ({ id:c.id, label:c[lang], icon:c.icon, count:c.count }))];
  return (
    <div className="catfilter">
      {items.map(it => (
        <button key={it.id} className={`catfilter-chip ${sel===it.id?'on':''}`} onClick={()=>setSel(it.id)}>
          <span className="catfilter-ic"><H_Icon name={it.icon} /></span>
          <span className="catfilter-lbl">{it.label}</span>
          <span className="catfilter-ct">{it.count}</span>
        </button>
      ))}
    </div>
  );
}

/* ---- Merged shop screen ------------------------------------------------- */
function Home({ t, lang, nav, onAdd, addedIds, params }) {
  const isEs = lang === 'es';
  const cats = window.PY.categories;
  const all = window.PY.products;
  const [sel, setSel] = React.useState(params?.cat || 'all');
  const gridRef = React.useRef(null);

  React.useEffect(() => { if (params?.cat) setSel(params.cat); }, [params]);

  const scrollToShop = () => {
    const el = gridRef.current;
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior:'smooth' });
  };
  const goShop = (cat) => { setSel(cat); setTimeout(scrollToShop, 60); };

  const filtered = React.useMemo(() => {
    const list = sel==='all' ? all : all.filter(p => p.cat===sel);
    return [...list].sort((a,b)=>(b.featured?1:0)-(a.featured?1:0));
  }, [sel]);

  const activeCat = cats.find(c => c.id===sel);

  return (
    <main>
      <ShopHero t={t} lang={lang} nav={nav} goShop={goShop} />

      {/* certifications strip — brand credibility */}
      <div className="wrap">
        <div className="cert-strip">
          <span className="cert-strip-lbl">{isEs?'Certificaciones':'Certifications'}</span>
          {window.PY.certs.map((c,k) => (
            <React.Fragment key={c}>
              <span className="cert-strip-item">{c}</span>
              {k < window.PY.certs.length-1 && <H_Chev count={1} style={{opacity:.4}} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* product section with visual filters */}
      <section className="section-tight" ref={gridRef}>
        <div className="wrap">
          <div className="shop-head">
            <div>
              <span className="eyebrow" style={{display:'block',marginBottom:10}}>{isEs?'Nuestros productos':'Our products'}</span>
              <h1 className="h2">
                {sel==='all'
                  ? (isEs?'Catálogo completo':'Full catalog')
                  : activeCat[lang]}
              </h1>
            </div>
            <span className="shop-count"><b>{filtered.length}</b> {isEs?'productos':'products'}</span>
          </div>

          <CatFilterBar lang={lang} cats={cats} sel={sel} setSel={setSel} />

          {activeCat && (
            <p className="shop-cat-desc">{activeCat[`desc_${lang}`]}</p>
          )}

          <div className="prod-grid cols4">
            {filtered.map(p => (
              <H_Card key={p.id} p={p} t={t} lang={lang} nav={nav} onAdd={onAdd} added={addedIds.has(p.id)} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="section-tight">
        <div className="wrap">
          <div className="cta-band">
            <div>
              <H_Div />
              <h2 className="h2" style={{marginTop:14}}>{t('cta_band_title')}</h2>
              <p>{t('cta_band_sub')}</p>
            </div>
            <div className="acts">
              <H_Btn variant="accent" size="lg" icon="doc" onClick={()=>nav('contact')}>{t('cta_quote')}</H_Btn>
              <a className="btn btn-ghost-light btn-lg" href={`https://wa.me/${window.PY.company.phoneRaw}`} target="_blank" rel="noreferrer">
                <H_Icon name="whatsapp" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { Home });
