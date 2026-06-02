import type { APIRoute } from 'astro';
import { createSupabaseServer } from '../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
  const data = await request.json();
  const { nombre, email, empresa, pais, tipo_cliente, productos, volumen, mensaje } = data;

  if (!nombre || !email || !mensaje) {
    return new Response(JSON.stringify({ error: 'Faltan campos requeridos' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createSupabaseServer(cookies);
  const { error } = await supabase.from('contact_requests').insert({
    nombre, email, empresa, pais, tipo_cliente, productos, volumen, mensaje,
  });

  if (error) {
    return new Response(JSON.stringify({ error: 'Error al guardar' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
