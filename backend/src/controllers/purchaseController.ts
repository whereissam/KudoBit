import { purchaseModel } from '../models/purchaseModel.js'
import { productModel } from '../models/productModel.js'
import { config } from '../config/env.js'
import { AppError } from '../middleware/errorHandler.js'
import type { AppContext } from '../types/index.js'
import { createPublicClient, http } from 'viem'

const rpcUrl = process.env.RPC_URL || 'https://rpc-quicknode-holesky.morphl2.io'

const publicClient = createPublicClient({
  transport: http(rpcUrl),
})

async function verifyTransactionOnChain(txHash: string, expectedBuyer: string, expectedAmount: number): Promise<boolean> {
  try {
    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    })

    if (!receipt || receipt.status !== 'success') {
      return false
    }

    // Verify the sender matches the authenticated user
    const tx = await publicClient.getTransaction({
      hash: txHash as `0x${string}`,
    })

    if (tx.from.toLowerCase() !== expectedBuyer.toLowerCase()) {
      return false
    }

    return true
  } catch {
    return false
  }
}

export const purchaseController = {
  async createPurchase(c: AppContext) {
    const user = c.get('user')
    const body = c.get('validatedBody') as { product_id: number; price_usdc: number; tx_hash: string }
    const { product_id, price_usdc, tx_hash } = body

    const product = await productModel.findById(product_id)
    if (!product) {
      throw new AppError('Product not found', 404)
    }

    const existing = await purchaseModel.findByTxHash(tx_hash)
    if (existing) {
      throw new AppError('Purchase already recorded', 409)
    }

    // Verify transaction on-chain
    const isValid = await verifyTransactionOnChain(tx_hash, user.address, price_usdc)
    if (!isValid) {
      throw new AppError('Transaction verification failed', 400)
    }

    const purchase = await purchaseModel.create(
      user.address,
      product_id,
      price_usdc,
      tx_hash
    )

    return c.json(purchase, 201)
  },

  async getUserPurchases(c: AppContext) {
    const { address } = c.req.param()
    const user = c.get('user')

    if (user.address !== address.toLowerCase()) {
      throw new AppError('Unauthorized', 403)
    }

    const purchases = await purchaseModel.findByBuyer(address)
    return c.json(purchases)
  },

  async getContentAccess(c: AppContext) {
    const { product_id } = c.req.param()
    const user = c.get('user')

    const purchase = await purchaseModel.verifyPurchase(
      user.address,
      parseInt(product_id)
    )

    if (!purchase) {
      throw new AppError('Purchase not found or unauthorized', 403)
    }

    if (!purchase.ipfs_hash) {
      throw new AppError('No content available for this product', 404)
    }

    const gateway = config.ipfs.gateway
    const downloadUrl = `https://${gateway}/ipfs/${purchase.ipfs_hash}`

    return c.json({
      product_id: parseInt(product_id),
      ipfs_hash: purchase.ipfs_hash,
      download_url: downloadUrl,
      purchased_at: purchase.created_at
    })
  },

  async verifyPurchase(c: AppContext) {
    const { address, product_id } = c.req.param()
    const user = c.get('user')

    if (user.address !== address.toLowerCase()) {
      throw new AppError('Unauthorized', 403)
    }

    const purchase = await purchaseModel.verifyPurchase(
      address,
      parseInt(product_id)
    )

    return c.json({
      has_access: !!purchase,
      purchase: purchase || null
    })
  }
}
