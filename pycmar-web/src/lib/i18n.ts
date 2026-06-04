export type Lang = 'es' | 'en' | 'zh';

type Dict = Record<string, string>;

const t_data: Record<Lang, Dict> = {
  es: {
    nav_home:"Inicio", nav_catalog:"Catálogo", nav_about:"Nosotros", nav_export:"Exportación", nav_contact:"Contacto",
    search:"Buscar producto, especie o corte…",
    cta_catalog:"Ver catálogo", cta_quote:"Solicitar cotización",
    hero_eyebrow:"Exportador peruano de productos hidrobiológicos",
    hero_title_1:"Del mar del Perú", hero_title_em:"al mundo", hero_title_2:", sin romper la cadena de frío.",
    hero_sub:"Pota, pescados, mariscos y preparados congelados con estándares HACCP y SANIPES. Compra directa para el mercado local y cotización para volumen de exportación.",
    stat_species:"Especies en línea", stat_markets:"Mercados de destino", stat_cold:"Cadena de frío", stat_years:"Trazabilidad total",
    cats_title:"Categorías destacadas", cats_heading:"Una línea completa de proteína marina",
    cats_sub:"Pota, pescados, mariscos, ovas y preparados — todo congelado bajo una misma cadena de frío.",
    cats_all:"Ver todo el catálogo",
    benefits_title:"Por qué Pycmar", benefits_heading:"Confianza que se construye contenedor a contenedor",
    benefits_sub:"Cuatro razones por las que clientes locales e internacionales confían en cada embarque.",
    ben1_t:"Calidad certificada", ben1_d:"Plantas con HACCP, SANIPES y habilitación FDA/UE. Control en cada lote.",
    ben2_t:"Cadena de frío", ben2_d:"Congelado IQF y en bloque a −18 °C, sin interrupción desde planta a contenedor.",
    ben3_t:"Capacidad exportadora", ben3_d:"Gestión operativa integral y tercerización para procesar a cualquier volumen.",
    ben4_t:"Trazabilidad", ben4_d:"Zona de captura FAO, talla y empaque documentados por producto.",
    featured_title:"Productos destacados", featured_heading:"Lo más solicitado",
    trust_title:"Certificaciones y mercados", trust_heading:"Operamos bajo los estándares más exigentes del mundo",
    trust_sub:"Operamos bajo los estándares que exigen los mercados más estrictos.",
    markets_label:"Mercados de destino",
    cta_band_title:"¿Listo para tu próximo embarque?",
    cta_band_sub:"Cuéntanos qué necesitas y armamos tu cotización por contenedor o pedido local.",
    view_detail:"Ver detalle", add_quote:"Agregar a cotización", buy_now:"Comprar",
    filter_cat:"Categoría", filter_format:"Formato", filter_origin:"Origen", filter_clear:"Limpiar filtros",
    catalog_title:"Catálogo de productos",
    catalog_sub:"Pota, pescados, mariscos y preparados congelados. Filtra por categoría, formato y origen.",
    catalog_count:"productos",
    sort_label:"Ordenar", sort_featured:"Destacados", sort_az:"A — Z", sort_price_lo:"Precio: menor", sort_price_hi:"Precio: mayor",
    all:"Todos", per_kg:"x kg", from:"desde", quote_only:"Precio por cotización",
    spec_sci:"Nombre científico", spec_fao:"Zona de captura", spec_origin:"Origen", spec_format:"Formato",
    spec_pres:"Presentación", spec_measure:"Medidas", spec_sizes:"Tallas", spec_pack:"Empaquetado",
    qty:"Cantidad", related:"También te puede interesar", back_catalog:"Volver al catálogo",
    tab_buy:"Compra directa", tab_quote:"Cotización export",
    buy_note:"Precio local con IGV. Despacho refrigerado en Lima y provincias.",
    quote_note:"Para volumen y exportación: arma tu lista y solicita precio FOB/CFR.",
    cart_title:"Tu selección", cart_empty:"Aún no agregas productos.", cart_empty_cta:"Explorar catálogo",
    subtotal:"Subtotal", request_quote:"Enviar solicitud de cotización", remove:"Quitar", continue_shopping:"Seguir comprando",
    export_eyebrow:"Capacidades de exportación", export_title:"Una operación lista para el comercio internacional.",
    export_sub:"Gestionamos cada etapa de la cadena productiva con conocimiento técnico y logística de frío.",
    process_title:"Cómo trabajamos", process_heading:"De la captura al contenedor, en cuatro etapas",
    logistics_title:"Logística y cobertura", logistics_heading:"Una operación lista para el comercio internacional",
    coverage_eyebrow:"Cobertura internacional", coverage_heading:"Llevamos el mar del Perú a estos mercados",
    contact_title:"Hablemos de tu pedido", contact_sub:"Respondemos cotizaciones en menos de 24 horas hábiles.",
    form_name:"Nombre y apellido", form_company:"Empresa", form_country:"País", form_email:"Correo",
    form_type:"Tipo de cliente", form_type_b2c:"Local / Minorista", form_type_b2b:"Exportación / Mayorista",
    form_volume:"Volumen estimado", form_message:"Mensaje", form_send:"Enviar solicitud",
    form_whatsapp:"Escríbenos por WhatsApp",
    quote_ok:"¡Solicitud enviada!", quote_ok_sub:"Nuestro equipo comercial te contactará en menos de 24 h.",
    direct_contact:"Conversemos directo",
    reply_24h:"Respondemos en 24 horas",
    reply_24h_sub:"Todo pedido de exportación recibe una cotización FOB/CFR detallada en menos de un día hábil.",
    footer_rights:"Todos los derechos reservados.",
    footer_explore:"Explora", footer_company:"Empresa", footer_contact:"Contacto",
    footer_about:"Empresa peruana dedicada al desarrollo exportador, gestión operativa, procesamiento y comercialización de productos hidrobiológicos. Soluciones eficientes, confiables y sostenibles para el mercado nacional e internacional.",
    login:"Ingresar", register:"Crear cuenta", logout:"Salir",
    announce_text:"Exportación a 6 mercados internacionales",
    vol_1:"< 1 contenedor", vol_2:"1–3 contenedores / mes", vol_3:"3–10 contenedores / mes", vol_4:"> 10 contenedores / mes",
    vol_select:"Selecciona un volumen",
    send_another:"Enviar otra solicitud",
    no_results:"No hay productos con esos filtros.",
    frozen_iqf:"Congelado IQF a bordo", traceability:"Trazabilidad por lote",
    certifications:"Certificaciones",
    loading:"Procesando…",
    filters:"Filtros", view_results:"Ver resultados",
    cart_buy:"Compra", cart_quote_seg:"Cotización",
    checkout:"Proceder al pago", checkout_title:"Resumen de pago",
    pay_card:"Tarjeta crédito/débito", pay_wallet:"Billetera digital", pay_intl:"Internacional",
    pay_pay:"Pagar", order_ok:"¡Pedido confirmado!", order_ok_sub:"Recibirás la confirmación por correo. ¡Gracias!",
    products_to_quote:"Productos a cotizar", quote_dest:"Destino, Incoterm, frecuencia…",
  },
  en: {
    nav_home:"Home", nav_catalog:"Catalog", nav_about:"About", nav_export:"Export", nav_contact:"Contact",
    search:"Search product, species or cut…",
    cta_catalog:"View catalog", cta_quote:"Request a quote",
    hero_eyebrow:"Peruvian exporter of hydrobiological products",
    hero_title_1:"From Peru's sea", hero_title_em:"to the world", hero_title_2:", without breaking the cold chain.",
    hero_sub:"Squid, fish, shellfish and value-added frozen seafood under HACCP and SANIPES standards. Direct purchase for the local market and quotes for export volume.",
    stat_species:"Species in line", stat_markets:"Destination markets", stat_cold:"Cold chain", stat_years:"Full traceability",
    cats_title:"Featured categories", cats_heading:"A complete marine protein line",
    cats_sub:"Squid, fish, shellfish, roe and value-added — all frozen under a single cold chain.",
    cats_all:"View full catalog",
    benefits_title:"Why Pycmar", benefits_heading:"Trust built container by container",
    benefits_sub:"Four reasons local and international clients trust every single shipment.",
    ben1_t:"Certified quality", ben1_d:"HACCP & SANIPES plants with FDA/EU approval. Control in every batch.",
    ben2_t:"Cold chain", ben2_d:"IQF and block freezing at −18 °C, unbroken from plant to container.",
    ben3_t:"Export capacity", ben3_d:"Full operational management and outsourcing to process at any volume.",
    ben4_t:"Traceability", ben4_d:"FAO capture zone, size and packaging documented per product.",
    featured_title:"Featured products", featured_heading:"Most requested",
    trust_title:"Certifications & markets", trust_heading:"We operate under the world's most demanding standards",
    trust_sub:"We operate under the standards the strictest markets demand.",
    markets_label:"Destination markets",
    cta_band_title:"Ready for your next shipment?",
    cta_band_sub:"Tell us what you need and we'll build your quote by container or local order.",
    view_detail:"View detail", add_quote:"Add to quote", buy_now:"Buy now",
    filter_cat:"Category", filter_format:"Format", filter_origin:"Origin", filter_clear:"Clear filters",
    catalog_title:"Product catalog",
    catalog_sub:"Squid, fish, shellfish and value-added frozen seafood. Filter by category, format and origin.",
    catalog_count:"products",
    sort_label:"Sort", sort_featured:"Featured", sort_az:"A — Z", sort_price_lo:"Price: low", sort_price_hi:"Price: high",
    all:"All", per_kg:"per kg", from:"from", quote_only:"Price on request",
    spec_sci:"Scientific name", spec_fao:"Capture zone", spec_origin:"Origin", spec_format:"Format",
    spec_pres:"Presentation", spec_measure:"Measurements", spec_sizes:"Sizes", spec_pack:"Packaging",
    qty:"Quantity", related:"You may also like", back_catalog:"Back to catalog",
    tab_buy:"Direct purchase", tab_quote:"Export quote",
    buy_note:"Local price incl. tax. Refrigerated delivery in Lima and provinces.",
    quote_note:"For volume & export: build your list and request FOB/CFR pricing.",
    cart_title:"Your selection", cart_empty:"You haven't added products yet.", cart_empty_cta:"Explore catalog",
    subtotal:"Subtotal", request_quote:"Send quote request", remove:"Remove", continue_shopping:"Continue shopping",
    export_eyebrow:"Export capabilities", export_title:"An operation ready for international trade.",
    export_sub:"We manage every stage of the production chain with technical know-how and cold logistics.",
    process_title:"How we work", process_heading:"From catch to container, in four stages",
    logistics_title:"Logistics & coverage", logistics_heading:"An operation ready for global trade",
    coverage_eyebrow:"International coverage", coverage_heading:"We take Peru's sea to these markets",
    contact_title:"Let's talk about your order", contact_sub:"We answer quotes in under 24 business hours.",
    form_name:"Full name", form_company:"Company", form_country:"Country", form_email:"Email",
    form_type:"Client type", form_type_b2c:"Local / Retail", form_type_b2b:"Export / Wholesale",
    form_volume:"Estimated volume", form_message:"Message", form_send:"Send request",
    form_whatsapp:"Message us on WhatsApp",
    quote_ok:"Request sent!", quote_ok_sub:"Our sales team will contact you within 24 h.",
    direct_contact:"Let's talk directly",
    reply_24h:"We reply within 24 hours",
    reply_24h_sub:"Every export request gets a detailed FOB/CFR quote in under one business day.",
    footer_rights:"All rights reserved.",
    footer_explore:"Explore", footer_company:"Company", footer_contact:"Contact",
    footer_about:"Peruvian company dedicated to export development, operational management, processing and commercialization of hydrobiological products. Efficient, reliable and sustainable solutions for domestic and international markets.",
    login:"Log in", register:"Sign up", logout:"Log out",
    announce_text:"Exporting to 6 international markets",
    vol_1:"< 1 container", vol_2:"1–3 containers / month", vol_3:"3–10 containers / month", vol_4:"> 10 containers / month",
    vol_select:"Select a volume",
    send_another:"Send another request",
    no_results:"No products match those filters.",
    frozen_iqf:"IQF frozen on board", traceability:"Batch-level traceability",
    certifications:"Certifications",
    loading:"Processing…",
    filters:"Filters", view_results:"View results",
    cart_buy:"Buy", cart_quote_seg:"Quote",
    checkout:"Proceed to checkout", checkout_title:"Checkout",
    pay_card:"Credit/debit card", pay_wallet:"Digital wallet", pay_intl:"International",
    pay_pay:"Pay", order_ok:"Order confirmed!", order_ok_sub:"You'll receive a confirmation by email. Thank you!",
    products_to_quote:"Products to quote", quote_dest:"Destination, Incoterm, frequency…",
  },
  zh: {
    nav_home:"首页", nav_catalog:"产品目录", nav_about:"关于我们", nav_export:"出口业务", nav_contact:"联系我们",
    search:"搜索产品、物种或切割方式…",
    cta_catalog:"查看目录", cta_quote:"申请报价",
    hero_eyebrow:"秘鲁水产品出口商",
    hero_title_1:"从秘鲁大海", hero_title_em:"走向世界", hero_title_2:"，冷链完整无断。",
    hero_sub:"鱿鱼、鱼类、贝类及冷冻增值海产品，符合HACCP和SANIPES标准。面向本地市场直购，出口量提供报价。",
    stat_species:"产品种类", stat_markets:"目标市场", stat_cold:"冷链运输", stat_years:"完整溯源",
    cats_title:"主要品类", cats_heading:"完整的海洋蛋白产品线",
    cats_sub:"鱿鱼、鱼类、贝类、鱼卵及增值产品——统一冷链冷冻管理。",
    cats_all:"查看全部目录",
    benefits_title:"为什么选择Pycmar", benefits_heading:"一个集装箱一个集装箱地建立信任",
    benefits_sub:"本地及国际客户信赖每次发货的四大理由。",
    ben1_t:"认证质量", ben1_d:"HACCP、SANIPES认证工厂，获FDA/欧盟批准，每批次严格把控。",
    ben2_t:"冷链运输", ben2_d:"IQF及整块冷冻至-18°C，从工厂到集装箱全程不中断。",
    ben3_t:"出口能力", ben3_d:"全流程运营管理和委托加工，可处理任意规模订单。",
    ben4_t:"产品溯源", ben4_d:"每种产品均记录FAO捕捞区域、规格和包装信息。",
    featured_title:"明星产品", featured_heading:"最受欢迎",
    trust_title:"认证与市场", trust_heading:"我们遵循全球最严格的标准运营",
    trust_sub:"我们严格执行各主要市场要求的质量标准。",
    markets_label:"目标市场",
    cta_band_title:"准备好下一次发货了吗？",
    cta_band_sub:"告诉我们您的需求，我们将为您提供按集装箱或本地订单的报价。",
    view_detail:"查看详情", add_quote:"加入报价单", buy_now:"立即购买",
    filter_cat:"品类", filter_format:"规格", filter_origin:"产地", filter_clear:"清除筛选",
    catalog_title:"产品目录",
    catalog_sub:"鱿鱼、鱼类、贝类及冷冻增值海产品。按品类、规格和产地筛选。",
    catalog_count:"个产品",
    sort_label:"排序", sort_featured:"推荐", sort_az:"A — Z", sort_price_lo:"价格：低到高", sort_price_hi:"价格：高到低",
    all:"全部", per_kg:"每千克", from:"起", quote_only:"询价",
    spec_sci:"学名", spec_fao:"捕捞区域", spec_origin:"产地", spec_format:"规格",
    spec_pres:"呈现形式", spec_measure:"尺寸规格", spec_sizes:"重量规格", spec_pack:"包装",
    qty:"数量", related:"您可能还喜欢", back_catalog:"返回目录",
    tab_buy:"直接购买", tab_quote:"出口报价",
    buy_note:"本地含税价格。在利马及各省提供冷链配送。",
    quote_note:"批量及出口订单：建立清单并申请FOB/CFR报价。",
    cart_title:"您的选择", cart_empty:"您尚未添加任何产品。", cart_empty_cta:"浏览目录",
    subtotal:"小计", request_quote:"发送报价请求", remove:"删除", continue_shopping:"继续购物",
    export_eyebrow:"出口能力", export_title:"为国际贸易准备好的完整运营体系。",
    export_sub:"我们凭借专业技术和冷链物流管理生产链的每个环节。",
    process_title:"我们的工作流程", process_heading:"从捕捞到集装箱，四个阶段",
    logistics_title:"物流与覆盖范围", logistics_heading:"为全球贸易准备好的运营体系",
    coverage_eyebrow:"国际覆盖", coverage_heading:"我们将秘鲁的海洋产品带到这些市场",
    contact_title:"让我们谈谈您的订单", contact_sub:"我们在24个工作小时内回复报价。",
    form_name:"姓名", form_company:"公司", form_country:"国家", form_email:"电子邮件",
    form_type:"客户类型", form_type_b2c:"本地 / 零售", form_type_b2b:"出口 / 批发",
    form_volume:"预计采购量", form_message:"留言", form_send:"发送请求",
    form_whatsapp:"通过WhatsApp联系我们",
    quote_ok:"请求已发送！", quote_ok_sub:"我们的销售团队将在24小时内与您联系。",
    direct_contact:"直接联系",
    reply_24h:"24小时内回复",
    reply_24h_sub:"每个出口请求都会在一个工作日内收到详细的FOB/CFR报价。",
    footer_rights:"版权所有。",
    footer_explore:"探索", footer_company:"公司", footer_contact:"联系方式",
    footer_about:"秘鲁企业，致力于水产品出口开发、运营管理、加工和销售。为国内外市场提供高效、可靠和可持续的解决方案。",
    login:"登录", register:"注册", logout:"退出",
    announce_text:"出口至6个国际市场",
    vol_1:"< 1个集装箱", vol_2:"1–3个集装箱/月", vol_3:"3–10个集装箱/月", vol_4:"> 10个集装箱/月",
    vol_select:"选择采购量",
    send_another:"发送另一个请求",
    no_results:"没有符合条件的产品。",
    frozen_iqf:"船上IQF冷冻", traceability:"批次溯源",
    certifications:"认证",
    loading:"处理中…",
    filters:"筛选", view_results:"查看结果",
    cart_buy:"购买", cart_quote_seg:"报价",
    checkout:"去结账", checkout_title:"结账",
    pay_card:"信用/借记卡", pay_wallet:"数字钱包", pay_intl:"国际支付",
    pay_pay:"付款", order_ok:"订单已确认！", order_ok_sub:"您将收到电子邮件确认。谢谢！",
    products_to_quote:"报价产品", quote_dest:"目的地、贸易术语、频率…",
  },
};

