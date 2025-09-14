import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Get the existing pool connection
import pool from './database.js';

/**
 * Initialize additional database tables for Phase 3A collaborative features
 */
export async function initializeCollaborativeTables() {
  try {
    // Create collaborative_products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS collaborative_products (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price_usdc DECIMAL(18,6) NOT NULL,
        ipfs_content_hash VARCHAR(255),
        loyalty_badge_id INTEGER,
        is_active BOOLEAN DEFAULT TRUE,
        requires_all_approval BOOLEAN DEFAULT FALSE,
        total_sales DECIMAL(18,6) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create collaborators table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS collaborators (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL,
        wallet_address VARCHAR(42) NOT NULL,
        contribution_weight INTEGER NOT NULL, -- Basis points (1% = 100, 100% = 10000)
        role VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES collaborative_products(id) ON DELETE CASCADE
      )
    `);

    // Create royalty_splits table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS royalty_splits (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL,
        recipient_address VARCHAR(42) NOT NULL,
        percentage INTEGER NOT NULL, -- Basis points (1% = 100, 100% = 10000)
        role VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES collaborative_products(id) ON DELETE CASCADE
      )
    `);

    // Create product_proposals table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_proposals (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL,
        proposal_type VARCHAR(50) NOT NULL, -- 'activate', 'deactivate', 'update_price', 'update_royalties'
        proposer_address VARCHAR(42) NOT NULL,
        new_price DECIMAL(18,6),
        new_active_status BOOLEAN,
        votes_for INTEGER DEFAULT 0,
        votes_against INTEGER DEFAULT 0,
        executed BOOLEAN DEFAULT FALSE,
        deadline TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES collaborative_products(id) ON DELETE CASCADE
      )
    `);

    // Create proposal_votes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS proposal_votes (
        id SERIAL PRIMARY KEY,
        proposal_id INTEGER NOT NULL,
        voter_address VARCHAR(42) NOT NULL,
        support BOOLEAN NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (proposal_id) REFERENCES product_proposals(id) ON DELETE CASCADE,
        UNIQUE(proposal_id, voter_address)
      )
    `);

    // Create collaborative_purchases table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS collaborative_purchases (
        id SERIAL PRIMARY KEY,
        buyer_address VARCHAR(42) NOT NULL,
        product_id INTEGER NOT NULL,
        price_usdc DECIMAL(18,6) NOT NULL,
        loyalty_badge_awarded INTEGER,
        transaction_hash VARCHAR(66) NOT NULL,
        block_number INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES collaborative_products(id)
      )
    `);

    // Create royalty_distributions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS royalty_distributions (
        id SERIAL PRIMARY KEY,
        purchase_id INTEGER NOT NULL,
        recipient_address VARCHAR(42) NOT NULL,
        amount_usdc DECIMAL(18,6) NOT NULL,
        role VARCHAR(100) NOT NULL,
        transaction_hash VARCHAR(66) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (purchase_id) REFERENCES collaborative_purchases(id)
      )
    `);

    // Add indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_collaborators_product_id ON collaborators(product_id);
      CREATE INDEX IF NOT EXISTS idx_collaborators_wallet ON collaborators(wallet_address);
      CREATE INDEX IF NOT EXISTS idx_royalty_splits_product_id ON royalty_splits(product_id);
      CREATE INDEX IF NOT EXISTS idx_proposals_product_id ON product_proposals(product_id);
      CREATE INDEX IF NOT EXISTS idx_collaborative_purchases_buyer ON collaborative_purchases(buyer_address);
      CREATE INDEX IF NOT EXISTS idx_collaborative_purchases_product ON collaborative_purchases(product_id);
    `);

    console.log('✅ Collaborative product tables initialized successfully');
  } catch (error) {
    console.error('❌ Collaborative tables initialization error:', error);
    throw error;
  }
}

/**
 * Enhanced database functions for collaborative products
 */
export const collaborativeDb = {
  // Collaborative Product Management
  async createCollaborativeProduct(productData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create the product
      const productQuery = `
        INSERT INTO collaborative_products 
        (product_id, name, description, price_usdc, ipfs_content_hash, loyalty_badge_id, requires_all_approval)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const productResult = await client.query(productQuery, [
        productData.productId,
        productData.name,
        productData.description,
        productData.priceUsdc,
        productData.ipfsContentHash,
        productData.loyaltyBadgeId,
        productData.requiresAllApproval
      ]);
      
      const product = productResult.rows[0];

      // Add collaborators
      for (const collaborator of productData.collaborators) {
        await client.query(`
          INSERT INTO collaborators (product_id, wallet_address, contribution_weight, role)
          VALUES ($1, $2, $3, $4)
        `, [product.id, collaborator.wallet.toLowerCase(), collaborator.contributionWeight, collaborator.role]);
      }

      // Add royalty splits
      for (const royalty of productData.royaltyRecipients) {
        await client.query(`
          INSERT INTO royalty_splits (product_id, recipient_address, percentage, role)
          VALUES ($1, $2, $3, $4)
        `, [product.id, royalty.recipient.toLowerCase(), royalty.percentage, royalty.role]);
      }

      await client.query('COMMIT');
      return product;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getCollaborativeProduct(productId) {
    const productQuery = 'SELECT * FROM collaborative_products WHERE id = $1';
    const productResult = await pool.query(productQuery, [productId]);
    
    if (productResult.rows.length === 0) {
      return null;
    }

    const product = productResult.rows[0];

    // Get collaborators
    const collaboratorsQuery = 'SELECT * FROM collaborators WHERE product_id = $1 ORDER BY contribution_weight DESC';
    const collaboratorsResult = await pool.query(collaboratorsQuery, [productId]);

    // Get royalty splits
    const royaltiesQuery = 'SELECT * FROM royalty_splits WHERE product_id = $1 ORDER BY percentage DESC';
    const royaltiesResult = await pool.query(royaltiesQuery, [productId]);

    return {
      ...product,
      collaborators: collaboratorsResult.rows,
      royaltyRecipients: royaltiesResult.rows
    };
  },

  async getCollaborativeProductsByCollaborator(walletAddress) {
    const query = `
      SELECT cp.*, c.role, c.contribution_weight, c.is_active as collaborator_active
      FROM collaborative_products cp
      JOIN collaborators c ON cp.id = c.product_id
      WHERE c.wallet_address = $1
      ORDER BY cp.created_at DESC
    `;
    const result = await pool.query(query, [walletAddress.toLowerCase()]);
    return result.rows;
  },

  async getAllCollaborativeProducts() {
    const query = 'SELECT * FROM collaborative_products WHERE is_active = TRUE ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  },

  // Proposal Management
  async createProposal(proposalData) {
    const query = `
      INSERT INTO product_proposals 
      (product_id, proposal_type, proposer_address, new_price, new_active_status, deadline)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    const result = await pool.query(query, [
      proposalData.productId,
      proposalData.proposalType,
      proposalData.proposerAddress.toLowerCase(),
      proposalData.newPrice,
      proposalData.newActiveStatus,
      deadline
    ]);
    return result.rows[0];
  },

  async getProposal(proposalId) {
    const query = 'SELECT * FROM product_proposals WHERE id = $1';
    const result = await pool.query(query, [proposalId]);
    return result.rows[0];
  },

  async getProposalsByProduct(productId) {
    const query = 'SELECT * FROM product_proposals WHERE product_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [productId]);
    return result.rows;
  },

  async voteOnProposal(proposalId, voterAddress, support) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert the vote
      await client.query(`
        INSERT INTO proposal_votes (proposal_id, voter_address, support)
        VALUES ($1, $2, $3)
        ON CONFLICT (proposal_id, voter_address) 
        DO UPDATE SET support = EXCLUDED.support
      `, [proposalId, voterAddress.toLowerCase(), support]);

      // Update vote counts
      const voteCountQuery = `
        UPDATE product_proposals 
        SET votes_for = (
          SELECT COUNT(*) FROM proposal_votes 
          WHERE proposal_id = $1 AND support = TRUE
        ),
        votes_against = (
          SELECT COUNT(*) FROM proposal_votes 
          WHERE proposal_id = $1 AND support = FALSE
        )
        WHERE id = $1
        RETURNING *
      `;
      const result = await client.query(voteCountQuery, [proposalId]);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async executeProposal(proposalId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get the proposal
      const proposalResult = await client.query('SELECT * FROM product_proposals WHERE id = $1', [proposalId]);
      const proposal = proposalResult.rows[0];

      if (!proposal || proposal.executed) {
        throw new Error('Proposal not found or already executed');
      }

      // Mark as executed
      await client.query('UPDATE product_proposals SET executed = TRUE WHERE id = $1', [proposalId]);

      // Apply the changes if approved
      if (proposal.votes_for > proposal.votes_against) {
        if (proposal.proposal_type === 'update_price') {
          await client.query(
            'UPDATE collaborative_products SET price_usdc = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [proposal.new_price, proposal.product_id]
          );
        } else if (proposal.proposal_type === 'activate') {
          await client.query(
            'UPDATE collaborative_products SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [proposal.product_id]
          );
        } else if (proposal.proposal_type === 'deactivate') {
          await client.query(
            'UPDATE collaborative_products SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [proposal.product_id]
          );
        }
      }

      await client.query('COMMIT');
      return { executed: true, approved: proposal.votes_for > proposal.votes_against };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Purchase Management
  async recordCollaborativePurchase(purchaseData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Record the purchase
      const purchaseQuery = `
        INSERT INTO collaborative_purchases 
        (buyer_address, product_id, price_usdc, loyalty_badge_awarded, transaction_hash, block_number)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const purchaseResult = await client.query(purchaseQuery, [
        purchaseData.buyerAddress.toLowerCase(),
        purchaseData.productId,
        purchaseData.priceUsdc,
        purchaseData.loyaltyBadgeAwarded,
        purchaseData.transactionHash,
        purchaseData.blockNumber
      ]);
      
      const purchase = purchaseResult.rows[0];

      // Record royalty distributions
      for (const distribution of purchaseData.royaltyDistributions) {
        await client.query(`
          INSERT INTO royalty_distributions 
          (purchase_id, recipient_address, amount_usdc, role, transaction_hash)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          purchase.id,
          distribution.recipient.toLowerCase(),
          distribution.amount,
          distribution.role,
          purchaseData.transactionHash
        ]);
      }

      // Update product total sales
      await client.query(`
        UPDATE collaborative_products 
        SET total_sales = total_sales + $1 
        WHERE id = $2
      `, [purchaseData.priceUsdc, purchaseData.productId]);

      await client.query('COMMIT');
      return purchase;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getCollaborativePurchasesByBuyer(buyerAddress) {
    const query = `
      SELECT cp.*, p.name as product_name, p.description, p.ipfs_content_hash
      FROM collaborative_purchases cp
      JOIN collaborative_products p ON cp.product_id = p.id
      WHERE cp.buyer_address = $1
      ORDER BY cp.created_at DESC
    `;
    const result = await pool.query(query, [buyerAddress.toLowerCase()]);
    return result.rows;
  },

  async getCollaborativePurchasesByProduct(productId) {
    const query = 'SELECT * FROM collaborative_purchases WHERE product_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [productId]);
    return result.rows;
  },

  async getRoyaltyDistributionsByCollaborator(collaboratorAddress) {
    const query = `
      SELECT rd.*, cp.buyer_address, p.name as product_name, cp.created_at as purchase_date
      FROM royalty_distributions rd
      JOIN collaborative_purchases cp ON rd.purchase_id = cp.id
      JOIN collaborative_products p ON cp.product_id = p.id
      WHERE rd.recipient_address = $1
      ORDER BY rd.created_at DESC
    `;
    const result = await pool.query(query, [collaboratorAddress.toLowerCase()]);
    return result.rows;
  },

  // Analytics
  async getCollaboratorAnalytics(collaboratorAddress) {
    const query = `
      SELECT 
        COUNT(DISTINCT cp.product_id) as total_products,
        COUNT(DISTINCT cp.id) as total_purchases,
        COALESCE(SUM(rd.amount_usdc), 0) as total_earnings,
        COUNT(DISTINCT cp.buyer_address) as unique_customers
      FROM collaborative_purchases cp
      JOIN royalty_distributions rd ON cp.id = rd.purchase_id
      JOIN collaborative_products p ON cp.product_id = p.id
      JOIN collaborators c ON p.id = c.product_id
      WHERE c.wallet_address = $1 AND rd.recipient_address = $1
    `;
    const result = await pool.query(query, [collaboratorAddress.toLowerCase()]);
    return result.rows[0];
  },

  async getProductAnalytics(productId) {
    const client = await pool.connect();
    try {
      // Get basic product stats
      const productQuery = `
        SELECT 
          p.*,
          COUNT(cp.id) as total_purchases,
          COALESCE(SUM(cp.price_usdc), 0) as total_revenue,
          COUNT(DISTINCT cp.buyer_address) as unique_customers
        FROM collaborative_products p
        LEFT JOIN collaborative_purchases cp ON p.id = cp.product_id
        WHERE p.id = $1
        GROUP BY p.id
      `;
      const productResult = await client.query(productQuery, [productId]);
      
      // Get collaborator earnings
      const earningsQuery = `
        SELECT 
          c.wallet_address,
          c.role,
          c.contribution_weight,
          COALESCE(SUM(rd.amount_usdc), 0) as total_earnings
        FROM collaborators c
        LEFT JOIN royalty_distributions rd ON c.wallet_address = rd.recipient_address
        LEFT JOIN collaborative_purchases cp ON rd.purchase_id = cp.id AND cp.product_id = c.product_id
        WHERE c.product_id = $1
        GROUP BY c.wallet_address, c.role, c.contribution_weight
        ORDER BY total_earnings DESC
      `;
      const earningsResult = await client.query(earningsQuery, [productId]);

      return {
        product: productResult.rows[0],
        collaboratorEarnings: earningsResult.rows
      };
    } finally {
      client.release();
    }
  },

  // Utility functions
  async isCollaborator(productId, walletAddress) {
    const query = 'SELECT COUNT(*) FROM collaborators WHERE product_id = $1 AND wallet_address = $2 AND is_active = TRUE';
    const result = await pool.query(query, [productId, walletAddress.toLowerCase()]);
    return parseInt(result.rows[0].count) > 0;
  },

  async getCollaboratorCount(productId) {
    const query = 'SELECT COUNT(*) FROM collaborators WHERE product_id = $1 AND is_active = TRUE';
    const result = await pool.query(query, [productId]);
    return parseInt(result.rows[0].count);
  }
};

export default collaborativeDb;