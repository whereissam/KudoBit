import { Chain } from 'viem'
import { monadTestnet, monadMainnet } from './chains'

// Contract deployment addresses per chain
export interface ChainDeployment {
  chainId: number
  contracts: {
    MockUSDC: `0x${string}`
    LoyaltyToken: `0x${string}`
    Shopfront: `0x${string}`
  }
  blockNumber?: number
  deployedAt?: string
  verified?: boolean
}

// Multi-chain deployment registry
export const CHAIN_DEPLOYMENTS: Record<number, ChainDeployment> = {
  // Local development (Hardhat)
  31337: {
    chainId: 31337,
    contracts: {
      MockUSDC: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      LoyaltyToken: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
      Shopfront: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
    },
    deployedAt: '2024-01-01T00:00:00Z',
    verified: true
  },

  // Monad Testnet
  [monadTestnet.id]: {
    chainId: monadTestnet.id,
    contracts: {
      MockUSDC: '0x0000000000000000000000000000000000000000',
      LoyaltyToken: '0x0000000000000000000000000000000000000000',
      Shopfront: '0x0000000000000000000000000000000000000000'
    }
  },

  // Monad Mainnet
  [monadMainnet.id]: {
    chainId: monadMainnet.id,
    contracts: {
      MockUSDC: '0x0000000000000000000000000000000000000000',
      LoyaltyToken: '0x0000000000000000000000000000000000000000',
      Shopfront: '0x0000000000000000000000000000000000000000'
    }
  },

  // Ethereum Sepolia
  11155111: {
    chainId: 11155111,
    contracts: {
      MockUSDC: '0x0000000000000000000000000000000000000000',
      LoyaltyToken: '0x0000000000000000000000000000000000000000',
      Shopfront: '0x0000000000000000000000000000000000000000'
    }
  },

  // Polygon Amoy
  80002: {
    chainId: 80002,
    contracts: {
      MockUSDC: '0x0000000000000000000000000000000000000000',
      LoyaltyToken: '0x0000000000000000000000000000000000000000',
      Shopfront: '0x0000000000000000000000000000000000000000'
    }
  },

  // Arbitrum Sepolia
  421614: {
    chainId: 421614,
    contracts: {
      MockUSDC: '0x0000000000000000000000000000000000000000',
      LoyaltyToken: '0x0000000000000000000000000000000000000000',
      Shopfront: '0x0000000000000000000000000000000000000000'
    }
  },

  // Optimism Sepolia
  11155420: {
    chainId: 11155420,
    contracts: {
      MockUSDC: '0x0000000000000000000000000000000000000000',
      LoyaltyToken: '0x0000000000000000000000000000000000000000',
      Shopfront: '0x0000000000000000000000000000000000000000'
    }
  },

  // Base Sepolia
  84532: {
    chainId: 84532,
    contracts: {
      MockUSDC: '0x0000000000000000000000000000000000000000',
      LoyaltyToken: '0x0000000000000000000000000000000000000000',
      Shopfront: '0x0000000000000000000000000000000000000000'
    }
  }
}

// Contract ABIs (imported from existing contracts)
import { MOCK_USDC_ABI, LOYALTY_TOKEN_ABI, SHOPFRONT_ABI } from './contracts'

export const CONTRACT_ABIS = {
  MockUSDC: MOCK_USDC_ABI,
  LoyaltyToken: LOYALTY_TOKEN_ABI,
  Shopfront: SHOPFRONT_ABI
} as const

// Helper functions
export function getDeployment(chainId: number): ChainDeployment | undefined {
  return CHAIN_DEPLOYMENTS[chainId]
}

export function getContractAddress(
  chainId: number,
  contractName: keyof ChainDeployment['contracts']
): `0x${string}` | undefined {
  const deployment = getDeployment(chainId)
  return deployment?.contracts[contractName]
}

export function isDeployed(chainId: number): boolean {
  const deployment = getDeployment(chainId)
  if (!deployment) return false

  return Object.values(deployment.contracts).every(
    address => address !== '0x0000000000000000000000000000000000000000'
  )
}

