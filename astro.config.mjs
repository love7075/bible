// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
    output: 'static',
    site: 'https://love7075.github.io',
    base: '/', // TODO: 将 'your-repo-name' 替换为你的 GitHub 仓库名
    // adapter: vercel({
    //     webAnalytics: {
    //         enabled: true
    //     },
    //     isr: true,
    // }),
    vite: {
        plugins: [tailwindcss()],
        envPrefix: ['MONGODB_', 'NODE_'],
        envDir: '.',
        build: {
            assetsInlineLimit: 0
        }
    }
});
