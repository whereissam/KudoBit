import { collaborativeDb, initializeCollaborativeTables } from './collaborative-extensions.js';
import jwt from 'jsonwebtoken';

/**
 * Add collaborative product routes to the Hono app
 * @param {Hono} app - The Hono application instance
 * @param {function} authenticateToken - JWT authentication middleware
 */
export function addCollaborativeRoutes(app, authenticateToken) {
  const JWT_SECRET = process.env.JWT_SECRET || 'kudobit-hackathon-secret-key';

  // Initialize collaborative tables on startup
  initializeCollaborativeTables().catch(console.error);

  // COLLABORATIVE PRODUCT MANAGEMENT ENDPOINTS

  /**
   * Create a new collaborative product
   */
  app.post('/api/collaborative/products', authenticateToken, async (c) => {
    try {
      const user = c.get('user');
      const {
        productId,
        name,
        description,
        priceUsdc,
        ipfsContentHash,
        loyaltyBadgeId,
        collaborators,
        requiresAllApproval = false
      } = await c.req.json();

      // Validation
      if (!productId || !name || !priceUsdc || !collaborators || collaborators.length < 2) {
        return c.json({ error: 'Missing required fields or insufficient collaborators' }, 400);
      }

      // Verify sender is one of the collaborators
      const isCollaborator = collaborators.some(collab => 
        collab.wallet.toLowerCase() === user.address.toLowerCase()
      );
      if (!isCollaborator) {
        return c.json({ error: 'Sender must be a collaborator' }, 403);
      }

      // Verify contribution weights sum to 10000 (100%)
      const totalWeight = collaborators.reduce((sum, collab) => sum + collab.contributionWeight, 0);
      if (totalWeight !== 10000) {
        return c.json({ error: 'Contribution weights must sum to 100%' }, 400);
      }

      // Create royalty recipients from collaborators
      const royaltyRecipients = collaborators.map(collab => ({
        recipient: collab.wallet,
        percentage: collab.contributionWeight,
        role: collab.role
      }));

      const productData = {
        productId,
        name,
        description,
        priceUsdc,
        ipfsContentHash,
        loyaltyBadgeId,
        collaborators,
        royaltyRecipients,
        requiresAllApproval
      };

      const product = await collaborativeDb.createCollaborativeProduct(productData);

      return c.json({
        success: true,
        message: 'Collaborative product created successfully',
        product: {
          id: product.id,
          productId: product.product_id,
          name: product.name,
          description: product.description,
          priceUsdc: product.price_usdc,
          collaborators: collaborators.length,
          requiresAllApproval: product.requires_all_approval,
          createdAt: product.created_at
        }
      });

    } catch (error) {
      console.error('Create collaborative product error:', error);
      return c.json({ error: error.message }, 500);
    }
  });

  /**
   * Get a specific collaborative product with full details
   */
  app.get('/api/collaborative/products/:id', async (c) => {
    try {
      const productId = parseInt(c.req.param('id'));
      const product = await collaborativeDb.getCollaborativeProduct(productId);

      if (!product) {
        return c.json({ error: 'Product not found' }, 404);
      }

      return c.json({
        success: true,
        product: {
          id: product.id,
          productId: product.product_id,
          name: product.name,
          description: product.description,
          priceUsdc: product.price_usdc,
          ipfsContentHash: product.ipfs_content_hash,
          loyaltyBadgeId: product.loyalty_badge_id,
          isActive: product.is_active,
          requiresAllApproval: product.requires_all_approval,
          totalSales: product.total_sales,
          createdAt: product.created_at,
          collaborators: product.collaborators,
          royaltyRecipients: product.royaltyRecipients
        }
      });

    } catch (error) {
      console.error('Get collaborative product error:', error);
      return c.json({ error: error.message }, 500);
    }
  });

  /**
   * Get all collaborative products for a collaborator
   */
  app.get('/api/collaborative/products/collaborator/:address', authenticateToken, async (c) => {
    try {
      const user = c.get('user');
      const collaboratorAddress = c.req.param('address');

      // Only allow users to see their own collaborative products
      if (user.address !== collaboratorAddress.toLowerCase()) {
        return c.json({ error: 'Unauthorized' }, 403);
      }

      const products = await collaborativeDb.getCollaborativeProductsByCollaborator(collaboratorAddress);

      const formattedProducts = products.map(product => ({
        id: product.id,
        productId: product.product_id,
        name: product.name,
        description: product.description,
        priceUsdc: product.price_usdc,
        isActive: product.is_active,
        totalSales: product.total_sales,
        myRole: product.role,
        myContribution: product.contribution_weight,
        isActiveCollaborator: product.collaborator_active,
        createdAt: product.created_at
      }));

      return c.json({
        success: true,
        products: formattedProducts
      });

    } catch (error) {
      console.error('Get collaborator products error:', error);
      return c.json({ error: error.message }, 500);
    }
  });

  /**
   * Get all active collaborative products (public endpoint)
   */
  app.get('/api/collaborative/products', async (c) => {
    try {
      const products = await collaborativeDb.getAllCollaborativeProducts();

      const formattedProducts = products.map(product => ({
        id: product.id,
        productId: product.product_id,
        name: product.name,
        description: product.description,
        priceUsdc: product.price_usdc,
        totalSales: product.total_sales,
        createdAt: product.created_at
      }));

      return c.json({
        success: true,
        products: formattedProducts
      });

    } catch (error) {
      console.error('Get all collaborative products error:', error);
      return c.json({ error: error.message }, 500);
    }
  });

  // PROPOSAL MANAGEMENT ENDPOINTS

  /**
   * Create a new proposal for a collaborative product
   */
  app.post('/api/collaborative/proposals', authenticateToken, async (c) => {
    try {
      const user = c.get('user');
      const { productId, proposalType, newPrice, newActiveStatus } = await c.req.json();

      if (!productId || !proposalType) {
        return c.json({ error: 'Product ID and proposal type are required' }, 400);
      }

      // Verify user is a collaborator on this product
      const isCollaborator = await collaborativeDb.isCollaborator(productId, user.address);
      if (!isCollaborator) {
        return c.json({ error: 'Only collaborators can create proposals' }, 403);
      }

      const proposalData = {
        productId,
        proposalType,
        proposerAddress: user.address,
        newPrice,
        newActiveStatus
      };

      const proposal = await collaborativeDb.createProposal(proposalData);

      return c.json({
        success: true,
        message: 'Proposal created successfully',
        proposal: {
          id: proposal.id,
          productId: proposal.product_id,
          proposalType: proposal.proposal_type,
          proposer: proposal.proposer_address,
          newPrice: proposal.new_price,
          newActiveStatus: proposal.new_active_status,
          votesFor: proposal.votes_for,
          votesAgainst: proposal.votes_against,
          deadline: proposal.deadline,
          createdAt: proposal.created_at
        }
      });

    } catch (error) {
      console.error('Create proposal error:', error);
      return c.json({ error: error.message }, 500);
    }
  });

  /**
   * Vote on a proposal
   */
  app.post('/api/collaborative/proposals/:id/vote', authenticateToken, async (c) => {
    try {
      const user = c.get('user');
      const proposalId = parseInt(c.req.param('id'));
      const { support } = await c.req.json();

      if (typeof support !== 'boolean') {
        return c.json({ error: 'Support must be a boolean value' }, 400);
      }

      // Get the proposal to verify product access
      const proposal = await collaborativeDb.getProposal(proposalId);
      if (!proposal) {
        return c.json({ error: 'Proposal not found' }, 404);
      }

      if (proposal.executed) {
        return c.json({ error: 'Proposal already executed' }, 400);
      }

      if (new Date() > new Date(proposal.deadline)) {
        return c.json({ error: 'Voting period has ended' }, 400);
      }

      // Verify user is a collaborator on this product
      const isCollaborator = await collaborativeDb.isCollaborator(proposal.product_id, user.address);
      if (!isCollaborator) {
        return c.json({ error: 'Only collaborators can vote on proposals' }, 403);
      }

      const updatedProposal = await collaborativeDb.voteOnProposal(proposalId, user.address, support);

      return c.json({
        success: true,
        message: 'Vote recorded successfully',
        proposal: {
          id: updatedProposal.id,
          votesFor: updatedProposal.votes_for,
          votesAgainst: updatedProposal.votes_against,
          executed: updatedProposal.executed
        }
      });

    } catch (error) {
      console.error('Vote on proposal error:', error);
      return c.json({ error: error.message }, 500);
    }
  });

  /**
   * Execute a proposal
   */
  app.post('/api/collaborative/proposals/:id/execute', authenticateToken, async (c) => {
    try {
      const user = c.get('user');
      const proposalId = parseInt(c.req.param('id'));

      // Get the proposal to verify product access
      const proposal = await collaborativeDb.getProposal(proposalId);
      if (!proposal) {
        return c.json({ error: 'Proposal not found' }, 404);
      }

      // Verify user is a collaborator on this product
      const isCollaborator = await collaborativeDb.isCollaborator(proposal.product_id, user.address);
      if (!isCollaborator) {
        return c.json({ error: 'Only collaborators can execute proposals' }, 403);
      }

      const result = await collaborativeDb.executeProposal(proposalId);

      return c.json({
        success: true,
        message: result.approved ? 'Proposal executed and approved' : 'Proposal executed but rejected',
        executed: result.executed,
        approved: result.approved
      });

    } catch (error) {
      console.error('Execute proposal error:', error);
      return c.json({ error: error.message }, 500);
    }
  });

  /**
   * Get proposals for a product
   */
  app.get('/api/collaborative/products/:id/proposals', authenticateToken, async (c) => {
    try {
      const user = c.get('user');
      const productId = parseInt(c.req.param('id'));

      // Verify user is a collaborator on this product
      const isCollaborator = await collaborativeDb.isCollaborator(productId, user.address);
      if (!isCollaborator) {
        return c.json({ error: 'Only collaborators can view proposals' }, 403);
      }

      const proposals = await collaborativeDb.getProposalsByProduct(productId);

      const formattedProposals = proposals.map(proposal => ({
        id: proposal.id,
        productId: proposal.product_id,
        proposalType: proposal.proposal_type,
        proposer: proposal.proposer_address,
        newPrice: proposal.new_price,
        newActiveStatus: proposal.new_active_status,
        votesFor: proposal.votes_for,
        votesAgainst: proposal.votes_against,
        executed: proposal.executed,
        deadline: proposal.deadline,
        createdAt: proposal.created_at
      }));

      return c.json({
        success: true,
        proposals: formattedProposals
      });

    } catch (error) {
      console.error('Get proposals error:', error);
      return c.json({ error: error.message }, 500);
    }
  });

  // PURCHASE AND ANALYTICS ENDPOINTS

  /**
   * Record a collaborative product purchase (typically called by event indexer)
   */
  app.post('/api/collaborative/purchases', authenticateToken, async (c) => {
    try {
      const {
        buyerAddress,
        productId,
        priceUsdc,
        loyaltyBadgeAwarded,
        transactionHash,
        blockNumber,
        royaltyDistributions
      } = await c.req.json();

      if (!buyerAddress || !productId || !priceUsdc || !transactionHash || !royaltyDistributions) {
        return c.json({ error: 'Missing required purchase data' }, 400);
      }

      const purchaseData = {
        buyerAddress,
        productId: parseInt(productId),
        priceUsdc,
        loyaltyBadgeAwarded,
        transactionHash,
        blockNumber,
        royaltyDistributions
      };

      const purchase = await collaborativeDb.recordCollaborativePurchase(purchaseData);

      return c.json({
        success: true,
        message: 'Collaborative purchase recorded successfully',
        purchase: {
          id: purchase.id,
          buyerAddress: purchase.buyer_address,
          productId: purchase.product_id,
          priceUsdc: purchase.price_usdc,
          transactionHash: purchase.transaction_hash,
          createdAt: purchase.created_at
        }
      });

    } catch (error) {
      console.error('Record collaborative purchase error:', error);
      return c.json({ error: error.message }, 500);
    }
  });

  /**
   * Get collaborative purchases for a buyer
   */
  app.get('/api/collaborative/purchases/buyer/:address', authenticateToken, async (c) => {
    try {
      const user = c.get('user');
      const buyerAddress = c.req.param('address');

      // Only allow users to see their own purchases
      if (user.address !== buyerAddress.toLowerCase()) {
        return c.json({ error: 'Unauthorized' }, 403);
      }

      const purchases = await collaborativeDb.getCollaborativePurchasesByBuyer(buyerAddress);

      const formattedPurchases = purchases.map(purchase => ({
        id: purchase.id,
        productId: purchase.product_id,
        productName: purchase.product_name,
        description: purchase.description,
        priceUsdc: purchase.price_usdc,
        loyaltyBadgeAwarded: purchase.loyalty_badge_awarded,
        transactionHash: purchase.transaction_hash,
        hasContent: !!purchase.ipfs_content_hash,
        createdAt: purchase.created_at
      }));

      return c.json({
        success: true,
        purchases: formattedPurchases
      });

    } catch (error) {
      console.error('Get buyer collaborative purchases error:', error);
      return c.json({ error: error.message }, 500);
    }
  });

  /**
   * Get analytics for a collaborator
   */
  app.get('/api/collaborative/analytics/collaborator/:address', authenticateToken, async (c) => {
    try {
      const user = c.get('user');
      const collaboratorAddress = c.req.param('address');

      // Only allow users to see their own analytics
      if (user.address !== collaboratorAddress.toLowerCase()) {
        return c.json({ error: 'Unauthorized' }, 403);
      }

      const analytics = await collaborativeDb.getCollaboratorAnalytics(collaboratorAddress);
      const royaltyDistributions = await collaborativeDb.getRoyaltyDistributionsByCollaborator(collaboratorAddress);

      return c.json({
        success: true,
        analytics: {
          totalProducts: parseInt(analytics.total_products),
          totalPurchases: parseInt(analytics.total_purchases),
          totalEarnings: analytics.total_earnings,
          uniqueCustomers: parseInt(analytics.unique_customers),
          recentDistributions: royaltyDistributions.slice(0, 10) // Last 10 distributions
        }
      });

    } catch (error) {
      console.error('Get collaborator analytics error:', error);
      return c.json({ error: error.message }, 500);
    }
  });

  /**
   * Get analytics for a collaborative product
   */
  app.get('/api/collaborative/analytics/product/:id', authenticateToken, async (c) => {
    try {
      const user = c.get('user');
      const productId = parseInt(c.req.param('id'));

      // Verify user is a collaborator on this product
      const isCollaborator = await collaborativeDb.isCollaborator(productId, user.address);
      if (!isCollaborator) {
        return c.json({ error: 'Only collaborators can view product analytics' }, 403);
      }

      const analytics = await collaborativeDb.getProductAnalytics(productId);

      return c.json({
        success: true,
        analytics: {
          product: {
            id: analytics.product.id,
            name: analytics.product.name,
            totalPurchases: parseInt(analytics.product.total_purchases),
            totalRevenue: analytics.product.total_revenue,
            uniqueCustomers: parseInt(analytics.product.unique_customers),
            totalSales: analytics.product.total_sales
          },
          collaboratorEarnings: analytics.collaboratorEarnings.map(earning => ({
            walletAddress: earning.wallet_address,
            role: earning.role,
            contributionWeight: earning.contribution_weight,
            totalEarnings: earning.total_earnings,
            contributionPercentage: (earning.contribution_weight / 100).toFixed(1) + '%'
          }))
        }
      });

    } catch (error) {
      console.error('Get product analytics error:', error);
      return c.json({ error: error.message }, 500);
    }
  });

  /**
   * Get dashboard data for a collaborator
   */
  app.get('/api/collaborative/dashboard/:address', authenticateToken, async (c) => {
    try {
      const user = c.get('user');
      const collaboratorAddress = c.req.param('address');

      // Only allow users to see their own dashboard
      if (user.address !== collaboratorAddress.toLowerCase()) {
        return c.json({ error: 'Unauthorized' }, 403);
      }

      // Get collaborator's products
      const products = await collaborativeDb.getCollaborativeProductsByCollaborator(collaboratorAddress);
      
      // Get collaborator analytics
      const analytics = await collaborativeDb.getCollaboratorAnalytics(collaboratorAddress);

      // Get recent royalty distributions
      const recentDistributions = await collaborativeDb.getRoyaltyDistributionsByCollaborator(collaboratorAddress);

      return c.json({
        success: true,
        dashboard: {
          summary: {
            totalProducts: parseInt(analytics.total_products),
            totalEarnings: analytics.total_earnings,
            totalPurchases: parseInt(analytics.total_purchases),
            uniqueCustomers: parseInt(analytics.unique_customers)
          },
          products: products.slice(0, 5), // Latest 5 products
          recentDistributions: recentDistributions.slice(0, 10) // Latest 10 distributions
        }
      });

    } catch (error) {
      console.error('Get collaborator dashboard error:', error);
      return c.json({ error: error.message }, 500);
    }
  });

  console.log('✅ Collaborative product routes added successfully');
}

export default addCollaborativeRoutes;