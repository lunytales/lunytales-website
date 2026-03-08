// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

const LEGACY_REDIRECT_PATH = '/lunytales-v2/';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://lunytales.com',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => {
        const pathname = page.startsWith('http') ? new URL(page).pathname : page;
        return pathname !== LEGACY_REDIRECT_PATH;
      },
    }),
  ],
});
