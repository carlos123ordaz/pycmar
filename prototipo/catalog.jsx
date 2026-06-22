/* =========================================================================
   PYCMAR · Catalog + Product page  →  window
   ========================================================================= */
const { Icon: C_Icon, Btn: C_Btn, Tag: C_Tag, SectionHead: C_Sec,
        ProductCard: C_Card, ProductImg: C_Img, useScrolled: _us } = window;

const FORMATS = ['IQF','Bloque','Cocido','Prefrito'];

function FilterPanel({ t, lang, cats, sel, toggle, origins, clear, mobile, close }) {
  return (
    <aside className={`filters ${mobile?'open':''}`}>
      {mobile && (
        <div className="row" style={{justifyContent:'space-between',marginBottom:18}}>
          <h3 className="h3">{lang==='es'?'Filtros':'Filters'}</h3>
          <button className="icon-btn" onClick={close}><C_Icon name="x" /></button>
        </div>
      )}
      <div className="filter-block">
        <h4>{t('filter_cat')}</h4>
        {cats.map(c => {
          const on = sel.cat.includes(c.id);
          return (
            <div key={c.id} className={`filter-opt ${on?'on':''}`} onClick={()=>toggle('cat',c.id)}>
              <span className="box"><C_Icon name="check" /></span>
              {c[lang]}<span className="ct">{c.count}</span>
            </div>
          );
        })}
      </div>
      <div className="filter-block">
        <h4>{t('filter_format')}</h4>
        {FORMATS.map(f => {
          const on = sel.format.includes(f);
          return (
            <div key={f} className={`filter-opt ${on?'on':''}`} onClick={()=>toggle('format',f)}>
              <span className="box"><C_Icon name="check" /></span>{f}
            </div>
          );
        })}
      </div>
      <div className="filter-block">
        <h4>{t('filter_origin')}</h4>
        {origins.map(o => {
          const on = sel.origin.includes(o);
          return (
            <div key={o} className={`filter-opt ${on?'on':''}`} onClick={()=>toggle('origin',o)}>
              <span className="box"><C_Icon name="check" /></span>{o}
            </div>
          );
        })}
      </div>
      <button className="btn btn-outline btn-sm btn-block" style={{marginTop:18}} onClick={clear}>
        <C_Icon name="x" /> {t('filter_clear')}
      </button>
      {mobile && <C_Btn variant="navy" block style={{marginTop:10}} onClick={close}>{lang==='es'?'Ver resultados':'View results'}</C_Btn>}
    </aside>
  );
}

