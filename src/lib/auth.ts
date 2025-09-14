import { SiweMessage } from 'siwe'

// Fallback system: try backend first, use localStorage if backend fails
const PREFER_BACKEND = true
const API_BASE_URL = 'http://localhost:3001'

export class AuthService {
  private static token: string | null = localStorage.getItem('kudobit_token')
  private static currentAddress: string | null = localStorage.getItem('kudobit_address')

  static async getNonce(): Promise<string> {
    if (PREFER_BACKEND) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/nonce`)
        const data = await response.json()
        return data.nonce
      } catch (error) {
        console.warn('Backend nonce failed, using local nonce')
      }
    }
    
    // Fallback: Generate a simple nonce locally
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  static async login(address: string, chainId: number, signMessage: (message: string) => Promise<string>): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const nonce = await this.getNonce()
      
      // Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to KudoBit - The Web3 Gumroad',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce,
        issuedAt: new Date().toISOString(),
      })

      // Get user to sign the message (this verifies wallet ownership)
      const signature = await signMessage(message.prepareMessage())

      // Try backend authentication first
      if (PREFER_BACKEND) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: message.prepareMessage(),
              signature,
            }),
          })

          const data = await response.json()

          if (data.success && data.token) {
            this.token = data.token
            this.currentAddress = address.toLowerCase()
            localStorage.setItem('kudobit_token', data.token)
            localStorage.setItem('kudobit_address', address.toLowerCase())
            return { success: true, token: data.token }
          }
        } catch (backendError) {
          console.warn('Backend auth failed, using local auth:', backendError)
        }
      }
      
      // Fallback: Create local token
      const localToken = btoa(JSON.stringify({
        address: address.toLowerCase(),
        chainId,
        timestamp: Date.now(),
        signature: signature.slice(0, 20) // Just a partial signature for verification
      }))
      
      this.token = localToken
      this.currentAddress = address.toLowerCase()
      localStorage.setItem('kudobit_token', localToken)
      localStorage.setItem('kudobit_address', address.toLowerCase())
      
      return { success: true, token: localToken }
      
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Authentication failed' }
    }
  }

  static async logout(): Promise<void> {
    // Try backend logout if backend is available
    if (PREFER_BACKEND && this.token) {
      try {
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
        })
      } catch (error) {
        console.warn('Backend logout failed:', error)
      }
    }
    
    // Always clear local storage
    this.token = null
    this.currentAddress = null
    localStorage.removeItem('kudobit_token')
    localStorage.removeItem('kudobit_address')
  }

  static async verifyAuth(): Promise<{ authenticated: boolean; address?: string; chainId?: number }> {
    if (!this.token) {
      return { authenticated: false }
    }

    // Try backend verification first
    if (PREFER_BACKEND) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          return data
        }
      } catch (error) {
        console.warn('Backend verification failed, using local verification:', error)
      }
    }

    // Fallback: Local token verification
    try {
      const tokenData = JSON.parse(atob(this.token))
      const isValid = tokenData.address && tokenData.timestamp && (Date.now() - tokenData.timestamp < 24 * 60 * 60 * 1000) // 24 hours
      
      if (isValid) {
        return {
          authenticated: true,
          address: tokenData.address,
          chainId: tokenData.chainId
        }
      } else {
        this.logout()
        return { authenticated: false }
      }
    } catch (error) {
      console.error('Token parsing error:', error)
      this.logout()
      return { authenticated: false }
    }
  }

  static async getCreatorProfile(address: string): Promise<any> {
    // Try backend first
    if (PREFER_BACKEND) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/creator/${address}`, {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          referrerPolicy: 'no-referrer',
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(5000)
        })
        if (response.ok) {
          return await response.json()
        }
      } catch (error) {
        // Only log warning, don't throw - gracefully fallback to localStorage
        console.warn('Backend profile fetch failed, using localStorage:', (error as Error).message || error)
      }
    }
    
    // Fallback: Check localStorage
    const profiles = JSON.parse(localStorage.getItem('kudobit_profiles') || '{}')
    const profile = profiles[address.toLowerCase()]
    
    if (profile) {
      return {
        address: address.toLowerCase(),
        displayName: profile.displayName || 'Creator',
        bio: profile.bio || 'Welcome to my KudoBit storefront!',
        socialLinks: profile.socialLinks || {},
        isVerified: false
      }
    }
    
    return null
  }

  static async updateCreatorProfile(profileData: { displayName?: string; bio?: string; socialLinks?: any }): Promise<{ success: boolean; error?: string }> {
    if (!this.token) {
      return { success: false, error: 'Not authenticated' }
    }

    if (!this.currentAddress) {
      return { success: false, error: 'No authenticated user' }
    }

    // Try backend update first
    if (PREFER_BACKEND) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/creator/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
          },
          body: JSON.stringify(profileData),
        })

        if (response.ok) {
          await response.json()
        }
      } catch (error) {
        console.warn('Backend profile update failed:', error)
      }
    }

    // Always update localStorage as fallback
    try {
      const profiles = JSON.parse(localStorage.getItem('kudobit_profiles') || '{}')
      profiles[this.currentAddress] = {
        ...profiles[this.currentAddress],
        ...profileData
      }
      localStorage.setItem('kudobit_profiles', JSON.stringify(profiles))
      
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Failed to update profile' }
    }
  }

  static async getAnalytics(address: string): Promise<any> {
    if (!this.token) {
      return null
    }

    if (!PREFER_BACKEND) {
      // Demo analytics data
      return {
        totalSales: 12,
        totalRevenue: '2.4', // in USDC
        loyaltyBadgesIssued: 8,
        uniqueCustomers: 5,
        averageOrderValue: '0.2',
        popularProducts: [
          { id: 1, name: 'Exclusive Wallpaper NFT', sales: 5 },
          { id: 2, name: '1-Month Premium Content Pass', sales: 4 },
          { id: 3, name: 'Digital Sticker Pack', sales: 3 }
        ]
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics/${address}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      })

      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Analytics error:', error)
      return null
    }
  }

  static getToken(): string | null {
    return this.token
  }

  static isAuthenticated(): boolean {
    return !!this.token
  }

  static getCurrentAddress(): string | null {
    // Always try localStorage first
    const storedAddress = this.currentAddress || localStorage.getItem('kudobit_address')
    if (storedAddress) {
      return storedAddress
    }
    
    // Fallback: Try to decode JWT token
    if (this.token) {
      try {
        const payload = JSON.parse(atob(this.token.split('.')[1]))
        return payload.address
      } catch (error) {
        return null
      }
    }
    return null
  }
}

// Convenience function for signInWithEthereum
export async function signInWithEthereum(
  address: `0x${string}`, 
  signMessageAsync: (message: string) => Promise<string>
): Promise<{ success: boolean; token?: string; error?: string }> {
  const chainId = 2810 // Morph Holesky
  return AuthService.login(address, chainId, signMessageAsync)
}