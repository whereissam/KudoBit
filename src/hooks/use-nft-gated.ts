import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { EXTENSION_CONTRACTS, NFT_GATED_ABI } from '@/lib/extension-contracts'

const ZERO = '0x0000000000000000000000000000000000000000'

export function useNFTGatedContent() {
  const { address } = useAccount()
  const enabled = EXTENSION_CONTRACTS.nftGatedContent !== ZERO

  const { data: contentCount } = useReadContract({
    address: EXTENSION_CONTRACTS.nftGatedContent,
    abi: NFT_GATED_ABI,
    functionName: 'contentCount',
    query: { enabled },
  })

  const { data: accessibleContent, isLoading } = useReadContract({
    address: EXTENSION_CONTRACTS.nftGatedContent,
    abi: NFT_GATED_ABI,
    functionName: 'getUserAccessibleContent',
    args: address ? [address] : undefined,
    query: { enabled: !!address && enabled },
  })

  const { writeContract, data: txHash, isPending: isWriting } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const accessContent = (contentId: bigint) => {
    writeContract({
      address: EXTENSION_CONTRACTS.nftGatedContent,
      abi: NFT_GATED_ABI,
      functionName: 'accessContent',
      args: [contentId],
    })
  }

  const createLoyaltyGated = (name: string, description: string, ipfsHash: string, requiredBadge: bigint, minBalance: bigint) => {
    writeContract({
      address: EXTENSION_CONTRACTS.nftGatedContent,
      abi: NFT_GATED_ABI,
      functionName: 'createLoyaltyGatedContent',
      args: [name, description, ipfsHash, requiredBadge, minBalance],
    })
  }

  const createSubscriptionGated = (name: string, description: string, ipfsHash: string, requiredTier: bigint) => {
    writeContract({
      address: EXTENSION_CONTRACTS.nftGatedContent,
      abi: NFT_GATED_ABI,
      functionName: 'createSubscriptionGatedContent',
      args: [name, description, ipfsHash, requiredTier],
    })
  }

  const parsedAccessible = accessibleContent ? {
    contentIds: (accessibleContent as any)[0] as bigint[],
    names: (accessibleContent as any)[1] as string[],
    accessStatus: (accessibleContent as any)[2] as boolean[],
  } : undefined

  return {
    contentCount: contentCount ? Number(contentCount) : 0,
    accessibleContent: parsedAccessible,
    isLoading,
    isWriting,
    isConfirming,
    isSuccess,
    txHash,
    contractDeployed: enabled,
    accessContent,
    createLoyaltyGated,
    createSubscriptionGated,
  }
}

export function useContentAccess(contentId: bigint | undefined) {
  const { address } = useAccount()
  const enabled = EXTENSION_CONTRACTS.nftGatedContent !== ZERO

  const { data: access, isLoading } = useReadContract({
    address: EXTENSION_CONTRACTS.nftGatedContent,
    abi: NFT_GATED_ABI,
    functionName: 'checkAccess',
    args: address && contentId !== undefined ? [address, contentId] : undefined,
    query: { enabled: !!address && contentId !== undefined && enabled },
  })

  const { data: gate } = useReadContract({
    address: EXTENSION_CONTRACTS.nftGatedContent,
    abi: NFT_GATED_ABI,
    functionName: 'getContentGate',
    args: contentId !== undefined ? [contentId] : undefined,
    query: { enabled: contentId !== undefined && enabled },
  })

  return {
    hasAccess: access ? (access as any)[0] as boolean : false,
    reason: access ? (access as any)[1] as string : '',
    gate: gate ? {
      name: (gate as any)[0] as string,
      description: (gate as any)[1] as string,
      accessLevel: Number((gate as any)[2]),
      isActive: (gate as any)[3] as boolean,
    } : undefined,
    isLoading,
  }
}
