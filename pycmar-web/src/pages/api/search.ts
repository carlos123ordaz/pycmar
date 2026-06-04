import type { APIRoute } from 'astro';
import { supabase, getImageUrl } from '../../lib/supabase';

export const GET: APIRoute = async ({ url }) => {
  const q    = url.searchParams.get('q')?.trim() ?? '';
  const lang = url.searchParams.get('lang') ?? 'es';

  if (q.length < 2) {
    return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
  }

  const { data, error } = await supabase
    .from('products')
    .select('id, name_es, name_en, name_zh, slug, images:product_images(image_path), category:categories(name_es, name_en, name_zh, slug)')
    .eq('active', true)
    .or(`name_es.ilike.%${q}%,name_en.ilike.%${q}%,name_zh.ilike.%${q}%`)
    .limit(6);

  if (error || !data) {
    return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
  }

  const results = data.map((p: any) => {
    const name = lang === 'zh' && p.name_zh ? p.name_zh
               : lang === 'en' && p.name_en ? p.name_en
               : p.name_es;
    const cat  = lang === 'zh' ? p.category?.name_zh ?? p.category?.name_es
               : lang === 'en' ? p.category?.name_en ?? p.category?.name_es
               : p.category?.name_es;
    const img  = getImageUrl('product-images', p.images?.[0]?.image_path ?? null);
    return { id: p.id, name, cat, slug: p.slug, img };
  });

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
};
