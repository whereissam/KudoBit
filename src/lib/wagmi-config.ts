import { useChainId } from 'wagmi'
import { mainnet, hardhat } from 'wagmi/chains'

// Simple chain mapping
const morphHolesky = {
  id: 2810,
  name: 'Morph Holesky',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc-quicknode-holesky.morphl2.io'] } },
  blockExplorers: { default: { name: 'Morphscan', url: 'https://explorer-holesky.morphl2.io' } },
  testnet: true,
} as const

export const getChain = (chainId: number) => {
  switch (chainId) {
    case 1: return mainnet
    case 31337: return hardhat
    case 2810: return morphHolesky
    default: return mainnet
  }
}

// Hook that returns what each wagmi call needs
export const useWagmiConfig = () => {
  const chainId = useChainId()
  return {
    // For useReadContract
    readConfig: { chainId },
    // For writeContract  
    writeConfig: { chain: getChain(chainId) }
  }
}