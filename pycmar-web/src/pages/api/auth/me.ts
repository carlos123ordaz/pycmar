import type { APIRoute } from 'astro';
import { createSupabaseServer } from '../../../lib/supabase';

export const GET: APIRoute = async ({ cookies }) => {
  const supabase = createSupabaseServer(cookies);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ user: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ user: { id: user.id, email: user.email } }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
