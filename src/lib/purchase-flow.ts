import { Address } from 'viem'
import { SHOPFRONT_ABI, MOCK_USDC_ABI } from './contracts'

export type PurchaseState = 'idle' | 'processing' | 'success'

export interface PurchaseFlow {
  state: PurchaseState
  error?: string
  currentItemId?: number
}

export function createApprovalParams(
  shopfrontAddress: Address,
  usdcAddress: Address,
  price: bigint
) {
  return {
    address: usdcAddress,
    abi: MOCK_USDC_ABI,
    functionName: 'approve' as const,
    args: [shopfrontAddress, price] as const,
  }
}

export function createPurchaseParams(
  shopfrontAddress: Address,
  itemId: number
) {
  return {
    address: shopfrontAddress,
    abi: SHOPFRONT_ABI,
    functionName: 'buyItem' as const,
    args: [BigInt(itemId)] as const,
  }
}

export function needsApproval(allowance: bigint | undefined, price: bigint): boolean {
  return !allowance || allowance < price
}

export function hasInsufficientBalance(balance: bigint | undefined, price: bigint): boolean {
  return !balance || balance < price
}