function Catalog({ t, lang, nav, onAdd, addedIds, params }) {
  const cats = window.PY.categories;
  const allProducts = window.PY.products;
  const origins = React.useMemo(() => {
    const set = new Set();
    allProducts.forEach(p => p[`origin_${lang}`].split(' · ').forEach(o => set.add(o)));
    return [...set].sort();
  }, [lang]);

  const [sel, setSel] = React.useState({ cat: params?.cat ? [params.cat] : [], format: [], origin: [] });
  const [sort, setSort] = React.useState('featured');
  const [mobileFilter, setMobileFilter] = React.useState(false);

  React.useEffect(() => { if (params?.cat) setSel(s => ({ ...s, cat:[params.cat] })); }, [params]);

  const toggle = (key, val) => setSel(s => ({ ...s, [key]: s[key].includes(val) ? s[key].filter(x=>x!==val) : [...s[key], val] }));
  const clear = () => setSel({ cat:[], format:[], origin:[] });

  const filtered = React.useMemo(() => {
    let r = allProducts.filter(p => {
      if (sel.cat.length && !sel.cat.includes(p.cat)) return false;
      if (sel.format.length && !p.tags.some(tg => sel.format.includes(tg))) return false;
      if (sel.origin.length && !sel.origin.some(o => p[`origin_${lang}`].includes(o))) return false;
      return true;
    });
    if (sort==='az') r = [...r].sort((a,b)=>a[lang].localeCompare(b[lang]));
    else if (sort==='price_lo') r = [...r].sort((a,b)=>a.price-b.price);
    else if (sort==='price_hi') r = [...r].sort((a,b)=>b.price-a.price);
    else r = [...r].sort((a,b)=>(b.featured?1:0)-(a.featured?1:0));
    return r;
  }, [sel, sort, lang]);

  const activeChips = [
    ...sel.cat.map(c => ({ key:'cat', val:c, label: cats.find(x=>x.id===c)[lang] })),
    ...sel.format.map(f => ({ key:'format', val:f, label:f })),
    ...sel.origin.map(o => ({ key:'origin', val:o, label:o })),
  ];

  return (
    <main>
      <div className="catalog-head">
        <div className="wrap">
          <span className="eyebrow" style={{display:'block',marginBottom:12}}>{t('nav_catalog')}</span>
          <h1 className="h2">{t('catalog_title')}</h1>
          <p className="lead" style={{marginTop:10,maxWidth:'50ch'}}>
            {lang==='es'?'Pota, pescados, mariscos y preparados congelados. Filtra por categoría, formato y origen.'
                        :'Squid, fish, shellfish and value-added frozen seafood. Filter by category, format and origin.'}
          </p>
        </div>
      </div>
      <div className="wrap section-tight">
        <div className="catalog-layout">
          <FilterPanel t={t} lang={lang} cats={cats} sel={sel} toggle={toggle} origins={origins} clear={clear} mobile={false} />
          <div>
            <div className="catalog-bar">
              <div className="row" style={{gap:14,flexWrap:'wrap'}}>
                <button className="btn btn-outline btn-sm mobile-filter-btn" onClick={()=>setMobileFilter(true)}>
                  <C_Icon name="filter" /> {lang==='es'?'Filtros':'Filters'}
                </button>
                <span className="ct"><b>{filtered.length}</b> {t('catalog_count')}</span>
              </div>
              <div className="row" style={{gap:9}}>
                <span style={{fontSize:'.88rem',color:'var(--gray)',fontWeight:600}}>{t('sort_label')}</span>
                <select className="select" value={sort} onChange={(e)=>setSort(e.target.value)}>
                  <option value="featured">{t('sort_featured')}</option>
                  <option value="az">{t('sort_az')}</option>
                  <option value="price_lo">{t('sort_price_lo')}</option>
                  <option value="price_hi">{t('sort_price_hi')}</option>
                </select>
              </div>
            </div>
            {activeChips.length > 0 && (
              <div className="chips-row" style={{marginBottom:22}}>
                {activeChips.map(ch => (
                  <button key={ch.key+ch.val} className="chip active" onClick={()=>toggle(ch.key,ch.val)}>
                    {ch.label} <C_Icon name="x" style={{width:14,height:14}} />
                  </button>
                ))}
                <button className="chip" onClick={clear}>{t('filter_clear')}</button>
              </div>
            )}
            <div className="prod-grid cols3">
              {filtered.map(p => <C_Card key={p.id} p={p} t={t} lang={lang} nav={nav} onAdd={onAdd} added={addedIds.has(p.id)} />)}
            </div>
            {filtered.length === 0 && (
              <div className="center" style={{padding:'70px 0',color:'var(--gray)'}}>
                <p style={{marginBottom:16}}>{lang==='es'?'No hay productos con esos filtros.':'No products match those filters.'}</p>
                <C_Btn variant="outline" onClick={clear}>{t('filter_clear')}</C_Btn>
              </div>
            )}
          </div>
        </div>
      </div>
      {mobileFilter && (
        <div className="overlay" onClick={()=>setMobileFilter(false)}>
          <div onClick={(e)=>e.stopPropagation()}>
            <FilterPanel t={t} lang={lang} cats={cats} sel={sel} toggle={toggle} origins={origins} clear={clear} mobile close={()=>setMobileFilter(false)} />
          </div>
        </div>
      )}
    </main>
  );
}

