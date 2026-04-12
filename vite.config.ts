import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import react from '@vitejs/plugin-react-swc'
import type { Connect, Plugin } from 'vite'
import { defineConfig, loadEnv } from 'vite'

// ── Local dev: simulate /.netlify/functions/auth ───────────────────────────
// In production, the real Netlify Function handles this.
// env is loaded with loadEnv (empty prefix = ALL vars incl. non-VITE_ ones).
function netlifyFunctionsMock(env: Record<string, string>): Plugin {
  return {
    name: 'netlify-functions-mock',
    apply: 'serve',
    configureServer(server) {
      const authHandler: Connect.NextHandleFunction = (
        req: IncomingMessage,
        res: ServerResponse,
        next: Connect.NextFunction
      ) => {
        if (req.url !== '/.netlify/functions/auth') return next()
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        let body = ''
        req.on('data', (chunk: Buffer) => {
          body += chunk.toString()
        })
        req.on('end', () => {
          try {
            const { password } = JSON.parse(body) as { password: string }
            const ownerPassword = env.OWNER_PASSWORD

            if (!ownerPassword || password !== ownerPassword) {
              res.statusCode = 401
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ authorized: false, error: 'Invalid password' }))
              return
            }

            const providers: Record<string, { apiKey: string }> = {}
            if (env.GEMINI_API_KEY) {
              providers.gemini = { apiKey: env.GEMINI_API_KEY }
            }
            if (env.OPENROUTER_API_KEY) {
              providers.openrouter = { apiKey: env.OPENROUTER_API_KEY }
            }

            const defaultProvider = providers.openrouter ? 'openrouter' : 'gemini'

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ authorized: true, providers, defaultProvider }))
          } catch {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Invalid request body' }))
          }
        })
      }

      server.middlewares.use(authHandler)
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load ALL env vars from .env.local (empty prefix = no VITE_ filter)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    server: {
      host: '::',
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), netlifyFunctionsMock(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
