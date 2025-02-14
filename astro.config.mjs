import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

export default defineConfig({
  image: {
    domains: ["googleusercontent.com"],
  },
  output: 'server',
  adapter: netlify({
    edgeMiddleware: false,
  }),
});