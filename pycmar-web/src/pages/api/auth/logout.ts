import type { APIRoute } from 'astro';
import { createSupabaseServer } from '../../../lib/supabase';

export const POST: APIRoute = async ({ cookies }) => {
  const supabase = createSupabaseServer(cookies);
  await supabase.auth.signOut();

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
