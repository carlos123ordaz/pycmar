import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  site: 'https://pycmar.com',   // actualiza con tu dominio real
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
});
