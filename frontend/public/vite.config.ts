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

// Search engines: SITE_INDEXING=true (at launch) lets them index the site and follow the sitemap;
// otherwise robots.txt disallows everything and every page carries noindex (pre-launch).
const indexing = process.env.SITE_INDEXING === 'true'

function robotsTxt() {
  return indexing
    ? `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n'
}

/** Serves /robots.txt in dev and writes it into dist/ at build time. */
function robotsFile() {
  return {
    name: 'robots-txt',
    configureServer(server: any) {
      server.middlewares.use('/robots.txt', (_req: any, res: any) => {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.end(robotsTxt())
      })
    },
    generateBundle(this: any) {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt() })
    },
  }
}

function siteUrlInHtml() {
  return {
    name: 'site-url-in-html',
    transformIndexHtml(html: string) {
      const withUrl = html.replaceAll('%SITE_URL%', siteUrl)
      return indexing ? withUrl.replace(/\s*<!-- Pre-launch:[^>]*-->\s*<meta name="robots"[^>]*\/>/, '') : withUrl
    },
  }
}

export default defineConfig({
  base: basePath,
  plugins: [
    figmaAssetResolver(),
    siteUrlInHtml(),
    robotsFile(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  // Static assets in /public are served at / and copied to dist/ root
  publicDir: 'public',
  build: {
    rollupOptions: {
      output: {
        // Libraries change rarely: keep them in their own file so browsers reuse it after a site update.
        manualChunks(id: string) {
          if (/node_modules\/(react|react-dom|scheduler|react-router)\//.test(id)) return 'react'
          if (id.includes('node_modules/lucide-react')) return 'icons'
        },
      },
    },
  },
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
        // Send the browser's IP (X-Forwarded-For) so the API's per-IP rate limits work.
        xfwd: true,
      },
      // The sitemap is built by the API (it knows every fighter, event and article).
      // A production host must forward /sitemap.xml the same way.
      '/sitemap.xml': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:3001',
        changeOrigin: true,
        rewrite: () => '/api/sitemap.xml',
      },
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
