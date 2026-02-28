import { db } from '../config/database.js'
import type { Purchase } from '../types/index.js'

export const purchaseModel = {
  async create(buyerAddress: string, productId: number, priceUsdc: number, txHash: string): Promise<Purchase> {
    const result = await db.query(
      `INSERT INTO purchases (buyer_address, product_id, price_usdc, tx_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [buyerAddress.toLowerCase(), productId, priceUsdc, txHash]
    )
    return result.rows[0]
  },

  async findByBuyer(buyerAddress: string): Promise<(Purchase & { product_name: string; creator_address: string; ipfs_hash: string | null })[]> {
    const result = await db.query(
      `SELECT p.*, pr.name as product_name, pr.creator_address, pr.ipfs_hash
       FROM purchases p
       JOIN products pr ON p.product_id = pr.id
       WHERE p.buyer_address = $1
       ORDER BY p.created_at DESC`,
      [buyerAddress.toLowerCase()]
    )
    return result.rows
  },

  async findByProduct(productId: number | number[]): Promise<Purchase[]> {
    if (Array.isArray(productId)) {
      if (productId.length === 0) return []
      const result = await db.query(
        'SELECT * FROM purchases WHERE product_id = ANY($1) ORDER BY created_at DESC',
        [productId]
      )
      return result.rows
    }
    const result = await db.query(
      'SELECT * FROM purchases WHERE product_id = $1 ORDER BY created_at DESC',
      [productId]
    )
    return result.rows
  },

  async findByTxHash(txHash: string): Promise<Purchase | null> {
    const result = await db.query(
      'SELECT * FROM purchases WHERE tx_hash = $1',
      [txHash]
    )
    return result.rows[0] || null
  },

  async verifyPurchase(buyerAddress: string, productId: number): Promise<(Purchase & { ipfs_hash: string | null }) | null> {
    const result = await db.query(
      `SELECT p.*, pr.ipfs_hash
       FROM purchases p
       JOIN products pr ON p.product_id = pr.id
       WHERE p.buyer_address = $1 AND p.product_id = $2`,
      [buyerAddress.toLowerCase(), productId]
    )
    return result.rows[0] || null
  }
}
