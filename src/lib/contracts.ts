import { Address } from 'viem'

// Network-specific contract deployments
const NETWORK_CONTRACTS = {
  // Local development (Hardhat)
  1337: {
    mockUSDC: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address,  
    loyaltyToken: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as Address,  
    creatorStore: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9' as Address,
    secondaryMarketplace: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0' as Address,
  },
  // Morph Holesky
  2810: {
    mockUSDC: '0x1dA0552f45cC89be39A2BF53Ef1c75859894D5dd' as Address,
    loyaltyToken: '0x89de622217c01f4c97453a35CaFfF1E7b7D6f8FC' as Address,  
    creatorStore: '0x203B1f821F726d596b57C1399906EF338b98b9FF' as Address,
    secondaryMarketplace: '0x203B1f821F726d596b57C1399906EF338b98b9FF' as Address, // Using creatorStore as fallback
  },
  // Ethereum Mainnet (placeholder - not deployed)
  1: {
    mockUSDC: '0x0000000000000000000000000000000000000000' as Address,
    loyaltyToken: '0x0000000000000000000000000000000000000000' as Address,  
    creatorStore: '0x0000000000000000000000000000000000000000' as Address,
    secondaryMarketplace: '0x0000000000000000000000000000000000000000' as Address,
  }
} as const

// Function to get contracts for current chain
export function getContracts(chainId?: number): typeof NETWORK_CONTRACTS[1337] {
  const defaultChainId = 1337 // Default to local development
  const currentChainId = chainId || defaultChainId
  
  // Return contracts for the current chain, fallback to local dev if not found
  return NETWORK_CONTRACTS[currentChainId as keyof typeof NETWORK_CONTRACTS] || NETWORK_CONTRACTS[1337]
}

// Default export for backward compatibility (uses local development)
export const CONTRACTS = getContracts()

export const MOCK_USDC_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "faucet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export const SECONDARY_MARKETPLACE_ABI = [
  // Primary purchase functions
  {
    "inputs": [{"internalType": "uint256", "name": "productId", "type": "uint256"}],
    "name": "buyItem",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Resale functions
  {
    "inputs": [
      {"internalType": "uint256", "name": "productId", "type": "uint256"},
      {"internalType": "uint256", "name": "resalePrice", "type": "uint256"}
    ],
    "name": "listForResale",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "resaleId", "type": "uint256"}],
    "name": "buyResaleItem",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "resaleId", "type": "uint256"}],
    "name": "cancelResaleListing",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // View functions for products
  {
    "inputs": [],
    "name": "getAllProducts",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "string", "name": "name", "type": "string"},
          {"internalType": "string", "name": "description", "type": "string"},
          {"internalType": "string", "name": "ipfsContentHash", "type": "string"},
          {"internalType": "uint256", "name": "priceInUSDC", "type": "uint256"},
          {"internalType": "bool", "name": "isActive", "type": "bool"},
          {"internalType": "uint256", "name": "loyaltyBadgeId", "type": "uint256"},
          {"internalType": "address", "name": "creator", "type": "address"},
          {"internalType": "uint256", "name": "creatorRoyaltyPercentage", "type": "uint256"}
        ],
        "internalType": "struct SecondaryMarketplace.Product[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // View functions for resale listings
  {
    "inputs": [],
    "name": "getAllActiveResaleListings",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "uint256", "name": "productId", "type": "uint256"},
          {"internalType": "address", "name": "seller", "type": "address"},
          {"internalType": "uint256", "name": "resalePrice", "type": "uint256"},
          {"internalType": "bool", "name": "isActive", "type": "bool"},
          {"internalType": "uint256", "name": "listedAt", "type": "uint256"}
        ],
        "internalType": "struct SecondaryMarketplace.ResaleListing[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserResaleListings",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserOwnedProducts",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserPurchases",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "uint256", "name": "productId", "type": "uint256"}
    ],
    "name": "userCanResell",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Fee calculation
  {
    "inputs": [
      {"internalType": "uint256", "name": "resalePrice", "type": "uint256"},
      {"internalType": "uint256", "name": "productId", "type": "uint256"}
    ],
    "name": "calculateResaleFees",
    "outputs": [
      {"internalType": "uint256", "name": "platformFee", "type": "uint256"},
      {"internalType": "uint256", "name": "creatorRoyalty", "type": "uint256"},
      {"internalType": "uint256", "name": "sellerAmount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Purchase history
  {
    "inputs": [{"internalType": "uint256", "name": "productId", "type": "uint256"}],
    "name": "getProductPurchaseHistory",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "productId", "type": "uint256"},
          {"internalType": "address", "name": "buyer", "type": "address"},
          {"internalType": "uint256", "name": "pricePaid", "type": "uint256"},
          {"internalType": "uint256", "name": "purchasedAt", "type": "uint256"},
          {"internalType": "bool", "name": "isResold", "type": "bool"}
        ],
        "internalType": "struct SecondaryMarketplace.Purchase[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Owner functions
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Constants
  {
    "inputs": [],
    "name": "DEFAULT_CREATOR_ROYALTY",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PLATFORM_FEE",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Keep the old ABI for backward compatibility
export const CREATOR_STORE_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "productId", "type": "uint256"}],
    "name": "buyItem",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllProducts",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "string", "name": "name", "type": "string"},
          {"internalType": "string", "name": "description", "type": "string"},
          {"internalType": "string", "name": "ipfsContentHash", "type": "string"},
          {"internalType": "uint256", "name": "priceInUSDC", "type": "uint256"},
          {"internalType": "bool", "name": "isActive", "type": "bool"},
          {"internalType": "uint256", "name": "loyaltyBadgeId", "type": "uint256"}
        ],
        "internalType": "struct CreatorStore.Product[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserPurchases",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "string", "name": "ipfsContentHash", "type": "string"},
      {"internalType": "uint256", "name": "priceInUSDC", "type": "uint256"},
      {"internalType": "uint256", "name": "loyaltyBadgeId", "type": "uint256"}
    ],
    "name": "listProduct",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

export const LOYALTY_TOKEN_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "account", "type": "address"},
      {"internalType": "uint256", "name": "id", "type": "uint256"}
    ],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "recipient", "type": "address"},
      {"internalType": "uint256", "name": "badgeId", "type": "uint256"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "mintBadge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "uri",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "BRONZE_BADGE",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "SILVER_BADGE", 
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "GOLD_BADGE",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DIAMOND_BADGE",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const