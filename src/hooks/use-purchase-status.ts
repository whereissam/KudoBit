import { useReadContract } from 'wagmi'
import { CONTRACTS, GUMROAD_CORE_ABI, MOCK_USDC_ABI } from '@/lib/contracts'

export function usePurchaseStatus(productId: number | bigint, userAddress?: `0x${string}`) {
  return useReadContract({
    address: CONTRACTS.gumroadCore,
    abi: GUMROAD_CORE_ABI,
    functionName: 'hasPurchased',
    args: [BigInt(productId), userAddress || '0x0'],
    query: { enabled: !!userAddress },
  })
}

export function useUserBalance(userAddress?: `0x${string}`) {
  return useReadContract({
    address: CONTRACTS.mockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  })
}