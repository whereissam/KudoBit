import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { EXTENSION_CONTRACTS, COLLABORATIVE_ABI } from '@/lib/extension-contracts'

const ZERO = '0x0000000000000000000000000000000000000000'

export function useCollaborativeProducts() {
  const { address } = useAccount()
  const enabled = EXTENSION_CONTRACTS.collaborativeProducts !== ZERO

  const { data: allProducts, isLoading: isLoadingProducts } = useReadContract({
    address: EXTENSION_CONTRACTS.collaborativeProducts,
    abi: COLLABORATIVE_ABI,
    functionName: 'getAllCollaborativeProducts',
    query: { enabled },
  })

  const { data: creatorProductIds } = useReadContract({
    address: EXTENSION_CONTRACTS.collaborativeProducts,
    abi: COLLABORATIVE_ABI,
    functionName: 'getCreatorProducts',
    args: address ? [address] : undefined,
    query: { enabled: !!address && enabled },
  })

  const { data: earnings } = useReadContract({
    address: EXTENSION_CONTRACTS.collaborativeProducts,
    abi: COLLABORATIVE_ABI,
    functionName: 'getCollaboratorEarnings',
    args: address ? [address] : undefined,
    query: { enabled: !!address && enabled },
  })

  const { data: productCount } = useReadContract({
    address: EXTENSION_CONTRACTS.collaborativeProducts,
    abi: COLLABORATIVE_ABI,
    functionName: 'productCount',
    query: { enabled },
  })

  const { writeContract, data: txHash, isPending: isWriting } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const createProduct = (args: {
    name: string
    description: string
    ipfsContentHash: string
    priceInUSDC: bigint
    loyaltyBadgeId: bigint
    collaboratorAddresses: `0x${string}`[]
    royaltyPercentages: bigint[]
    roles: string[]
  }) => {
    writeContract({
      address: EXTENSION_CONTRACTS.collaborativeProducts,
      abi: COLLABORATIVE_ABI,
      functionName: 'createCollaborativeProduct',
      args: [
        args.name, args.description, args.ipfsContentHash,
        args.priceInUSDC, args.loyaltyBadgeId,
        args.collaboratorAddresses, args.royaltyPercentages, args.roles,
      ],
    })
  }

  const buyProduct = (productId: bigint) => {
    writeContract({
      address: EXTENSION_CONTRACTS.collaborativeProducts,
      abi: COLLABORATIVE_ABI,
      functionName: 'buyCollaborativeProduct',
      args: [productId],
    })
  }

  return {
    allProducts: allProducts as any[] | undefined,
    creatorProductIds: creatorProductIds as bigint[] | undefined,
    earnings: earnings as bigint | undefined,
    productCount: productCount ? Number(productCount) : 0,
    isLoading: isLoadingProducts,
    isWriting,
    isConfirming,
    isSuccess,
    txHash,
    contractDeployed: enabled,
    createProduct,
    buyProduct,
  }
}

export function useCollaborativeProduct(productId: bigint | undefined) {
  const enabled = EXTENSION_CONTRACTS.collaborativeProducts !== ZERO

  const { data: product, isLoading: isLoadingProduct } = useReadContract({
    address: EXTENSION_CONTRACTS.collaborativeProducts,
    abi: COLLABORATIVE_ABI,
    functionName: 'getCollaborativeProduct',
    args: productId !== undefined ? [productId] : undefined,
    query: { enabled: productId !== undefined && enabled },
  })

  const { data: collaborators, isLoading: isLoadingCollaborators } = useReadContract({
    address: EXTENSION_CONTRACTS.collaborativeProducts,
    abi: COLLABORATIVE_ABI,
    functionName: 'getProductCollaborators',
    args: productId !== undefined ? [productId] : undefined,
    query: { enabled: productId !== undefined && enabled },
  })

  const parsed = product ? {
    id: Number((product as any).id || (product as any)[0]),
    name: (product as any).name || (product as any)[1],
    description: (product as any).description || (product as any)[2],
    ipfsContentHash: (product as any).ipfsContentHash || (product as any)[3],
    priceInUSDC: (product as any).priceInUSDC || (product as any)[4],
    isActive: (product as any).isActive ?? (product as any)[5],
    primaryCreator: (product as any).primaryCreator || (product as any)[7],
    totalSales: Number((product as any).totalSales || (product as any)[9] || 0),
    totalRevenue: (product as any).totalRevenue || (product as any)[10],
  } : undefined

  return {
    product: parsed,
    collaborators: collaborators as any[] | undefined,
    isLoading: isLoadingProduct || isLoadingCollaborators,
  }
}
