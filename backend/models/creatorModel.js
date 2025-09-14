import { dbSQLite as db } from '../database-sqlite.js';

export const creatorModel = {
  findAll: async () => {
    return await db.all('SELECT * FROM creators ORDER BY created_at DESC');
  },

  findByAddress: async (address) => {
    return await db.get('SELECT * FROM creators WHERE address = ?', [address]);
  },

  create: async (address, displayName = null, bio = null, socialLinks = {}) => {
    const result = await db.run(
      'INSERT INTO creators (address, display_name, bio, social_links) VALUES (?, ?, ?, ?)',
      [address, displayName, bio, JSON.stringify(socialLinks)]
    );
    
    return await db.get('SELECT * FROM creators WHERE id = ?', [result.lastID]);
  },

  update: async (address, updates) => {
    const { displayName, bio, socialLinks } = updates;
    
    await db.run(
      `UPDATE creators 
       SET display_name = ?, bio = ?, social_links = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE address = ?`,
      [displayName, bio, JSON.stringify(socialLinks || {}), address]
    );
    
    const updated = await db.get('SELECT * FROM creators WHERE address = ?', [address]);
    return {
      ...updated,
      social_links: JSON.parse(updated.social_links || '{}')
    };
  }
};