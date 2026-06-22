/* =========================================================================
   PYCMAR · About page (Nosotros)  →  window
   ========================================================================= */
const { Icon: AB_Icon, Btn: AB_Btn, SectionHead: AB_Sec, ProductImg: AB_Img, DividerChev: AB_Div } = window;

function AboutPage({ t, lang, nav }) {
  const isEs = lang === 'es';
  const { company } = window.PY;

  const values = [
    { ic:'shield', t: isEs?'Calidad certificada':'Certified quality',
      d: isEs?'Cada lote pasa por control bajo protocolos HACCP y SANIPES, desde la recepción hasta el embarque.'
            :'Every batch is controlled under HACCP and SANIPES protocols, from intake to shipping.' },
    { ic:'snow', t: isEs?'Cadena de frío':'Unbroken cold chain',
      d: isEs?'Congelado IQF y en bloque a −18 °C, sin interrupción entre la planta y el contenedor reefer.'
            :'IQF and block freezing at −18 °C, unbroken from plant to reefer container.' },
    { ic:'leaf', t: isEs?'Pesca responsable':'Responsible sourcing',
      d: isEs?'Trabajamos con captura artesanal e industrial trazable, respetando tallas y zonas FAO.'
            :'We work with traceable artisanal and industrial catch, respecting sizes and FAO zones.' },
    { ic:'anchor', t: isEs?'Origen peruano':'Peruvian origin',
      d: isEs?'Desde Paita y Lima al mundo: el sabor y la riqueza del mar peruano en cada embarque.'
            :'From Paita and Lima to the world: the flavor and wealth of the Peruvian sea in every shipment.' },
  ];

  return (
    <main>
      {/* ---- Hero --------------------------------------------------------- */}
      <section className="export-hero">
        <div className="wrap">
          <span className="eyebrow on-dark">{t('nav_about')}</span>
          <h1 className="display" style={{margin:'.3em 0 .4em'}}>
            {isEs ? <>Una empresa peruana que lleva <em>el mar al mundo</em>.</>
                  : <>A Peruvian company taking <em>the sea to the world</em>.</>}
          </h1>
          <p className="lead">
            {isEs
              ? 'Pycmar es una empresa dedicada al desarrollo exportador, procesamiento y comercialización de productos hidrobiológicos congelados, con la calidad y la trazabilidad que exigen los mercados más estrictos.'
              : 'Pycmar is a company dedicated to export development, processing and commercialization of frozen hydrobiological products, with the quality and traceability the strictest markets demand.'}
          </p>
          <div className="hero-stats" style={{marginTop:36}}>
            {[
              ['35+', isEs?'Especies en línea':'Species in line'],
              ['6', isEs?'Mercados de destino':'Destination markets'],
              ['−18°C', isEs?'Cadena de frío':'Cold chain'],
              ['100%', isEs?'Trazabilidad':'Traceability'],
            ].map(([n,l]) => (
              <div className="hero-stat" key={l}><div className="n">{n}</div><div className="l">{l}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Historia ----------------------------------------------------- */}
      <section className="section">
        <div className="wrap">
          <div className="logi">
            <div>
              <span className="eyebrow">{isEs?'Quiénes somos':'Who we are'}</span>
              <h2 className="h2" style={{margin:'12px 0 16px'}}>
                {isEs?'Nacimos junto al mar del norte peruano':'Born by Peru\'s northern sea'}
              </h2>
              <p className="lead" style={{marginBottom:16}}>
                {isEs
                  ? 'En la costa de Paita, donde desembarca buena parte de la pota y los pelágicos del Perú, construimos una operación que une el conocimiento del pescador artesanal con la disciplina de una planta de exportación.'
                  : 'On the coast of Paita, where much of Peru\'s squid and pelagics are landed, we built an operation that unites the artisanal fisher\'s knowledge with the discipline of an export plant.'}
              </p>
              <p className="muted" style={{fontSize:'1rem',lineHeight:1.65}}>
                {isEs
                  ? 'Hoy procesamos pota, pescados, mariscos, ovas y preparados de valor agregado, atendiendo tanto al mercado local con compra directa como a clientes internacionales con cotizaciones por contenedor. Cada producto sale documentado: especie, zona de captura FAO, talla y empaque.'
                  : 'Today we process squid, fish, shellfish, roe and value-added products, serving both the local market with direct purchase and international clients with per-container quotes. Every product ships documented: species, FAO capture zone, size and packaging.'}
              </p>
              <div className="market-row" style={{marginTop:24}}>
                {window.PY.certs.slice(0,4).map(c => <span key={c} className="market-tag">{c}</span>)}
              </div>
            </div>
            <div>
              <div className="logi-visual"><AB_Img id="about-team" label={isEs?'FOTO · Equipo Pycmar / planta de proceso':'PHOTO · Pycmar team / processing plant'} /></div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Misión & Visión --------------------------------------------- */}
      <section className="section bene">
        <div className="wrap">
          <AB_Sec eyebrow={isEs?'Nuestro propósito':'Our purpose'}
            title={isEs?'Lo que nos mueve cada día':'What drives us every day'} center />
          <div className="mv-grid">
            <div className="mv-card">
              <div className="bene-ic" style={{marginBottom:18}}><AB_Icon name="anchor" /></div>
              <span className="bene-n">{isEs?'Misión':'Mission'}</span>
              <h3>{isEs?'Llevar el mar del Perú al mundo':'Take Peru\'s sea to the world'}</h3>
              <p>
                {isEs
                  ? 'Ofrecer productos hidrobiológicos congelados de máxima calidad, procesados con responsabilidad y entregados sin romper la cadena de frío, generando valor para nuestros pescadores, clientes y equipo.'
                  : 'Offer top-quality frozen hydrobiological products, processed responsibly and delivered without breaking the cold chain, creating value for our fishers, clients and team.'}
              </p>
            </div>
            <div className="mv-card">
              <div className="bene-ic" style={{marginBottom:18}}><AB_Icon name="globe" /></div>
              <span className="bene-n">{isEs?'Visión':'Vision'}</span>
              <h3>{isEs?'Ser un referente exportador del Perú':'Become a benchmark Peruvian exporter'}</h3>
              <p>
                {isEs
                  ? 'Consolidarnos como un socio confiable de la pesca peruana en los mercados internacionales más exigentes, reconocidos por nuestra trazabilidad, sostenibilidad y consistencia en cada embarque.'
                  : 'Consolidate ourselves as a trusted partner of Peruvian fishing in the most demanding international markets, recognized for our traceability, sustainability and consistency in every shipment.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Cita / declaración ------------------------------------------ */}
      <section className="section-tight">
        <div className="wrap">
          <div className="about-quote">
            <AB_Div />
            <blockquote>
              {isEs
                ? '“No vendemos sólo congelados: entregamos la confianza de una cadena de frío que nunca se rompe, desde la red hasta el plato.”'
                : '“We don\'t just sell frozen seafood: we deliver the trust of a cold chain that never breaks, from net to plate.”'}
            </blockquote>
            <div className="about-quote-by">{company.legal} · {company.city}</div>
          </div>
        </div>
      </section>

      {/* ---- Valores ------------------------------------------------------ */}
      <section className="section">
        <div className="wrap">
          <AB_Sec eyebrow={isEs?'Nuestros valores':'Our values'}
            title={isEs?'Los principios detrás de cada contenedor':'The principles behind every container'}
            sub={isEs?'Cuatro compromisos que sostienen la relación con nuestros clientes locales e internacionales.':'Four commitments that sustain our relationship with local and international clients.'} center />
          <div className="bene-grid">
            {values.map((v,i) => (
              <div className="bene-card" key={v.t}>
                <span className="bene-n">{String(i+1).padStart(2,'0')}</span>
                <div className="bene-ic"><AB_Icon name={v.ic} /></div>
                <h3>{v.t}</h3>
                <p>{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA band ----------------------------------------------------- */}
      <section className="section-tight">
        <div className="wrap">
          <div className="cta-band">
            <div>
              <AB_Div />
              <h2 className="h2" style={{marginTop:14}}>
                {isEs?'¿Trabajamos juntos en tu próximo embarque?':'Shall we work together on your next shipment?'}
              </h2>
              <p>{isEs?'Conoce nuestra capacidad exportadora o escríbenos para armar tu cotización.':'Discover our export capacity or write to us to build your quote.'}</p>
            </div>
            <div className="acts">
              <AB_Btn variant="accent" size="lg" iconRight="arrowR" onClick={()=>nav('export')}>{isEs?'Ver exportación':'View export'}</AB_Btn>
              <AB_Btn variant="ghost-light" size="lg" icon="doc" onClick={()=>nav('contact')}>{t('cta_quote')}</AB_Btn>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { AboutPage });
