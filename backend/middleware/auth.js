import jwt from 'jsonwebtoken';
import { errorHandler } from '../utils/errorHandler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'kudobit-hackathon-secret-key';

// Middleware to verify JWT token
export const authenticateToken = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return errorHandler.unauthorized(c, 'Access token required');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    c.set('user', decoded);
    await next();
  } catch (error) {
    return errorHandler.forbidden(c, 'Invalid or expired token');
  }
};