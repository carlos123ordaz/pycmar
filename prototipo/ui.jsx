/* =========================================================================
   PYCMAR · UI primitives  →  window
   ========================================================================= */
const { useState, useEffect, useRef, useCallback } = React;

/* ---- Icons (stroke, 24 grid) ------------------------------------------- */
const ICON_PATHS = {
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
  cart:'<path d="M2.5 3h2l2.2 12.2a1.6 1.6 0 0 0 1.6 1.3h8.5a1.6 1.6 0 0 0 1.6-1.3L21 7H6"/><circle cx="9" cy="20.5" r="1.4"/><circle cx="18" cy="20.5" r="1.4"/>',
  menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  chevR:'<path d="m9 5 7 7-7 7"/>',
  chevD:'<path d="m5 9 7 7 7-7"/>',
  arrowR:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  minus:'<path d="M5 12h14"/>',
  check:'<path d="m4 12 5 5L20 6"/>',
  heart:'<path d="M12 20s-7-4.6-9.3-9C1.3 8.2 2.7 5 6 5c2 0 3.2 1.3 4 2.6C10.8 6.3 12 5 14 5c3.3 0 4.7 3.2 3.3 6-2.3 4.4-9.3 9-9.3 9Z"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  whatsapp:'<path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.6-1.2A9 9 0 1 0 12 3Z"/><path d="M8.5 8.2c.2-.4.4-.4.6-.4h.5c.2 0 .4 0 .6.5l.7 1.6c.1.2 0 .4-.1.5l-.4.5c-.1.2-.2.3 0 .6.3.5.8 1.2 1.5 1.7.8.5 1.2.6 1.4.5l.5-.5c.2-.2.3-.1.5-.1l1.5.8c.2.1.3.2.3.4 0 .5-.7 1.3-1.2 1.4-.5.2-1.6.3-3.4-.7-2-1.1-3.2-3.1-3.3-3.3-.1-.2-.8-1.1-.8-2.1s.5-1.5.7-1.7Z" fill="currentColor" stroke="none"/>',
  phone:'<path d="M5 4h3.5l1.5 4-2 1.4a12 12 0 0 0 5.6 5.6L17 17l4 1.5V22a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  pin:'<path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
  snow:'<path d="M12 2v20M4.2 7l15.6 10M19.8 7 4.2 17"/><path d="M12 6l-2-2m2 2 2-2M12 18l-2 2m2-2 2 2M6 9 3.2 8.5M6 9l-.6-2.8M18 15l2.8.5M18 15l.6 2.8M18 9l2.8-.5M18 9l.6-2.8M6 15l-2.8.5M6 15l-.6 2.8"/>',
  shield:'<path d="M12 3 5 6v5c0 4.4 3 8 7 10 4-2 7-5.6 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
  ship:'<path d="M3 16l1.5 4.5a1 1 0 0 0 1 .7h11a1 1 0 0 0 1-.7L20 16M5 16V9l7-3 7 3v7M12 3v3M9 16V11l3-1 3 1v5"/>',
  leaf:'<path d="M4 20c0-8 6-14 16-14 0 10-6 16-14 16-1 0-2-.2-2-.2S4 21 4 20Z"/><path d="M9 15c3-3 6-4 9-5"/>',
  anchor:'<circle cx="12" cy="5" r="2"/><path d="M12 7v13M5 13a7 7 0 0 0 14 0M5 13H3m16 0h2"/>',
  plane:'<path d="M21 15.5 13 12V5.5a1.5 1.5 0 0 0-3 0V12l-8 3.5V18l8-2v3l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-3l8 2v-2.5Z"/>',
  thermometer:'<path d="M10 4a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0Z"/><path d="M12 9v6"/>',
  box:'<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/>',
  doc:'<path d="M6 2h8l4 4v16H6V2Z"/><path d="M14 2v4h4M9 13h6M9 17h6M9 9h2"/>',
  star:'<path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.8 6.7 19.5l1.2-6L3.4 9.3l6-.7L12 3Z"/>',
  factory:'<path d="M3 21V10l5 3V10l5 3V8l8 4v9H3Z"/><path d="M7 17h2m4 0h2m4 0h0"/>',
  drop:'<path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11Z"/>',
  flask:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M7.5 15h9"/>',
  truck:'<path d="M2 6h11v9H2zM13 9h4l4 3v3h-8z"/><circle cx="6" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>',
  scale:'<path d="M12 4v16M7 20h10M5 8h14M12 4l-5 4a3 3 0 0 0 6 0M12 4l5 4a3 3 0 0 1-6 0"/>',
  ig:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.5"/><circle cx="17" cy="7" r="1"/>',
  fb:'<path d="M14 8h2V5h-2c-2 0-3 1.4-3 3.2V10H9v3h2v8h3v-8h2.2l.5-3H14V8.6c0-.4.2-.6.6-.6Z"/>',
  ln:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 10v7M7 7v0M11 17v-4a2 2 0 0 1 4 0v4M11 10v7"/>',
  filter:'<path d="M3 5h18M6 12h12M10 19h4"/>',
  sparkle:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
};
function Icon({ name, style }) {
  const fillNames = []; // none use fill except inner whatsapp handled in path
  return React.createElement('svg', {
    viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:1.7,
    strokeLinecap:'round', strokeLinejoin:'round', style,
    dangerouslySetInnerHTML:{ __html: ICON_PATHS[name] || '' }
  });
}

