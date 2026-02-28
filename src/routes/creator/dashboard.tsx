import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Loader2 } from 'lucide-react'
import { CONTRACTS, CREATOR_REGISTRY_ABI } from '@/lib/contracts'
import { AppleDashboard } from '@/components/apple-dashboard'

export const Route = createFileRoute('/creator/dashboard')({
  component: CreatorDashboard,
})

function CreatorDashboard() {
  const { address, isConnected } = useAccount()
  const navigate = useNavigate()

  // Read creator registration status from chain
  const { data: isRegistered, isLoading: isCheckingRegistration } = useReadContract({
    address: CONTRACTS.creatorRegistry,
    abi: CREATOR_REGISTRY_ABI,
    functionName: 'isRegistered',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  })

  // Read creator profile from chain
  const { data: creatorData, isLoading: isLoadingProfile } = useReadContract({
    address: CONTRACTS.creatorRegistry,
    abi: CREATOR_REGISTRY_ABI,
    functionName: 'creators',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address && !!isRegistered },
  })

  const isLoading = isCheckingRegistration || isLoadingProfile

  // Build creator profile from on-chain data
  const creatorProfile = (creatorData && address) ? {
    address: address as string,
    displayName: (creatorData as any)[0] || 'Creator',
    bio: (creatorData as any)[1] || '',
    avatar: (creatorData as any)[2] || '',
    verified: (creatorData as any)[3] || false,
    productCount: Number((creatorData as any)[4] || 0),
    totalSales: Number((creatorData as any)[5] || 0),
  } : undefined

  if (!isConnected) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Creator Dashboard</CardTitle>
            <CardDescription>
              Connect your wallet to access creator features
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-muted/30 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Loading Dashboard</h2>
          <p className="text-muted-foreground">Checking your creator status...</p>
        </div>
      </div>
    )
  }

  if (!isRegistered) {
    return (
      <div className="bg-muted/30 min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto bg-background rounded-2xl shadow-sm border border-border p-8 text-center">
          <div className="w-16 h-16 bg-chart-4/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-8 w-8 text-chart-4" />
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-4">
            Join as Creator
          </h2>
          <p className="text-muted-foreground mb-8">
            You need to register as a creator to access the dashboard and start selling your digital products.
          </p>

          <div className="space-y-4">
            <Button
              onClick={() => navigate({ to: '/register' })}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-full font-medium"
            >
              <User className="mr-2 h-5 w-5" />
              Register as Creator
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/' })}
              className="w-full border-border hover:border-muted-foreground text-foreground py-3 rounded-full font-medium"
            >
              Browse Products
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
      </div>
    )
  }

  return <AppleDashboard creatorProfile={creatorProfile} />
}
