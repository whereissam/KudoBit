import { useState, useMemo, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { Menu, X, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'

interface MobileNavProps {
  hasAdminAccess?: boolean
}

export function MobileNav({ hasAdminAccess = false }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { theme } = useTheme()
  const isDark = useMemo(() => 
    theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches),
    [theme]
  )

  const handleToggle = useCallback(() => setIsOpen(!isOpen), [isOpen])
  const handleClose = useCallback(() => setIsOpen(false), [])

  return (
    <div className="sm:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        className="h-9 w-9"
      >
        {isOpen ? (
          <X className="h-4 w-4" />
        ) : (
          <Menu className="h-4 w-4" />
        )}
        <span className="sr-only">Toggle menu</span>
      </Button>

      {isOpen && (
        <div className="fixed top-14 left-0 right-0 shadow-xl z-50 bg-background border-border border max-h-[80vh] overflow-y-auto font-sans tracking-normal">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="hover:text-primary [&.active]:text-primary [&.active]:font-medium transition-colors py-3 px-2 text-base rounded-md text-foreground hover:bg-muted/30"
                onClick={handleClose}
              >
                🛍️ Shop
              </Link>
              <Link 
                to={"/creator/dashboard" as any} 
                className="hover:text-primary [&.active]:text-primary [&.active]:font-medium transition-colors py-3 px-2 text-base rounded-md text-foreground hover:bg-muted/30"
                onClick={handleClose}
              >
                🎨 Creator Hub
              </Link>
              <Link 
                to={"/purchases" as any} 
                className="hover:text-primary [&.active]:text-primary [&.active]:font-medium transition-colors py-3 px-2 text-base rounded-md text-foreground hover:bg-muted/30"
                onClick={handleClose}
              >
                📦 My Purchases
              </Link>
              <Link 
                to={"/loyalty" as any} 
                className="hover:text-primary [&.active]:text-primary [&.active]:font-medium transition-colors py-3 px-2 text-base rounded-md text-foreground hover:bg-muted/30"
                onClick={handleClose}
              >
                🏆 My Loyalty
              </Link>
              <Link 
                to={"/marketplace/secondary" as any} 
                className="hover:text-primary [&.active]:text-primary [&.active]:font-medium transition-colors py-3 px-2 text-base rounded-md text-foreground hover:bg-muted/30"
                onClick={handleClose}
              >
                🔄 Secondary Market
              </Link>
              <Link 
                to={"/perks/discover" as any} 
                className="hover:text-primary [&.active]:text-primary [&.active]:font-medium transition-colors py-3 px-2 text-base rounded-md text-foreground hover:bg-muted/30"
                onClick={handleClose}
              >
                🎁 Perks
              </Link>
              {hasAdminAccess && (
                <Link 
                  to={"/admin" as any} 
                  className="hover:text-primary [&.active]:text-primary [&.active]:font-medium transition-colors py-3 px-2 text-base rounded-md text-foreground hover:bg-muted/30"
                  onClick={handleClose}
                >
                  ⚙️ Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}