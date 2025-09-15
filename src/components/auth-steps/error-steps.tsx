import { Button } from '@/components/ui/button'
import { User } from 'lucide-react'

interface NotFoundStepProps {
  onCreateAccount: () => void
  onTryDifferentWallet: () => void
}

export function NotFoundStep({ onCreateAccount, onTryDifferentWallet }: NotFoundStepProps) {
  return (
    <div className="text-center space-y-4">
      <div className="mx-auto w-12 h-12 bg-chart-4/10 rounded-full flex items-center justify-center">
        <User className="h-6 w-6 text-chart-4" />
      </div>
      <div>
        <h4 className="font-medium text-orange-900">No Account Found</h4>
        <p className="text-sm text-orange-800 mb-4">
          This wallet doesn't have a creator account yet.
        </p>
      </div>
      <div className="space-y-3">
        <Button onClick={onCreateAccount} className="w-full">
          Create Account
        </Button>
        <Button variant="outline" onClick={onTryDifferentWallet} className="w-full">
          Try Different Wallet
        </Button>
      </div>
    </div>
  )
}

interface AlreadyExistsStepProps {
  onSignIn: () => void
  onTryDifferentWallet: () => void
}

export function AlreadyExistsStep({ onSignIn, onTryDifferentWallet }: AlreadyExistsStepProps) {
  return (
    <div className="text-center space-y-4">
      <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
        <User className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h4 className="font-medium text-blue-900">Account Exists</h4>
        <p className="text-sm text-blue-800 mb-4">
          This wallet already has a creator account.
        </p>
      </div>
      <div className="space-y-3">
        <Button onClick={onSignIn} className="w-full">
          Sign In Instead
        </Button>
        <Button variant="outline" onClick={onTryDifferentWallet} className="w-full">
          Try Different Wallet
        </Button>
      </div>
    </div>
  )
}