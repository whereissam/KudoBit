import { useMemo, useCallback } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { CONTRACTS, PRODUCT_NFT_ABI, CREATOR_REGISTRY_ABI } from '@/lib/contracts'
import { ipfsService } from '@/services/ipfs-service'
import { contractService, ProductMetadata } from '@/services/contract-service'

export interface ProductFormData {
  name: string
  description: string
  price: string
  category: string
  files: FileList
  coverImage: File | null
}

export function useCreator() {
  const { address } = useAccount()

  // Read creator registration status from chain
  const { data: isRegistered, isLoading: isCheckingRegistration } = useReadContract({
    address: CONTRACTS.creatorRegistry,
    abi: CREATOR_REGISTRY_ABI,
    functionName: 'isRegistered',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  // Read creator profile from chain
  const { data: creatorData, isLoading: isLoadingProfile } = useReadContract({
    address: CONTRACTS.creatorRegistry,
    abi: CREATOR_REGISTRY_ABI,
    functionName: 'creators',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!isRegistered },
  })

  // Read creator's product IDs from chain
  const { data: productIds, isLoading: isLoadingProducts } = useReadContract({
    address: CONTRACTS.productNFT,
    abi: PRODUCT_NFT_ABI,
    functionName: 'getCreatorProducts',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!isRegistered },
  })

  const isLoading = isCheckingRegistration || isLoadingProfile || isLoadingProducts

  // Build profile from on-chain data (memoized to avoid new ref every render)
  const profile = useMemo(() => creatorData ? {
    address,
    name: (creatorData as any)[0] || '',
    bio: (creatorData as any)[1] || '',
    avatar: (creatorData as any)[2] || '',
    verified: (creatorData as any)[3] || false,
    productCount: Number((creatorData as any)[4] || 0),
    totalSales: Number((creatorData as any)[5] || 0),
  } : null, [creatorData, address])

  // Prepare product creation data (upload to IPFS, return config for wagmi write)
  const prepareCreateProduct = useCallback(async (formData: ProductFormData) => {
    if (!address) throw new Error('Wallet not connected')

    let imageHash = ''
    if (formData.coverImage) {
      imageHash = await ipfsService.uploadFile(formData.coverImage)
    }

    const contentHashes: string[] = []
    for (let i = 0; i < formData.files.length; i++) {
      const hash = await ipfsService.uploadFile(formData.files[i])
      contentHashes.push(hash)
    }

    const metadata: ProductMetadata = {
      name: formData.name,
      description: formData.description,
      image: imageHash ? ipfsService.getFileURL(imageHash) : '',
      price: formData.price,
      category: formData.category,
    }

    await ipfsService.uploadJSON(metadata)

    return contractService.getCreateProductConfig(metadata, contentHashes[0] || '')
  }, [address])

  return useMemo(() => ({
    isRegistered: !!isRegistered,
    isLoading,
    profile,
    productIds: (productIds as bigint[]) || [],
    prepareCreateProduct,
    isCreator: !!isRegistered,
  }), [isRegistered, isLoading, profile, productIds, prepareCreateProduct])
}
