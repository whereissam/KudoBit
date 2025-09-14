import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { SiweMessage } from 'siwe'
import jwt from 'jsonwebtoken'
import { ethers } from 'ethers'
import dotenv from 'dotenv'
// import multer from 'multer' // Temporarily disabled with IPFS
import { initializeDatabase, dbSQLite as db } from './database-sqlite.js'
// import { IPFSService } from './ipfs-service.js' // Temporarily disabled
import { eventIndexer } from './event-indexer.js'
import { v1Routes } from './routes/v1/index.js'
// import addCollaborativeRoutes from './collaborative-routes.js' // Temporarily disabled

dotenv.config()

const app = new Hono()

// CORS middleware
app.use('/*', cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
}))

// Mount v1 API routes
app.route('/v1', v1Routes)
app.route('/api/v1', v1Routes)

// JWT secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'kudobit-hackathon-secret-key'

// Helper function to generate nonce
function generateNonce() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Health check endpoint
app.get('/', (c) => {
  return c.json({ 
    message: 'KudoBit Backend API',
    version: '1.0.0',
    status: 'running'
  })
})

// Get nonce for SIWE authentication
app.get('/auth/nonce', (c) => {
  const nonce = generateNonce()
  return c.json({ nonce })
})

// SIWE Login endpoint
app.post('/auth/login', async (c) => {
  try {
    const { message, signature } = await c.req.json()
    
    if (!message || !signature) {
      return c.json({ error: 'Message and signature are required' }, 400)
    }

    // Parse and validate the SIWE message
    const siweMessage = new SiweMessage(message)
    
    // Verify the signature
    const verification = await siweMessage.verify({ signature })
    
    if (!verification.success) {
      return c.json({ error: 'Invalid signature' }, 401)
    }

    // Extract wallet address
    const walletAddress = siweMessage.address.toLowerCase()
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        address: walletAddress,
        chainId: siweMessage.chainId,
        iat: Math.floor(Date.now() / 1000)
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Store session in database
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    await db.createSession(walletAddress, token, expiresAt)

    // Check if creator profile exists, if not create basic one
    let creator = await db.getCreator(walletAddress)
    if (!creator) {
      creator = await db.createCreator(walletAddress)
    }

    return c.json({
      success: true,
      token,
      address: walletAddress,
      message: 'Authentication successful'
    })
    
  } catch (error) {
    console.error('Auth error:', error)
    return c.json({ error: 'Authentication failed' }, 500)
  }
})

// Middleware to verify JWT token
const authenticateToken = async (c, next) => {
  const authHeader = c.req.header('Authorization')
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return c.json({ error: 'Access token required' }, 401)
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    c.set('user', decoded)
    await next()
  } catch (error) {
    return c.json({ error: 'Invalid or expired token' }, 403)
  }
}

// Get creator profile
app.get('/api/creator/:address', async (c) => {
  const address = c.req.param('address').toLowerCase()
  const creator = await db.getCreator(address)
  
  if (!creator) {
    return c.json({ error: 'Creator not found' }, 404)
  }

  // Remove sensitive data and format response
  const publicProfile = {
    address: creator.address,
    displayName: creator.display_name,
    bio: creator.bio,
    socialLinks: creator.social_links,
    isVerified: creator.is_verified
  }

  return c.json(publicProfile)
})

// Check creator onchain status
app.get('/api/creator/check-onchain/:address', async (c) => {
  const address = c.req.param('address').toLowerCase()
  
  try {
    // Check if creator exists in database
    const creator = await db.getCreator(address)
    
    // Mock onchain verification (in real app, this would check smart contract)
    const onchainStatus = {
      address: address,
      isRegisteredOnchain: !!creator,
      hasProducts: false,
      totalSales: 0,
      loyaltyLevel: 'bronze'
    }
    
    if (creator) {
      // Get creator's products and sales
      const products = await db.getProductsByCreator(address)
      const purchases = await db.getPurchasesByCreator(address)
      
      onchainStatus.hasProducts = products.length > 0
      onchainStatus.totalSales = purchases.length
      
      // Determine loyalty level based on sales
      if (purchases.length >= 100) onchainStatus.loyaltyLevel = 'diamond'
      else if (purchases.length >= 50) onchainStatus.loyaltyLevel = 'gold'
      else if (purchases.length >= 20) onchainStatus.loyaltyLevel = 'silver'
    }
    
    return c.json(onchainStatus)
  } catch (error) {
    console.error('Check onchain error:', error)
    return c.json({ error: 'Failed to check onchain status' }, 500)
  }
})

