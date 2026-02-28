import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { EXTENSION_CONTRACTS, AFFILIATE_ABI } from '@/lib/extension-contracts'

const ZERO = '0x0000000000000000000000000000000000000000'

export function useAffiliate() {
  const { address } = useAccount()
  const enabled = EXTENSION_CONTRACTS.affiliateProgram !== ZERO

  const { data: isAffiliate, isLoading: isCheckingStatus } = useReadContract({
    address: EXTENSION_CONTRACTS.affiliateProgram,
    abi: AFFILIATE_ABI,
    functionName: 'isAffiliate',
    args: address ? [address] : undefined,
    query: { enabled: !!address && enabled },
  })

  const { data: affiliateData } = useReadContract({
    address: EXTENSION_CONTRACTS.affiliateProgram,
    abi: AFFILIATE_ABI,
    functionName: 'affiliates',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!isAffiliate && enabled },
  })

  const { data: stats } = useReadContract({
    address: EXTENSION_CONTRACTS.affiliateProgram,
    abi: AFFILIATE_ABI,
    functionName: 'getAffiliateStats',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!isAffiliate && enabled },
  })

  const { data: platformStats } = useReadContract({
    address: EXTENSION_CONTRACTS.affiliateProgram,
    abi: AFFILIATE_ABI,
    functionName: 'getPlatformStats',
    query: { enabled },
  })

  const { data: topAffiliates } = useReadContract({
    address: EXTENSION_CONTRACTS.affiliateProgram,
    abi: AFFILIATE_ABI,
    functionName: 'getTopAffiliates',
    args: [BigInt(10)],
    query: { enabled },
  })

  const { writeContract, data: txHash, isPending: isWriting } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const register = (displayName: string, bio: string) => {
    writeContract({
      address: EXTENSION_CONTRACTS.affiliateProgram,
      abi: AFFILIATE_ABI,
      functionName: 'registerAffiliate',
      args: [displayName, bio],
    })
  }

  const withdrawCommissions = () => {
    writeContract({
      address: EXTENSION_CONTRACTS.affiliateProgram,
      abi: AFFILIATE_ABI,
      functionName: 'withdrawCommissions',
    })
  }

  const updateProfile = (displayName: string, bio: string) => {
    writeContract({
      address: EXTENSION_CONTRACTS.affiliateProgram,
      abi: AFFILIATE_ABI,
      functionName: 'updateAffiliateProfile',
      args: [displayName, bio],
    })
  }

  const profile = affiliateData ? {
    address: (affiliateData as any)[0] as string,
    referralCode: (affiliateData as any)[1] as `0x${string}`,
    displayName: (affiliateData as any)[2] as string,
    bio: (affiliateData as any)[3] as string,
    joinedAt: Number((affiliateData as any)[4] || 0),
    totalReferrals: Number((affiliateData as any)[5] || 0),
    totalEarnings: (affiliateData as any)[6] as bigint,
    pendingEarnings: (affiliateData as any)[7] as bigint,
    isActive: (affiliateData as any)[8] as boolean,
    isVerified: (affiliateData as any)[9] as boolean,
  } : undefined

  const parsedStats = stats ? {
    totalReferrals: Number((stats as any)[0] || 0),
    totalEarnings: (stats as any)[1] as bigint,
    pendingEarnings: (stats as any)[2] as bigint,
    currentTier: Number((stats as any)[3] || 0),
    tierName: (stats as any)[4] as string,
    creatorReferrals: Number((stats as any)[5] || 0),
    buyerReferrals: Number((stats as any)[6] || 0),
    subscriptionReferrals: Number((stats as any)[7] || 0),
    totalSalesGenerated: (stats as any)[8] as bigint,
  } : undefined

  const parsedTopAffiliates = topAffiliates ? {
    addresses: (topAffiliates as any)[0] as string[],
    displayNames: (topAffiliates as any)[1] as string[],
    totalReferrals: ((topAffiliates as any)[2] as bigint[]).map(Number),
    totalEarnings: (topAffiliates as any)[3] as bigint[],
  } : undefined

  return {
    isAffiliate: !!isAffiliate,
    profile,
    stats: parsedStats,
    platformStats: platformStats ? {
      totalAffiliates: Number((platformStats as any)[0] || 0),
      totalReferrals: Number((platformStats as any)[1] || 0),
      totalCommissionsPaid: (platformStats as any)[2] as bigint,
      activeAffiliates: Number((platformStats as any)[3] || 0),
    } : undefined,
    topAffiliates: parsedTopAffiliates,
    isLoading: isCheckingStatus,
    isWriting,
    isConfirming,
    isSuccess,
    txHash,
    contractDeployed: enabled,
    register,
    withdrawCommissions,
    updateProfile,
  }
}
