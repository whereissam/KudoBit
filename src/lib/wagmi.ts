import { http, createConfig } from 'wagmi'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'
import { mainnet } from 'wagmi/chains'

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

export const config = createConfig({
  chains: [morphHolesky, mainnet],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ 
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '8c3b2f9f4d7e8a1b5c9d2e6f3a4b7c8e' 
    }),
  ],
  ssr: true,
  transports: {
    [morphHolesky.id]: http(),
    [mainnet.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}