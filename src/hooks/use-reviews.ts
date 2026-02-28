import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { EXTENSION_CONTRACTS, REVIEWS_ABI } from '@/lib/extension-contracts'

const ZERO = '0x0000000000000000000000000000000000000000'

export function useProductReviews(productId: bigint | undefined) {
  const enabled = EXTENSION_CONTRACTS.reviews !== ZERO

  const { data: reviewIds, isLoading: isLoadingIds } = useReadContract({
    address: EXTENSION_CONTRACTS.reviews,
    abi: REVIEWS_ABI,
    functionName: 'getProductReviews',
    args: productId !== undefined ? [productId] : undefined,
    query: { enabled: productId !== undefined && enabled },
  })

  const { data: rating, isLoading: isLoadingRating } = useReadContract({
    address: EXTENSION_CONTRACTS.reviews,
    abi: REVIEWS_ABI,
    functionName: 'getProductRating',
    args: productId !== undefined ? [productId] : undefined,
    query: { enabled: productId !== undefined && enabled },
  })

  const { writeContract, data: txHash, isPending: isWriting } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const createReview = (targetProductId: bigint, reviewRating: number, comment: string) => {
    writeContract({
      address: EXTENSION_CONTRACTS.reviews,
      abi: REVIEWS_ABI,
      functionName: 'createReview',
      args: [targetProductId, reviewRating, comment],
    })
  }

  return {
    reviewIds: reviewIds as bigint[] | undefined,
    averageRating: rating ? Number((rating as any)[0] || 0) : 0,
    totalReviews: rating ? Number((rating as any)[1] || 0) : 0,
    isLoading: isLoadingIds || isLoadingRating,
    isWriting,
    isConfirming,
    isSuccess,
    txHash,
    contractDeployed: enabled,
    createReview,
  }
}
