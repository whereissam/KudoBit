import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

// Initialize SQLite database
export async function initializeDatabase() {
  try {
    // Open SQLite database
    db = await open({
      filename: path.join(__dirname, 'kudobit.db'),
      driver: sqlite3.Database
    });

    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');

    // Create creators table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS creators (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        address TEXT UNIQUE NOT NULL,
        display_name TEXT,
        bio TEXT,
        social_links TEXT DEFAULT '{}',
        is_verified INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sessions table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        address TEXT NOT NULL,
        token TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL
      )
    `);

    // Create products table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        creator_address TEXT NOT NULL,
        product_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price_usdc REAL NOT NULL,
        ipfs_content_hash TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_address) REFERENCES creators(address)
      )
    `);

    // Create purchases table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS purchases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        buyer_address TEXT NOT NULL,
        creator_address TEXT NOT NULL,
        product_id INTEGER NOT NULL,
        price_usdc REAL NOT NULL,
        transaction_hash TEXT NOT NULL,
        block_number INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create loyalty_badges table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS loyalty_badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipient_address TEXT NOT NULL,
        badge_id INTEGER NOT NULL,
        badge_name TEXT,
        transaction_hash TEXT NOT NULL,
        block_number INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ SQLite database tables initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

// Database query functions
export const dbSQLite = {
  // Creator functions
  async createCreator(address, displayName = null, bio = null, socialLinks = {}) {
    const defaultDisplayName = displayName || `Creator ${address.slice(0, 6)}...${address.slice(-4)}`;
    const result = await db.run(
      `INSERT INTO creators (address, display_name, bio, social_links)
       VALUES (?, ?, ?, ?)`,
      [address.toLowerCase(), defaultDisplayName, bio, JSON.stringify(socialLinks)]
    );
    
    return await db.get('SELECT * FROM creators WHERE id = ?', [result.lastID]);
  },

  async getCreator(address) {
    const result = await db.get('SELECT * FROM creators WHERE address = ?', [address.toLowerCase()]);
    if (result && result.social_links) {
      try {
        result.social_links = JSON.parse(result.social_links);
      } catch (e) {
        result.social_links = {};
      }
    }
    return result;
  },

  async updateCreator(address, updates) {
    const setParts = [];
    const values = [];

    if (updates.displayName !== undefined) {
      setParts.push('display_name = ?');
      values.push(updates.displayName);
    }
    if (updates.bio !== undefined) {
      setParts.push('bio = ?');
      values.push(updates.bio);
    }
    if (updates.socialLinks !== undefined) {
      setParts.push('social_links = ?');
      values.push(JSON.stringify(updates.socialLinks));
    }

    setParts.push('updated_at = CURRENT_TIMESTAMP');
    values.push(address.toLowerCase());

    const query = `UPDATE creators SET ${setParts.join(', ')} WHERE address = ?`;
    await db.run(query, values);
    
    return await db.get('SELECT * FROM creators WHERE address = ?', [address.toLowerCase()]);
  },

  async getAllCreators() {
    return await db.all('SELECT address, display_name, bio, is_verified FROM creators ORDER BY created_at DESC');
  },

  // Session functions
  async createSession(address, token, expiresAt) {
    const result = await db.run(
      `INSERT INTO sessions (address, token, expires_at)
       VALUES (?, ?, ?)`,
      [address.toLowerCase(), token, expiresAt.toISOString()]
    );
    
    return await db.get('SELECT * FROM sessions WHERE id = ?', [result.lastID]);
  },

  async getSession(address) {
    return await db.get(
      'SELECT * FROM sessions WHERE address = ? AND expires_at > datetime("now")',
      [address.toLowerCase()]
    );
  },

  async deleteSession(address) {
    await db.run('DELETE FROM sessions WHERE address = ?', [address.toLowerCase()]);
  },

  // Product functions
  async createProduct(creatorAddress, productId, name, description, priceUsdc, ipfsContentHash) {
    const result = await db.run(
      `INSERT INTO products (creator_address, product_id, name, description, price_usdc, ipfs_content_hash)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [creatorAddress.toLowerCase(), productId, name, description, priceUsdc, ipfsContentHash]
    );
    
    return await db.get('SELECT * FROM products WHERE id = ?', [result.lastID]);
  },

  async getProductsByCreator(creatorAddress) {
    return await db.all(
      'SELECT * FROM products WHERE creator_address = ? ORDER BY created_at DESC',
      [creatorAddress.toLowerCase()]
    );
  },

  async updateProductStatus(creatorAddress, productId, isActive) {
    await db.run(
      `UPDATE products 
       SET is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE creator_address = ? AND product_id = ?`,
      [isActive ? 1 : 0, creatorAddress.toLowerCase(), productId]
    );
    
    return await db.get(
      'SELECT * FROM products WHERE creator_address = ? AND product_id = ?',
      [creatorAddress.toLowerCase(), productId]
    );
  },

  // Purchase tracking
  async recordPurchase(buyerAddress, creatorAddress, productId, priceUsdc, transactionHash, blockNumber = null) {
    const result = await db.run(
      `INSERT INTO purchases (buyer_address, creator_address, product_id, price_usdc, transaction_hash, block_number)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [buyerAddress.toLowerCase(), creatorAddress.toLowerCase(), productId, priceUsdc, transactionHash, blockNumber]
    );
    
    return await db.get('SELECT * FROM purchases WHERE id = ?', [result.lastID]);
  },

  async getPurchasesByCreator(creatorAddress) {
    return await db.all(
      'SELECT * FROM purchases WHERE creator_address = ? ORDER BY created_at DESC',
      [creatorAddress.toLowerCase()]
    );
  },

  async getPurchasesByBuyer(buyerAddress) {
    return await db.all(
      'SELECT * FROM purchases WHERE buyer_address = ? ORDER BY created_at DESC',
      [buyerAddress.toLowerCase()]
    );
  },

  // Loyalty badge tracking
  async recordLoyaltyBadge(recipientAddress, badgeId, badgeName, transactionHash, blockNumber = null) {
    const result = await db.run(
      `INSERT INTO loyalty_badges (recipient_address, badge_id, badge_name, transaction_hash, block_number)
       VALUES (?, ?, ?, ?, ?)`,
      [recipientAddress.toLowerCase(), badgeId, badgeName, transactionHash, blockNumber]
    );
    
    return await db.get('SELECT * FROM loyalty_badges WHERE id = ?', [result.lastID]);
  },

  async getLoyaltyBadgesByRecipient(recipientAddress) {
    return await db.all(
      'SELECT * FROM loyalty_badges WHERE recipient_address = ? ORDER BY created_at DESC',
      [recipientAddress.toLowerCase()]
    );
  }
};

export default db;