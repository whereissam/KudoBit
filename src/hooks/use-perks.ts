import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { EXTENSION_CONTRACTS, PERKS_ABI, BADGE_CHECKER_ABI } from '@/lib/extension-contracts'

const ZERO = '0x0000000000000000000000000000000000000000'

export function usePerks() {
  const { address } = useAccount()
  const perksEnabled = EXTENSION_CONTRACTS.perksRegistry !== ZERO
  const badgeEnabled = EXTENSION_CONTRACTS.badgeChecker !== ZERO

  const { data: allPerks, isLoading: isLoadingPerks } = useReadContract({
    address: EXTENSION_CONTRACTS.perksRegistry,
    abi: PERKS_ABI,
    functionName: 'getAllActivePerks',
    query: { enabled: perksEnabled },
  })

  const { data: eligiblePerks } = useReadContract({
    address: EXTENSION_CONTRACTS.perksRegistry,
    abi: PERKS_ABI,
    functionName: 'getEligiblePerksForUser',
    args: address ? [address] : undefined,
    query: { enabled: !!address && perksEnabled },
  })

  const { data: badgeBalances, isLoading: isLoadingBadges } = useReadContract({
    address: EXTENSION_CONTRACTS.badgeChecker,
    abi: BADGE_CHECKER_ABI,
    functionName: 'getUserBadgeBalances',
    args: address ? [address] : undefined,
    query: { enabled: !!address && badgeEnabled },
  })

  const { data: highestTier } = useReadContract({
    address: EXTENSION_CONTRACTS.badgeChecker,
    abi: BADGE_CHECKER_ABI,
    functionName: 'getUserHighestTier',
    args: address ? [address] : undefined,
    query: { enabled: !!address && badgeEnabled },
  })

  const { data: perkCount } = useReadContract({
    address: EXTENSION_CONTRACTS.perksRegistry,
    abi: PERKS_ABI,
    functionName: 'perkCount',
    query: { enabled: perksEnabled },
  })

  const { writeContract, data: txHash, isPending: isWriting } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const redeemPerk = (perkId: bigint, additionalData: string = '') => {
    writeContract({
      address: EXTENSION_CONTRACTS.perksRegistry,
      abi: PERKS_ABI,
      functionName: 'redeemPerk',
      args: [perkId, additionalData],
    })
  }

  const createPerk = (args: {
    name: string
    description: string
    perkType: string
    requiredBadgeId: bigint
    requiredBadgeContract: `0x${string}`
    minimumBadgeAmount: bigint
    metadata: string
    usageLimit: bigint
    expirationTimestamp: bigint
    redemptionCode: string
  }) => {
    writeContract({
      address: EXTENSION_CONTRACTS.perksRegistry,
      abi: PERKS_ABI,
      functionName: 'createPerk',
      args: [
        args.name, args.description, args.perkType,
        args.requiredBadgeId, args.requiredBadgeContract, args.minimumBadgeAmount,
        args.metadata, args.usageLimit, args.expirationTimestamp, args.redemptionCode,
      ],
    })
  }

  return {
    allPerks: allPerks as any[] | undefined,
    eligiblePerks: eligiblePerks as any[] | undefined,
    badgeBalances: badgeBalances as any[] | undefined,
    highestTier: highestTier ? {
      tier: Number((highestTier as any)[0] || 0),
      name: (highestTier as any)[1] as string,
    } : undefined,
    perkCount: perkCount ? Number(perkCount) : 0,
    isLoading: isLoadingPerks || isLoadingBadges,
    isWriting,
    isConfirming,
    isSuccess,
    txHash,
    contractDeployed: perksEnabled,
    redeemPerk,
    createPerk,
  }
}
