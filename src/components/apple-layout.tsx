import { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { useAccount } from 'wagmi'
import { WalletConnect } from './wallet-connect'
import { ThemeToggle } from './theme-toggle'
import { MobileNav } from './mobile-nav'
import { CreatorService } from '@/lib/creator-service'
import { useState, useEffect, useMemo } from 'react'
import { Button } from './ui/button'

interface AppleLayoutProps {
  children: ReactNode
  showHero?: boolean
  onAuthModal?: (mode: 'signin' | 'signup') => void
}

export function AppleLayout({ children, showHero = false, onAuthModal }: AppleLayoutProps) {
  const { address, isConnected } = useAccount()
  const [isCreator, setIsCreator] = useState(false)

  // Check creator status once when wallet connects
  useEffect(() => {
    if (!isConnected || !address) {
      setIsCreator(false);
      return;
    }
    
    const profile = CreatorService.getCurrentCreatorProfile();
    if (profile && profile.address === address.toLowerCase()) {
      setIsCreator(true);
    } else {
      setIsCreator(false);
    }
  }, [isConnected, address]);

  return (
    <div className="min-h-screen bg-background font-sans tracking-normal overflow-x-hidden">
      {/* Apple-style Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center mr-3 shadow-md">
                  <span className="text-primary-foreground font-bold text-sm">K</span>
                </div>
                <span className="text-xl font-semibold text-foreground">KudoBit</span>
              </Link>
            </div>

            {/* Center Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm font-medium"
              >
                Discover
              </Link>
              <Link 
                to="/creator/dashboard" 
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm font-medium"
              >
                Create
              </Link>
              <Link 
                to="/purchases" 
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm font-medium"
              >
                My Purchases
              </Link>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {isConnected ? (
                <WalletConnect />
              ) : (
                <div className="hidden sm:flex items-center space-x-3">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onAuthModal?.('signin')}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    Sign In
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => onAuthModal?.('signup')}
                    className="bg-primary/50 hover:bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
                  >
                    Get Started
                  </Button>
                </div>
              )}
              <ThemeToggle />
              <MobileNav />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative">
        {children}
      </main>

      {/* Apple-style Footer */}
      <footer className="bg-muted/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-3">
                <li><Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Discover</Link></li>
                <li><Link to="/creator/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Create</Link></li>
                <li><Link to="/purchases" className="text-sm text-muted-foreground hover:text-foreground">Library</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Creators</h3>
              <ul className="space-y-3">
                <li><Link to="/register" className="text-sm text-muted-foreground hover:text-foreground">Join as Creator</Link></li>
                <li><Link to="/creator/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Dashboard</Link></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Resources</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">About</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Blog</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded mr-2">
                  <span className="text-primary-foreground font-bold text-xs flex items-center justify-center h-full">K</span>
                </div>
                <span className="text-sm text-muted-foreground">© 2024 KudoBit. All rights reserved.</span>
              </div>
              <div className="flex items-center space-x-6">
                <a href="#" className="text-gray-400 hover:text-muted-foreground">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-muted-foreground">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-muted-foreground">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}