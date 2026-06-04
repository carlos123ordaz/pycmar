-- ============================================================
-- PYCMAR — Update: traducciones al chino (中文)
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de migration_add_chinese.sql
-- ============================================================


-- ── CATEGORÍAS ───────────────────────────────────────────────

-- Pota / Giant Squid
UPDATE public.categories SET
  name_zh        = '茎柔鱼（秘鲁鱿鱼）',
  description_zh = '茎柔鱼 — 我们出口产品线的核心品种。'
WHERE slug = 'pota';

-- Calamar y Sepia / Squid & Cuttlefish
UPDATE public.categories SET
  name_zh        = '鱿鱼与墨鱼',
  description_zh = '整只洛利戈鱿鱼和墨鱼，块冻或单冻（IQF）。'
WHERE slug = 'calamar';

-- Pescados / Fish
UPDATE public.categories SET
  name_zh        = '鱼类',
  description_zh = '中上层鱼类和底层鱼类，整条、去头去尾及鱼片。'
WHERE slug = 'pescado';

-- Mariscos / Shellfish
UPDATE public.categories SET
  name_zh        = '贝类与海鲜',
  description_zh = '优质章鱼、龙虾和扇贝。'
WHERE slug = 'marisco';

-- Ovas / Roe
UPDATE public.categories SET
  name_zh        = '鱼卵',
  description_zh = '块冻飞鱼卵，无黑卵。'
WHERE slug = 'ovas';

-- Preparados / Value-Added
UPDATE public.categories SET
  name_zh        = '加工产品',
  description_zh = '预炸及混合海鲜，即食即用。'
WHERE slug = 'preparados';


-- ── PRODUCTOS — POTA ─────────────────────────────────────────

-- Botones de Pota / Giant Squid Buttons
UPDATE public.products SET
  name_zh        = '鱿鱼套管圆切片',
  blurb_zh       = '整圆套管切片，均匀紧实。烧烤和爆炒的最佳规格。',
  description_zh = '整圆套管切片，均匀紧实。烧烤和爆炒的最佳规格。'
WHERE slug = 'botones';

-- Recortes de Pota / Giant Squid Bits & Pieces
UPDATE public.products SET
  name_zh        = '鱿鱼套管碎块',
  blurb_zh       = '套管碎块，适用于混合料、罐头及蛋白粉加工。',
  description_zh = '套管碎块，适用于混合料、罐头及蛋白粉加工。'
WHERE slug = 'recortes';

-- Filete de Pota / Giant Squid Fillet
UPDATE public.products SET
  name_zh        = '鱿鱼整片',
  blurb_zh       = '整张展开的套管片，可按需切成鱿鱼圈、鱿鱼条和定制切块。',
  description_zh = '整张展开的套管片，可按需切成鱿鱼圈、鱿鱼条和定制切块。'
WHERE slug = 'filete';

-- Daruma (Boin Boiled Fillet)
UPDATE public.products SET
  name_zh        = '熟制鱿鱼片（Daruma）',
  blurb_zh       = '日式预熟鱿鱼片，专为亚洲高端市场打造。',
  description_zh = '日式预熟鱿鱼片，专为亚洲高端市场打造。'
WHERE slug = 'daruma';

-- Steak Oval de Pota IQF / Oval Squid Steak IQF
UPDATE public.products SET
  name_zh        = '椭圆形鱿鱼排 IQF',
  blurb_zh       = '切割整齐的椭圆形鱿鱼排，适合零售包装。',
  description_zh = '切割整齐的椭圆形鱿鱼排，适合零售包装。'
WHERE slug = 'steak-oval';

-- Filete Corte Valencia / Valencia Fillet Cut
UPDATE public.products SET
  name_zh        = '巴伦西亚式鱿鱼片',
  blurb_zh       = '标准矩形切割，专为西班牙市场设计。',
  description_zh = '标准矩形切割，专为西班牙市场设计。'
WHERE slug = 'valencia';

-- Anillas de Pota / Giant Squid Rings
UPDATE public.products SET
  name_zh        = '鱿鱼圈',
  blurb_zh       = '标准规格鱿鱼圈，白色或黄色，适用于裹粉和罐装。',
  description_zh = '标准规格鱿鱼圈，白色或黄色，适用于裹粉和罐装。'
WHERE slug = 'anillas';

-- Alas de Pota / Giant Squid Wings
UPDATE public.products SET
  name_zh        = '鱿鱼鳍',
  blurb_zh       = '套管侧鳍，质地紧实，出肉率高。',
  description_zh = '套管侧鳍，质地紧实，出肉率高。'
WHERE slug = 'alas';

-- Nucas de Pota / Giant Squid Necks
UPDATE public.products SET
  name_zh        = '鱿鱼颈肉',
  blurb_zh       = '头套管连接处，肉质丰厚，适用于炖煮和混合料。',
  description_zh = '头套管连接处，肉质丰厚，适用于炖煮和混合料。'
