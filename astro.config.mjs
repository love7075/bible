// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
    output: 'server',
    adapter: vercel({
        webAnalytics: {
            enabled: true
        }
    }),
    vite: {
        plugins: [tailwindcss()],
        envPrefix: ['MONGODB_', 'NODE_'],
        envDir: '.',
        build: {
            assetsInlineLimit: 0
        }
    }
});
