import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'server',
  site: 'https://pycmar.com',
  adapter: vercel(),
  integrations: [react()],
});