export function t(key: string, lang: Lang): string {
  return t_data[lang]?.[key] ?? t_data['es'][key] ?? key;
}

export function getLang(val: string | undefined): Lang {
  if (val === 'en' || val === 'zh') return val;
  return 'es';
}

export function pName(p: { name_es: string; name_en: string; name_zh?: string | null }, lang: Lang): string {
  if (lang === 'zh' && p.name_zh) return p.name_zh;
  return (lang !== 'es' && p.name_en) ? p.name_en : p.name_es;
}

export function pBlurb(p: { blurb_es?: string | null; blurb_en?: string | null; blurb_zh?: string | null }, lang: Lang): string | null {
  if (lang === 'zh' && p.blurb_zh) return p.blurb_zh;
  if (lang !== 'es' && p.blurb_en) return p.blurb_en;
  return p.blurb_es ?? null;
}

export function pDesc(p: { description_es: string; description_en: string; description_zh?: string | null }, lang: Lang): string {
  if (lang === 'zh' && p.description_zh) return p.description_zh;
  return (lang !== 'es' && p.description_en) ? p.description_en : p.description_es;
}

export function catName(p: { name_es: string; name_en: string; name_zh?: string | null }, lang: Lang): string {
  if (lang === 'zh' && p.name_zh) return p.name_zh;
  return (lang !== 'es' && p.name_en) ? p.name_en : p.name_es;
}