/* ---- Product page ------------------------------------------------------- */
function ProductPage({ t, lang, nav, onAdd, params, openCart, addToCart }) {
  const p = window.PY.products.find(x => x.id === params.id) || window.PY.products[0];
  const cat = window.PY.categories.find(c => c.id === p.cat);
  const [tab, setTab] = React.useState('buy');
  const [qty, setQty] = React.useState(p.cat==='marisco'||p.price>40 ? 5 : 10);
  const [thumb, setThumb] = React.useState(0);
  const [justAdded, setJustAdded] = React.useState(false);

  React.useEffect(()=>{ window.scrollTo(0,0); setTab('buy'); setThumb(0); }, [params.id]);

  const related = window.PY.products.filter(x => x.cat===p.cat && x.id!==p.id).slice(0,4);
  const specs = [
    ['spec_sci', p.sci !== 'Mix' ? p.sci : (lang==='es'?'Mezcla de especies':'Species blend')],
    ['spec_fao', p.fao],
    ['spec_origin', p[`origin_${lang}`]],
    ['spec_format', p.tags.join(' · ')],
    ['spec_pres', p[`pres_${lang}`]],
    p[`measure_${lang}`] && ['spec_measure', p[`measure_${lang}`]],
    p[`sizes_${lang}`] && ['spec_sizes', p[`sizes_${lang}`]],
    ['spec_pack', p[`pack_${lang}`]],
  ].filter(Boolean);

  const doAdd = (mode) => {
    addToCart(p, qty, mode);
    setJustAdded(true);
    setTimeout(()=>setJustAdded(false), 1600);
    openCart();
  };

  return (
    <main>
      <div className="wrap">
        <div className="crumbs">
          <a href="#" onClick={(e)=>{e.preventDefault();nav('home');}}>{t('nav_home')}</a>
          <span className="sep">/</span>
          <a href="#" onClick={(e)=>{e.preventDefault();nav('catalog');}}>{t('nav_catalog')}</a>
          <span className="sep">/</span>
          <a href="#" onClick={(e)=>{e.preventDefault();nav('catalog',{cat:p.cat});}}>{cat[lang]}</a>
          <span className="sep">/</span>
          <span style={{color:'var(--navy)',fontWeight:600}}>{p[lang]}</span>
        </div>
      </div>
      <div className="wrap" style={{paddingBottom:'clamp(50px,7vw,90px)'}}>
        <div className="pdp">
          <div className="pdp-gallery">
            <div className="pdp-main">
              <C_Img id={`${p.id}-v${thumb}`} label={`${(p[lang]||'').toUpperCase()} · ${lang==='es'?'foto':'photo'} ${thumb+1}`} />
            </div>
            <div className="pdp-thumbs">
              {[0,1,2,3].map(i => (
                <div key={i} className={`pdp-thumb ${thumb===i?'on':''}`} onClick={()=>setThumb(i)}>
                  <C_Img id={`${p.id}-t${i}`} label={`${i+1}`} />
                </div>
              ))}
            </div>
          </div>
          <div className="pdp-info">
            {p.sci !== 'Mix' && <div className="sci">{p.sci}</div>}
            <h1>{p[lang]}</h1>
            <div className="pdp-tags">
              {p.tags.map(tg => <C_Tag key={tg} label={tg} />)}
              <span className="pill"><C_Icon name="pin" style={{width:14,height:14}} /> {p[`origin_${lang}`]}</span>
            </div>
            <p className="pdp-blurb">{p[`blurb_${lang}`]}</p>

            <dl className="spec-table">
              {specs.map(([k,v]) => (
                <div className="spec-row" key={k}><dt>{t(k)}</dt><dd>{v}</dd></div>
              ))}
            </dl>

            <div className="pdp-buy">
              <div className="buy-tabs">
                <button className={`buy-tab ${tab==='buy'?'on':''}`} onClick={()=>setTab('buy')}>{t('tab_buy')}</button>
                <button className={`buy-tab ${tab==='quote'?'on':''}`} onClick={()=>setTab('quote')}>{t('tab_quote')}</button>
              </div>
              <div className="buy-panel">
                {tab==='buy' ? (
                  <>
                    <div className="buy-price">
                      <span className="v">S/ {p.price.toFixed(2)}</span>
                      <span className="u">/ {t('per_kg')}</span>
                    </div>
                    <p className="buy-note">{t('buy_note')}</p>
                    <div className="row" style={{gap:16,flexWrap:'wrap'}}>
                      <div className="qty">
                        <button onClick={()=>setQty(q=>Math.max(1,q-1))}><C_Icon name="minus" style={{width:16,height:16}} /></button>
                        <input value={qty} onChange={(e)=>setQty(Math.max(1,parseInt(e.target.value)||1))} />
                        <button onClick={()=>setQty(q=>q+1)}><C_Icon name="plus" style={{width:16,height:16}} /></button>
                      </div>
                      <span style={{color:'var(--gray)',fontSize:'.9rem'}}>kg · <b style={{color:'var(--navy)'}}>S/ {(p.price*qty).toFixed(2)}</b></span>
                    </div>
                    <div className="buy-actions">
                      <C_Btn variant="accent" icon="cart" onClick={()=>doAdd('buy')}>{t('buy_now')}</C_Btn>
                      <C_Btn variant="outline" icon="doc" onClick={()=>{setTab('quote');}}>{t('add_quote')}</C_Btn>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="buy-price">
                      <span className="v" style={{fontSize:'1.5rem'}}>{t('quote_only')}</span>
                    </div>
                    <p className="buy-note">{t('quote_note')}</p>
                    <div className="row" style={{gap:16,flexWrap:'wrap',marginBottom:4}}>
                      <div className="qty">
                        <button onClick={()=>setQty(q=>Math.max(1,q-1))}><C_Icon name="minus" style={{width:16,height:16}} /></button>
                        <input value={qty} onChange={(e)=>setQty(Math.max(1,parseInt(e.target.value)||1))} />
                        <button onClick={()=>setQty(q=>q+1)}><C_Icon name="plus" style={{width:16,height:16}} /></button>
                      </div>
                      <span style={{color:'var(--gray)',fontSize:'.9rem'}}>kg {lang==='es'?'estimados':'estimated'}</span>
                    </div>
                    <div className="buy-actions">
                      <C_Btn variant="navy" icon="doc" onClick={()=>doAdd('quote')}>{t('add_quote')}</C_Btn>
                      <a className="btn btn-wa" href={`https://wa.me/${window.PY.company.phoneRaw}?text=${encodeURIComponent((lang==='es'?'Hola PYCMAR, quiero cotizar: ':'Hi PYCMAR, I want a quote for: ')+p[lang])}`} target="_blank" rel="noreferrer">
                        <C_Icon name="whatsapp" /> WhatsApp
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div style={{marginTop:'clamp(50px,7vw,90px)'}}>
            <h2 className="h3" style={{marginBottom:24}}>{t('related')}</h2>
            <div className="prod-grid">
              {related.map(r => <C_Card key={r.id} p={r} t={t} lang={lang} nav={nav} onAdd={(pp)=>addToCart(pp,r.cat==='marisco'?5:10,'quote')} added={false} />)}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

Object.assign(window, { Catalog, ProductPage });