WHERE slug = 'nucas';

-- Tentáculos de Pota / Giant Squid Tentacles
UPDATE public.products SET
  name_zh        = '鱿鱼触须',
  blurb_zh       = '干净切割，无爪无吸盘。',
  description_zh = '干净切割，无爪无吸盘。'
WHERE slug = 'tentaculos';

-- Rodajas de Rejo / Giant Squid Tentacle Slices
UPDATE public.products SET
  name_zh        = '熟制鱿鱼触须切片',
  blurb_zh       = '熟制触须切片，可直接用于塔帕斯和沙拉。',
  description_zh = '熟制触须切片，可直接用于塔帕斯和沙拉。'
WHERE slug = 'rodaja-rejo';

-- Dados de Pota IQF / Giant Squid Cubes IQF
UPDATE public.products SET
  name_zh        = '鱿鱼丁 IQF',
  blurb_zh       = '均匀2厘米方块，适合烤串和混合料。',
  description_zh = '均匀2厘米方块，适合烤串和混合料。'
WHERE slug = 'dados';

-- Rabas de Pota IQF / Giant Squid Sticks IQF
UPDATE public.products SET
  name_zh        = '炸鱿鱼条 IQF',
  blurb_zh       = '细长条，油炸专用，经典酒吧风格炸鱿鱼。',
  description_zh = '细长条，油炸专用，经典酒吧风格炸鱿鱼。'
WHERE slug = 'rabas';

-- Tiras de Pota IQF / Giant Squid Strips IQF
UPDATE public.products SET
  name_zh        = '鱿鱼宽条 IQF',
  blurb_zh       = '宽条切割，适用于爆炒和大批量炒锅料理。',
  description_zh = '宽条切割，适用于爆炒和大批量炒锅料理。'
WHERE slug = 'tiras';


-- ── PRODUCTOS — CALAMAR ──────────────────────────────────────

-- Calamar Loligo / Loligo Squid
UPDATE public.products SET
  name_zh        = '洛利戈鱿鱼（整只）',
  blurb_zh       = '整只小型鱿鱼，肉质甜嫩，达到市场标准规格。',
  description_zh = '整只小型鱿鱼，肉质甜嫩，达到市场标准规格。'
WHERE slug = 'loligo';

-- Sepia / Cuttlefish
UPDATE public.products SET
  name_zh        = '墨鱼（整只 IQF）',
  blurb_zh       = '整只单冻墨鱼，肉质白嫩紧实。',
  description_zh = '整只单冻墨鱼，肉质白嫩紧实。'
WHERE slug = 'sepia';


-- ── PRODUCTOS — PESCADOS ─────────────────────────────────────

-- Mahi Mahi (Dorado)
UPDATE public.products SET
  name_zh        = '鬼头刀（彩虹鱼）',
  blurb_zh       = '远洋鬼头刀，肉质紧实低脂，美国出口主打品种。',
  description_zh = '远洋鬼头刀，肉质紧实低脂，美国出口主打品种。'
WHERE slug = 'mahimahi';

-- Anchoveta Peruana / Peruvian Sardine
UPDATE public.products SET
  name_zh        = '秘鲁凤尾鱼',
  blurb_zh       = '秘鲁蓝色中上层鱼，富含Omega-3，适用于罐头和腌制加工。',
  description_zh = '秘鲁蓝色中上层鱼，富含Omega-3，适用于罐头和腌制加工。'
WHERE slug = 'anchoveta';

-- Sardina Venezolana / Venezuelan Sardine
UPDATE public.products SET
  name_zh        = '委内瑞拉沙丁鱼',
  blurb_zh       = '加勒比沙丁鱼，整条或去内脏，适合罐装。',
  description_zh = '加勒比沙丁鱼，整条或去内脏，适合罐装。'
WHERE slug = 'sardina-vz';

-- Rape (Monkfish)
UPDATE public.products SET
  name_zh        = '鮟鱇鱼（安康鱼）',
  blurb_zh       = '低脂紧实的鮟鱇鱼尾，欧洲高端食材。',
  description_zh = '低脂紧实的鮟鱇鱼尾，欧洲高端食材。'
WHERE slug = 'rape';

-- Cachua (Leatherjacket)
UPDATE public.products SET
  name_zh        = '剥皮鱼',
  blurb_zh       = '白肉剥皮鱼，去头去尾出肉率高。',
  description_zh = '白肉剥皮鱼，去头去尾出肉率高。'
WHERE slug = 'cachua';

-- Tahalí (Pez Sable) / Ribbonfish
UPDATE public.products SET
  name_zh        = '带鱼（银刀鱼）',
  blurb_zh       = '银色带鱼，在亚洲市场需求量极大。',
  description_zh = '银色带鱼，在亚洲市场需求量极大。'
WHERE slug = 'tahali';

