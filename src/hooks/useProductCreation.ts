import { useState, useMemo, useCallback } from 'react'
import { useWriteContract } from 'wagmi'
import { parseUnits } from 'viem'
import { CONTRACTS, PRODUCT_NFT_ABI } from '@/lib/contracts'
import { contentService } from '@/services/content-service'
import toast from 'react-hot-toast'

interface ProductData {
  name: string
  description: string
  shortDescription: string
  category: string
  tags: string[]
  price: string
  images: File[]
  previewFiles: File[]
  productFiles: File[]
}

interface CreationState {
  step: 'idle' | 'uploading' | 'minting' | 'success' | 'error'
  progress: number
  message: string
  txHash?: string
  productId?: number
}

export function useProductCreation() {
  const [state, setState] = useState<CreationState>({
    step: 'idle',
    progress: 0,
    message: ''
  })

  const { writeContract } = useWriteContract()
  
  const createProduct = useCallback(async (productData: ProductData) => {
    try {
      setState({
        step: 'uploading',
        progress: 10,
        message: 'Uploading files to IPFS...'
      })

      // Upload all content to IPFS
      const metadataHash = await contentService.createProductMetadata(
        productData.name,
        productData.description,
        productData.images,
        productData.productFiles,
        productData.previewFiles
      )

      setState({
        step: 'uploading',
        progress: 60,
        message: 'Files uploaded successfully. Preparing smart contract...'
      })

      // Prepare contract parameters
      const priceInWei = parseUnits(productData.price, 6) // USDC has 6 decimals
      
      setState({
        step: 'minting',
        progress: 80,
        message: 'Creating product on blockchain...'
      })

      // Call smart contract to create product
      writeContract({
        address: CONTRACTS.productNFT,
        abi: PRODUCT_NFT_ABI,
        functionName: 'mintProduct',
        args: [
          productData.name,
          productData.shortDescription,
          `ipfs://${metadataHash}`,
          priceInWei,
          metadataHash
        ],
      })

    } catch (error) {
      console.error('Product creation error:', error)
      setState({
        step: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Failed to create product'
      })
      toast.error('Failed to create product')
    }
  }, [writeContract])

  const uploadFiles = useCallback(async (files: File[], type: 'images' | 'preview' | 'product') => {
    try {
      const results = await contentService.uploadFiles(files)
      return results
    } catch (error) {
      console.error(`Error uploading ${type} files:`, error)
      throw new Error(`Failed to upload ${type} files`)
    }
  }, [])

  const validateProduct = useCallback((productData: ProductData): string[] => {
    const errors: string[] = []

    if (!productData.name.trim()) {
      errors.push('Product name is required')
    }

    if (!productData.description.trim()) {
      errors.push('Product description is required')
    }

    if (!productData.category) {
      errors.push('Product category is required')
    }

    if (!productData.price || parseFloat(productData.price) <= 0) {
      errors.push('Valid price is required')
    }

    if (productData.images.length === 0) {
      errors.push('At least one product image is required')
    }

    if (productData.productFiles.length === 0) {
      errors.push('At least one product file is required')
    }

    // File size validation (max 100MB total)
    const totalSize = [
      ...productData.images,
      ...productData.productFiles,
      ...productData.previewFiles
    ].reduce((sum, file) => sum + file.size, 0)

    if (totalSize > 100 * 1024 * 1024) {
      errors.push('Total file size cannot exceed 100MB')
    }

    return errors
  }, [])

  const resetState = useCallback(() => {
    setState({
      step: 'idle',
      progress: 0,
      message: ''
    })
  }, [])

  return useMemo(() => ({
    state,
    createProduct,
    uploadFiles,
    validateProduct,
    resetState
  }), [state, createProduct, uploadFiles, validateProduct, resetState])
}