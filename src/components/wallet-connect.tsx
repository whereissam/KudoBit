import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 sm:gap-4">
        <span className="text-xs sm:text-sm font-mono">
          {address?.slice(0, 4)}...{address?.slice(-3)}
        </span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => disconnect()}
          className="text-xs sm:text-sm px-2 sm:px-4"
        >
          <span className="hidden sm:inline">Disconnect</span>
          <span className="sm:hidden">Exit</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex gap-1 sm:gap-2">
      {connectors.map((connector) => (
        <Button
          key={connector.uid}
          onClick={() => connect({ connector })}
          variant="default"
          size="sm"
          className="text-xs sm:text-sm px-2 sm:px-4"
        >
          <span className="hidden sm:inline">Connect {connector.name}</span>
          <span className="sm:hidden">Connect</span>
        </Button>
      ))}
    </div>
  )
}