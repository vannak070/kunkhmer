import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import fs from 'node:fs'
import zlib from 'node:zlib'
import crypto from 'node:crypto'
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


/**
 * Build-time extras for the installable admin (claude/updates/admin-pwa-performance.md):
 *  - index.html: preloads the English font, and gives the Khmer font's file name to the small script that
 *    preloads it for browsers set to Khmer;
 *  - dist/sw.js: the service worker (pwa/sw.template.js) with the list of files to keep on the device and a
 *    version taken from their names, so every deploy is a new version;
 *  - a Brotli copy (.br) of text files, which Caddy serves to browsers that accept it (about 15 % smaller than gzip).
 */
function kkfPwa(): Plugin {
  let base = '/'
  return {
    name: 'kkf-pwa',
    apply: 'build',
    configResolved(config) {
      base = config.base.endsWith('/') ? config.base : config.base + '/'
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const names = Object.keys(ctx.bundle ?? {})
        const find = (re: RegExp) => names.find((n) => re.test(n))
        const outfit = find(/outfit-latin-.*\.woff2$/)
        const khmer = find(/kantumruy-pro-khmer-.*\.woff2$/)
        return {
          html: html.replace('__KHMER_FONT__', khmer ? base + khmer : ''),
          tags: outfit
            ? [{ tag: 'link', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: base + outfit }, injectTo: 'head-prepend' as const }]
            : [],
        }
      },
    },
    writeBundle(options, bundle) {
      const dir = options.dir as string
      const built = Object.keys(bundle).filter((n) => !n.endsWith('.map') && n !== 'index.html')
      // Everything the screens need, so an installed app is complete (and an old version stays consistent after a deploy).
      const precache = ['index.html', 'manifest.webmanifest', 'favicon.png', 'icons/icon-192.png', ...built]
      const html = String((bundle['index.html'] as { source?: string | Uint8Array } | undefined)?.source ?? '')
      const version = crypto.createHash('sha1').update(precache.join('|') + html).digest('hex').slice(0, 10)
      const template = fs.readFileSync(path.resolve(__dirname, 'pwa/sw.template.js'), 'utf8')
      fs.writeFileSync(
        path.join(dir, 'sw.js'),
        template.replace('__VERSION__', version).replace('__PRECACHE__', JSON.stringify(precache)),
      )

      const walk = (d: string): string[] =>
        fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]))
      for (const file of walk(dir)) {
        if (!/\.(js|css|html|svg|json|webmanifest)$/.test(file)) continue
        const source = fs.readFileSync(file)
        if (source.length < 1024) continue
        fs.writeFileSync(file + '.br', zlib.brotliCompressSync(source, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11, [zlib.constants.BROTLI_PARAM_SIZE_HINT]: source.length } }))
      }
    },
  }
}

const basePath = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  base: basePath,
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    kkfPwa(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5175,
    proxy: {
      // Proxy /api calls to the backend (Docker: backend:3001, local: localhost:3001)
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        // Send the browser's IP (X-Forwarded-For) so the API's per-IP rate limits work.
        xfwd: true,
      },
    },
  },

  build: {
    // Keep React and the router in their own file: it rarely changes, so a deploy doesn't make phones download it again.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/node_modules\/(react|react-dom|scheduler|react-router)\//.test(id)) return 'react'
        },
      },
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
