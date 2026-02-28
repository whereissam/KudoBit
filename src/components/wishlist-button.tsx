import { Heart, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWishlist } from '@/hooks/use-wishlist'
import { useAccount } from 'wagmi'
import { cn } from '@/lib/utils'

interface WishlistButtonProps {
  productId: number
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  showText?: boolean
}

export function WishlistButton({ 
  productId, 
  variant = 'outline', 
  size = 'sm',
  className,
  showText = false
}: WishlistButtonProps) {
  const { isConnected } = useAccount()
  const { isInWishlist, toggleWishlist, isLoading } = useWishlist()
  
  const inWishlist = isInWishlist(productId)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isConnected) {
      // Could trigger a connect wallet modal here
      return
    }

    await toggleWishlist(productId)
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={!isConnected || isLoading}
      className={cn(
        "transition-colors",
        inWishlist && variant === 'outline' && "border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-destructive",
        inWishlist && variant === 'default' && "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart 
          className={cn(
            "h-4 w-4",
            inWishlist && "fill-current"
          )} 
        />
      )}
      {showText && (
        <span className="ml-2">
          {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
        </span>
      )}
    </Button>
  )
}