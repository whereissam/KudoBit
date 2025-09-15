import { Button } from '@/components/ui/button'
import { WalletConnect } from '@/components/wallet-connect'

interface ConnectStepProps {
  isConnected: boolean
  address: string | undefined
  onContinue: () => void
}

export function ConnectStep({ isConnected, address, onContinue }: ConnectStepProps) {
  if (!isConnected) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Connect your wallet to continue
        </p>
        <WalletConnect />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-800">
          ✅ Wallet connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
      </div>
      <Button onClick={onContinue} className="w-full">
        Continue
      </Button>
    </div>
  )
}