export function catDesc(p: { description_es: string; description_en: string; description_zh?: string | null }, lang: Lang): string {
  if (lang === 'zh' && p.description_zh) return p.description_zh;
  return (lang !== 'es' && p.description_en) ? p.description_en : p.description_es;
}

export const markets: Record<Lang, string[]> = {
  es: ['Estados Unidos','España','China','Japón','Italia','Corea del Sur'],
  en: ['United States','Spain','China','Japan','Italy','South Korea'],
  zh: ['美国','西班牙','中国','日本','意大利','韩国'],
};

const FORMAT_MAP: Record<string, Record<Lang, string>> = {
  'IQF':      { es: 'IQF',      en: 'IQF',        zh: 'IQF'  },
  'Bloque':   { es: 'Bloque',   en: 'Block',       zh: '块冻'  },
  'Cocido':   { es: 'Cocido',   en: 'Cooked',      zh: '熟制'  },
  'Prefrito': { es: 'Prefrito', en: 'Pre-fried',   zh: '预炸'  },
};
export function translateFormat(fmt: string, lang: Lang): string {
  return FORMAT_MAP[fmt]?.[lang] ?? fmt;
}

const ORIGIN_MAP: Record<string, { en: string; zh: string }> = {
  'Perú':           { en: 'Peru',             zh: '秘鲁'          },
  'Perú (Sechura)': { en: 'Peru (Sechura)',   zh: '秘鲁（塞丘拉）'  },
  'Perú · Ecuador': { en: 'Peru · Ecuador',   zh: '秘鲁 · 厄瓜多尔' },
  'Perú · África':  { en: 'Peru · Africa',    zh: '秘鲁 · 非洲'    },
  'Venezuela':      { en: 'Venezuela',        zh: '委内瑞拉'        },
  'África':         { en: 'Africa',           zh: '非洲'           },
  'Atlántico':      { en: 'Atlantic',         zh: '大西洋'          },
  'Caribe':         { en: 'Caribbean',        zh: '加勒比海'        },
  'España':         { en: 'Spain',            zh: '西班牙'          },
  'Pacífico':       { en: 'Pacific',          zh: '太平洋'          },
};
export function translateOrigin(origin: string, lang: Lang): string {
  if (lang === 'es') return origin;
  return ORIGIN_MAP[origin]?.[lang] ?? origin;
}

export const certs: Record<Lang, string[]> = {
  es: ['HACCP','SANIPES','FDA','BRCGS','Unión Europea','MSC Chain'],
  en: ['HACCP','SANIPES','FDA','BRCGS','European Union','MSC Chain'],
  zh: ['HACCP','SANIPES','FDA','BRCGS','欧盟','MSC Chain'],
};
