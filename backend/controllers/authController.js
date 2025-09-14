import { authService } from '../services/authService.js';
import { errorHandler } from '../utils/errorHandler.js';

export const authController = {
  getNonce: (c) => {
    try {
      const nonce = authService.generateNonce();
      return c.json({ 
        object: 'nonce',
        nonce,
        created: Math.floor(Date.now() / 1000)
      });
    } catch (error) {
      console.error('Get nonce error:', error);
      return errorHandler.internal(c, 'Failed to generate nonce');
    }
  },

  getSiweTemplate: (c) => {
    const nonce = authService.generateNonce();
    const domain = c.req.header('host') || 'localhost:4500';
    const origin = `http://${domain}`;
    
    const siweTemplate = {
      domain,
      address: '{{USER_WALLET_ADDRESS}}', // To be replaced by frontend
      statement: 'Sign in to KudoBit',
      uri: origin,
      version: '1',
      chainId: 2810, // Morph Holesky
      nonce,
      issuedAt: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
    };
    
    const messageTemplate = `${domain} wants you to sign in with your Ethereum account:
{{USER_WALLET_ADDRESS}}

Sign in to KudoBit

URI: ${origin}
Version: 1
Chain ID: 2810
Nonce: ${nonce}
Issued At: ${siweTemplate.issuedAt}
Expiration Time: ${siweTemplate.expirationTime}`;

    return c.json({
      object: 'siwe_template',
      nonce,
      template: siweTemplate,
      message_template: messageTemplate,
      instructions: 'Replace {{USER_WALLET_ADDRESS}} with the actual wallet address before signing',
      created: Math.floor(Date.now() / 1000)
    });
  },

  login: async (c) => {
    try {
      const { message, signature } = await c.req.json();
      
      if (!message || !signature) {
        return errorHandler.badRequest(c, 'Message and signature are required');
      }

      const result = await authService.authenticateUser(message, signature);
      
      return c.json({
        object: 'authentication',
        id: `auth_${Date.now()}`,
        success: true,
        token: result.token,
        address: result.address,
        message: 'Authentication successful',
        created: Math.floor(Date.now() / 1000)
      });
      
    } catch (error) {
      console.error('Auth login error:', error);
      
      // Handle different types of authentication errors
      if (error.message.includes('Invalid signature')) {
        return errorHandler.unauthorized(c, error.message, 'invalid_signature');
      } else if (error.message.includes('Invalid SIWE message format')) {
        return errorHandler.badRequest(c, error.message, 'invalid_siwe_format');
      } else if (error.message.includes('Failed to verify signature')) {
        return errorHandler.badRequest(c, error.message, 'verification_failed');
      }
      
      return errorHandler.internal(c, 'Authentication failed');
    }
  },

  logout: async (c) => {
    try {
      const user = c.get('user');
      await authService.logoutUser(user.address);
      
      return c.json({
        object: 'authentication',
        id: `logout_${Date.now()}`,
        success: true,
        message: 'Logged out successfully',
        created: Math.floor(Date.now() / 1000)
      });
    } catch (error) {
      console.error('Auth logout error:', error);
      return errorHandler.internal(c, 'Logout failed');
    }
  },

  verifyAuth: (c) => {
    const user = c.get('user');
    return c.json({
      object: 'authentication_status',
      authenticated: true,
      address: user.address,
      chainId: user.chainId,
      created: Math.floor(Date.now() / 1000)
    });
  }
};