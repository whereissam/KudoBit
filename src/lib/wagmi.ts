import { http } from 'wagmi'
import { hardhat } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import {
  ALL_CHAINS,
  TESTNET_CHAINS,
  MAINNET_CHAINS,
  monadTestnet,
  monadMainnet,
  getDefaultChain
} from './chains'

// Environment-based chain selection
const isDevelopment = import.meta.env.DEV
const isTestMode = import.meta.env.VITE_TESTNET_MODE === 'true'

// Determine which chains to include
function getActiveChains() {
  if (isDevelopment) {
    // Development: Include hardhat + all testnet chains
    return [hardhat, ...TESTNET_CHAINS]
  } else if (isTestMode) {
    // Testnet mode: Only testnet chains
    return TESTNET_CHAINS
  } else {
    // Production: Only mainnet chains
    return MAINNET_CHAINS
  }
}

const activeChains = getActiveChains()

// Build transports for active chains
const buildTransports = () => {
  const transports: Record<number, any> = {}

  // Add hardhat transport for development
  if (isDevelopment) {
    transports[hardhat.id] = http('http://127.0.0.1:8545')
  }

  // Add transports for each active chain
  activeChains.forEach(chain => {
    if (chain.id !== hardhat.id) {
      transports[chain.id] = http(chain.rpcUrls.default.http[0])
    }
  })

  return transports
}

export const getChainById = (chainId: number) => {
  const chain = ALL_CHAINS.find(c => c.id === chainId)
  if (!chain) {
    console.warn(`Chain ID ${chainId} not found, falling back to default`)
    return getDefaultChain()
  }
  return chain
}

export const config = getDefaultConfig({
  appName: 'KudoBit - Multi-Chain Commerce',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '8c3b2f9f4d7e8a1b5c9d2e6f3a4b7c8e',
  chains: activeChains as any,
  ssr: false,
  transports: buildTransports(),
  multiInjectedProviderDiscovery: true,
})

// Export chain utilities
export {
  activeChains,
  isDevelopment,
  isTestMode,
  getDefaultChain,
  monadTestnet,
  monadMainnet
}

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
