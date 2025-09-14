// User role management for KudoBit
// Separates Buyers from Creators with different access levels

export enum UserRole {
  BUYER = 'buyer',
  CREATOR = 'creator',
  ADMIN = 'admin'
}

export interface UserProfile {
  address: string
  role: UserRole
  displayName?: string
  bio?: string
  socialLinks?: {
    twitter?: string
    website?: string
    discord?: string
  }
  createdAt: Date
  isVerified: boolean
}

export class UserRoleService {
  private static _currentUser: UserProfile | null = null

  // For buyers - no account needed, just wallet connection for purchases
  static getBuyerInfo(address: string): UserProfile {
    return {
      address: address.toLowerCase(),
      role: UserRole.BUYER,
      displayName: `${address.slice(0, 6)}...${address.slice(-4)}`,
      createdAt: new Date(),
      isVerified: false
    }
  }

  // For creators - requires signup process
  static async registerAsCreator(
    address: string, 
    profileData: {
      displayName: string
      bio: string
      socialLinks: { twitter?: string; website?: string; discord?: string }
    }
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const creatorProfile: UserProfile = {
        address: address.toLowerCase(),
        role: UserRole.CREATOR,
        displayName: profileData.displayName,
        bio: profileData.bio,
        socialLinks: profileData.socialLinks,
        createdAt: new Date(),
        isVerified: false
      }
      
      this._currentUser = creatorProfile
      localStorage.setItem('kudobit_user_role', UserRole.CREATOR)
      localStorage.setItem('kudobit_user_address', address.toLowerCase())
      localStorage.setItem('kudobit_creator_profile', JSON.stringify(creatorProfile))
      
      return { success: true, user: creatorProfile }
    } catch (error) {
      return { success: false, error: 'Failed to register as creator' }
    }
  }

  // Login for existing creators
  static async loginAsCreator(address: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      // Check if user is already registered as creator
      const savedProfile = localStorage.getItem('kudobit_creator_profile')
      const savedAddress = localStorage.getItem('kudobit_user_address')
      
      if (savedProfile && savedAddress === address.toLowerCase()) {
        const creatorProfile = JSON.parse(savedProfile)
        this._currentUser = creatorProfile
        localStorage.setItem('kudobit_user_role', UserRole.CREATOR)
        return { success: true, user: creatorProfile }
      }
      
      return { success: false, error: 'Creator profile not found. Please register first.' }
    } catch (error) {
      return { success: false, error: 'Failed to login as creator' }
    }
  }

  // Check if user is a registered creator
  static getCreatorProfile(): UserProfile | null {
    const savedProfile = localStorage.getItem('kudobit_creator_profile')
    const savedRole = localStorage.getItem('kudobit_user_role')
    
    if (savedRole === UserRole.CREATOR && savedProfile) {
      return JSON.parse(savedProfile)
    }
    
    return null
  }

  static isRegisteredCreator(): boolean {
    return this.getCreatorProfile() !== null
  }

  // Buyers don't have accounts - they're just connected wallets
  static canBuy(address: string): boolean {
    return !!address // Just need a wallet connection
  }

  static canAccessCreatorFeatures(): boolean {
    return this.isRegisteredCreator()
  }

  static logout(): void {
    this._currentUser = null
    localStorage.removeItem('kudobit_user_role')
    localStorage.removeItem('kudobit_user_address')
    localStorage.removeItem('kudobit_creator_profile')
    localStorage.removeItem('kudobit_token')
  }

  static getCurrentRole(): UserRole | null {
    return localStorage.getItem('kudobit_user_role') as UserRole || null
  }

  static canPurchase(): boolean {
    return this.getCurrentRole() === UserRole.BUYER || this.getCurrentRole() === UserRole.CREATOR
  }
}