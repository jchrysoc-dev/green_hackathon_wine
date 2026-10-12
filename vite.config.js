import { defineConfig } from 'vite';

export default defineConfig({
  // This project uses Vercel's existing config_GM_API_KEY browser variable.
  envPrefix: ['VITE_', 'config_']
});
