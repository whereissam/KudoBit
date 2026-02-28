import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { EXTENSION_CONTRACTS, TIPPING_ABI } from '@/lib/extension-contracts'

const ZERO = '0x0000000000000000000000000000000000000000'

export function useTipping() {
  const { address } = useAccount()
  const enabled = EXTENSION_CONTRACTS.tippingAndCrowdfunding !== ZERO

  const { data: platformStats } = useReadContract({
    address: EXTENSION_CONTRACTS.tippingAndCrowdfunding,
    abi: TIPPING_ABI,
    functionName: 'getPlatformStats',
    query: { enabled },
  })

  const { data: campaignCount } = useReadContract({
    address: EXTENSION_CONTRACTS.tippingAndCrowdfunding,
    abi: TIPPING_ABI,
    functionName: 'campaignCount',
    query: { enabled },
  })

  const { data: userContributions } = useReadContract({
    address: EXTENSION_CONTRACTS.tippingAndCrowdfunding,
    abi: TIPPING_ABI,
    functionName: 'getUserContributions',
    args: address ? [address] : undefined,
    query: { enabled: !!address && enabled },
  })

  const { writeContract, data: txHash, isPending: isWriting } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const tipCreator = (creator: `0x${string}`, amount: bigint, message: string, isAnonymous: boolean) => {
    writeContract({
      address: EXTENSION_CONTRACTS.tippingAndCrowdfunding,
      abi: TIPPING_ABI,
      functionName: 'tipCreator',
      args: [creator, amount, message, isAnonymous],
    })
  }

  const createCampaign = (args: {
    title: string
    description: string
    mediaIpfsHash: string
    goalAmount: bigint
    durationInDays: bigint
    milestones: string[]
    minimumContribution: bigint
    maxContributors: bigint
  }) => {
    writeContract({
      address: EXTENSION_CONTRACTS.tippingAndCrowdfunding,
      abi: TIPPING_ABI,
      functionName: 'createCrowdfundingCampaign',
      args: [
        args.title, args.description, args.mediaIpfsHash,
        args.goalAmount, args.durationInDays, args.milestones,
        args.minimumContribution, args.maxContributors,
      ],
    })
  }

  // Note: contract has typo "contributeToCompaign"
  const contributeToCampaign = (campaignId: bigint, amount: bigint, message: string, isAnonymous: boolean) => {
    writeContract({
      address: EXTENSION_CONTRACTS.tippingAndCrowdfunding,
      abi: TIPPING_ABI,
      functionName: 'contributeToCompaign',
      args: [campaignId, amount, message, isAnonymous],
    })
  }

  const parsedPlatformStats = platformStats ? {
    totalTips: (platformStats as any)[0] as bigint,
    totalCrowdfunding: (platformStats as any)[1] as bigint,
    activeCampaigns: Number((platformStats as any)[2] || 0),
    totalCreators: Number((platformStats as any)[3] || 0),
    verifiedCreators: Number((platformStats as any)[4] || 0),
  } : undefined

  return {
    platformStats: parsedPlatformStats,
    campaignCount: campaignCount ? Number(campaignCount) : 0,
    userContributions: userContributions as bigint[] | undefined,
    isWriting,
    isConfirming,
    isSuccess,
    txHash,
    contractDeployed: enabled,
    tipCreator,
    createCampaign,
    contributeToCampaign,
  }
}

export function useCampaign(campaignId: bigint | undefined) {
  const enabled = EXTENSION_CONTRACTS.tippingAndCrowdfunding !== ZERO

  const { data: campaign, isLoading } = useReadContract({
    address: EXTENSION_CONTRACTS.tippingAndCrowdfunding,
    abi: TIPPING_ABI,
    functionName: 'campaigns',
    args: campaignId !== undefined ? [campaignId] : undefined,
    query: { enabled: campaignId !== undefined && enabled },
  })

  const parsed = campaign ? {
    id: Number((campaign as any)[0]),
    creator: (campaign as any)[1] as string,
    title: (campaign as any)[2] as string,
    description: (campaign as any)[3] as string,
    mediaIpfsHash: (campaign as any)[4] as string,
    goalAmount: (campaign as any)[5] as bigint,
    raisedAmount: (campaign as any)[6] as bigint,
    startTime: Number((campaign as any)[7] || 0),
    endTime: Number((campaign as any)[8] || 0),
    status: Number((campaign as any)[9]),
    minimumContribution: (campaign as any)[10] as bigint,
    maxContributors: Number((campaign as any)[11] || 0),
    contributorCount: Number((campaign as any)[12] || 0),
  } : undefined

  return { campaign: parsed, isLoading }
}
