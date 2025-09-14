import { creatorModel } from '../models/creatorModel.js';

export const creatorService = {
  getAllCreators: async () => {
    const creators = await creatorModel.findAll();
    return creators.map(creator => ({
      address: creator.address,
      displayName: creator.display_name,
      bio: creator.bio,
      isVerified: creator.is_verified,
      created: creator.created_at
    }));
  },

  getCreator: async (address) => {
    const creator = await creatorModel.findByAddress(address);
    if (!creator) return null;

    return {
      address: creator.address,
      displayName: creator.display_name,
      bio: creator.bio,
      socialLinks: creator.social_links,
      isVerified: creator.is_verified,
      created: creator.created_at
    };
  },

  registerCreator: async (address, displayName, bio, socialLinks) => {
    const existingCreator = await creatorModel.findByAddress(address);
    if (existingCreator && existingCreator.display_name) {
      throw new Error('Creator already registered');
    }

    const creator = await creatorModel.update(address, {
      displayName,
      bio,
      socialLinks: socialLinks || {}
    });

    return {
      address: creator.address,
      displayName: creator.display_name,
      bio: creator.bio,
      socialLinks: creator.social_links,
      created: creator.created_at
    };
  },

  updateCreator: async (address, updates) => {
    const creator = await creatorModel.findByAddress(address);
    if (!creator) return null;

    const updatedCreator = await creatorModel.update(address, updates);

    return {
      address: updatedCreator.address,
      displayName: updatedCreator.display_name,
      bio: updatedCreator.bio,
      socialLinks: updatedCreator.social_links
    };
  }
};