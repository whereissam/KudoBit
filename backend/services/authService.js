import { SiweMessage } from 'siwe';
import jwt from 'jsonwebtoken';
import { authModel } from '../models/authModel.js';
import { creatorModel } from '../models/creatorModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'kudobit-hackathon-secret-key';

export const authService = {
  generateNonce: () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  },

  authenticateUser: async (message, signature) => {
    let siweMessage;
    
    try {
      siweMessage = new SiweMessage(message);
    } catch (error) {
      console.error('SIWE message parsing error:', error);
      throw new Error('Invalid SIWE message format. Please ensure the message follows the EIP-4361 standard.');
    }
    
    let verification;
    try {
      verification = await siweMessage.verify({ signature });
    } catch (error) {
      console.error('SIWE verification error:', error);
      throw new Error('Failed to verify signature. Please check your message and signature.');
    }
    
    if (!verification.success) {
      throw new Error('Invalid signature');
    }

    const walletAddress = siweMessage.address.toLowerCase();
    
    const token = jwt.sign(
      { 
        address: walletAddress,
        chainId: siweMessage.chainId,
        iat: Math.floor(Date.now() / 1000)
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await authModel.createSession(walletAddress, token, expiresAt);

    let creator = await creatorModel.findByAddress(walletAddress);
    if (!creator) {
      creator = await creatorModel.create(walletAddress);
    }

    return {
      token,
      address: walletAddress
    };
  },

  logoutUser: async (address) => {
    await authModel.deleteSession(address);
  }
};