import { Hono } from 'hono';
import { dbSQLite as db } from '../../database-sqlite.js';

const analyticsRoutes = new Hono();

// Get analytics for a specific creator
analyticsRoutes.get('/creator/:address', async (c) => {
  try {
    const address = c.req.param('address').toLowerCase();
    
    // Initialize result object
    const analytics = {
      productSales: {},
      activeFans: 0,
      profileViews: 0
    };

    // Get purchases for this creator's products
    const purchases = await db.getPurchasesByCreator(address);
    const products = await db.getProductsByCreator(address);

    // Build product sales map
    const productSalesMap = {};
    purchases.forEach(purchase => {
      const productId = purchase.product_id;
      if (!productSalesMap[productId]) {
        productSalesMap[productId] = 0;
      }
      productSalesMap[productId]++;
    });

    analytics.productSales = productSalesMap;

    // Get unique buyers as active fans
    const uniqueBuyers = new Set(purchases.map(p => p.buyer_address));
    analytics.activeFans = uniqueBuyers.size;

    // Calculate profile views based on sales activity
    const totalSales = Object.values(analytics.productSales).reduce((sum, sales) => sum + sales, 0);
    analytics.profileViews = Math.floor(totalSales * 15); // Assume 15 views per sale

    return c.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    return c.json({ 
      error: 'Failed to fetch analytics',
      productSales: {},
      activeFans: 0,
      profileViews: 0
    }, 500);
  }
});

// Get global platform analytics
analyticsRoutes.get('/platform', async (c) => {
  try {
    const stats = {
      totalRevenue: '0',
      totalSales: 0,
      activeCreators: 0,
      totalCustomers: 0
    };

    // Get all purchases by querying all creators
    const allCreators = await db.getAllCreators();
    let allPurchases = [];
    for (const creator of allCreators) {
      const creatorPurchases = await db.getPurchasesByCreator(creator.address);
      allPurchases = allPurchases.concat(creatorPurchases);
    }
    stats.totalSales = allPurchases.length;

    // Get unique buyers
    const uniqueBuyers = new Set(allPurchases.map(p => p.buyer_address));
    stats.totalCustomers = uniqueBuyers.size;

    // Get unique creators who have sales
    const uniqueCreators = new Set(allPurchases.map(p => p.creator_address));
    stats.activeCreators = uniqueCreators.size;

    // Calculate total revenue from actual purchase amounts
    const totalRevenue = allPurchases.reduce((sum, purchase) => {
      return sum + parseFloat(purchase.price_usdc || 0);
    }, 0);
    stats.totalRevenue = totalRevenue.toFixed(6);

    return c.json(stats);
  } catch (error) {
    console.error('Platform analytics error:', error);
    return c.json({ 
      error: 'Failed to fetch platform analytics',
      totalRevenue: '0',
      totalSales: 0,
      activeCreators: 0,
      totalCustomers: 0
    }, 500);
  }
});

// Get loyalty badge statistics
analyticsRoutes.get('/loyalty/:address', async (c) => {
  try {
    const address = c.req.param('address').toLowerCase();
    
    // Mock loyalty badge stats based on user activity
    // In a real app, this would query the loyalty_badges table
    const purchases = await db.getPurchasesByBuyer(address);
    const totalPurchases = purchases.length;
    
    const loyaltyStats = {
      bronze: 0,
      silver: 0,
      gold: 0,
      diamond: 0
    };

    // Assign badges based on purchase count
    if (totalPurchases >= 1) loyaltyStats.bronze = 1;
    if (totalPurchases >= 5) loyaltyStats.silver = 1;
    if (totalPurchases >= 20) loyaltyStats.gold = 1;
    if (totalPurchases >= 50) loyaltyStats.diamond = 1;

    return c.json(loyaltyStats);
  } catch (error) {
    console.error('Loyalty analytics error:', error);
    return c.json({ 
      bronze: 0,
      silver: 0,
      gold: 0,
      diamond: 0
    }, 500);
  }
});

export { analyticsRoutes };