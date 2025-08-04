import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Star, Users, Zap, Shield, Globe, Wallet } from 'lucide-react'

interface LandingHeroProps {
  onSignUp: () => void
  onSignIn: () => void
  isConnected: boolean
}

export function LandingHero({ onSignUp, onSignIn, isConnected }: LandingHeroProps) {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Web3 Creator Economy
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Monetize Your Content with{' '}
              <span className="text-primary">Web3</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Connect your wallet, create products, and earn crypto from your fans. 
              No middlemen, no fees, complete ownership.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            {!isConnected ? (
              <>
                <Button 
                  size="lg" 
                  onClick={onSignUp}
                  className="text-lg px-8 py-3 h-auto"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={onSignIn}
                  className="text-lg px-8 py-3 h-auto"
                >
                  <Wallet className="mr-2 h-5 w-5" />
                  Sign In
                </Button>
              </>
            ) : (
              <Button 
                size="lg"
                onClick={() => navigate({ to: '/creator/dashboard' })}
                className="text-lg px-8 py-3 h-auto"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-16">
            <div className="flex items-center gap-1">
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="ml-2">5.0 rating</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>1000+ creators</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              <span>Global community</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Wallet-First</CardTitle>
              <CardDescription>
                Just connect your crypto wallet to get started. No lengthy signups or KYC required.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Instant Payments</CardTitle>
              <CardDescription>
                Get paid in USDC instantly when fans purchase your content. No waiting for payment processing.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Full Ownership</CardTitle>
              <CardDescription>
                Your content, your rules. Built on blockchain for transparency and true digital ownership.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-card rounded-2xl p-8 shadow-lg">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">$2.5M+</div>
              <div className="text-muted-foreground">Creator Earnings</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">50K+</div>
              <div className="text-muted-foreground">Products Sold</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">1000+</div>
              <div className="text-muted-foreground">Active Creators</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Instant Payouts</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}