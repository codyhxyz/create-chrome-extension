import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react', '@wxt-dev/auto-icons'],
  manifest: {
    name: 'My Extension',
    description: 'A brief description of what this extension does.',
    permissions: ['storage', 'alarms', 'sidePanel'],
    minimum_chrome_version: '114',
  },
  autoIcons: {
    baseIconPath: 'assets/icon.svg',
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