// Update creator profile (authenticated)
app.put('/api/creator/profile', authenticateToken, async (c) => {
  const user = c.get('user')
  const { displayName, bio, socialLinks } = await c.req.json()
  
  const creator = await db.getCreator(user.address)
  if (!creator) {
    return c.json({ error: 'Creator not found' }, 404)
  }

  // Update profile in database
  const updatedCreator = await db.updateCreator(user.address, {
    displayName,
    bio,
    socialLinks
  })

  return c.json({
    success: true,
    message: 'Profile updated successfully',
    profile: {
      address: updatedCreator.address,
      displayName: updatedCreator.display_name,
      bio: updatedCreator.bio,
      socialLinks: updatedCreator.social_links
    }
  })
})

// Creator registration endpoint
app.post('/api/creator/register', authenticateToken, async (c) => {
  const user = c.get('user')
  const { displayName, bio, socialLinks } = await c.req.json()
  
  // Check if creator already exists
  const existingCreator = await db.getCreator(user.address)
  if (existingCreator) {
    return c.json({ error: 'Creator already registered' }, 400)
  }

  // Create new creator profile
  const creator = await db.createCreator(user.address, displayName, bio, socialLinks || {})

  return c.json({
    success: true,
    message: 'Creator registered successfully',
    profile: {
      address: creator.address,
      displayName: creator.display_name,
      bio: creator.bio,
      socialLinks: creator.social_links
    }
  })
})

// Get all creators (public endpoint for discovery)
app.get('/api/creators', async (c) => {
  const creators = await db.getAllCreators()
  
  const publicCreators = creators.map(creator => ({
    address: creator.address,
    displayName: creator.display_name,
    bio: creator.bio,
    isVerified: creator.is_verified
  }))

  return c.json(publicCreators)
})

// Verify authentication status
app.get('/api/auth/verify', authenticateToken, (c) => {
  const user = c.get('user')
  return c.json({
    authenticated: true,
    address: user.address,
    chainId: user.chainId
  })
})

// Logout endpoint
app.post('/api/auth/logout', authenticateToken, async (c) => {
  const user = c.get('user')
  await db.deleteSession(user.address)
  
  return c.json({
    success: true,
    message: 'Logged out successfully'
  })
})

// Analytics endpoint (for demo purposes)
app.get('/api/analytics/:address', authenticateToken, (c) => {
  const address = c.req.param('address').toLowerCase()
  const user = c.get('user')
  
  // Only allow creators to see their own analytics
  if (user.address !== address) {
    return c.json({ error: 'Unauthorized' }, 403)
  }

  // Mock analytics data (in real app, this would come from blockchain indexing)
  const mockAnalytics = {
    totalSales: 12,
    totalRevenue: '2.4', // in USDC
    loyaltyBadgesIssued: 8,
    uniqueCustomers: 5,
    averageOrderValue: '0.2',
    popularProducts: [
      { id: 1, name: 'Exclusive Wallpaper NFT', sales: 5 },
      { id: 2, name: '1-Month Premium Content Pass', sales: 4 },
      { id: 3, name: 'Digital Sticker Pack', sales: 3 }
    ]
  }

  return c.json(mockAnalytics)
})

// IPFS functionality temporarily disabled
/*
// Configure multer for file uploads (in-memory storage)
const storage = multer.memoryStorage()
const upload = multer({ 
  storage,
  limits: {
    fileSize: IPFSService.getMaxFileSize(),
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const supportedTypes = IPFSService.getSupportedFileTypes()
    if (supportedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`), false)
    }
  }
})
*/

// IPFS endpoints temporarily disabled
// IPFS file upload endpoint
app.post('/api/ipfs/upload', authenticateToken, async (c) => {
  return c.json({ error: 'IPFS functionality temporarily disabled' }, 503)
})

