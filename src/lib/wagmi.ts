import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, localhost } from 'wagmi/chains'

// Define Morph Holesky chain details per plan specifications
const morphHolesky = {
  id: 2810,
  name: 'Morph Holesky',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-quicknode-holesky.morphl2.io'] },
  },
  blockExplorers: {
    default: { name: 'Morphscan', url: 'https://explorer-holesky.morphl2.io' },
  },
  testnet: true,
} as const

// Local development chain
const localChain = {
  ...localhost,
  id: 31337,
  name: 'Localhost 8545',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
  },
} as const

export const config = getDefaultConfig({
  appName: 'KudoBit',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'fecdb34a9446481efe518ac7a0625cb1',
  chains: [localChain, morphHolesky, mainnet],
  ssr: true
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}