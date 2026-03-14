import { SiweMessage } from 'siwe'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export class AuthService {
  private static token: string | null = localStorage.getItem('kudobit_token')
  private static currentAddress: string | null = localStorage.getItem('kudobit_address')

  static async getNonce(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/auth/nonce`)
    if (!response.ok) {
      throw new Error('Failed to get nonce from server')
    }
    const data = await response.json()
    return data.nonce
  }

  static async login(address: string, chainId: number, signMessage: (message: string) => Promise<string>): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const nonce = await this.getNonce()

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

      const signature = await signMessage(message.prepareMessage())

      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.prepareMessage(),
          signature,
        }),
      })

      const data = await response.json()

      if (response.ok && data.token) {
        this.token = data.token
        this.currentAddress = address.toLowerCase()
        localStorage.setItem('kudobit_token', data.token)
        localStorage.setItem('kudobit_address', address.toLowerCase())
        return { success: true, token: data.token }
      }

      return { success: false, error: data.error || 'Authentication failed' }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Authentication failed. Please ensure the backend is running.' }
    }
  }

  static async logout(): Promise<void> {
    if (this.token) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${this.token}` },
        })
      } catch {
        // Backend logout failed, still clear local state
      }
    }

    this.token = null
    this.currentAddress = null
    localStorage.removeItem('kudobit_token')
    localStorage.removeItem('kudobit_address')
  }

  static async verifyAuth(): Promise<{ authenticated: boolean; address?: string; chainId?: number }> {
    if (!this.token) {
      return { authenticated: false }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${this.token}` },
      })

      if (response.ok) {
        const data = await response.json()
        return { authenticated: true, address: data.address, ...data }
      }

      // Token invalid — clear local state
      await this.logout()
      return { authenticated: false }
    } catch {
      // Backend unreachable — fail closed
      return { authenticated: false }
    }
  }

  static async getCreatorProfile(address: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/creators/${address}`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        signal: AbortSignal.timeout(5000)
      })
      if (response.ok) {
        return await response.json()
      }
    } catch {
      console.warn('Backend profile fetch failed')
    }

    return null
  }

  static async updateCreatorProfile(profileData: { displayName?: string; bio?: string; socialLinks?: any }): Promise<{ success: boolean; error?: string }> {
    if (!this.token || !this.currentAddress) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/creators/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify(profileData),
      })

      if (response.ok) {
        return { success: true }
      }
      return { success: false, error: 'Failed to update profile' }
    } catch {
      return { success: false, error: 'Failed to update profile' }
    }
  }

  static async getAnalytics(address: string): Promise<any> {
    if (!this.token) return null

    try {
      const response = await fetch(`${API_BASE_URL}/api/creators/${address}/analytics`, {
        headers: { 'Authorization': `Bearer ${this.token}` },
      })

      if (response.ok) {
        return await response.json()
      }
      return null
    } catch {
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
    const storedAddress = this.currentAddress || localStorage.getItem('kudobit_address')
    if (storedAddress) return storedAddress

    if (this.token) {
      try {
        const payload = JSON.parse(atob(this.token.split('.')[1]))
        return payload.address
      } catch {
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
  const chainId = 10143 // Monad Testnet
  return AuthService.login(address, chainId, signMessageAsync)
}
