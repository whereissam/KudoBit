import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { swaggerUI } from '@hono/swagger-ui'
import { db } from './config/database.js'
import { config } from './config/env.js'
import { apiRoutes } from './routes/index.js'
import type { AppEnv } from './types/index.js'

const app = new Hono<AppEnv>()

// CORS middleware
app.use('/*', cors({
  origin: config.cors.origins,
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Health check
app.get('/', (c) => c.json({
  name: 'KudoBit API',
  version: '2.0.0',
  status: 'healthy',
  env: config.nodeEnv
}))

app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// API routes
app.route('/api', apiRoutes)

// Swagger UI
app.get('/docs', swaggerUI({
  url: '/api/docs/openapi.json'
}))

app.get('/api/docs/openapi.json', (c) => {
  return c.json({
    openapi: '3.0.0',
    info: {
      title: 'KudoBit API',
      version: '2.0.0',
      description: 'Decentralized Gumroad - Creator marketplace on blockchain',
      contact: { name: 'KudoBit Team' }
    },
    servers: [
      { url: `http://localhost:${config.port}`, description: 'Development server' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    tags: [
      { name: 'Authentication', description: 'SIWE authentication endpoints' },
      { name: 'Creators', description: 'Creator profile management' },
      { name: 'Products', description: 'Product management' },
      { name: 'Purchases', description: 'Purchase tracking and content access' },
      { name: 'Categories', description: 'Product categories' },
      { name: 'Tags', description: 'Product tags' },
      { name: 'Search', description: 'Search and discovery' },
      { name: 'Reviews', description: 'Product reviews and ratings' },
      { name: 'Wishlist', description: 'User wishlists' },
      { name: 'Follow', description: 'Creator following' },
      { name: 'Analytics', description: 'Creator and product analytics' },
      { name: 'Downloads', description: 'Secure content downloads' }
    ],
    paths: {}
  })
})

// 404 handler
app.notFound((c) => c.json({ error: 'Not found' }, 404))

// Error handler
app.onError((err, c) => {
  console.error('Global error:', err)
  return c.json({
    error: err.message || 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  }, ((err as Error & { statusCode?: number }).statusCode || 500) as 500)
})

async function start() {
  try {
    await db.init()

    serve({
      fetch: app.fetch,
      port: config.port
    })

    console.log(`
╔═══════════════════════════════════════════════╗
║  KudoBit API Server                           ║
║                                               ║
║  Environment: ${config.nodeEnv.padEnd(31)} ║
║  Port: ${String(config.port).padEnd(38)} ║
║  API: http://localhost:${config.port}/api          ║
║  Docs: http://localhost:${config.port}/docs        ║
║                                               ║
║  Database connected                           ║
║  Routes registered                            ║
║  Swagger UI available                         ║
║  TypeScript runtime (tsx)                     ║
╚═══════════════════════════════════════════════╝
    `)
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...')
  await db.close()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...')
  await db.close()
  process.exit(0)
})

start().catch(console.error)