export function getSupportedChains(): number[] {
  return Object.keys(CHAIN_DEPLOYMENTS)
    .map(Number)
    .filter(chainId => isDeployed(chainId))
}

export function getTestnetChains(): number[] {
  return [31337, monadTestnet.id, 11155111, 80002, 421614, 11155420, 84532]
}

export function getMainnetChains(): number[] {
  return [monadMainnet.id, 1, 137, 42161, 10, 8453]
}

// Contract configuration with multi-chain support
export function getContractConfig(chainId: number, contractName: keyof typeof CONTRACT_ABIS) {
  const address = getContractAddress(chainId, contractName)
  if (!address) {
    throw new Error(`Contract ${contractName} not deployed on chain ${chainId}`)
  }

  return {
    address,
    abi: CONTRACT_ABIS[contractName],
    chainId
  }
}

// Update deployment addresses (used by deployment scripts)
export function updateDeployment(chainId: number, contracts: Partial<ChainDeployment['contracts']>) {
  if (!CHAIN_DEPLOYMENTS[chainId]) {
    CHAIN_DEPLOYMENTS[chainId] = {
      chainId,
      contracts: {
        MockUSDC: '0x0000000000000000000000000000000000000000',
        LoyaltyToken: '0x0000000000000000000000000000000000000000',
        Shopfront: '0x0000000000000000000000000000000000000000'
      }
    }
  }

  CHAIN_DEPLOYMENTS[chainId].contracts = {
    ...CHAIN_DEPLOYMENTS[chainId].contracts,
    ...contracts
  }

  CHAIN_DEPLOYMENTS[chainId].deployedAt = new Date().toISOString()

  console.log(`Updated deployment for chain ${chainId}:`, contracts)
}

// Cross-chain deployment status
export interface DeploymentStatus {
  totalChains: number
  deployedChains: number
  pendingChainsCount: number
  supportedChains: number[]
  pendingChains: number[]
  deploymentProgress: number
}

export function getDeploymentStatus(): DeploymentStatus {
  const allChains = Object.keys(CHAIN_DEPLOYMENTS).map(Number)
  const deployedChains = getSupportedChains()
  const pendingChains = allChains.filter(chainId => !isDeployed(chainId))

  return {
    totalChains: allChains.length,
    deployedChains: deployedChains.length,
    pendingChainsCount: pendingChains.length,
    supportedChains: deployedChains,
    pendingChains,
    deploymentProgress: (deployedChains.length / allChains.length) * 100
  }
}

// Chain-specific configuration overrides
export const CHAIN_CONFIG_OVERRIDES: Record<number, {
  gasMultiplier?: number
  blockConfirmations?: number
  maxRetries?: number
  retryDelay?: number
}> = {
  // Ethereum mainnet - higher gas, more confirmations
  1: {
    gasMultiplier: 1.2,
    blockConfirmations: 3,
    maxRetries: 5,
    retryDelay: 30000
  },

  // Polygon - faster, cheaper
  137: {
    gasMultiplier: 1.1,
    blockConfirmations: 1,
    maxRetries: 3,
    retryDelay: 5000
  },

  // Arbitrum - very fast
  42161: {
    gasMultiplier: 1.0,
    blockConfirmations: 1,
    maxRetries: 2,
    retryDelay: 2000
  },

  // Optimism - fast L2
  10: {
    gasMultiplier: 1.0,
    blockConfirmations: 1,
    maxRetries: 2,
    retryDelay: 2000
  },

  // Base - Coinbase L2
  8453: {
    gasMultiplier: 1.0,
    blockConfirmations: 1,
    maxRetries: 2,
    retryDelay: 2000
  },

  // Monad - high-throughput L1
  [monadMainnet.id]: {
    gasMultiplier: 1.0,
    blockConfirmations: 1,
    maxRetries: 2,
    retryDelay: 1000
  }
}

export function getChainConfig(chainId: number) {
  return CHAIN_CONFIG_OVERRIDES[chainId] || {
    gasMultiplier: 1.1,
    blockConfirmations: 2,
    maxRetries: 3,
    retryDelay: 10000
  }
}
