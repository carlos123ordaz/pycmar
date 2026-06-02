import { defineMiddleware } from 'astro:middleware';
import { getLang } from './lib/i18n';

export const onRequest = defineMiddleware((context, next) => {
  const cookie = context.cookies.get('lang')?.value;
  context.locals.lang = getLang(cookie);
  return next();
});
