import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { swaggerUI } from '@hono/swagger-ui';
import dotenv from 'dotenv';
import { initializeDatabase } from './database-sqlite.js';
import { v1Routes } from './routes/v1/index.js';
import { errorHandler } from './utils/errorHandler.js';
import { swaggerSpec } from './docs/swagger.js';
import { eventIndexer } from './event-indexer.js';
import { securityHeaders, corsHeaders } from './middleware/security.js';
import { apiRateLimit } from './middleware/rateLimit.js';
import { requestLogger, logger } from './utils/logger.js';

dotenv.config();

const app = new Hono();

// Enhanced security and logging middleware
app.use('*', requestLogger());
app.use('*', securityHeaders());
app.use('*', corsHeaders());
app.use('/v1/*', apiRateLimit);

// Health check endpoint
app.get('/', (c) => {
  return c.json({ 
    object: 'api_version',
    id: 'kudobit_v1',
    name: 'KudoBit API',
    version: '1.0.0',
    status: 'active',
    created: Math.floor(Date.now() / 1000)
  });
});

// API Documentation endpoints
app.get('/docs', swaggerUI({ url: '/api-spec' }));
app.get('/api-spec', (c) => {
  return c.json(swaggerSpec);
});

// Mount versioned API routes
app.route('/v1', v1Routes);

// Global error handler
app.onError((err, c) => {
  console.error('Global error:', err);
  return errorHandler.internal(c, 'Internal server error');
});

// 404 handler
app.notFound((c) => {
  return errorHandler.notFound(c, 'Endpoint not found');
});

const port = process.env.PORT || 4500;

console.log(`🚀 KudoBit Backend (Stripe-style) starting on port ${port}`);
console.log(`📡 CORS enabled for: http://localhost:5173, http://localhost:3000`);
console.log(`🔗 API Base URL: http://localhost:${port}/v1`);

// Initialize database and event indexer before starting server
async function startServer() {
  try {
    console.log('🗄️  Initializing database...');
    await initializeDatabase();
    
    // Initialize and start event indexer (optional, can be enabled later)
    try {
      console.log('🔍 Initializing event indexer...');
      await eventIndexer.initialize();
      await eventIndexer.start();
      console.log('✅ Event indexer started successfully');
    } catch (error) {
      console.warn('⚠️  Event indexer failed to start (this is optional):', error.message);
      console.warn('   The API will continue to work normally without event indexing');
      console.warn('   Set proper RPC_URL and upgrade QuickNode plan if needed');
    }
    
    serve({
      fetch: app.fetch,
      port
    });
    
    console.log(`✅ KudoBit Backend running at http://localhost:${port}`);
    console.log(`📖 API Documentation: http://localhost:${port}/docs`);
    console.log(`🔗 API Base URL: http://localhost:${port}/v1`);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();