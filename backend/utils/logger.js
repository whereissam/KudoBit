// Structured logging utility based on stripe-style-api-standards.md Section 11

class Logger {
  constructor() {
    this.correlationId = null;
  }

  setCorrelationId(id) {
    this.correlationId = id;
  }

  _log(level, message, metadata = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      correlation_id: this.correlationId,
      ...metadata
    };

    // In production, send to centralized logging system
    console.log(JSON.stringify(logEntry));
  }

  debug(message, metadata) {
    this._log('debug', message, metadata);
  }

  info(message, metadata) {
    this._log('info', message, metadata);
  }

  warn(message, metadata) {
    this._log('warn', message, metadata);
  }

  error(message, metadata) {
    this._log('error', message, metadata);
  }

  critical(message, metadata) {
    this._log('critical', message, metadata);
  }

  // Audit logging for compliance
  audit(action, metadata = {}) {
    this._log('info', `AUDIT: ${action}`, {
      ...metadata,
      audit: true,
      timestamp_unix: Math.floor(Date.now() / 1000)
    });
  }

  // Request logging
  request(c, startTime = Date.now()) {
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    this._log('info', 'HTTP Request', {
      request_id: c.get('requestId'),
      method: c.req.method,
      endpoint: c.req.path,
      status_code: c.res.status,
      latency: `${latency}ms`,
      client_ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
      user_agent: c.req.header('user-agent'),
      user_id: c.get('user')?.address || null
    });
  }
}

export const logger = new Logger();

// Middleware to add request ID and correlation ID
export const requestLogger = () => {
  return async (c, next) => {
    const requestId = generateRequestId();
    const correlationId = c.req.header('x-correlation-id') || requestId;
    
    c.set('requestId', requestId);
    c.set('correlationId', correlationId);
    logger.setCorrelationId(correlationId);
    
    // Add correlation ID to response headers
    c.header('X-Correlation-ID', correlationId);
    c.header('X-Request-ID', requestId);
    
    const startTime = Date.now();
    
    try {
      await next();
    } catch (error) {
      logger.error('Request failed with error', {
        request_id: requestId,
        error_type: error.constructor.name,
        error_message: error.message,
        error_stack: error.stack,
        endpoint: c.req.path,
        method: c.req.method
      });
      throw error;
    } finally {
      logger.request(c, startTime);
    }
  };
};

function generateRequestId() {
  return 'req_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}