/* =========================================================================
   PYCMAR · Chrome (header, search, mobile menu, footer)  →  window
   ========================================================================= */
const { company } = window.PY;

/* ---- Live search -------------------------------------------------------- */
function HeaderSearch({ t, lang, nav }) {
  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', h);
    return () => document.removeEventListener('pointerdown', h);
  }, []);
  const results = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return window.PY.products.filter(p =>
      (p[lang] || '').toLowerCase().includes(s) ||
      (p.sci || '').toLowerCase().includes(s) ||
      (p.cat || '').toLowerCase().includes(s)
    ).slice(0, 6);
  }, [q, lang]);
  return (
    <div className="search-wrap" ref={ref}>
      <Icon name="search" style={{position:'absolute',left:'.8em',width:18,height:18,color:'var(--gray)',pointerEvents:'none'}} />
      <input
        value={q} placeholder={t('search')}
        onChange={(e)=>{setQ(e.target.value);setOpen(true);}}
        onFocus={()=>setOpen(true)}
      />
      {open && results.length > 0 && (
        <div className="search-results">
          {results.map(p => (
            <a key={p.id} href="#" onClick={(e)=>{e.preventDefault();setOpen(false);setQ('');nav('product',{id:p.id});}}>
              <div className="thumb"><ProductImg id={p.id} label={p[lang]} /></div>
              <div>
                <div className="sr-name">{p[lang]}</div>
                <div className="sr-cat">{window.PY.categories.find(c=>c.id===p.cat)?.[lang]}</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- Header ------------------------------------------------------------- */
function Header({ route, nav, t, lang, setLang, cartCount, openCart }) {
  const scrolled = useScrolled();
  const [menu, setMenu] = React.useState(false);
  const links = [
    { id:'home', label:t('nav_home') },
    { id:'about', label:t('nav_about') },
    { id:'export', label:t('nav_export') },
    { id:'contact', label:t('nav_contact') },
  ];
  return (
    <>
      <div className="announce">
        <ChevGlyph count={2} />
        <span className="announce-txt"><strong>HACCP · SANIPES · FDA</strong> — {lang==='es'?'Exportación a 6 mercados internacionales':'Exporting to 6 international markets'}</span>
      </div>
      <header className={`header ${scrolled?'scrolled':''}`}>
        <div className="header-inner">
          <Logo variant="navy" onClick={()=>nav('home')} />
          <nav className="nav">
            {links.map(l => (
              <a key={l.id} href="#" className={route===l.id?'active':''}
                 onClick={(e)=>{e.preventDefault();nav(l.id);}}>{l.label}</a>
            ))}
          </nav>
          <HeaderSearch t={t} lang={lang} nav={nav} />
          <div className="header-actions">
            <div className="lang-toggle" role="group" aria-label="Language">
              <button className={lang==='es'?'on':''} onClick={()=>setLang('es')}>ES</button>
              <button className={lang==='en'?'on':''} onClick={()=>setLang('en')}>EN</button>
            </div>
            <button className="icon-btn" aria-label="Cart" onClick={openCart}>
              <Icon name="cart" />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
            <button className="icon-btn hamburger" aria-label="Menu" onClick={()=>setMenu(true)}>
              <Icon name="menu" />
            </button>
          </div>
        </div>
      </header>
      {menu && <MobileMenu links={links} route={route} nav={nav} t={t} lang={lang} setLang={setLang} close={()=>setMenu(false)} />}
    </>
  );
}

/* ---- Mobile menu -------------------------------------------------------- */
function MobileMenu({ links, route, nav, t, lang, setLang, close }) {
  return (
    <div className="overlay" onClick={close}>
      <div className="drawer" style={{width:'min(360px,100vw)'}} onClick={(e)=>e.stopPropagation()}>
        <div className="drawer-head">
          <Logo variant="navy" onClick={()=>{close();nav('home');}} />
          <button className="icon-btn" onClick={close}><Icon name="x" /></button>
        </div>
        <div className="drawer-body">
          <div style={{display:'flex',flexDirection:'column',gap:4}}>
            {links.map(l => (
              <a key={l.id} href="#" onClick={(e)=>{e.preventDefault();close();nav(l.id);}}
                 style={{padding:'14px 6px',fontSize:'1.15rem',fontWeight:700,borderBottom:'1px solid var(--line)',
                   color: route===l.id?'var(--accent-600)':'var(--navy)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                {l.label} <Icon name="chevR" style={{width:18,height:18,color:'var(--gray-2)'}} />
              </a>
            ))}
          </div>
          <div style={{marginTop:24,display:'flex',gap:10}}>
            <div className="lang-toggle">
              <button className={lang==='es'?'on':''} onClick={()=>setLang('es')}>ES</button>
              <button className={lang==='en'?'on':''} onClick={()=>setLang('en')}>EN</button>
            </div>
          </div>
          <a className="btn btn-wa btn-block" style={{marginTop:22}} href={`https://wa.me/${company.phoneRaw}`} target="_blank" rel="noreferrer">
            <Icon name="whatsapp" /> {t('form_whatsapp')}
          </a>
        </div>
      </div>
    </div>
  );
}

/* ---- Footer ------------------------------------------------------------- */
function Footer({ t, lang, nav }) {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <Logo variant="white" onClick={()=>nav('home')} />
            <p className="footer-about">
              {lang==='es'
                ? 'Empresa peruana dedicada al desarrollo exportador, procesamiento y comercialización de productos hidrobiológicos con altos estándares de calidad.'
                : 'Peruvian company dedicated to export development, processing and commercialization of hydrobiological products under high quality standards.'}
            </p>
            <div className="row" style={{gap:8}}>
              {window.PY.certs.slice(0,4).map(c => <span key={c} className="market-tag">{c}</span>)}
            </div>
          </div>
          <div>
            <h5>{t('footer_explore')}</h5>
            <div className="footer-links">
              <a href="#" onClick={(e)=>{e.preventDefault();nav('home');}}>{t('nav_home')}</a>
              <a href="#" onClick={(e)=>{e.preventDefault();nav('catalog');}}>{t('nav_catalog')}</a>
              <a href="#" onClick={(e)=>{e.preventDefault();nav('about');}}>{t('nav_about')}</a>
              <a href="#" onClick={(e)=>{e.preventDefault();nav('export');}}>{t('nav_export')}</a>
              <a href="#" onClick={(e)=>{e.preventDefault();nav('contact');}}>{t('nav_contact')}</a>
            </div>
          </div>
          <div>
            <h5>{t('footer_company')}</h5>
            <div className="footer-links">
              {window.PY.categories.map(c => (
                <a key={c.id} href="#" onClick={(e)=>{e.preventDefault();nav('catalog',{cat:c.id});}}>{c[lang]}</a>
              ))}
            </div>
          </div>
          <div>
            <h5>{t('footer_contact')}</h5>
            <div className="footer-contact-item"><Icon name="mail" /> {company.email}</div>
            <div className="footer-contact-item"><Icon name="phone" /> {company.phone}</div>
            <div className="footer-contact-item"><Icon name="pin" /> {company.city}</div>
            <a className="btn btn-wa btn-sm" style={{marginTop:8}} href={`https://wa.me/${company.phoneRaw}`} target="_blank" rel="noreferrer">
              <Icon name="whatsapp" /> WhatsApp
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {company.legal}. {t('footer_rights')}</span>
          <div className="socials">
            <a href="#" aria-label="Instagram"><Icon name="ig" /></a>
            <a href="#" aria-label="Facebook"><Icon name="fb" /></a>
            <a href="#" aria-label="LinkedIn"><Icon name="ln" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Header, Footer, MobileMenu, HeaderSearch });
