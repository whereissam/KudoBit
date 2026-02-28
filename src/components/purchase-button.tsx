import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { PurchaseFlow } from '@/lib/purchase-flow'

interface PurchaseButtonProps {
  flow: PurchaseFlow
  itemId: number
  onPurchase: () => void
  disabled?: boolean
}

export function PurchaseButton({ flow, itemId, onPurchase, disabled }: PurchaseButtonProps) {
  const isCurrentItem = flow.currentItemId === itemId
  const isProcessing = flow.state === 'processing' && isCurrentItem
  const isSuccess = flow.state === 'success' && isCurrentItem
  const hasError = flow.error && isCurrentItem

  const getContent = () => {
    if (isProcessing) {
      return (
        <span className="flex items-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin" />
          Processing
        </span>
      )
    }
    
    if (isSuccess) {
      return (
        <span className="flex items-center gap-2">
          <CheckCircle className="h-3 w-3" />
          Success!
        </span>
      )
    }
    
    if (hasError) {
      return (
        <span className="flex items-center gap-2">
          <AlertCircle className="h-3 w-3" />
          Failed
        </span>
      )
    }
    
    return 'Buy Now'
  }

  return (
    <Button
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
      onClick={onPurchase}
      disabled={disabled || isProcessing}
    >
      {getContent()}
    </Button>
  )
}