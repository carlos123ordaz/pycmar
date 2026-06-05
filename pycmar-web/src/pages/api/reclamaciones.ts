import type { APIRoute } from 'astro';
import { createSupabaseServer } from '../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
  const data = await request.json();
  const { nombre, dni, email, telefono, direccion, tipo, fecha, producto, descripcion, pedido } = data;

  if (!nombre || !dni || !email || !telefono || !tipo || !fecha || !descripcion) {
    return new Response(JSON.stringify({ error: 'Faltan campos requeridos' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createSupabaseServer(cookies);
  const { error } = await supabase.from('reclamaciones').insert({
    nombre,
    dni,
    email,
    telefono,
    direccion: direccion || null,
    tipo,
    fecha_incidente: fecha,
    producto: producto || null,
    descripcion,
    pedido: pedido || null,
  });

  if (error) {
    return new Response(JSON.stringify({ error: 'Error al guardar el reclamo' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
