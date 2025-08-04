import { dbSQLite as db } from '../database-sqlite.js';

export const productModel = {
  findByCreator: async (creatorAddress) => {
    return await db.all(
      'SELECT * FROM products WHERE creator_address = ? ORDER BY created_at DESC',
      [creatorAddress]
    );
  },

  findById: async (id) => {
    return await db.get('SELECT * FROM products WHERE id = ?', [id]);
  },

  create: async (creatorAddress, productId, name, description, priceUsdc, ipfsContentHash) => {
    const result = await db.run(
      `INSERT INTO products (creator_address, product_id, name, description, price_usdc, ipfs_content_hash)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [creatorAddress, productId, name, description, priceUsdc, ipfsContentHash]
    );
    
    return await db.get('SELECT * FROM products WHERE id = ?', [result.lastID]);
  },

  updateStatus: async (creatorAddress, productId, isActive) => {
    const result = await db.run(
      `UPDATE products 
       SET is_active = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE creator_address = ? AND id = ?`,
      [isActive ? 1 : 0, creatorAddress, productId]
    );
    
    if (result.changes === 0) return null;
    
    return await db.get(
      'SELECT * FROM products WHERE creator_address = ? AND id = ?',
      [creatorAddress, productId]
    );
  }
};