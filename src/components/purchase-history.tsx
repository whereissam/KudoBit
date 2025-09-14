import { useAccount, useReadContract, useChainId } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CONTRACTS, getContracts, CREATOR_STORE_ABI } from '@/lib/contracts'
import { formatUnits } from 'viem'
import { ShoppingBag } from 'lucide-react'
import { useMemo } from 'react'

export function PurchaseHistory() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  
  // Get contracts for current chain
  const currentContracts = useMemo(() => getContracts(chainId), [chainId])

  // Get user's purchase history
  const { data: purchaseIds, isLoading } = useReadContract({
    address: currentContracts.creatorStore,
    abi: CREATOR_STORE_ABI,
    functionName: 'getUserPurchases',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  // Get all items to match purchase IDs with item details
  const { data: allProducts } = useReadContract({
    address: currentContracts.creatorStore,
    abi: CREATOR_STORE_ABI,
    functionName: 'getAllProducts',
  })

  if (!isConnected) {
    return (
      <Card className="font-sans tracking-normal">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Purchase History
          </CardTitle>
          <CardDescription>Connect your wallet to view your purchase history</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Purchase History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading purchases...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const purchasedItems = purchaseIds && allProducts 
    ? purchaseIds.map((id: any) => allProducts.find((product: any) => product.id === id)).filter((product: any): product is NonNullable<typeof product> => Boolean(product))
    : []

  return (
    <Card className="font-sans tracking-normal">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Purchase History
        </CardTitle>
        <CardDescription>
          Your digital purchases and transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {purchasedItems.length === 0 ? (
          <div className="text-center py-6">
            <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No purchases yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Visit the shop to buy your first digital item!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {purchasedItems.map((item: any, index: number) => (
              <div key={`${item.id}-${index}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/30 rounded-lg gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="text-2xl shrink-0">
                    {item.id.toString() === '1' && '🖼️'}
                    {item.id.toString() === '2' && '🎫'}
                    {item.id.toString() === '3' && '📦'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start sm:text-right gap-2">
                  <p className="text-sm font-semibold text-primary">
                    {formatUnits(item.priceInUSDC, 6)} USDC
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    Purchased
                  </Badge>
                </div>
              </div>
            ))}
            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground">
                Total items purchased: {purchasedItems.length}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}