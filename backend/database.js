import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'kudobit',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create creators table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS creators (
        id SERIAL PRIMARY KEY,
        address VARCHAR(42) UNIQUE NOT NULL,
        display_name VARCHAR(255),
        bio TEXT,
        social_links JSONB DEFAULT '{}',
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        address VARCHAR(42) NOT NULL,
        token TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
      )
    `);

    // Create products table (for Phase 2B)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        creator_address VARCHAR(42) NOT NULL,
        product_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price_usdc DECIMAL(18,6) NOT NULL,
        ipfs_content_hash VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_address) REFERENCES creators(address)
      )
    `);

    // Create purchases table (for event indexing)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id SERIAL PRIMARY KEY,
        buyer_address VARCHAR(42) NOT NULL,
        creator_address VARCHAR(42) NOT NULL,
        product_id INTEGER NOT NULL,
        price_usdc DECIMAL(18,6) NOT NULL,
        transaction_hash VARCHAR(66) NOT NULL,
        block_number INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create loyalty_badges table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS loyalty_badges (
        id SERIAL PRIMARY KEY,
        recipient_address VARCHAR(42) NOT NULL,
        badge_id INTEGER NOT NULL,
        badge_name VARCHAR(255),
        transaction_hash VARCHAR(66) NOT NULL,
        block_number INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create download_logs table (for Phase 2D secure content delivery)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS download_logs (
        id SERIAL PRIMARY KEY,
        buyer_address VARCHAR(42) NOT NULL,
        product_id INTEGER NOT NULL,
        creator_address VARCHAR(42) NOT NULL,
        download_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address INET,
        user_agent TEXT
      )
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

// Database query functions
export const db = {
  // Creator functions
  async createCreator(address, displayName = null, bio = null, socialLinks = {}) {
    const query = `
      INSERT INTO creators (address, display_name, bio, social_links)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const defaultDisplayName = displayName || `Creator ${address.slice(0, 6)}...${address.slice(-4)}`;
    const result = await pool.query(query, [address.toLowerCase(), defaultDisplayName, bio, JSON.stringify(socialLinks)]);
    return result.rows[0];
  },

  async getCreator(address) {
    const query = 'SELECT * FROM creators WHERE address = $1';
    const result = await pool.query(query, [address.toLowerCase()]);
    return result.rows[0];
  },

  async updateCreator(address, updates) {
    const setClause = [];
    const values = [];
    let paramCount = 1;

    if (updates.displayName !== undefined) {
      setClause.push(`display_name = $${paramCount++}`);
      values.push(updates.displayName);
    }
    if (updates.bio !== undefined) {
      setClause.push(`bio = $${paramCount++}`);
      values.push(updates.bio);
    }
    if (updates.socialLinks !== undefined) {
      setClause.push(`social_links = $${paramCount++}`);
      values.push(JSON.stringify(updates.socialLinks));
    }

    setClause.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(address.toLowerCase());

    const query = `
      UPDATE creators 
      SET ${setClause.join(', ')}
      WHERE address = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async getAllCreators() {
    const query = 'SELECT address, display_name, bio, is_verified FROM creators ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  },

  // Session functions
  async createSession(address, token, expiresAt) {
    const query = `
      INSERT INTO sessions (address, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [address.toLowerCase(), token, expiresAt]);
    return result.rows[0];
  },

  async getSession(address) {
    const query = 'SELECT * FROM sessions WHERE address = $1 AND expires_at > NOW()';
    const result = await pool.query(query, [address.toLowerCase()]);
    return result.rows[0];
  },

  async deleteSession(address) {
    const query = 'DELETE FROM sessions WHERE address = $1';
    await pool.query(query, [address.toLowerCase()]);
  },

  // Product functions (for Phase 2B)
  async createProduct(creatorAddress, productId, name, description, priceUsdc, ipfsContentHash) {
    const query = `
      INSERT INTO products (creator_address, product_id, name, description, price_usdc, ipfs_content_hash)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await pool.query(query, [creatorAddress.toLowerCase(), productId, name, description, priceUsdc, ipfsContentHash]);
    return result.rows[0];
  },

  async getProductsByCreator(creatorAddress) {
    const query = 'SELECT * FROM products WHERE creator_address = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [creatorAddress.toLowerCase()]);
    return result.rows;
  },

  async updateProductStatus(creatorAddress, productId, isActive) {
    const query = `
      UPDATE products 
      SET is_active = $3, updated_at = CURRENT_TIMESTAMP
      WHERE creator_address = $1 AND product_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [creatorAddress.toLowerCase(), productId, isActive]);
    return result.rows[0];
  },

  // Purchase tracking (for event indexing)
  async recordPurchase(buyerAddress, creatorAddress, productId, priceUsdc, transactionHash, blockNumber = null) {
    const query = `
      INSERT INTO purchases (buyer_address, creator_address, product_id, price_usdc, transaction_hash, block_number)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await pool.query(query, [
      buyerAddress.toLowerCase(), 
      creatorAddress.toLowerCase(), 
      productId, 
      priceUsdc, 
      transactionHash,
      blockNumber
    ]);
    return result.rows[0];
  },

  async getPurchasesByCreator(creatorAddress) {
    const query = 'SELECT * FROM purchases WHERE creator_address = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [creatorAddress.toLowerCase()]);
    return result.rows;
  },

  async getPurchasesByBuyer(buyerAddress) {
    const query = 'SELECT * FROM purchases WHERE buyer_address = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [buyerAddress.toLowerCase()]);
    return result.rows;
  },

  // Loyalty badge tracking
  async recordLoyaltyBadge(recipientAddress, badgeId, badgeName, transactionHash, blockNumber = null) {
    const query = `
      INSERT INTO loyalty_badges (recipient_address, badge_id, badge_name, transaction_hash, block_number)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [recipientAddress.toLowerCase(), badgeId, badgeName, transactionHash, blockNumber]);
    return result.rows[0];
  },

  async getLoyaltyBadgesByRecipient(recipientAddress) {
    const query = 'SELECT * FROM loyalty_badges WHERE recipient_address = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [recipientAddress.toLowerCase()]);
    return result.rows;
  }
};

export default pool;