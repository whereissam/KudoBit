import { http } from 'wagmi'
import { mainnet, hardhat } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

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

export const config = getDefaultConfig({
  appName: 'KudoBit',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '8c3b2f9f4d7e8a1b5c9d2e6f3a4b7c8e',
  chains: [hardhat, morphHolesky, mainnet],
  ssr: false, // Disable SSR for client-side rendering
  transports: {
    [hardhat.id]: http('http://127.0.0.1:8545'),
    [morphHolesky.id]: http('https://rpc-quicknode-holesky.morphl2.io'),
    [mainnet.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}