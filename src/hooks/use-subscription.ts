import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { EXTENSION_CONTRACTS, SUBSCRIPTION_ABI } from '@/lib/extension-contracts'

const ZERO = '0x0000000000000000000000000000000000000000'

export function useSubscription() {
  const { address } = useAccount()
  const enabled = EXTENSION_CONTRACTS.subscriptionTiers !== ZERO

  const { data: allTiers, isLoading: isLoadingTiers } = useReadContract({
    address: EXTENSION_CONTRACTS.subscriptionTiers,
    abi: SUBSCRIPTION_ABI,
    functionName: 'getAllSubscriptionTiers',
    query: { enabled },
  })

  const { data: userTiers } = useReadContract({
    address: EXTENSION_CONTRACTS.subscriptionTiers,
    abi: SUBSCRIPTION_ABI,
    functionName: 'getUserActiveTiers',
    args: address ? [address] : undefined,
    query: { enabled: !!address && enabled },
  })

  const { data: tierCount } = useReadContract({
    address: EXTENSION_CONTRACTS.subscriptionTiers,
    abi: SUBSCRIPTION_ABI,
    functionName: 'tierCount',
    query: { enabled },
  })

  const { writeContract, data: txHash, isPending: isWriting } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const subscribe = (tierId: bigint, isAnnual: boolean) => {
    writeContract({
      address: EXTENSION_CONTRACTS.subscriptionTiers,
      abi: SUBSCRIPTION_ABI,
      functionName: 'subscribeToTier',
      args: [tierId, isAnnual],
    })
  }

  const cancel = (tierId: bigint) => {
    writeContract({
      address: EXTENSION_CONTRACTS.subscriptionTiers,
      abi: SUBSCRIPTION_ABI,
      functionName: 'cancelSubscription',
      args: [tierId],
    })
  }

  const parsedTiers = allTiers ? {
    tierIds: (allTiers as any)[0] as bigint[],
    names: (allTiers as any)[1] as string[],
    monthlyPrices: (allTiers as any)[2] as bigint[],
    annualPrices: (allTiers as any)[3] as bigint[],
    activeStatus: (allTiers as any)[4] as boolean[],
  } : undefined

  const parsedUserTiers = userTiers ? {
    activeTierIds: (userTiers as any)[0] as bigint[],
    tierNames: (userTiers as any)[1] as string[],
  } : undefined

  return {
    allTiers: parsedTiers,
    userActiveTiers: parsedUserTiers,
    tierCount: tierCount ? Number(tierCount) : 0,
    isLoading: isLoadingTiers,
    isWriting,
    isConfirming,
    isSuccess,
    txHash,
    contractDeployed: enabled,
    subscribe,
    cancel,
  }
}

export function useSubscriptionStatus(tierId: bigint | undefined) {
  const { address } = useAccount()
  const enabled = EXTENSION_CONTRACTS.subscriptionTiers !== ZERO

  const { data: info, isLoading } = useReadContract({
    address: EXTENSION_CONTRACTS.subscriptionTiers,
    abi: SUBSCRIPTION_ABI,
    functionName: 'getUserSubscriptionInfo',
    args: address && tierId !== undefined ? [address, tierId] : undefined,
    query: { enabled: !!address && tierId !== undefined && enabled },
  })

  const parsed = info ? {
    isActive: (info as any)[0] as boolean,
    startTime: Number((info as any)[1] || 0),
    endTime: Number((info as any)[2] || 0),
    timeRemaining: Number((info as any)[3] || 0),
    isAnnual: (info as any)[4] as boolean,
    amountPaid: (info as any)[5] as bigint,
  } : undefined

  return { subscription: parsed, isLoading }
}
