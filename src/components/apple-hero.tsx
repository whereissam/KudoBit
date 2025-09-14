import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Play } from 'lucide-react'

interface AppleHeroProps {
  onSignUp: () => void
  onSignIn: () => void
  isConnected: boolean
}

export function AppleHero({ onSignUp, onSignIn, isConnected }: AppleHeroProps) {
  const navigate = useNavigate()
  return (
    <div className="relative bg-background overflow-hidden font-sans tracking-normal">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      {/* Hero Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-28">
          <div className="text-center">
            {/* Announcement */}
            <div className="inline-flex items-center px-4 py-1.5 mb-8 text-sm font-medium text-primary-foreground bg-primary/10 rounded-full">
              <span className="mr-2">🚀</span>
              <span>Keep 100% of your earnings - No platform fees</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground tracking-tight">
              Create.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                Connect.
              </span>
              <br />
              Earn.
            </h1>

            {/* Subheadline */}
            <p className="mt-8 max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
              The creator platform built for the future. Sell digital products, build your community, and earn with complete ownership on Web3.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!isConnected ? (
                <>
                  <Button
                    onClick={onSignUp}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-200 min-w-[200px]"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    onClick={onSignIn}
                    variant="outline"
                    size="lg"
                    className="border-2 border-border hover:border-border/80 text-foreground px-8 py-4 text-lg font-medium rounded-full transition-all duration-200 min-w-[200px]"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Watch Demo
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => navigate({ to: '/creator/dashboard' })}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Social Proof */}
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center">
                <div className="flex -space-x-2 mr-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-primary border-2 border-background" />
                  ))}
                </div>
                <span>Trusted by 1000+ creators</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">⭐⭐⭐⭐⭐</span>
                <span>5.0 rating on Web3</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Preview */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative">
          {/* Main Dashboard Preview */}
          <div className="relative mx-auto max-w-5xl">
            <div className="rounded-2xl shadow-2xl overflow-hidden bg-card border border-border">
              {/* Fake browser header */}
              <div className="bg-muted px-4 py-3 border-b border-border">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <div className="w-3 h-3 rounded-full bg-chart-4"></div>
                  <div className="w-3 h-3 rounded-full bg-chart-1"></div>
                  <div className="ml-4 flex-1 bg-background rounded-md px-3 py-1 text-sm text-muted-foreground">
                    kudobit.app/dashboard
                  </div>
                </div>
              </div>
              
              {/* Dashboard content preview */}
              <div className="bg-gradient-to-br from-muted/50 to-background p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Revenue Card */}
                  <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
                      <div className="w-8 h-8 bg-chart-1/10 rounded-lg flex items-center justify-center">
                        <span className="text-chart-1 text-sm">💰</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-foreground">$0.00</div>
                    <div className="text-sm text-muted-foreground mt-1">Real-time data</div>
                  </div>

                  {/* Products Card */}
                  <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-muted-foreground">Products Sold</h3>
                      <div className="w-8 h-8 bg-chart-2/10 rounded-lg flex items-center justify-center">
                        <span className="text-chart-2 text-sm">📦</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-foreground">0</div>
                    <div className="text-sm text-muted-foreground mt-1">Real-time data</div>
                  </div>

                  {/* Fans Card */}
                  <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-muted-foreground">Active Fans</h3>
                      <div className="w-8 h-8 bg-chart-3/10 rounded-lg flex items-center justify-center">
                        <span className="text-chart-3 text-sm">👥</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-foreground">0</div>
                    <div className="text-sm text-muted-foreground mt-1">Real-time data</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">
                    Create Product
                  </div>
                  <div className="bg-muted text-muted-foreground px-4 py-2 rounded-lg text-sm font-medium">
                    View Analytics
                  </div>
                  <div className="bg-muted text-muted-foreground px-4 py-2 rounded-lg text-sm font-medium">
                    Manage Fans
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-muted/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Why creators choose KudoBit
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The only platform that gives you true ownership, instant payments, and zero fees on Web3.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-chart-2/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Instant Payments</h3>
              <p className="text-muted-foreground">
                Get paid in USDC instantly when fans purchase your content. No waiting periods.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-chart-3/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Full Ownership</h3>
              <p className="text-muted-foreground">
                Your content, your audience, your rules. Built on blockchain for true ownership.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-chart-1/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Zero Fees</h3>
              <p className="text-muted-foreground">
                Keep 100% of your earnings. No platform fees, no hidden costs, no surprises.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}