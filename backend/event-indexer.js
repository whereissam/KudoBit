import { ethers } from 'ethers';
import { db } from './database.js';
import dotenv from 'dotenv';

dotenv.config();

// Morph Holesky RPC endpoint
const RPC_URL = process.env.RPC_URL || 'https://rpc-quicknode-holesky.morphl2.io';
const CREATOR_STORE_ADDRESS = process.env.CREATOR_STORE_ADDRESS;
const LOYALTY_TOKEN_ADDRESS = process.env.LOYALTY_TOKEN_ADDRESS;

// Contract ABIs (simplified for event listening)
const CREATOR_STORE_ABI = [
  "event ProductPurchased(address indexed buyer, uint256 indexed productId, uint256 price, address indexed creator)",
  "event ProductListed(address indexed creator, uint256 indexed productId, string name, uint256 price)",
  "event FundsWithdrawn(address indexed creator, uint256 amount)"
];

const LOYALTY_TOKEN_ABI = [
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
  "event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)"
];

class EventIndexer {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_URL);
    this.creatorStoreContract = null;
    this.loyaltyTokenContract = null;
    this.isRunning = false;
    this.lastProcessedBlock = 0;
    this.requestQueue = [];
    this.rateLimitDelay = 100; // 100ms between requests (10 requests/second)
    
    // Enhanced error handling properties
    this.reconnecting = false;
    this.reconnectAttempts = 0;
    this.usePollingOnly = true; // Use polling-only mode to avoid filter expiration issues
    this.maxReconnectAttempts = 5;
  }

  // Rate-limited request wrapper
  async rateLimitedRequest(requestFn) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processingQueue) return;
    this.processingQueue = true;

    while (this.requestQueue.length > 0) {
      const { requestFn, resolve, reject } = this.requestQueue.shift();
      try {
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
      // Wait before processing next request
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
    }

    this.processingQueue = false;
  }

  async initialize() {
    try {
      if (!CREATOR_STORE_ADDRESS || !LOYALTY_TOKEN_ADDRESS) {
        throw new Error('Contract addresses not configured. Please set CREATOR_STORE_ADDRESS and LOYALTY_TOKEN_ADDRESS in .env');
      }

      // Initialize contracts
      this.creatorStoreContract = new ethers.Contract(
        CREATOR_STORE_ADDRESS,
        CREATOR_STORE_ABI,
        this.provider
      );

      this.loyaltyTokenContract = new ethers.Contract(
        LOYALTY_TOKEN_ADDRESS,
        LOYALTY_TOKEN_ABI,
        this.provider
      );

      // Get current block number
      const currentBlock = await this.provider.getBlockNumber();
      this.lastProcessedBlock = currentBlock - 100; // Start from 100 blocks ago

      console.log('✅ Event indexer initialized');
      console.log(`📦 Creator Store: ${CREATOR_STORE_ADDRESS}`);
      console.log(`🏆 Loyalty Token: ${LOYALTY_TOKEN_ADDRESS}`);
      console.log(`🧱 Starting from block: ${this.lastProcessedBlock}`);

    } catch (error) {
      console.error('❌ Event indexer initialization failed:', error);
      throw error;
    }
  }

  async start() {
    if (this.isRunning) {
      console.log('Event indexer is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting event indexer...');

    // Process historical events first
    await this.processHistoricalEvents();

    // Set up real-time event listeners (unless in polling-only mode)
    if (!this.usePollingOnly) {
      this.setupEventListeners();
    } else {
      console.log('📊 Running in polling-only mode due to persistent filter errors');
    }

    // Set up periodic polling for missed events
    this.setupPeriodicSync();
  }

  async stop() {
    this.isRunning = false;
    
    // Clear intervals
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    // Remove event listeners
    if (this.creatorStoreContract) {
      this.creatorStoreContract.removeAllListeners();
    }
    if (this.loyaltyTokenContract) {
      this.loyaltyTokenContract.removeAllListeners();
    }
    if (this.provider) {
      this.provider.removeAllListeners();
    }
    
    console.log('⏹️ Event indexer stopped');
  }

  async processHistoricalEvents() {
    try {
      const currentBlock = await this.provider.getBlockNumber();
      const fromBlock = Math.max(this.lastProcessedBlock, currentBlock - 1000); // Limit to last 1000 blocks
      const toBlock = currentBlock;

      console.log(`📚 Processing historical events from block ${fromBlock} to ${toBlock}`);

      // Process CreatorStore events
      await this.processCreatorStoreEvents(fromBlock, toBlock);

      // Process LoyaltyToken events  
      await this.processLoyaltyTokenEvents(fromBlock, toBlock);

      this.lastProcessedBlock = toBlock;
      console.log(`✅ Historical events processed up to block ${toBlock}`);

    } catch (error) {
      console.error('❌ Error processing historical events:', error);
    }
  }

  async processCreatorStoreEvents(fromBlock, toBlock) {
    try {
      // Get ProductPurchased events with retry logic
      let purchaseEvents = [];
      try {
        purchaseEvents = await this.creatorStoreContract.queryFilter('ProductPurchased', fromBlock, toBlock);
      } catch (filterError) {
        if (filterError.code === 'UNKNOWN_ERROR' && filterError.error?.message === 'filter not found') {
          console.log('🔄 Purchase filter expired, retrying with new filter');
          try {
            purchaseEvents = await this.creatorStoreContract.queryFilter('ProductPurchased', fromBlock, toBlock);
          } catch (retryError) {
            console.log('🔄 Purchase filter retry failed, skipping this cycle');
          }
        } else {
          throw filterError;
        }
      }

      console.log(`Found ${purchaseEvents.length} purchase events`);

      for (const event of purchaseEvents) {
        await this.handleProductPurchased(event);
      }

      // Get ProductListed events with retry logic
      let listEvents = [];
      try {
        listEvents = await this.creatorStoreContract.queryFilter('ProductListed', fromBlock, toBlock);
      } catch (filterError) {
        if (filterError.code === 'UNKNOWN_ERROR' && filterError.error?.message === 'filter not found') {
          console.log('🔄 Product listing filter expired, retrying with new filter');
          try {
            listEvents = await this.creatorStoreContract.queryFilter('ProductListed', fromBlock, toBlock);
          } catch (retryError) {
            console.log('🔄 Product listing filter retry failed, skipping this cycle');
          }
        } else {
          throw filterError;
        }
      }

      console.log(`Found ${listEvents.length} product listing events`);

      for (const event of listEvents) {
        await this.handleProductListed(event);
      }

    } catch (error) {
      console.error('Error processing CreatorStore events:', error);
    }
  }

  async processLoyaltyTokenEvents(fromBlock, toBlock) {
    try {
      // Get TransferSingle events (badge minting) with retry logic
      let transferEvents = [];
      try {
        transferEvents = await this.loyaltyTokenContract.queryFilter('TransferSingle', fromBlock, toBlock);
      } catch (filterError) {
        if (filterError.code === 'UNKNOWN_ERROR' && filterError.error?.message === 'filter not found') {
          console.log('🔄 Transfer filter expired, retrying with new filter');
          try {
            transferEvents = await this.loyaltyTokenContract.queryFilter('TransferSingle', fromBlock, toBlock);
          } catch (retryError) {
            console.log('🔄 Transfer filter retry failed, skipping this cycle');
          }
        } else {
          throw filterError;
        }
      }

      console.log(`Found ${transferEvents.length} loyalty badge transfer events`);

      for (const event of transferEvents) {
        await this.handleLoyaltyBadgeTransfer(event);
      }

    } catch (error) {
      console.error('Error processing LoyaltyToken events:', error);
    }
  }

  setupEventListeners() {
    try {
      // Remove any existing listeners to avoid duplicates
      if (this.creatorStoreContract) {
        this.creatorStoreContract.removeAllListeners();
      }
      if (this.loyaltyTokenContract) {
        this.loyaltyTokenContract.removeAllListeners();
      }
      if (this.provider) {
        this.provider.removeAllListeners();
      }

      // Set up error handling for all contract listeners
      const handleContractError = (error, eventName) => {
        console.error(`🚨 Contract error on ${eventName}:`, error);
        if (this.isFilterError(error)) {
          console.log(`🔄 Filter expired for ${eventName}, scheduling reconnection`);
          this.scheduleReconnection();
        }
      };

      // Note: Contract error listeners removed as 'error' is not a valid event fragment
      // Error handling is done in individual event handlers and provider error handler

      // Listen for new ProductPurchased events with enhanced error handling
      this.creatorStoreContract.on('ProductPurchased', async (buyer, productId, price, creator, event) => {
        try {
          console.log('🛒 New purchase event detected');
          await this.handleProductPurchased(event);
        } catch (error) {
          console.error('Error handling ProductPurchased event:', error);
          if (this.isFilterError(error)) {
            this.scheduleReconnection();
          }
        }
      });

      // Listen for new ProductListed events with enhanced error handling
      this.creatorStoreContract.on('ProductListed', async (creator, productId, name, price, event) => {
        try {
          console.log('📝 New product listing event detected');
          await this.handleProductListed(event);
        } catch (error) {
          console.error('Error handling ProductListed event:', error);
          if (this.isFilterError(error)) {
            this.scheduleReconnection();
          }
        }
      });

      // Listen for loyalty badge transfers with enhanced error handling
      this.loyaltyTokenContract.on('TransferSingle', async (operator, from, to, id, value, event) => {
        try {
          console.log('🏆 New loyalty badge transfer detected');
          await this.handleLoyaltyBadgeTransfer(event);
        } catch (error) {
          console.error('Error handling TransferSingle event:', error);
          if (this.isFilterError(error)) {
            this.scheduleReconnection();
          }
        }
      });

      // Handle provider errors and reconnection
      this.provider.on('error', (error) => {
        console.error('🚨 Provider error:', error);
        if (this.isFilterError(error)) {
          this.scheduleReconnection();
        }
      });

      console.log('👂 Real-time event listeners set up with enhanced error handling');
    } catch (error) {
      console.error('Error setting up event listeners:', error);
      // If setup fails, try again after a delay
      setTimeout(() => {
        if (this.isRunning) {
          this.setupEventListeners();
        }
      }, 10000);
    }
  }

  // Helper method to check if an error is related to expired filters
  isFilterError(error) {
    return error && (
      (error.code === 'UNKNOWN_ERROR' && error.error?.message === 'filter not found') ||
      (error.code === -32000 && error.message === 'filter not found') ||
      error.message?.includes('filter not found') ||
      error.message?.includes('eth_getFilterChanges')
    );
  }

  // Helper method to schedule reconnection with exponential backoff
  scheduleReconnection() {
    if (this.reconnecting) return;
    
    this.reconnecting = true;
    this.reconnectAttempts = (this.reconnectAttempts || 0) + 1;
    
    // If we've failed too many times, switch to polling-only mode
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log(`⚠️  Too many reconnection failures (${this.reconnectAttempts}), switching to polling-only mode`);
      this.usePollingOnly = true;
      this.reconnecting = false;
      
      // Remove all event listeners when switching to polling-only
      if (this.creatorStoreContract) {
        this.creatorStoreContract.removeAllListeners();
      }
      if (this.loyaltyTokenContract) {
        this.loyaltyTokenContract.removeAllListeners();
      }
      if (this.provider) {
        this.provider.removeAllListeners();
      }
      return;
    }
    
    const delay = Math.min(5000 * Math.pow(2, this.reconnectAttempts), 60000); // Max 1 minute
    
    console.log(`🔄 Scheduling reconnection in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (this.isRunning && !this.usePollingOnly) {
        console.log('🔌 Reconnecting event listeners...');
        this.setupEventListeners();
        this.reconnecting = false;
        
        // Reset attempts counter on successful reconnection
        setTimeout(() => {
          if (this.isRunning) {
            this.reconnectAttempts = 0;
          }
        }, 30000);
      } else {
        this.reconnecting = false;
      }
    }, delay);
  }

  setupPeriodicSync() {
    // Adjust interval based on mode: 10s for polling-only mode, 30s for hybrid mode
    const syncInterval = this.usePollingOnly ? 10000 : 30000;
    const mode = this.usePollingOnly ? 'polling-only' : 'hybrid';
    
    this.syncInterval = setInterval(async () => {
      if (!this.isRunning) return;

      try {
        const currentBlock = await this.provider.getBlockNumber();
        if (currentBlock > this.lastProcessedBlock) {
          const fromBlock = this.lastProcessedBlock + 1;
          const toBlock = Math.min(currentBlock, fromBlock + 100); // Process max 100 blocks at a time
          
          await this.processCreatorStoreEvents(fromBlock, toBlock);
          await this.processLoyaltyTokenEvents(fromBlock, toBlock);
          this.lastProcessedBlock = toBlock;
          
          if (toBlock < currentBlock) {
            console.log(`📊 Processed blocks ${fromBlock}-${toBlock}, ${currentBlock - toBlock} blocks remaining`);
          } else if (this.usePollingOnly) {
            console.log(`📊 Polling sync complete up to block ${toBlock}`);
          }
        }
      } catch (error) {
        if (this.isFilterError(error)) {
          console.log('🔄 Filter error in periodic sync, will retry next cycle');
        } else {
          console.error('Error in periodic sync:', error);
        }
      }
    }, syncInterval);

    console.log(`⏰ Periodic sync set up (${mode} mode) - every ${syncInterval/1000}s`);
  }

  async handleProductPurchased(event) {
    try {
      const { buyer, productId, price, creator } = event.args;
      const transactionHash = event.transactionHash;
      const blockNumber = event.blockNumber;

      console.log(`📦 Processing purchase: ${buyer} bought product ${productId} for ${ethers.formatUnits(price, 6)} USDC`);

      // Check if this purchase is already recorded
      const existingPurchases = await db.getPurchasesByCreator(creator);
      const existingPurchase = existingPurchases.find(p => p.transaction_hash === transactionHash);

      if (existingPurchase) {
        console.log('Purchase already recorded, skipping');
        return;
      }

      // Record purchase in database
      await db.recordPurchase(
        buyer.toLowerCase(),
        creator.toLowerCase(),
        productId.toString(),
        ethers.formatUnits(price, 6), // Convert from 6 decimal USDC
        transactionHash,
        blockNumber
      );

      console.log('✅ Purchase recorded in database');

    } catch (error) {
      console.error('Error handling ProductPurchased event:', error);
    }
  }

  async handleProductListed(event) {
    try {
      const { creator, productId, name, price } = event.args;
      console.log(`📝 Product listed: ${name} (ID: ${productId}) by ${creator} for ${ethers.formatUnits(price, 6)} USDC`);

      // This event can be used to sync on-chain product data with off-chain database
      // For now, we'll just log it since products are managed through the API

    } catch (error) {
      console.error('Error handling ProductListed event:', error);
    }
  }

  async getIndexingStatus() {
    try {
      const currentBlock = await this.provider.getBlockNumber();
      return {
        isRunning: this.isRunning,
        currentBlock,
        lastProcessedBlock: this.lastProcessedBlock,
        blocksBehind: currentBlock - this.lastProcessedBlock,
        creatorStoreAddress: CREATOR_STORE_ADDRESS,
        loyaltyTokenAddress: LOYALTY_TOKEN_ADDRESS
      };
    } catch (error) {
      console.error('Error getting indexing status:', error);
      return {
        isRunning: this.isRunning,
        error: error.message
      };
    }
  }

  async handleLoyaltyBadgeTransfer(event) {
    try {
      const { operator, from, to, id, value } = event.args;
      const transactionHash = event.transactionHash;
      const blockNumber = event.blockNumber;

      // Only process minting events (from == zero address)
      if (from !== ethers.ZeroAddress) {
        return;
      }

      console.log(`🏆 Loyalty badge minted: Badge ${id} to ${to}`);

      // Map badge IDs to names
      const badgeNames = {
        1: 'Bronze Badge',
        2: 'Silver Badge', 
        3: 'Gold Badge',
        4: 'Diamond Badge'
      };

      const badgeName = badgeNames[id.toString()] || `Badge ${id}`;

      // Check if this badge mint is already recorded
      const existingBadges = await db.getLoyaltyBadgesByRecipient(to);
      const existingBadge = existingBadges.find(b => b.transaction_hash === transactionHash);

      if (existingBadge) {
        console.log('Badge mint already recorded, skipping');
        return;
      }

      // Record badge mint in database
      await db.recordLoyaltyBadge(
        to.toLowerCase(),
        id.toString(),
        badgeName,
        transactionHash,
        blockNumber
      );

      console.log('✅ Loyalty badge mint recorded in database');

    } catch (error) {
      console.error('Error handling LoyaltyBadgeTransfer event:', error);
    }
  }

  async getIndexingStatus() {
    const currentBlock = await this.provider.getBlockNumber();
    return {
      isRunning: this.isRunning,
      lastProcessedBlock: this.lastProcessedBlock,
      currentBlock,
      blocksBehind: currentBlock - this.lastProcessedBlock
    };
  }
}

// Create singleton instance
const eventIndexer = new EventIndexer();

export { EventIndexer, eventIndexer };