import { readContract } from '@wagmi/core'
import { config } from './wagmi'
import { CONTRACTS_EXTENDED, CREATOR_STORE_ABI, LOYALTY_TOKEN_ABI } from './contracts'
import { formatUnits } from 'viem'

export interface AnalyticsData {
  overview: {
    totalRevenue: string
    totalSales: number
    activeCreators: number
    totalCustomers: number
    averageOrderValue: string
    conversionRate: string
  }
  trends: {
    period: string
    revenue: number
    sales: number
    customers: number
  }[]
  topProducts: {
    id: number
    name: string
    creator: string
    sales: number
    revenue: string
    growth: number
  }[]
  topCreators: {
    address: string
    displayName: string
    totalSales: number
    totalRevenue: string
    products: number
    rating: number
  }[]
  loyaltyStats: {
    totalBadges: number
    bronzeBadges: number
    silverBadges: number
    goldBadges: number
    diamondBadges: number
    redemptionRate: string
  }
  geographicData: {
    country: string
    sales: number
    revenue: string
    percentage: number
  }[]
}

interface CreatorAnalytics {
  totalRevenue: string
  productsSold: number
  activeFans: number
  profileViews: number
  recentProducts: Array<{
    name: string
    sales: number
    revenue: string
  }>
}

interface Product {
  id: bigint
  name: string
  description: string
  ipfsContentHash: string
  priceInUSDC: bigint
  isActive: boolean
  loyaltyBadgeId: bigint
}

export class AnalyticsService {
  private static baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

  static async getGlobalAnalytics(): Promise<AnalyticsData> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/global`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch global analytics:', error)
      // Return real zero data instead of fake data
      return {
        overview: {
          totalRevenue: '0',
          totalSales: 0,
          activeCreators: 0,
          totalCustomers: 0,
          averageOrderValue: '0',
          conversionRate: '0'
        },
        trends: [],
        topProducts: [],
        topCreators: [],
        loyaltyStats: {
          totalBadges: 0,
          bronzeBadges: 0,
          silverBadges: 0,
          goldBadges: 0,
          diamondBadges: 0,
          redemptionRate: '0'
        },
        geographicData: []
      }
    }
  }

  static async getCreatorAnalytics(creatorAddress: string): Promise<CreatorAnalytics> {
    try {
      // Get analytics from backend API only (no blockchain calls)
      const backendAnalytics = await this.getBackendAnalytics(creatorAddress)
      
      // Get creator's products from backend
      const creatorProducts = await this.getCreatorProductsFromBackend(creatorAddress)

      // Calculate total revenue from backend purchases
      const totalRevenue = creatorProducts.reduce((sum, product) => {
        const sales = backendAnalytics.productSales[product.id?.toString()] || 0
        return sum + (parseFloat(product.priceUsdc || '0') * sales)
      }, 0)

      const productsSold = Object.values(backendAnalytics.productSales).reduce((sum, sales) => sum + sales, 0)

      return {
        totalRevenue: totalRevenue.toFixed(2),
        productsSold: productsSold,
        activeFans: backendAnalytics.activeFans || 0,
        profileViews: backendAnalytics.profileViews || 0,
        recentProducts: creatorProducts.slice(-3).map(product => ({
          name: product.name || 'Product',
          sales: backendAnalytics.productSales[product.id?.toString()] || 0,
          revenue: ((parseFloat(product.priceUsdc || '0')) * (backendAnalytics.productSales[product.id?.toString()] || 0)).toFixed(2)
        }))
      }
    } catch (error) {
      console.error('Error fetching creator analytics:', error)
      // Return REAL ZERO data instead of fake data
      return {
        totalRevenue: '0.00',
        productsSold: 0,
        activeFans: 0,
        profileViews: 0,
        recentProducts: []
      }
    }
  }

  private static async getAllProducts(): Promise<Product[]> {
    try {
      const products = await readContract(config, {
        address: CONTRACTS_EXTENDED.creatorStore,
        abi: CREATOR_STORE_ABI,
        functionName: 'getAllProducts',
        chainId: config.chains[0].id,
        authorizationList: []
      }) as any[]

      return products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        ipfsContentHash: p.ipfsContentHash,
        priceInUSDC: p.priceInUSDC,
        isActive: p.isActive,
        loyaltyBadgeId: p.loyaltyBadgeId
      }))
    } catch (error) {
      console.error('Error fetching products from blockchain:', error)
      return []
    }
  }


  private static async getBackendAnalytics(creatorAddress: string): Promise<{
    productSales: Record<string, number>
    activeFans: number
    profileViews: number
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/analytics/creator/${creatorAddress}`)
      if (!response.ok) {
        throw new Error('Failed to fetch backend analytics')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching backend analytics:', error)
      // Return REAL ZERO data instead of fake data
      return {
        productSales: {},
        activeFans: 0,
        profileViews: 0
      }
    }
  }

  private static async getCreatorProductsFromBackend(creatorAddress: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/products/creator/${creatorAddress}`)
      if (!response.ok) {
        throw new Error('Failed to fetch creator products')
      }
      const data = await response.json()
      return data.products || []
    } catch (error) {
      console.error('Error fetching creator products from backend:', error)
      return []
    }
  }

  static async getLoyaltyBadgeStats(userAddress: string): Promise<{
    bronze: number
    silver: number
    gold: number
    diamond: number
  }> {
    try {
      const [bronze, silver, gold, diamond] = await Promise.all([
        this.getBadgeBalance(userAddress, 1),
        this.getBadgeBalance(userAddress, 2),
        this.getBadgeBalance(userAddress, 3),
        this.getBadgeBalance(userAddress, 4)
      ])

      return { bronze, silver, gold, diamond }
    } catch (error) {
      console.error('Error fetching loyalty badge stats:', error)
      return { bronze: 0, silver: 0, gold: 0, diamond: 0 }
    }
  }

  private static async getBadgeBalance(userAddress: string, badgeId: number): Promise<number> {
    try {
      const balance = await readContract(config, {
        address: CONTRACTS_EXTENDED.loyaltyToken,
        abi: LOYALTY_TOKEN_ABI,
        functionName: 'balanceOf',
        args: [userAddress as `0x${string}`, BigInt(badgeId)],
        chainId: config.chains[0].id,
        authorizationList: []
      }) as bigint

      return Number(balance)
    } catch (error) {
      console.error(`Error fetching badge ${badgeId} balance:`, error)
      return 0
    }
  }

  static async getUserPurchases(userAddress: string): Promise<number[]> {
    try {
      const purchases = await readContract(config, {
        address: CONTRACTS_EXTENDED.creatorStore,
        abi: CREATOR_STORE_ABI,
        functionName: 'getUserPurchases',
        args: [userAddress as `0x${string}`],
        chainId: config.chains[0].id,
        authorizationList: []
      }) as bigint[]

      return purchases.map(p => Number(p))
    } catch (error) {
      console.error('Error fetching user purchases:', error)
      return []
    }
  }

  static async getProductPriceFromBlockchain(productId: number): Promise<string> {
    try {
      const products = await this.getAllProducts()
      const product = products.find(p => Number(p.id) === productId)
      
      if (product) {
        return formatUnits(product.priceInUSDC, 6) // USDC has 6 decimals
      }
      
      return '0'
    } catch (error) {
      console.error('Error fetching product price from blockchain:', error)
      return '0'
    }
  }
}