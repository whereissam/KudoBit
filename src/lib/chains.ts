import { Chain } from 'viem'
import {
  mainnet,
  sepolia,
  polygon,
  polygonAmoy,
  arbitrum,
  arbitrumSepolia,
  optimism,
  optimismSepolia,
  base,
  baseSepolia
} from 'viem/chains'

// Monad chain definitions
export const monadTestnet: Chain = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://testnet.monadscan.com',
    },
  },
  testnet: true,
}

export const monadMainnet: Chain = {
  id: 143,
  name: 'Monad',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://monadscan.com',
    },
  },
  testnet: false,
}

// Chain categories
export const TESTNET_CHAINS = [
  monadTestnet,
  sepolia,
  polygonAmoy,
  arbitrumSepolia,
  optimismSepolia,
  baseSepolia,
] as const

export const MAINNET_CHAINS = [
  monadMainnet,
  mainnet,
  polygon,
  arbitrum,
  optimism,
  base,
] as const

export const ALL_CHAINS = [...TESTNET_CHAINS, ...MAINNET_CHAINS] as const

// Chain metadata for UI
export interface ChainMetadata {
  id: number
  name: string
  shortName: string
  icon: string
  color: string
  category: 'L1' | 'L2' | 'Sidechain'
  fees: 'Low' | 'Medium' | 'High'
  speed: 'Fast' | 'Medium' | 'Slow'
  testnet: boolean
  explorerUrl: string
  faucetUrl?: string
  bridgeUrl?: string
  docs?: string
}

export const CHAIN_METADATA: Record<number, ChainMetadata> = {
  // Testnets
  [monadTestnet.id]: {
    id: monadTestnet.id,
    name: 'Monad Testnet',
    shortName: 'Monad',
    icon: '/chains/monad.svg',
    color: '#836EF9',
    category: 'L1',
    fees: 'Low',
    speed: 'Fast',
    testnet: true,
    explorerUrl: 'https://testnet.monadscan.com',
    faucetUrl: 'https://faucet.monad.xyz',
    docs: 'https://docs.monad.xyz'
  },
  [sepolia.id]: {
    id: sepolia.id,
    name: 'Ethereum Sepolia',
    shortName: 'Sepolia',
    icon: '/chains/ethereum.svg',
    color: '#627EEA',
    category: 'L1',
    fees: 'High',
    speed: 'Medium',
    testnet: true,
    explorerUrl: 'https://sepolia.etherscan.io',
    faucetUrl: 'https://sepoliafaucet.com',
    docs: 'https://ethereum.org/developers'
  },
  [polygonAmoy.id]: {
    id: polygonAmoy.id,
    name: 'Polygon Amoy',
    shortName: 'Amoy',
    icon: '/chains/polygon.svg',
    color: '#8247E5',
    category: 'L2',
    fees: 'Low',
    speed: 'Fast',
    testnet: true,
    explorerUrl: 'https://amoy.polygonscan.com',
    faucetUrl: 'https://faucet.polygon.technology',
    bridgeUrl: 'https://portal.polygon.technology',
    docs: 'https://docs.polygon.technology'
  },
  [arbitrumSepolia.id]: {
    id: arbitrumSepolia.id,
    name: 'Arbitrum Sepolia',
    shortName: 'Arb Sepolia',
    icon: '/chains/arbitrum.svg',
    color: '#12AAFF',
    category: 'L2',
    fees: 'Low',
    speed: 'Fast',
    testnet: true,
    explorerUrl: 'https://sepolia.arbiscan.io',
    faucetUrl: 'https://bridge.arbitrum.io',
    bridgeUrl: 'https://bridge.arbitrum.io',
    docs: 'https://docs.arbitrum.io'
  },
  [optimismSepolia.id]: {
    id: optimismSepolia.id,
    name: 'Optimism Sepolia',
    shortName: 'OP Sepolia',
    icon: '/chains/optimism.svg',
    color: '#FF0420',
    category: 'L2',
    fees: 'Low',
    speed: 'Fast',
    testnet: true,
    explorerUrl: 'https://sepolia-optimism.etherscan.io',
    faucetUrl: 'https://app.optimism.io/bridge',
    bridgeUrl: 'https://app.optimism.io/bridge',
    docs: 'https://docs.optimism.io'
  },
  [baseSepolia.id]: {
    id: baseSepolia.id,
    name: 'Base Sepolia',
    shortName: 'Base Sepolia',
    icon: '/chains/base.svg',
    color: '#0052FF',
    category: 'L2',
    fees: 'Low',
    speed: 'Fast',
    testnet: true,
    explorerUrl: 'https://sepolia.basescan.org',
    faucetUrl: 'https://bridge.base.org',
    bridgeUrl: 'https://bridge.base.org',
    docs: 'https://docs.base.org'
  },

  // Mainnets
  [monadMainnet.id]: {
    id: monadMainnet.id,
    name: 'Monad',
    shortName: 'Monad',
    icon: '/chains/monad.svg',
    color: '#836EF9',
    category: 'L1',
    fees: 'Low',
    speed: 'Fast',
    testnet: false,
    explorerUrl: 'https://monadscan.com',
    docs: 'https://docs.monad.xyz'
  },
  [mainnet.id]: {
    id: mainnet.id,
    name: 'Ethereum',
    shortName: 'ETH',
    icon: '/chains/ethereum.svg',
    color: '#627EEA',
    category: 'L1',
    fees: 'High',
    speed: 'Medium',
    testnet: false,
    explorerUrl: 'https://etherscan.io',
    docs: 'https://ethereum.org/developers'
  },
  [polygon.id]: {
    id: polygon.id,
    name: 'Polygon',
    shortName: 'MATIC',
    icon: '/chains/polygon.svg',
    color: '#8247E5',
    category: 'L2',
    fees: 'Low',
    speed: 'Fast',
    testnet: false,
    explorerUrl: 'https://polygonscan.com',
    bridgeUrl: 'https://portal.polygon.technology',
    docs: 'https://docs.polygon.technology'
  },
  [arbitrum.id]: {
    id: arbitrum.id,
    name: 'Arbitrum One',
    shortName: 'ARB',
    icon: '/chains/arbitrum.svg',
    color: '#12AAFF',
    category: 'L2',
    fees: 'Low',
    speed: 'Fast',
    testnet: false,
    explorerUrl: 'https://arbiscan.io',
    bridgeUrl: 'https://bridge.arbitrum.io',
    docs: 'https://docs.arbitrum.io'
  },
  [optimism.id]: {
    id: optimism.id,
    name: 'Optimism',
    shortName: 'OP',
    icon: '/chains/optimism.svg',
    color: '#FF0420',
    category: 'L2',
    fees: 'Low',
    speed: 'Fast',
    testnet: false,
    explorerUrl: 'https://optimistic.etherscan.io',
    bridgeUrl: 'https://app.optimism.io/bridge',
    docs: 'https://docs.optimism.io'
  },
  [base.id]: {
    id: base.id,
    name: 'Base',
    shortName: 'BASE',
    icon: '/chains/base.svg',
    color: '#0052FF',
    category: 'L2',
    fees: 'Low',
    speed: 'Fast',
    testnet: false,
    explorerUrl: 'https://basescan.org',
    bridgeUrl: 'https://bridge.base.org',
    docs: 'https://docs.base.org'
  }
}

