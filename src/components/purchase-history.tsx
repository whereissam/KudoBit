import { useAccount, useReadContract } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CONTRACTS, SHOPFRONT_ABI } from '@/lib/contracts'
import { formatUnits } from 'viem'
import { ShoppingBag } from 'lucide-react'

export function PurchaseHistory() {
  const { address, isConnected } = useAccount()

  // Get user's purchase history
  const { data: purchaseIds, isLoading } = useReadContract({
    address: CONTRACTS.shopfront,
    abi: SHOPFRONT_ABI,
    functionName: 'getUserPurchases',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  // Get all items to match purchase IDs with item details
  const { data: allItems } = useReadContract({
    address: CONTRACTS.shopfront,
    abi: SHOPFRONT_ABI,
    functionName: 'getAllItems',
  })

  if (!isConnected) {
    return (
      <Card>
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
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-morph-green-500"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading purchases...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const purchasedItems = purchaseIds && allItems 
    ? purchaseIds.map(id => allItems.find(item => item.id === id)).filter((item): item is NonNullable<typeof item> => Boolean(item))
    : []

  return (
    <Card>
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
            {purchasedItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {item.id.toString() === '1' && '🖼️'}
                    {item.id.toString() === '2' && '🎫'}
                    {item.id.toString() === '3' && '📦'}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-morph-green-600">
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