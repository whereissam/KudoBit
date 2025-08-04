// Security middleware based on stripe-style-api-standards.md Section 10

export const securityHeaders = () => {
  return async (c, next) => {
    await next();
    
    // Set security headers as per standards
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('X-XSS-Protection', '1; mode=block');
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https:;");
    
    // Remove server information
    c.header('Server', '');
    
    // Add API version header
    c.header('X-API-Version', 'v1');
  };
};

export const corsHeaders = () => {
  return async (c, next) => {
    const origin = c.req.header('Origin');
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174', 
      'http://localhost:3000',
      'https://kudobit.vercel.app' // Add production domain
    ];
    
    if (allowedOrigins.includes(origin)) {
      c.header('Access-Control-Allow-Origin', origin);
    }
    
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Idempotency-Key');
    c.header('Access-Control-Allow-Credentials', 'true');
    c.header('Access-Control-Max-Age', '86400'); // 24 hours
    
    if (c.req.method === 'OPTIONS') {
      return c.text('', 204);
    }
    
    await next();
  };
};