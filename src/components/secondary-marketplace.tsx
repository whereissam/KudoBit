import React, { useState, useEffect, useMemo } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { Button } from '@/components/ui/button'
import { getChainById } from '../lib/wagmi'
import { CONTRACTS, getContracts, SECONDARY_MARKETPLACE_ABI, MOCK_USDC_ABI } from '../lib/contracts'

interface Product {
  id: bigint
  name: string
  description: string
  ipfsContentHash: string
  priceInUSDC: bigint
  isActive: boolean
  loyaltyBadgeId: bigint
  creator: string
  creatorRoyaltyPercentage: bigint
}

interface ResaleListing {
  id: bigint
  productId: bigint
  seller: string
  resalePrice: bigint
  isActive: boolean
  listedAt: bigint
}

export function SecondaryMarketplace() {
  const { address } = useAccount()
  const chainId = useChainId()
  const [activeTab, setActiveTab] = useState<'browse' | 'resale' | 'owned'>('browse')
  const [resalePrice, setResalePrice] = useState('')
  const [selectedProductForResale, setSelectedProductForResale] = useState<bigint | null>(null)
  
  // Get contracts for current chain
  const currentContracts = useMemo(() => getContracts(chainId), [chainId])

  // Contract interactions
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })

  // Read contract data with explicit typing
  const { data: products } = useReadContract({
    address: currentContracts.secondaryMarketplace,
    abi: SECONDARY_MARKETPLACE_ABI,
    functionName: 'getAllProducts',
    chainId,
    account: address,
  }) as { data: Product[] | undefined }

  const { data: resaleListings } = useReadContract({
    address: currentContracts.secondaryMarketplace,
    abi: SECONDARY_MARKETPLACE_ABI,
    functionName: 'getAllActiveResaleListings',
    chainId,
    account: address,
  }) as { data: ResaleListing[] | undefined }

  const { data: ownedProducts } = useReadContract({
    address: currentContracts.secondaryMarketplace,
    abi: SECONDARY_MARKETPLACE_ABI,
    functionName: 'getUserOwnedProducts',
    args: address ? [address] : undefined,
    chainId,
    account: address,
  }) as { data: bigint[] | undefined }

  const { data: userResaleListings } = useReadContract({
    address: currentContracts.secondaryMarketplace,
    abi: SECONDARY_MARKETPLACE_ABI,
    functionName: 'getUserResaleListings',
    args: address ? [address] : undefined,
    chainId,
    account: address,
  }) as { data: bigint[] | undefined }

  const { data: usdcBalance } = useReadContract({
    address: currentContracts.mockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId,
    account: address,
  })

  // Primary purchase
  const handleBuyItem = async (productId: bigint, price: bigint) => {
    if (!address) return

    try {
      // First approve USDC
      writeContract({
        address: currentContracts.mockUSDC,
        abi: MOCK_USDC_ABI,
        functionName: 'approve',
        args: [currentContracts.secondaryMarketplace, price],
        chain: getChainById(chainId),
        account: address,
      })

      // Wait for approval, then purchase
      setTimeout(() => {
        writeContract({
          address: currentContracts.secondaryMarketplace,
          abi: SECONDARY_MARKETPLACE_ABI,
          functionName: 'buyItem',
          args: [productId],
          chain: getChainById(chainId),
          account: address,
        })
      }, 2000)
    } catch (error) {
      console.error('Purchase failed:', error)
    }
  }

  // List for resale
  const handleListForResale = async (productId: bigint, price: string) => {
    if (!address || !price) return

    try {
      const priceInWei = parseUnits(price, 6) // USDC has 6 decimals
      writeContract({
        address: currentContracts.secondaryMarketplace,
        abi: SECONDARY_MARKETPLACE_ABI,
        functionName: 'listForResale',
        args: [productId, priceInWei],
        chain: getChainById(chainId),
        account: address,
      })
    } catch (error) {
      console.error('Listing failed:', error)
    }
  }

  // Buy from resale
  const handleBuyResaleItem = async (resaleId: bigint, price: bigint) => {
    if (!address) return

    try {
      // First approve USDC
      writeContract({
        address: currentContracts.mockUSDC,
        abi: MOCK_USDC_ABI,
        functionName: 'approve',
        args: [currentContracts.secondaryMarketplace, price],
        chain: getChainById(chainId),
        account: address,
      })

      // Wait for approval, then purchase
      setTimeout(() => {
        writeContract({
          address: currentContracts.secondaryMarketplace,
          abi: SECONDARY_MARKETPLACE_ABI,
          functionName: 'buyResaleItem',
          args: [resaleId],
          chain: getChainById(chainId),
          account: address,
        })
      }, 2000)
    } catch (error) {
      console.error('Resale purchase failed:', error)
    }
  }

  // Cancel listing
  const handleCancelListing = async (resaleId: bigint) => {
    try {
      writeContract({
        address: currentContracts.secondaryMarketplace,
        abi: SECONDARY_MARKETPLACE_ABI,
        functionName: 'cancelResaleListing',
        args: [resaleId],
        chain: getChainById(chainId),
        account: address,
      })
    } catch (error) {
      console.error('Cancel listing failed:', error)
    }
  }

  // Get USDC for testing
  const handleGetUSDC = async () => {
    if (!address) return
    
    try {
      writeContract({
        address: currentContracts.mockUSDC,
        abi: MOCK_USDC_ABI,
        functionName: 'faucet',
        args: [parseUnits('100', 6)], // Get 100 USDC
        chain: getChainById(chainId),
        account: address,
      })
    } catch (error) {
      console.error('USDC faucet failed:', error)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Secondary Marketplace</h1>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm text-gray-600">
            USDC Balance: {usdcBalance ? formatUnits(usdcBalance, 6) : '0'} USDC
          </span>
          <Button onClick={handleGetUSDC} variant="outline" size="sm">
            Get Test USDC
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'browse' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('browse')}
        >
          Browse Products
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'resale' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('resale')}
        >
          Resale Market
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'owned' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('owned')}
        >
          My Items
        </button>
      </div>

      {/* Browse Products Tab */}
      {activeTab === 'browse' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Primary Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products && products.map((product: Product) => (
              <div key={product.id.toString()} className="border rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-3">{product.description}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-bold">
                    {formatUnits(product.priceInUSDC, 6)} USDC
                  </span>
                  <span className="text-sm text-gray-500">
                    Royalty: {formatUnits(product.creatorRoyaltyPercentage, 2)}%
                  </span>
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  Creator: {product.creator.slice(0, 8)}...
                </div>
                {product.isActive && (
                  <Button
                    onClick={() => handleBuyItem(product.id, product.priceInUSDC)}
                    disabled={isPending || isConfirming}
                    className="w-full"
                  >
                    {isPending || isConfirming ? 'Processing...' : 'Buy Now'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resale Market Tab */}
      {activeTab === 'resale' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Resale Listings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resaleListings && resaleListings.map((listing: ResaleListing) => {
              const product = products && products.find((p: Product) => p.id === listing.productId)
              return (
                <div key={listing.id.toString()} className="border rounded-lg p-4 shadow-sm bg-yellow-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded">
                      RESALE
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{product?.name || 'Unknown Product'}</h3>
                  <p className="text-gray-600 mb-3">{product?.description}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-bold text-green-600">
                      {formatUnits(listing.resalePrice, 6)} USDC
                    </span>
                    {product && (
                      <span className="text-sm text-gray-500">
                        Original: {formatUnits(product.priceInUSDC, 6)} USDC
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    Seller: {listing.seller.slice(0, 8)}...
                  </div>
                  {listing.seller !== address && (
                    <Button
                      onClick={() => handleBuyResaleItem(listing.id, listing.resalePrice)}
                      disabled={isPending || isConfirming}
                      className="w-full"
                    >
                      {isPending || isConfirming ? 'Processing...' : 'Buy Resale'}
                    </Button>
                  )}
                  {listing.seller === address && (
                    <Button
                      onClick={() => handleCancelListing(listing.id)}
                      variant="outline"
                      className="w-full"
                    >
                      Cancel Listing
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* My Items Tab */}
      {activeTab === 'owned' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">My Owned Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownedProducts && ownedProducts.map((productId: bigint) => {
              const product = products && products.find((p: Product) => p.id === productId)
              const isListed = userResaleListings && userResaleListings.includes(productId)
              
              return (
                <div key={productId.toString()} className="border rounded-lg p-4 shadow-sm bg-green-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded">
                      OWNED
                    </span>
                    {isListed && (
                      <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded">
                        LISTED
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{product?.name || 'Unknown Product'}</h3>
                  <p className="text-gray-600 mb-3">{product?.description}</p>
                  <div className="text-sm text-gray-500 mb-3">
                    Original Price: {product ? formatUnits(product.priceInUSDC, 6) : '0'} USDC
                  </div>
                  
                  {!isListed && (
                    <div className="space-y-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Resale price in USDC"
                        value={selectedProductForResale === productId ? resalePrice : ''}
                        onChange={(e) => {
                          setSelectedProductForResale(productId)
                          setResalePrice(e.target.value)
                        }}
                        className="w-full px-3 py-2 border rounded text-sm"
                      />
                      <Button
                        onClick={() => handleListForResale(productId, resalePrice)}
                        disabled={!resalePrice || isPending || isConfirming}
                        className="w-full"
                        size="sm"
                      >
                        {isPending || isConfirming ? 'Listing...' : 'List for Resale'}
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {(!ownedProducts || (Array.isArray(ownedProducts) && ownedProducts.length === 0)) && (
            <div className="text-center py-12 text-gray-500">
              <p>You don't own any items yet.</p>
              <p className="mt-2">Purchase some items from the Browse Products tab to see them here.</p>
            </div>
          )}
        </div>
      )}

      {/* Transaction Status */}
      {(isPending || isConfirming) && (
        <div className="fixed bottom-4 right-4 bg-blue-100 border-l-4 border-blue-500 p-4 rounded shadow-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm font-medium">
              {isPending ? 'Confirming transaction...' : 'Transaction processing...'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}