/* ---- Chevron motif (brand DNA — the >>> from the fish logo) ------------- */
function ChevGlyph({ count = 1, style }) {
  return React.createElement('span', { className:'chev', style },
    Array.from({length:count}).map((_, i) =>
      React.createElement('svg', { key:i, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor',
        strokeWidth:3.4, strokeLinecap:'round', strokeLinejoin:'round',
        dangerouslySetInnerHTML:{ __html:'<path d="m8 5 7 7-7 7"/>' } })
    )
  );
}
function DividerChev() {
  return (
    <div className="divider-chev">
      <ChevGlyph count={3} />
    </div>
  );
}

/* ---- Logo --------------------------------------------------------------- */
function Logo({ variant = 'navy', onClick, mark = false }) {
  const src = mark ? `assets/mark-${variant}.png` : `assets/logo-${variant}.png`;
  return (
    <a className="logo" href="#" onClick={(e)=>{e.preventDefault();onClick&&onClick();}} aria-label="PYCMAR">
      <img src={src} alt="PYCMAR — Procesos y Congelados del Mar" />
    </a>
  );
}

/* ---- Button ------------------------------------------------------------- */
function Btn({ variant='accent', size, block, icon, iconRight, children, ...rest }) {
  const cls = ['btn', `btn-${variant}`, size && `btn-${size}`, block && 'btn-block'].filter(Boolean).join(' ');
  return (
    <button className={cls} {...rest}>
      {icon && <Icon name={icon} />}
      {children}
      {iconRight && <Icon name={iconRight} />}
    </button>
  );
}

/* ---- Tag (format chips) ------------------------------------------------- */
const TAG_CLASS = { 'IQF':'tag-iqf', 'Bloque':'tag-bloque', 'Cocido':'tag-cocido', 'Prefrito':'tag-prefrito' };
function Tag({ label }) {
  return <span className={`tag ${TAG_CLASS[label]||'tag-bloque'}`}>{label}</span>;
}

/* ---- Price -------------------------------------------------------------- */
function Price({ value, t, from = true }) {
  return (
    <div className="price">
      {from && <span className="from">{t('from')}</span>}
      <span className="v">S/ {value.toFixed(2)}</span>
      <span className="u">{t('per_kg')}</span>
    </div>
  );
}

/* ---- Product image (user-fillable, premium placeholder) ----------------- */
function ProductImg({ id, label, dark = false }) {
  return React.createElement('image-slot', {
    id:`img-${id}`, class: dark ? 'slot-dark' : '', placeholder: label, shape:'rect',
  });
}

/* ---- Section heading ---------------------------------------------------- */
function SectionHead({ eyebrow, title, sub, center, dark, children }) {
  return (
    <div className={`sec-head ${center?'center':''}`}>
      {eyebrow && <span className={`eyebrow ${dark?'on-dark':''}`}>{eyebrow}</span>}
      <h2 className="h2">{title}</h2>
      {sub && <p className="lead">{sub}</p>}
      {children}
    </div>
  );
}

/* ---- hooks -------------------------------------------------------------- */
function useScrolled(threshold = 12) {
  const [s, setS] = useState(false);
  useEffect(() => {
    const on = () => setS(window.scrollY > threshold);
    on(); window.addEventListener('scroll', on, { passive:true });
    return () => window.removeEventListener('scroll', on);
  }, [threshold]);
  return s;
}

Object.assign(window, {
  Icon, ChevGlyph, DividerChev, Logo, Btn, Tag, Price, ProductImg, SectionHead, useScrolled,
});