// IPFS JSON upload endpoint (for metadata)
app.post('/api/ipfs/upload-json', authenticateToken, async (c) => {
  return c.json({ error: 'IPFS functionality temporarily disabled' }, 503)
})

// Get file info from IPFS
app.get('/api/ipfs/info/:hash', authenticateToken, async (c) => {
  return c.json({ error: 'IPFS functionality temporarily disabled' }, 503)
})

// List creator's uploaded files
app.get('/api/ipfs/files', authenticateToken, async (c) => {
  return c.json({ error: 'IPFS functionality temporarily disabled' }, 503)
})

// Delete file from IPFS (unpin)
app.delete('/api/ipfs/:hash', authenticateToken, async (c) => {
  return c.json({ error: 'IPFS functionality temporarily disabled' }, 503)
})

// Get IPFS configuration info (simplified without IPFS service)
app.get('/api/ipfs/config', (c) => {
  return c.json({
    message: 'IPFS functionality temporarily disabled',
    maxFileSize: 52428800, // 50MB
    supportedTypes: ['application/json', 'text/plain'],
    gateway: 'disabled'
  })
})

// Product Management Endpoints

// Create new product (store metadata in database)
app.post('/api/products', authenticateToken, async (c) => {
  try {
    const user = c.get('user')
    const { productId, name, description, priceUsdc, ipfsContentHash, metadata = {} } = await c.req.json()
    
    if (!productId || !name || !priceUsdc) {
      return c.json({ error: 'Product ID, name, and price are required' }, 400)
    }
    
    // Check if product already exists for this creator
    const existingProducts = await db.getProductsByCreator(user.address)
    const existingProduct = existingProducts.find(p => p.product_id === productId)
    
    if (existingProduct) {
      return c.json({ error: 'Product with this ID already exists' }, 400)
    }
    
    // Create product in database
    const product = await db.createProduct(
      user.address,
      productId,
      name,
      description || '',
      priceUsdc,
      ipfsContentHash || null
    )
    
    return c.json({
      success: true,
      message: 'Product created successfully',
      product: {
        id: product.id,
        productId: product.product_id,
        name: product.name,
        description: product.description,
        priceUsdc: product.price_usdc,
        ipfsContentHash: product.ipfs_content_hash,
        isActive: product.is_active,
        createdAt: product.created_at
      }
    })
    
  } catch (error) {
    console.error('Create product error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Get all products for a creator
app.get('/api/products/creator/:address', async (c) => {
  try {
    const creatorAddress = c.req.param('address')
    const products = await db.getProductsByCreator(creatorAddress)
    
    const formattedProducts = products.map(product => ({
      id: product.id,
      productId: product.product_id,
      name: product.name,
      description: product.description,
      priceUsdc: product.price_usdc,
      ipfsContentHash: product.ipfs_content_hash,
      isActive: product.is_active,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }))
    
    return c.json({
      success: true,
      products: formattedProducts
    })
    
  } catch (error) {
    console.error('Get products error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Get creator's own products (authenticated)
app.get('/api/products/my', authenticateToken, async (c) => {
  try {
    const user = c.get('user')
    const products = await db.getProductsByCreator(user.address)
    
    const formattedProducts = products.map(product => ({
      id: product.id,
      productId: product.product_id,
      name: product.name,
      description: product.description,
      priceUsdc: product.price_usdc,
      ipfsContentHash: product.ipfs_content_hash,
      isActive: product.is_active,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }))
    
    return c.json({
      success: true,
      products: formattedProducts
    })
    
  } catch (error) {
    console.error('Get my products error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Update product status (activate/deactivate)
app.put('/api/products/:productId/status', authenticateToken, async (c) => {
  try {
    const user = c.get('user')
    const productId = parseInt(c.req.param('productId'))
    const { isActive } = await c.req.json()
    
    if (typeof isActive !== 'boolean') {
      return c.json({ error: 'isActive must be a boolean' }, 400)
    }
    
    // Update product status
    const updatedProduct = await db.updateProductStatus(user.address, productId, isActive)
    
    if (!updatedProduct) {
      return c.json({ error: 'Product not found or unauthorized' }, 404)
    }
    
    return c.json({
      success: true,
      message: `Product ${isActive ? 'activated' : 'deactivated'} successfully`,
      product: {
        id: updatedProduct.id,
        productId: updatedProduct.product_id,
        name: updatedProduct.name,
        isActive: updatedProduct.is_active,
        updatedAt: updatedProduct.updated_at
      }
    })
    
  } catch (error) {
    console.error('Update product status error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Get purchase history for a creator
app.get('/api/purchases/creator/:address', authenticateToken, async (c) => {
  try {
    const user = c.get('user')
    const creatorAddress = c.req.param('address')
    
    // Only allow creators to see their own purchase history
    if (user.address !== creatorAddress.toLowerCase()) {
      return c.json({ error: 'Unauthorized' }, 403)
    }
    
    const purchases = await db.getPurchasesByCreator(creatorAddress)
    
    const formattedPurchases = purchases.map(purchase => ({
      id: purchase.id,
      buyerAddress: purchase.buyer_address,
      productId: purchase.product_id,
      priceUsdc: purchase.price_usdc,
      transactionHash: purchase.transaction_hash,
      blockNumber: purchase.block_number,
      createdAt: purchase.created_at
    }))
    
    return c.json({
      success: true,
      purchases: formattedPurchases
    })
    
  } catch (error) {
    console.error('Get creator purchases error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Get purchase history for a buyer
app.get('/api/purchases/buyer/:address', authenticateToken, async (c) => {
  try {
    const user = c.get('user')
    const buyerAddress = c.req.param('address')
    
    // Only allow users to see their own purchase history
    if (user.address !== buyerAddress.toLowerCase()) {
      return c.json({ error: 'Unauthorized' }, 403)
    }
    
    const purchases = await db.getPurchasesByBuyer(buyerAddress)
    
    const formattedPurchases = purchases.map(purchase => ({
      id: purchase.id,
      creatorAddress: purchase.creator_address,
      productId: purchase.product_id,
      priceUsdc: purchase.price_usdc,
      transactionHash: purchase.transaction_hash,
      blockNumber: purchase.block_number,
      createdAt: purchase.created_at
    }))
    
    return c.json({
      success: true,
      purchases: formattedPurchases
    })
    
  } catch (error) {
    console.error('Get buyer purchases error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Record a purchase (typically called by event indexing service)
app.post('/api/purchases', authenticateToken, async (c) => {
  try {
    const { buyerAddress, creatorAddress, productId, priceUsdc, transactionHash, blockNumber } = await c.req.json()
    
    if (!buyerAddress || !creatorAddress || !productId || !priceUsdc || !transactionHash) {
      return c.json({ error: 'Missing required purchase data' }, 400)
    }
    
    // Record purchase in database
    const purchase = await db.recordPurchase(
      buyerAddress,
      creatorAddress,
      productId,
      priceUsdc,
      transactionHash,
      blockNumber
    )
    
    return c.json({
      success: true,
      message: 'Purchase recorded successfully',
      purchase: {
        id: purchase.id,
        buyerAddress: purchase.buyer_address,
        creatorAddress: purchase.creator_address,
        productId: purchase.product_id,
        priceUsdc: purchase.price_usdc,
        transactionHash: purchase.transaction_hash,
        createdAt: purchase.created_at
      }
    })
    
  } catch (error) {
    console.error('Record purchase error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Event indexer status endpoint
app.get('/api/indexer/status', authenticateToken, async (c) => {
  try {
    const status = await eventIndexer.getIndexingStatus();
    return c.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Indexer status error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Secure Content Delivery Endpoints

// Verify purchase and generate secure download link
app.post('/api/content/verify-access', authenticateToken, async (c) => {
  try {
    const user = c.get('user');
    const { productId, creatorAddress } = await c.req.json();

    if (!productId || !creatorAddress) {
      return c.json({ error: 'Product ID and creator address are required' }, 400);
    }

    // Check if user has purchased this product
    const userPurchases = await db.getPurchasesByBuyer(user.address);
    const hasPurchased = userPurchases.some(purchase => 
      purchase.product_id === parseInt(productId) && 
      purchase.creator_address === creatorAddress.toLowerCase()
    );

    if (!hasPurchased) {
      return c.json({ 
        error: 'Access denied: Product not purchased',
        hasAccess: false
      }, 403);
    }

    // Get product details
    const products = await db.getProductsByCreator(creatorAddress);
    const product = products.find(p => p.product_id === parseInt(productId));

    if (!product || !product.ipfs_content_hash) {
      return c.json({ 
        error: 'Product content not found',
        hasAccess: false
      }, 404);
    }

    // Generate time-limited access token (valid for 1 hour)
    const accessToken = jwt.sign(
      {
        userAddress: user.address,
        productId: productId,
        creatorAddress: creatorAddress,
        ipfsHash: product.ipfs_content_hash,
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
      },
      JWT_SECRET
    );

    return c.json({
      success: true,
      hasAccess: true,
      product: {
        id: product.product_id,
        name: product.name,
        description: product.description,
        ipfsHash: product.ipfs_content_hash
      },
      accessToken,
      downloadUrl: `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/content/download/${accessToken}`,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour from now
    });

  } catch (error) {
    console.error('Content access verification error:', error);
    return c.json({ error: 'Failed to verify access' }, 500);
  }
});

// Secure download endpoint with token verification
app.get('/api/content/download/:token', async (c) => {
  try {
    const token = c.req.param('token');

    if (!token) {
      return c.json({ error: 'Access token required' }, 401);
    }

    // Verify access token
    let tokenData;
    try {
      tokenData = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return c.json({ error: 'Invalid or expired access token' }, 401);
    }

    const { userAddress, productId, creatorAddress, ipfsHash } = tokenData;

    // Double-check purchase still exists (in case of refunds/disputes)
    const userPurchases = await db.getPurchasesByBuyer(userAddress);
    const hasPurchased = userPurchases.some(purchase => 
      purchase.product_id === parseInt(productId) && 
      purchase.creator_address === creatorAddress.toLowerCase()
    );

    if (!hasPurchased) {
      return c.json({ error: 'Access revoked: Purchase not found' }, 403);
    }

    // Generate IPFS gateway URL
    const ipfsGateway = process.env.PINATA_GATEWAY || 'gateway.pinata.cloud';
    const downloadUrl = `https://${ipfsGateway}/ipfs/${ipfsHash}`;

    // Return redirect to IPFS content
    return c.redirect(downloadUrl);

  } catch (error) {
    console.error('Content download error:', error);
    return c.json({ error: 'Download failed' }, 500);
  }
});

// Get user's purchased content library
app.get('/api/content/library', authenticateToken, async (c) => {
  try {
    const user = c.get('user');

    // Get all purchases for this user
    const purchases = await db.getPurchasesByBuyer(user.address);

    // Get product details for each purchase
    const library = [];
    const creatorProductsCache = new Map();

    for (const purchase of purchases) {
      // Cache creator products to avoid repeated queries
      if (!creatorProductsCache.has(purchase.creator_address)) {
        const creatorProducts = await db.getProductsByCreator(purchase.creator_address);
        creatorProductsCache.set(purchase.creator_address, creatorProducts);
      }

      const creatorProducts = creatorProductsCache.get(purchase.creator_address);
      const product = creatorProducts.find(p => p.product_id === purchase.product_id);

      if (product) {
        library.push({
          purchaseId: purchase.id,
          purchaseDate: purchase.created_at,
          transactionHash: purchase.transaction_hash,
          product: {
            id: product.product_id,
            name: product.name,
            description: product.description,
            price: purchase.price_usdc,
            creatorAddress: purchase.creator_address,
            hasContent: !!product.ipfs_content_hash,
            ipfsHash: product.ipfs_content_hash
          }
        });
      }
    }

    // Sort by purchase date (newest first)
    library.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));

    return c.json({
      success: true,
      library,
      totalPurchases: library.length
    });

  } catch (error) {
    console.error('Library fetch error:', error);
    return c.json({ error: 'Failed to fetch library' }, 500);
  }
});

// Secure content delivery endpoint - verify purchase before allowing download
app.get('/api/content/download/:productId', authenticateToken, async (c) => {
  try {
    const user = c.get('user');
    const productId = parseInt(c.req.param('productId'));

    if (!productId || isNaN(productId)) {
      return c.json({ error: 'Invalid product ID' }, 400);
    }

    // Verify user has purchased this product
    const purchase = await db.query(
      'SELECT * FROM purchases WHERE buyer_address = $1 AND product_id = $2',
      [user.address, productId]
    );

    if (!purchase.rows || purchase.rows.length === 0) {
      return c.json({ error: 'Purchase not found. You must purchase this product to download content.' }, 403);
    }

    // Get product details to retrieve IPFS hash
    const productResult = await db.query(
      'SELECT * FROM products WHERE product_id = $1',
      [productId]
    );

    if (!productResult.rows || productResult.rows.length === 0) {
      return c.json({ error: 'Product not found' }, 404);
    }

    const product = productResult.rows[0];

    if (!product.ipfs_content_hash) {
      return c.json({ error: 'No content available for this product' }, 404);
    }

    // Generate secure IPFS URL
    const ipfsGateway = process.env.PINATA_GATEWAY || 'gateway.pinata.cloud';
    const contentUrl = `https://${ipfsGateway}/ipfs/${product.ipfs_content_hash}`;

    // Log download for analytics
    try {
      await db.query(
        'INSERT INTO download_logs (buyer_address, product_id, creator_address, download_timestamp) VALUES ($1, $2, $3, NOW())',
        [user.address, productId, product.creator_address]
      );
    } catch (logError) {
      console.warn('Failed to log download:', logError);
    }

    return c.json({
      success: true,
      downloadUrl: contentUrl,
      product: {
        id: product.product_id,
        name: product.name,
        description: product.description,
        contentHash: product.ipfs_content_hash
      },
      message: 'Content access granted'
    });

  } catch (error) {
    console.error('Content download error:', error);
    return c.json({ error: 'Failed to process download request' }, 500);
  }
});

// Get download statistics for creators
app.get('/api/content/stats/:creatorAddress', authenticateToken, async (c) => {
  try {
    const user = c.get('user');
    const creatorAddress = c.req.param('creatorAddress');

    // Only allow creators to see their own stats
    if (user.address !== creatorAddress.toLowerCase()) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Get all purchases for this creator
    const purchases = await db.getPurchasesByCreator(creatorAddress);
    const products = await db.getProductsByCreator(creatorAddress);

    // Calculate stats
    const stats = {
      totalSales: purchases.length,
      totalRevenue: purchases.reduce((sum, purchase) => sum + parseFloat(purchase.price_usdc), 0).toFixed(6),
      uniqueCustomers: new Set(purchases.map(p => p.buyer_address)).size,
      productsWithContent: products.filter(p => p.ipfs_content_hash).length,
      totalProducts: products.length,
      contentDeliveryRate: products.length > 0 ? 
        ((products.filter(p => p.ipfs_content_hash).length / products.length) * 100).toFixed(1) : 0
    };

    return c.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Content stats error:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

const port = process.env.LEGACY_PORT || 3001

// Add collaborative product routes (temporarily disabled)
// addCollaborativeRoutes(app, authenticateToken);

console.log(`🚀 KudoBit Backend starting on port ${port}`)
console.log(`📡 CORS enabled for: http://localhost:5173, http://localhost:3000`)
console.log(`🔐 JWT Secret configured: ${JWT_SECRET ? 'Yes' : 'No'}`)

// Initialize database and event indexer before starting server
async function startServer() {
  try {
    console.log('🗄️  Initializing database...')
    await initializeDatabase()
    
    // Initialize and start event indexer (optional, can be enabled later)
    try {
      console.log('🔍 Initializing event indexer...')
      await eventIndexer.initialize()
      await eventIndexer.start()
      console.log('✅ Event indexer started successfully')
    } catch (error) {
      console.warn('⚠️  Event indexer failed to start (this is optional):', error.message)
      console.warn('   Set CREATOR_STORE_ADDRESS and LOYALTY_TOKEN_ADDRESS in .env to enable event indexing')
    }
    
    serve({
      fetch: app.fetch,
      port
    })
    
    console.log(`✅ KudoBit Backend running at http://localhost:${port}`)
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()