import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ url, cookies, redirect }) => {
  const lang = url.searchParams.get('lang');
  if (lang === 'es' || lang === 'en' || lang === 'zh') {
    cookies.set('lang', lang, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
  }
  const from = url.searchParams.get('from') ?? '/';
  return redirect(from, 302);
};
