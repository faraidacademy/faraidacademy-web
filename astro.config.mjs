import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

import sitemap from '@astrojs/sitemap';

import icon from 'astro-icon';

export default defineConfig({
  image: {
    domains: ["googleusercontent.com"],
  },
  output: 'server',

  adapter: netlify({
    edgeMiddleware: false,
  }),

  integrations: [sitemap(), icon({
    include: {
      "material-symbols": ["*"],
    },
  }),],
});