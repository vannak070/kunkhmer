import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

const basePath = process.env.VITE_BASE_PATH || '/'

// Public origin used for absolute link-preview URLs in index.html (og:image, og:url).
// Set SITE_URL in production, e.g. SITE_URL=https://kunkhmer.com (include the base path if any).
const siteUrl = (process.env.SITE_URL || `http://localhost:5176${basePath}`).replace(/\/$/, '')

function siteUrlInHtml() {
  return {
    name: 'site-url-in-html',
    transformIndexHtml(html: string) {
      return html.replaceAll('%SITE_URL%', siteUrl)
    },
  }
}

export default defineConfig({
  base: basePath,
  plugins: [
    figmaAssetResolver(),
    siteUrlInHtml(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  // Static assets in /public are served at / and copied to dist/ root
  publicDir: 'public',
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5176,
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
