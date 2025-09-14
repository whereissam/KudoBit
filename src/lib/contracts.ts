import { Address } from 'viem'

// Development/placeholder addresses - replace with actual deployed addresses
const DEV_ADDRESSES = {
  mockUSDC: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  loyaltyToken: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  productNFT: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  creatorRegistry: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  royaltyManager: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
  contentAccess: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
  gumroadCore: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
  shopfront: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
}

export const CONTRACTS = {
  mockUSDC: (import.meta.env.VITE_MOCK_USDC_ADDRESS || DEV_ADDRESSES.mockUSDC) as Address,
  loyaltyToken: (import.meta.env.VITE_LOYALTY_TOKEN_ADDRESS || DEV_ADDRESSES.loyaltyToken) as Address,
  productNFT: (import.meta.env.VITE_PRODUCT_NFT_ADDRESS || DEV_ADDRESSES.productNFT) as Address,
  creatorRegistry: (import.meta.env.VITE_CREATOR_REGISTRY_ADDRESS || DEV_ADDRESSES.creatorRegistry) as Address,
  royaltyManager: (import.meta.env.VITE_ROYALTY_MANAGER_ADDRESS || DEV_ADDRESSES.royaltyManager) as Address,
  contentAccess: (import.meta.env.VITE_CONTENT_ACCESS_ADDRESS || DEV_ADDRESSES.contentAccess) as Address,
  gumroadCore: (import.meta.env.VITE_GUMROAD_CORE_ADDRESS || DEV_ADDRESSES.gumroadCore) as Address,
  // Legacy
  shopfront: (import.meta.env.VITE_SHOPFRONT_ADDRESS || DEV_ADDRESSES.shopfront) as Address,
}

export const SHOPFRONT_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "itemId", "type": "uint256"}],
    "name": "buyItem",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllItems",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "id", "type": "uint256"},
          {"internalType": "string", "name": "name", "type": "string"},
          {"internalType": "string", "name": "description", "type": "string"},
          {"internalType": "string", "name": "imageUrl", "type": "string"},
          {"internalType": "uint256", "name": "priceInUSDC", "type": "uint256"},
          {"internalType": "bool", "name": "isActive", "type": "bool"},
          {"internalType": "uint256", "name": "loyaltyBadgeId", "type": "uint256"}
        ],
        "internalType": "struct Shopfront.Item[]",
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
  }
] as const

export const MOCK_USDC_ABI = [
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
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "faucet",
    "outputs": [],
    "stateMutability": "nonpayable",
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
  }
] as const

// Core Gumroad contract ABIs - minimal and focused
export const PRODUCT_NFT_ABI = [
  {
    "inputs": [],
    "name": "productCounter",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "products",
    "outputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "uint256", "name": "price", "type": "uint256"},
      {"internalType": "bool", "name": "active", "type": "bool"},
      {"internalType": "address", "name": "creator", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "contentHashes",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "creator", "type": "address"}],
    "name": "getCreatorProducts",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "role", "type": "bytes32"},
      {"internalType": "address", "name": "account", "type": "address"}
    ],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "string", "name": "uri", "type": "string"},
      {"internalType": "uint256", "name": "price", "type": "uint256"},
      {"internalType": "string", "name": "contentHash", "type": "string"}
    ],
    "name": "mintProduct",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

export const GUMROAD_CORE_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "productId", "type": "uint256"},
      {"internalType": "address", "name": "paymentToken", "type": "address"}
    ],
    "name": "purchaseProduct",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"},
      {"internalType": "address", "name": "", "type": "address"}
    ],
    "name": "hasPurchased",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export const CREATOR_REGISTRY_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "bio", "type": "string"},
      {"internalType": "string", "name": "avatar", "type": "string"}
    ],
    "name": "registerCreator",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "bio", "type": "string"},
      {"internalType": "string", "name": "avatar", "type": "string"}
    ],
    "name": "updateCreatorProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "isRegistered",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "creators",
    "outputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "bio", "type": "string"},
      {"internalType": "string", "name": "avatar", "type": "string"},
      {"internalType": "bool", "name": "verified", "type": "bool"},
      {"internalType": "uint256", "name": "productCount", "type": "uint256"},
      {"internalType": "uint256", "name": "totalSales", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const