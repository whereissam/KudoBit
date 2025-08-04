import { errorHandler } from '../utils/errorHandler.js';

// In-memory rate limiting store (use Redis in production)
const rateLimitStore = new Map();

export const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = 'Too many requests from this IP, please try again later',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = (c) => c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
  } = options;

  return async (c, next) => {
    const key = keyGenerator(c);
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean up old entries
    if (rateLimitStore.has(key)) {
      const requests = rateLimitStore.get(key).filter(time => time > windowStart);
      rateLimitStore.set(key, requests);
    } else {
      rateLimitStore.set(key, []);
    }
    
    const requests = rateLimitStore.get(key);
    const requestCount = requests.length;
    
    // Set rate limit headers
    c.header('X-RateLimit-Limit', max.toString());
    c.header('X-RateLimit-Remaining', Math.max(0, max - requestCount).toString());
    c.header('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000).toString());
    
    if (requestCount >= max) {
      const retryAfter = Math.ceil(windowMs / 1000);
      return errorHandler.rateLimitExceeded(c, message, retryAfter);
    }
    
    // Record this request
    requests.push(now);
    
    await next();
    
    // Check if we should count this request
    const shouldCount = !(
      (skipSuccessfulRequests && c.res.status < 400) ||
      (skipFailedRequests && c.res.status >= 400)
    );
    
    if (!shouldCount) {
      // Remove the request we just added
      requests.pop();
    }
  };
};

// Specific rate limiters for different endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later'
});

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes for general API
  message: 'API rate limit exceeded'
});

export const createRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 creates per minute
  message: 'Too many create requests, please slow down'
});