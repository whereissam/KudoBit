import { errorHandler } from '../utils/errorHandler.js';

export const validateRequired = (fields) => {
  return async (c, next) => {
    try {
      const body = await c.req.json();
      
      const missing = [];
      for (const field of fields) {
        if (body[field] === undefined || body[field] === null || body[field] === '') {
          missing.push(field);
        }
      }
      
      if (missing.length > 0) {
        const message = missing.length === 1 
          ? `${missing[0]} is required`
          : `Missing required fields: ${missing.join(', ')}`;
        
        return errorHandler.badRequest(
          c, 
          message, 
          'missing_parameter', 
          missing[0] // First missing field as param
        );
      }
      
      await next();
    } catch (error) {
      return errorHandler.badRequest(c, 'Invalid JSON body', 'invalid_json');
    }
  };
};

export const validateWalletAddress = (addressField = 'address') => {
  return async (c, next) => {
    const address = c.req.param(addressField);
    
    if (!address) {
      return errorHandler.badRequest(
        c, 
        `${addressField} is required`, 
        'missing_parameter', 
        addressField
      );
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return errorHandler.badRequest(
        c, 
        'Invalid wallet address format. Must be a 40-character hexadecimal string starting with 0x', 
        'invalid_parameter_format', 
        addressField
      );
    }
    
    await next();
  };
};

// New validation middleware for type checking
export const validateTypes = (fieldTypes) => {
  return async (c, next) => {
    try {
      const body = await c.req.json();
      
      for (const [field, expectedType] of Object.entries(fieldTypes)) {
        if (body[field] !== undefined) {
          const actualType = typeof body[field];
          
          if (expectedType === 'integer' && !Number.isInteger(body[field])) {
            return errorHandler.badRequest(
              c,
              `${field} must be an integer`,
              'invalid_parameter_type',
              field
            );
          } else if (expectedType !== 'integer' && actualType !== expectedType) {
            return errorHandler.badRequest(
              c,
              `${field} must be of type ${expectedType}`,
              'invalid_parameter_type',
              field
            );
          }
        }
      }
      
      await next();
    } catch (error) {
      return errorHandler.badRequest(c, 'Invalid JSON body', 'invalid_json');
    }
  };
};