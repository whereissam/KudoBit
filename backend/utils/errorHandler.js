export const errorHandler = {
  badRequest: (c, message, code = null, param = null) => {
    const error = {
      type: 'validation_error',
      message
    };
    
    if (code) error.code = code;
    if (param) error.param = param;
    
    return c.json({ error }, 400);
  },

  unauthorized: (c, message, code = 'authentication_required') => {
    return c.json({
      error: {
        type: 'authentication_error',
        message,
        code
      }
    }, 401);
  },

  forbidden: (c, message, code = 'insufficient_permissions') => {
    return c.json({
      error: {
        type: 'authorization_error',
        message,
        code
      }
    }, 403);
  },

  notFound: (c, message, code = 'resource_not_found') => {
    return c.json({
      error: {
        type: 'api_error',
        message,
        code
      }
    }, 404);
  },

  rateLimitExceeded: (c, message, retryAfter = null) => {
    const error = {
      type: 'rate_limit_exceeded',
      message,
      code: 'rate_limit_exceeded'
    };
    
    const headers = {};
    if (retryAfter) {
      headers['Retry-After'] = retryAfter.toString();
    }
    
    return c.json({ error }, 429, headers);
  },

  internal: (c, message, code = 'internal_server_error') => {
    return c.json({
      error: {
        type: 'api_error',
        message,
        code
      }
    }, 500);
  }
};