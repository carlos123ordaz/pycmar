/* =========================================================================
   PYCMAR · Home screen  →  window
   ========================================================================= */
const { Icon: H_Icon, Btn: H_Btn, ChevGlyph: H_Chev, DividerChev: H_Div, SectionHead: H_Sec,
        ProductCard: H_Card, CategoryCard: H_Cat, ProductImg: H_Img } = window;

function Hero({ t, lang, nav }) {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div className="fade-up">
          <span className="eyebrow on-dark">{t('hero_eyebrow')}</span>
          <h1 className="display">
            {lang==='es' ? <>Del mar del Perú <em>al mundo</em>, sin romper la cadena de frío.</>
                         : <>From Peru's sea <em>to the world</em>, without breaking the cold chain.</>}
          </h1>
          <p className="lead">{t('hero_sub')}</p>
          <div className="hero-cta">
            <H_Btn variant="accent" size="lg" iconRight="arrowR" onClick={()=>nav('catalog')}>{t('cta_catalog')}</H_Btn>
            <H_Btn variant="ghost-light" size="lg" icon="doc" onClick={()=>nav('contact')}>{t('cta_quote')}</H_Btn>
          </div>
          <div className="hero-stats">
            {[['35+', t('stat_species')], ['6', t('stat_markets')], ['−18°C', t('stat_cold')], ['100%', t('stat_years')]].map(([n,l])=>(
              <div className="hero-stat" key={l}><div className="n">{n}</div><div className="l">{l}</div></div>
            ))}
          </div>
        </div>
        <div className="fade-up" style={{animationDelay:'.12s'}}>
          <div className="hero-visual">
            <H_Img id="hero-main" label={lang==='es'?'FOTO · Faena pesquera o producto estrella':'PHOTO · Fishing operation or hero product'} dark />
            <div className="hero-float">
              <div className="ic"><H_Icon name="snow" /></div>
              <div>
                <div className="t">{lang==='es'?'Congelado IQF a bordo':'IQF frozen on board'}</div>
                <div className="s">{lang==='es'?'Trazabilidad por lote':'Batch-level traceability'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="wrap">
        <div className="hero-marquee">
          <span><b>{lang==='es'?'Certificaciones':'Certifications'}:</b></span>
          {window.PY.certs.map((c,i)=>(
            <React.Fragment key={c}>
              <span>{c}</span>
              {i < window.PY.certs.length-1 && <H_Chev count={1} style={{opacity:.5}} />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

function Categories({ t, lang, nav }) {
  const cats = window.PY.categories;
  return (
    <section className="section">
      <div className="wrap">
        <H_Sec eyebrow={t('cats_title')} title={lang==='es'?'Una línea completa de proteína marina':'A complete marine protein line'} sub={t('cats_sub')} />
        <div className="cat-grid">
          <H_Cat c={cats[0]} lang={lang} nav={nav} className="span2" big />
          <H_Cat c={cats[3]} lang={lang} nav={nav} />
          <H_Cat c={cats[2]} lang={lang} nav={nav} />
          <H_Cat c={cats[1]} lang={lang} nav={nav} />
          <H_Cat c={cats[5]} lang={lang} nav={nav} />
        </div>
        <div style={{marginTop:30,textAlign:'center'}}>
          <H_Btn variant="outline" size="lg" iconRight="arrowR" onClick={()=>nav('catalog')}>{t('cats_all')}</H_Btn>
        </div>
      </div>
    </section>
  );
}

function Benefits({ t, lang }) {
  const items = [
    { ic:'shield', t:t('ben1_t'), d:t('ben1_d') },
    { ic:'snow',   t:t('ben2_t'), d:t('ben2_d') },
    { ic:'ship',   t:t('ben3_t'), d:t('ben3_d') },
    { ic:'leaf',   t:t('ben4_t'), d:t('ben4_d') },
  ];
  return (
    <section className="section bene">
      <div className="wrap">
        <H_Sec eyebrow={t('benefits_title')} title={lang==='es'?'Confianza que se construye contenedor a contenedor':'Trust built container by container'} sub={t('benefits_sub')} />
        <div className="bene-grid">
          {items.map((it,i)=>(
            <div className="bene-card" key={it.t}>
              <span className="bene-n">{String(i+1).padStart(2,'0')}</span>
              <div className="bene-ic"><H_Icon name={it.ic} /></div>
              <h3>{it.t}</h3>
              <p>{it.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Featured({ t, lang, nav, onAdd, addedIds }) {
  const items = window.PY.products.filter(p => p.featured).slice(0, 8);
  return (
    <section className="section">
      <div className="wrap">
        <div className="catalog-bar" style={{marginBottom:34}}>
          <div>
            <span className="eyebrow" style={{display:'block',marginBottom:10}}>{t('featured_title')}</span>
            <h2 className="h2">{lang==='es'?'Lo más solicitado':'Most requested'}</h2>
          </div>
          <H_Btn variant="outline" iconRight="arrowR" onClick={()=>nav('catalog')}>{t('cats_all')}</H_Btn>
        </div>
        <div className="prod-grid">
          {items.map(p => <H_Card key={p.id} p={p} t={t} lang={lang} nav={nav} onAdd={onAdd} added={addedIds.has(p.id)} />)}
        </div>
      </div>
    </section>
  );
}

function Trust({ t, lang, nav }) {
  return (
    <section className="section trust">
      <div className="wrap">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'clamp(32px,5vw,72px)',alignItems:'center'}} className="trust-grid">
          <div>
            <span className="eyebrow">{t('trust_title')}</span>
            <h2 className="h2" style={{margin:'14px 0 16px'}}>{lang==='es'?'Operamos bajo los estándares más exigentes del mundo':'We operate under the world\'s most demanding standards'}</h2>
            <p className="lead">{t('trust_sub')}</p>
            <div className="market-row">
              <span style={{fontSize:'.82rem',fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'#7ef0c4',width:'100%',marginBottom:4}}>
                {lang==='es'?'Mercados de destino':'Destination markets'}
              </span>
              {window.PY.markets.map(m => <span key={m.en} className="market-tag">{m[lang]}</span>)}
            </div>
          </div>
          <div className="cert-row" style={{margin:0}}>
            {window.PY.certs.map(c => (
              <div className="cert" key={c}>
                <div className="ck"><H_Icon name="shield" /></div>
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaBand({ t, lang, nav }) {
  return (
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
  );
}

function Home(props) {
  return (
    <main>
      <Hero {...props} />
      <Categories {...props} />
      <Benefits {...props} />
      <Featured {...props} />
      <Trust {...props} />
      <CtaBand {...props} />
    </main>
  );
}

Object.assign(window, { Home });
