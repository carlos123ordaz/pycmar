/* =========================================================================
   PYCMAR · Export + Contact pages  →  window
   ========================================================================= */
const { Icon: E_Icon, Btn: E_Btn, DividerChev: E_Div, SectionHead: E_Sec, ProductImg: E_Img } = window;

function ExportPage({ t, lang, nav }) {
  const steps = [
    { ic:'anchor',  t: lang==='es'?'Abastecimiento':'Sourcing',      d: lang==='es'?'Captura artesanal e industrial con control de origen y zona FAO documentada.':'Artisanal and industrial catch with origin control and documented FAO zone.' },
    { ic:'flask',   t: lang==='es'?'Procesamiento':'Processing',      d: lang==='es'?'Fileteado, corte y clasificación en planta con habilitación HACCP y SANIPES.':'Filleting, cutting and grading in HACCP & SANIPES-approved plants.' },
    { ic:'snow',    t: lang==='es'?'Congelado IQF':'IQF Freezing',    d: lang==='es'?'Congelado individual o en bloque a −18 °C, con glaseo a la carta.':'Individual or block freezing at −18 °C, with customizable glazing.' },
    { ic:'ship',    t: lang==='es'?'Logística & embarque':'Logistics & shipping', d: lang==='es'?'Contenedores reefer, documentación de exportación e Incoterms a medida.':'Reefer containers, export documentation and tailored Incoterms.' },
  ];
  const logistics = [
    { ic:'ship', t: lang==='es'?'Contenedores reefer':'Reefer containers', d: lang==='es'?'Carga consolidada o FCL a −18 °C sin ruptura de cadena de frío.':'Consolidated or FCL cargo at −18 °C with an unbroken cold chain.' },
    { ic:'doc',  t: lang==='es'?'Documentación completa':'Full documentation', d: lang==='es'?'Certificado sanitario, origen, packing list y trazabilidad por lote.':'Health & origin certificates, packing list and batch traceability.' },
    { ic:'scale',t: lang==='es'?'Incoterms a medida':'Tailored Incoterms', d: lang==='es'?'FOB, CFR o CIF según el destino y el acuerdo comercial.':'FOB, CFR or CIF depending on destination and trade agreement.' },
    { ic:'factory', t: lang==='es'?'Tercerización de planta':'Plant outsourcing', d: lang==='es'?'Gestión operativa integral para procesar a cualquier volumen.':'End-to-end operational management to process at any volume.' },
  ];
  return (
    <main>
      <section className="export-hero">
        <div className="wrap">
          <span className="eyebrow on-dark">{t('export_eyebrow')}</span>
          <h1 className="display" style={{margin:'.3em 0 .4em'}}>{t('export_title')}</h1>
          <p className="lead">{t('export_sub')}</p>
          <div className="hero-stats" style={{marginTop:36}}>
            {[['6', lang==='es'?'Continentes atendidos':'Markets served'],['−18°C', lang==='es'?'Cadena de frío':'Cold chain'],['24h', lang==='es'?'Respuesta a cotización':'Quote turnaround']].map(([n,l])=>(
              <div className="hero-stat" key={l}><div className="n">{n}</div><div className="l">{l}</div></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <E_Sec eyebrow={t('process_title')} title={lang==='es'?'De la captura al contenedor, en cuatro etapas':'From catch to container, in four stages'} center />
          <div className="process-grid">
            {steps.map((s,i)=>(
              <div className="process-step" key={s.t}>
                <div className="num">{String(i+1).padStart(2,'0')}</div>
                <div className="bene-ic" style={{marginBottom:16}}><E_Icon name={s.ic} /></div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bene">
        <div className="wrap">
          <div className="logi">
            <div>
              <div className="logi-visual"><E_Img id="export-logistics" label={lang==='es'?'FOTO · Carga reefer / planta de proceso':'PHOTO · Reefer loading / processing plant'} /></div>
            </div>
            <div>
              <span className="eyebrow">{t('logistics_title')}</span>
              <h2 className="h2" style={{margin:'12px 0 6px'}}>{lang==='es'?'Una operación lista para el comercio internacional':'An operation ready for global trade'}</h2>
              <div className="logi-list">
                {logistics.map(l => (
                  <div className="logi-item" key={l.t}>
                    <div className="ic"><E_Icon name={l.ic} /></div>
                    <div><h4>{l.t}</h4><p>{l.d}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section trust">
        <div className="wrap center">
          <span className="eyebrow">{lang==='es'?'Cobertura internacional':'International coverage'}</span>
          <h2 className="h2" style={{margin:'14px auto 12px',maxWidth:'18ch'}}>{lang==='es'?'Llevamos el mar del Perú a estos mercados':'We take Peru\'s sea to these markets'}</h2>
          <div className="map-markets" style={{justifyContent:'center',maxWidth:680,margin:'26px auto 0'}}>
            {window.PY.markets.map(m => (
              <span key={m.en} className="market-tag" style={{fontSize:'.95rem',padding:'.6em 1.2em'}}>
                <E_Icon name="plane" style={{width:16,height:16,display:'inline',verticalAlign:'-2px',marginRight:6,color:'#7ef0c4'}} />{m[lang]}
              </span>
            ))}
          </div>
          <div style={{marginTop:34}}>
            <E_Btn variant="accent" size="lg" icon="doc" onClick={()=>nav('contact')}>{t('cta_quote')}</E_Btn>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---- Contact ------------------------------------------------------------ */
function ContactPage({ t, lang }) {
  const [type, setType] = React.useState('b2b');
  const [sent, setSent] = React.useState(false);
  const { company } = window.PY;
  const submit = (e) => { e.preventDefault(); setSent(true); window.scrollTo(0,0); };

  if (sent) {
    return (
      <main className="section">
        <div className="wrap" style={{maxWidth:560}}>
          <div className="success-state" style={{background:'var(--mist)',borderRadius:'var(--radius-lg)',border:'1px solid var(--line)'}}>
            <div className="success-ic"><E_Icon name="check" /></div>
            <h3>{t('quote_ok')}</h3>
            <p>{t('quote_ok_sub')}</p>
            <E_Btn variant="navy" onClick={()=>setSent(false)}>{lang==='es'?'Enviar otra solicitud':'Send another request'}</E_Btn>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <section className="section-tight" style={{background:'var(--mist)',borderBottom:'1px solid var(--line)'}}>
        <div className="wrap">
          <span className="eyebrow" style={{display:'block',marginBottom:12}}>{t('nav_contact')}</span>
          <h1 className="h2">{t('contact_title')}</h1>
          <p className="lead" style={{marginTop:10,maxWidth:'46ch'}}>{t('contact_sub')}</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div style={{display:'grid',gridTemplateColumns:'1.3fr .9fr',gap:'clamp(30px,5vw,56px)',alignItems:'start'}} className="contact-grid">
            <form onSubmit={submit} style={{background:'#fff',border:'1px solid var(--line)',borderRadius:'var(--radius-lg)',padding:'clamp(24px,3vw,38px)',boxShadow:'var(--shadow-sm)'}}>
              <div className="field-row">
                <div className="field"><label>{t('form_name')} <span className="req">*</span></label><input required placeholder={lang==='es'?'Ej. María Quispe':'e.g. Maria Quispe'} /></div>
                <div className="field"><label>{t('form_company')}</label><input placeholder={lang==='es'?'Ej. Ocean Foods S.A.':'e.g. Ocean Foods Inc.'} /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>{t('form_email')} <span className="req">*</span></label><input type="email" required placeholder="nombre@empresa.com" /></div>
                <div className="field"><label>{t('form_country')} <span className="req">*</span></label>
                  <select required defaultValue="Perú">
                    {['Perú','Estados Unidos','España','China','Japón','Italia','Corea del Sur','Otro'].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="field">
                <label>{t('form_type')} <span className="req">*</span></label>
                <div className="seg-radio">
                  <label><input type="radio" name="type" checked={type==='b2c'} onChange={()=>setType('b2c')} /><span>{t('form_type_b2c')}</span></label>
                  <label><input type="radio" name="type" checked={type==='b2b'} onChange={()=>setType('b2b')} /><span>{t('form_type_b2b')}</span></label>
                </div>
              </div>
              {type==='b2b' && (
                <div className="field"><label>{t('form_volume')}</label>
                  <select defaultValue="">
                    <option value="" disabled>{lang==='es'?'Selecciona un volumen':'Select a volume'}</option>
                    {['< 1 contenedor','1–3 contenedores / mes','3–10 contenedores / mes','> 10 contenedores / mes'].map(v=><option key={v}>{v}</option>)}
                  </select>
                </div>
              )}
              <div className="field"><label>{t('form_message')}</label><textarea placeholder={lang==='es'?'Cuéntanos qué productos, formato y destino necesitas…':'Tell us which products, format and destination you need…'}></textarea></div>
              <E_Btn variant="accent" size="lg" block iconRight="arrowR" type="submit">{t('form_send')}</E_Btn>
              <a className="btn btn-wa btn-block" style={{marginTop:12}} href={`https://wa.me/${company.phoneRaw}`} target="_blank" rel="noreferrer">
                <E_Icon name="whatsapp" /> {t('form_whatsapp')}
              </a>
            </form>

            <div>
              <div style={{background:'var(--navy)',color:'#fff',borderRadius:'var(--radius-lg)',padding:'30px',marginBottom:18}}>
                <E_Div />
                <h3 style={{color:'#fff',margin:'14px 0 18px'}}>{lang==='es'?'Conversemos directo':'Let\'s talk directly'}</h3>
                <a className="footer-contact-item" href={`mailto:${company.email}`} style={{marginBottom:16}}><E_Icon name="mail" /> {company.email}</a>
                <a className="footer-contact-item" href={`tel:+${company.phoneRaw}`} style={{marginBottom:16}}><E_Icon name="phone" /> {company.phone}</a>
                <div className="footer-contact-item" style={{marginBottom:0}}><E_Icon name="pin" /> {company.city}</div>
              </div>
              <div style={{background:'var(--mist)',border:'1px solid var(--line)',borderRadius:'var(--radius-lg)',padding:'26px'}}>
                <div className="bene-ic" style={{marginBottom:14}}><E_Icon name="snow" /></div>
                <h4 style={{fontSize:'1.05rem',marginBottom:8}}>{lang==='es'?'Respondemos en 24 horas':'We reply within 24 hours'}</h4>
                <p className="muted" style={{fontSize:'.92rem'}}>{lang==='es'?'Todo pedido de exportación recibe una cotización FOB/CFR detallada en menos de un día hábil.':'Every export request gets a detailed FOB/CFR quote in under one business day.'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { ExportPage, ContactPage });
