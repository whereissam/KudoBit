import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="sm:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-11 w-11 touch-manipulation"
      >
        {isOpen ? (
          <X className="h-4 w-4" />
        ) : (
          <Menu className="h-4 w-4" />
        )}
        <span className="sr-only">Toggle menu</span>
      </Button>

      {isOpen && (
        <div className="absolute top-14 left-0 right-0 bg-background border-b shadow-xl z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-foreground hover:text-primary [&.active]:text-primary [&.active]:font-medium transition-colors py-3 text-base border-b border-border/50 flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                🛍️ <span>Shop</span>
              </Link>
              <Link 
                to="/discover" 
                className="text-foreground hover:text-primary [&.active]:text-primary [&.active]:font-medium transition-colors py-3 text-base border-b border-border/50 flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                🔍 <span>Discover</span>
              </Link>
              <Link 
                to="/creator" 
                className="text-foreground hover:text-primary [&.active]:text-primary [&.active]:font-medium transition-colors py-3 text-base border-b border-border/50 flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                🎨 <span>Creator</span>
              </Link>
              <Link 
                to="/account" 
                className="text-foreground hover:text-primary [&.active]:text-primary [&.active]:font-medium transition-colors py-3 text-base border-b border-border/50 flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                👤 <span>Account</span>
              </Link>
              <Link 
                to="/loyalty" 
                className="text-foreground hover:text-primary [&.active]:text-primary [&.active]:font-medium transition-colors py-3 text-base border-b border-border/50 flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                🏆 <span>Loyalty</span>
              </Link>
              <Link 
                to="/admin" 
                className="text-foreground hover:text-primary [&.active]:text-primary [&.active]:font-medium transition-colors py-3 text-base flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                ⚙️ <span>Admin</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}