// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://lunytales.com',
  base: '/lunytales-v2',
  trailingSlash: 'always',
});
