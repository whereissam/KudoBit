import { useChainId } from 'wagmi'
import { mainnet, hardhat } from 'wagmi/chains'

// Simple chain mapping
const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz'] } },
  blockExplorers: { default: { name: 'Monadscan', url: 'https://testnet.monadscan.com' } },
  testnet: true,
} as const

export const getChain = (chainId: number) => {
  switch (chainId) {
    case 1: return mainnet
    case 31337: return hardhat
    case 10143: return monadTestnet
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
