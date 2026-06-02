/* =========================================================================
   PYCMAR · Shared components (ProductCard, CategoryCard)  →  window
   Pulls primitives from window (ui.jsx loads first).
   ========================================================================= */
const { Icon: _Icon, Tag: _Tag, Price: _Price, ProductImg: _ProductImg, ChevGlyph: _Chev } = window;

function ProductCard({ p, t, lang, nav, onAdd, added }) {
  const cat = window.PY.categories.find(c => c.id === p.cat);
  return (
    <article className="pcard" onClick={()=>nav('product',{id:p.id})}>
      <div className="pcard-img">
        <_ProductImg id={p.id} label={p[lang]} />
        <div className="pcard-tags">
          {p.tags.map(tg => <_Tag key={tg} label={tg} />)}
        </div>
        <button className="pcard-fav" aria-label="Save" onClick={(e)=>e.stopPropagation()}>
          <_Icon name="heart" />
        </button>
      </div>
      <div className="pcard-body">
        {p.sci !== 'Mix' && <div className="sci">{p.sci}</div>}
        <h3>{p[lang]}</h3>
        <div className="meta">
          <span>{p[`origin_${lang}`]}</span>
          <span className="dot"></span>
          <span>{p.fao}</span>
        </div>
        <div className="pcard-foot">
          <_Price value={p.price} t={t} />
          <button className={`pcard-add ${added?'added':''}`} aria-label={t('add_quote')}
            onClick={(e)=>{e.stopPropagation();onAdd(p);}}>
            <_Icon name={added?'check':'plus'} />
          </button>
        </div>
      </div>
    </article>
  );
}

function CategoryCard({ c, lang, nav, className, big }) {
  return (
    <article className={`cat-card ${className||''}`} onClick={()=>nav('catalog',{cat:c.id})}>
      <div className="ph"><_ProductImg id={`cat-${c.id}`} label={c[lang]} dark /></div>
      <div className="body">
        <div className="count">{c.count} {lang==='es'?'productos':'products'}</div>
        <h3 style={big?{fontSize:'1.9rem'}:null}>{c[lang]}</h3>
        <div className="d">{c[`desc_${lang}`]}</div>
        <span className="go">{lang==='es'?'Explorar':'Explore'} <_Icon name="arrowR" style={{width:17,height:17}} /></span>
      </div>
    </article>
  );
}

Object.assign(window, { ProductCard, CategoryCard });
