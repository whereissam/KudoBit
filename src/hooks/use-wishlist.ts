import { useState, useCallback } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACTS_EXTENDED, WISHLIST_ABI } from '@/lib/contracts'
import { useErrorHandler } from './use-error-handler'
import { toast } from 'react-hot-toast'

export function useWishlist() {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const { handleContractError } = useErrorHandler()

  // Get user's wishlist
  const { data: wishlistItems, refetch: refetchWishlist } = useReadContract({
    address: CONTRACTS_EXTENDED.wishlist,
    abi: WISHLIST_ABI,
    functionName: 'getUserWishlist',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  // Check if specific product is in wishlist
  const isInWishlist = useCallback((productId: number) => {
    if (!wishlistItems) return false
    return wishlistItems.includes(BigInt(productId))
  }, [wishlistItems])

  // Write contract functions
  const { writeContract, data: hash, error } = useWriteContract()

  // Wait for transaction confirmation
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  })

  // Add to wishlist
  const addToWishlist = useCallback(async (productId: number) => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return false
    }
    
    try {
      setIsLoading(true)
      await writeContract({
        address: CONTRACTS_EXTENDED.wishlist,
        abi: WISHLIST_ABI,
        functionName: 'addToWishlist',
        args: [BigInt(productId)],
      })
      
      toast.success('Added to wishlist!')
      await refetchWishlist()
      return true
    } catch (error) {
      handleContractError(error, 'Wishlist', 'addToWishlist')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [address, writeContract, refetchWishlist, handleContractError])

  // Remove from wishlist
  const removeFromWishlist = useCallback(async (productId: number) => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return false
    }
    
    try {
      setIsLoading(true)
      await writeContract({
        address: CONTRACTS_EXTENDED.wishlist,
        abi: WISHLIST_ABI,
        functionName: 'removeFromWishlist',
        args: [BigInt(productId)],
      })
      
      toast.success('Removed from wishlist')
      await refetchWishlist()
      return true
    } catch (error) {
      handleContractError(error, 'Wishlist', 'removeFromWishlist')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [address, writeContract, refetchWishlist, handleContractError])

  // Toggle wishlist status
  const toggleWishlist = useCallback(async (productId: number) => {
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId)
    } else {
      return await addToWishlist(productId)
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist])

  return {
    wishlistItems: wishlistItems || [],
    wishlistCount: wishlistItems?.length || 0,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isLoading: isLoading || isConfirming,
    error,
    refetchWishlist,
  }
}