// Helper functions
export function getChainMetadata(chainId: number): ChainMetadata | undefined {
  return CHAIN_METADATA[chainId]
}

export function isTestnet(chainId: number): boolean {
  return CHAIN_METADATA[chainId]?.testnet ?? false
}

export function getChainByCategory(category: 'L1' | 'L2' | 'Sidechain') {
  return Object.values(CHAIN_METADATA).filter(chain => chain.category === category)
}

export function getTestnetChains() {
  return Object.values(CHAIN_METADATA).filter(chain => chain.testnet)
}

export function getMainnetChains() {
  return Object.values(CHAIN_METADATA).filter(chain => !chain.testnet)
}

// Default chain selection based on environment
export function getDefaultChain(): Chain {
  const isProduction = process.env.NODE_ENV === 'production'
  return isProduction ? monadMainnet : monadTestnet
}

// Chain icons mapping for components
export const CHAIN_ICONS = {
  [monadTestnet.id]: '/chains/monad.svg',
  [monadMainnet.id]: '/chains/monad.svg',
  [mainnet.id]: '/chains/ethereum.svg',
  [sepolia.id]: '/chains/ethereum.svg',
  [polygon.id]: '/chains/polygon.svg',
  [polygonAmoy.id]: '/chains/polygon.svg',
  [arbitrum.id]: '/chains/arbitrum.svg',
  [arbitrumSepolia.id]: '/chains/arbitrum.svg',
  [optimism.id]: '/chains/optimism.svg',
  [optimismSepolia.id]: '/chains/optimism.svg',
  [base.id]: '/chains/base.svg',
  [baseSepolia.id]: '/chains/base.svg',
} as const
