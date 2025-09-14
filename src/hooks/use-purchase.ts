import { useState, useCallback, useMemo } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import toast from 'react-hot-toast'
import { CONTRACTS, MOCK_USDC_ABI, GUMROAD_CORE_ABI } from '@/lib/contracts'

export type PurchaseState = 'idle' | 'approving' | 'purchasing' | 'success'

export interface PurchaseFlow {
  state: PurchaseState
  error?: string
  currentProductId?: number
}

export function usePurchase() {
  const { address } = useAccount()
  const [flow, setFlow] = useState<PurchaseFlow>({ state: 'idle' })
  
  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isSuccess, isError } = useWaitForTransactionReceipt({ hash: txHash })

  const { data: usdcBalance } = useReadContract({
    address: CONTRACTS.mockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  const { data: allowance } = useReadContract({
    address: CONTRACTS.mockUSDC,
    abi: MOCK_USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.gumroadCore] : undefined,
  })

  const purchase = useCallback(async (productId: number, price: bigint) => {
    if (!address) {
      toast.error('Connect wallet first')
      return
    }

    if (!usdcBalance || usdcBalance < price) {
      toast.error('Insufficient USDC balance')
      return
    }

    try {
      setFlow({ state: 'approving', currentProductId: productId })

      // Check if we need approval
      if (!allowance || allowance < price) {
        toast.loading('Approving USDC spend...')
        await writeContract({
          address: CONTRACTS.mockUSDC,
          abi: MOCK_USDC_ABI,
          functionName: 'approve',
          args: [CONTRACTS.gumroadCore, price],
        })
      } else {
        // Direct purchase if already approved
        setFlow({ state: 'purchasing', currentProductId: productId })
        toast.loading('Purchasing product...')
        await writeContract({
          address: CONTRACTS.gumroadCore,
          abi: GUMROAD_CORE_ABI,
          functionName: 'purchaseProduct',
          args: [BigInt(productId), CONTRACTS.mockUSDC],
        })
      }
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'shortMessage' in error 
        ? (error as { shortMessage: string }).shortMessage 
        : 'Transaction failed'
      setFlow({ state: 'idle', error: message })
      toast.error(message)
    }
  }, [address, usdcBalance, allowance, writeContract])

  // Handle transaction results
  if (isSuccess) {
    if (flow.state === 'approving') {
      // After approval, purchase the product
      setFlow({ state: 'purchasing', currentProductId: flow.currentProductId })
      toast.success('Approval successful')
      if (flow.currentProductId) {
        writeContract({
          address: CONTRACTS.gumroadCore,
          abi: GUMROAD_CORE_ABI,
          functionName: 'purchaseProduct',
          args: [BigInt(flow.currentProductId), CONTRACTS.mockUSDC],
        })
      }
    } else if (flow.state === 'purchasing') {
      setFlow({ state: 'success', currentProductId: flow.currentProductId })
      toast.success('Purchase successful!')
      setTimeout(() => setFlow({ state: 'idle' }), 3000)
    }
  }

  if (isError && isPending === false) {
    setFlow({ state: 'idle', error: 'Transaction failed' })
    toast.error('Transaction failed')
  }

  return useMemo(() => ({ flow, purchase }), [flow, purchase])
}