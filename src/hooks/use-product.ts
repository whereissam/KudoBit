import { useReadContract } from 'wagmi'
import { CONTRACTS, PRODUCT_NFT_ABI } from '@/lib/contracts'

export function useProduct(productId: number | bigint) {
  return useReadContract({
    address: CONTRACTS.productNFT,
    abi: PRODUCT_NFT_ABI,
    functionName: 'products',
    args: [BigInt(productId)],
  })
}

export function useProductContentHash(productId: number | bigint) {
  return useReadContract({
    address: CONTRACTS.productNFT,
    abi: PRODUCT_NFT_ABI,
    functionName: 'contentHashes',
    args: [BigInt(productId)],
  })
}

export function formatAddress(addr: string) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export function getProductEmoji(productId: number) {
  const emojis = ['📄', '🖼️', '🎫', '📦', '🎨', '📚', '🎵', '📹', '🎮', '🔧']
  return emojis[productId % emojis.length]
}