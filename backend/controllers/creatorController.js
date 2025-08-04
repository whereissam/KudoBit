import { creatorService } from '../services/creatorService.js';
import { errorHandler } from '../utils/errorHandler.js';

export const creatorController = {
  getAllCreators: async (c) => {
    try {
      const creators = await creatorService.getAllCreators();
      
      return c.json({
        object: 'list',
        data: creators.map(creator => ({
          id: creator.address,
          object: 'creator',
          address: creator.address,
          displayName: creator.displayName,
          bio: creator.bio,
          isVerified: creator.isVerified,
          created: Math.floor(new Date(creator.created).getTime() / 1000)
        })),
        has_more: false
      });
    } catch (error) {
      console.error('Get all creators error:', error);
      return errorHandler.internal(c, 'Failed to fetch creators');
    }
  },

  registerCreator: async (c) => {
    try {
      const user = c.get('user');
      const { displayName, bio, socialLinks } = await c.req.json();
      
      const creator = await creatorService.registerCreator(
        user.address,
        displayName,
        bio,
        socialLinks
      );

      return c.json({
        id: creator.address,
        object: 'creator',
        address: creator.address,
        displayName: creator.displayName,
        bio: creator.bio,
        socialLinks: creator.socialLinks,
        created: Math.floor(new Date(creator.created).getTime() / 1000)
      });
      
    } catch (error) {
      console.error('Register creator error:', error);
      if (error.message === 'Creator already registered') {
        return errorHandler.badRequest(c, error.message);
      }
      return errorHandler.internal(c, 'Registration failed');
    }
  },

  getCreator: async (c) => {
    try {
      const address = c.req.param('address').toLowerCase();
      const creator = await creatorService.getCreator(address);
      
      if (!creator) {
        return errorHandler.notFound(c, 'Creator not found');
      }

      return c.json({
        id: creator.address,
        object: 'creator',
        address: creator.address,
        displayName: creator.displayName,
        bio: creator.bio,
        socialLinks: creator.socialLinks,
        isVerified: creator.isVerified,
        created: Math.floor(new Date(creator.created).getTime() / 1000)
      });
    } catch (error) {
      console.error('Get creator error:', error);
      return errorHandler.internal(c, 'Failed to fetch creator');
    }
  },

  updateProfile: async (c) => {
    try {
      const user = c.get('user');
      const { displayName, bio, socialLinks } = await c.req.json();
      
      const updatedCreator = await creatorService.updateCreator(
        user.address,
        { displayName, bio, socialLinks }
      );

      if (!updatedCreator) {
        return errorHandler.notFound(c, 'Creator not found');
      }

      return c.json({
        id: updatedCreator.address,
        object: 'creator',
        address: updatedCreator.address,
        displayName: updatedCreator.displayName,
        bio: updatedCreator.bio,
        socialLinks: updatedCreator.socialLinks,
        updated: Math.floor(Date.now() / 1000)
      });
      
    } catch (error) {
      console.error('Update creator error:', error);
      return errorHandler.internal(c, 'Profile update failed');
    }
  }
};