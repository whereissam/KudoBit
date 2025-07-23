import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { ThemeToggle } from '@/components/theme-toggle'
import { MobileNav } from '@/components/mobile-nav'
import { WalletConnect } from '@/components/wallet-connect'

export const Route = createRootRoute({
  component: () => (
    <>
      <nav className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-8">
              <Link 
                to="/" 
                className="text-base sm:text-lg font-semibold text-foreground hover:text-primary transition-colors"
              >
                <span className="hidden sm:inline">Morph Commerce</span>
                <span className="sm:hidden">Morph</span>
              </Link>
              <div className="hidden sm:flex space-x-4 lg:space-x-6">
                <Link 
                  to="/" 
                  className="text-sm lg:text-base text-muted-foreground hover:text-foreground [&.active]:text-primary [&.active]:font-medium transition-colors"
                >
                  Shop
                </Link>
                <Link 
                  to={"/loyalty" as any} 
                  className="text-sm lg:text-base text-muted-foreground hover:text-foreground [&.active]:text-primary [&.active]:font-medium transition-colors"
                >
                  <span className="hidden lg:inline">My Loyalty</span>
                  <span className="lg:hidden">Loyalty</span>
                </Link>
                <Link 
                  to={"/admin" as any} 
                  className="text-sm lg:text-base text-muted-foreground hover:text-foreground [&.active]:text-primary [&.active]:font-medium transition-colors"
                >
                  Admin
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="hidden xs:block">
                <WalletConnect />
              </div>
              <ThemeToggle />
              <MobileNav />
            </div>
          </div>
          {/* Mobile wallet connection */}
          <div className="xs:hidden pb-3 border-t border-border mt-2 pt-3">
            <WalletConnect />
          </div>
        </div>
      </nav>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})