-- Pargo Rojo del Caribe / Caribbean Red Snapper
UPDATE public.products SET
  name_zh        = '加勒比红鲷鱼',
  blurb_zh       = '深红皮色鲷鱼，高端餐桌明星食材。',
  description_zh = '深红皮色鲷鱼，高端餐桌明星食材。'
WHERE slug = 'pargo';

-- Pejerrey (Silverside)
UPDATE public.products SET
  name_zh        = '秘鲁银汉鱼',
  blurb_zh       = '规格整齐的单冻银汉鱼，适合油炸或铁板烧。',
  description_zh = '规格整齐的单冻银汉鱼，适合油炸或铁板烧。'
WHERE slug = 'pejerrey';

-- Corvina Amarilla / Yellow Corvina
UPDATE public.products SET
  name_zh        = '黄花鱼（白姑鱼）',
  blurb_zh       = '低脂白姑鱼，无骨IVP鱼片。',
  description_zh = '低脂白姑鱼，无骨IVP鱼片。'
WHERE slug = 'corvina';

-- Pez Sierra (Kingfish)
UPDATE public.products SET
  name_zh        = '马鲛鱼（国王鱼）',
  blurb_zh       = '紧实马鲛鱼排，适合烧烤和酸橘汁腌鱼（柠汁腌）。',
  description_zh = '紧实马鲛鱼排，适合烧烤和酸橘汁腌鱼（柠汁腌）。'
WHERE slug = 'pez-sierra';


-- ── PRODUCTOS — MARISCOS ─────────────────────────────────────

-- Concha de Abanico / Scallops
UPDATE public.products SET
  name_zh        = '扇贝',
  blurb_zh       = '塞丘拉湾扇贝，肉质甜嫩，认证水产养殖。',
  description_zh = '塞丘拉湾扇贝，肉质甜嫩，认证水产养殖。'
WHERE slug = 'concha';

-- Langosta / Lobster
UPDATE public.products SET
  name_zh        = '龙虾',
  blurb_zh       = '生冻整只龙虾或龙虾尾，按规格分级，出口高端食材。',
  description_zh = '生冻整只龙虾或龙虾尾，按规格分级，出口高端食材。'
WHERE slug = 'langosta';

-- Pulpo / Octopus
UPDATE public.products SET
  name_zh        = '章鱼（整只）',
  blurb_zh       = '按规格分级的整只章鱼，肉质鲜嫩，可按需提供花切。',
  description_zh = '按规格分级的整只章鱼，肉质鲜嫩，可按需提供花切。'
WHERE slug = 'pulpo';

-- Pulpo en Bandeja / Octopus on Tray
UPDATE public.products SET
  name_zh        = '托盘装章鱼',
  blurb_zh       = '整只章鱼托盘包装，高端零售规格。',
  description_zh = '整只章鱼托盘包装，高端零售规格。'
WHERE slug = 'pulpo-bandeja';

-- Pata de Pulpo Cocida / Cooked Octopus Tentacle
UPDATE public.products SET
  name_zh        = '熟制章鱼须',
  blurb_zh       = '加利西亚风味熟制章鱼须，即可摆盘上桌。',
  description_zh = '加利西亚风味熟制章鱼须，即可摆盘上桌。'
WHERE slug = 'pata-pulpo';


-- ── PRODUCTOS — OVAS ─────────────────────────────────────────

-- Ovas de Pez Volador / Flying Fish Roe
UPDATE public.products SET
  name_zh        = '飞鱼卵（Tobiko）',
  blurb_zh       = '天然飞鱼卵块冻，寿司及日式料理的基础食材。',
  description_zh = '天然飞鱼卵块冻，寿司及日式料理的基础食材。'
WHERE slug = 'ovas';


-- ── PRODUCTOS — PREPARADOS ───────────────────────────────────

-- Calamar a la Romana / Battered Rings
UPDATE public.products SET
  name_zh        = '裹粉炸鱿鱼圈',
  blurb_zh       = '裹粉鱿鱼圈，即炸即食，欧洲风味增值产品。',
  description_zh = '裹粉鱿鱼圈，即炸即食，欧洲风味增值产品。'
WHERE slug = 'romana';

-- Preparado de Marisco / Seafood Mix
UPDATE public.products SET
  name_zh        = '海鲜混合包',
  blurb_zh       = '混合海鲜包，适合海鲜饭、炒饭和意面。',
  description_zh = '混合海鲜包，适合海鲜饭、炒饭和意面。'
WHERE slug = 'mix';


-- ── VERIFICACIÓN ─────────────────────────────────────────────
SELECT slug, name_es, name_zh,
       (blurb_zh IS NOT NULL AND blurb_zh <> '')       AS tiene_blurb,
       (description_zh IS NOT NULL AND description_zh <> '') AS tiene_desc
FROM public.products
ORDER BY category_id, slug;
