// Mobile-first optimizations for KudoBit
import { useEffect, useState } from 'react'

// Mobile detection
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent)
      const isSmallScreen = window.innerWidth < 768
      setIsMobile(isMobileDevice || isSmallScreen)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  return isMobile
}

// Touch gestures
export function useTouchGestures() {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)

  const handleTouchStart = (e: TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const getSwipeDirection = () => {
    if (!touchStart || !touchEnd) return null
    
    const diffX = touchStart.x - touchEnd.x
    const diffY = touchStart.y - touchEnd.y
    const ratio = Math.abs(diffX / diffY)
    
    if (ratio < 3) return null // Not a clear swipe
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
      return diffX > 0 ? 'left' : 'right'
    } else {
      return diffY > 0 ? 'up' : 'down'
    }
  }

  return {
    touchStart,
    touchEnd,
    handleTouchStart,
    handleTouchMove,
    getSwipeDirection
  }
}

// Progressive Web App utilities
export class PWAManager {
  private static instance: PWAManager
  private deferredPrompt: any = null

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager()
    }
    return PWAManager.instance
  }

  constructor() {
    this.setupPWAEvents()
  }

  private setupPWAEvents() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.deferredPrompt = e
    })

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed')
      this.deferredPrompt = null
    })
  }

  canInstall(): boolean {
    return !!this.deferredPrompt
  }

  async install(): Promise<boolean> {
    if (!this.deferredPrompt) return false

    this.deferredPrompt.prompt()
    const { outcome } = await this.deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      this.deferredPrompt = null
      return true
    }
    
    return false
  }

  isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true
  }
}

// Performance optimizations
export class MobilePerformance {
  // Lazy load images with intersection observer
  static observeImages() {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          if (img.dataset.src) {
            img.src = img.dataset.src
            img.classList.remove('lazy')
            imageObserver.unobserve(img)
          }
        }
      })
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    })

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img)
    })
  }

  // Preload critical resources
  static preloadCritical() {
    const criticalImages = [
      '/logo.svg',
      '/chains/morph.svg'
    ]

    criticalImages.forEach(src => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = src
      document.head.appendChild(link)
    })
  }

  // Memory management
  static cleanupUnusedAssets() {
    // Remove unused images from DOM
    const images = document.querySelectorAll('img')
    images.forEach(img => {
      if (!img.complete && img.naturalHeight === 0) {
        img.remove()
      }
    })
  }
}

// Haptic feedback for mobile interactions
export class HapticFeedback {
  static light() {
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

  static medium() {
    if ('vibrate' in navigator) {
      navigator.vibrate(20)
    }
  }

  static heavy() {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 10, 30])
    }
  }

  static success() {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 25, 50])
    }
  }

  static error() {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 100])
    }
  }
}

// Mobile-specific UI components
export const mobileStyles = {
  touchTarget: 'min-h-[44px] min-w-[44px]', // iOS HIG minimum touch target
  safeArea: 'pb-safe', // Safe area for iPhone notch
  scrollable: 'overscroll-behavior-y-contain', // Prevent bounce scroll
  momentum: '-webkit-overflow-scrolling: touch', // iOS momentum scrolling
}

// Responsive breakpoints
export const breakpoints = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  touch: '(pointer: coarse)',
  hover: '(hover: hover)'
}

// Mobile wallet connection optimization
export class MobileWalletManager {
  static isWalletConnectSupported(): boolean {
    return typeof window !== 'undefined' && !!window.ethereum
  }

  static async connectMobileWallet() {
    if (!this.isWalletConnectSupported()) {
      // Redirect to wallet app or show mobile-specific instructions
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      if (isMobile) {
        // Try to open MetaMask mobile app
        const metamaskUrl = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`
        window.location.href = metamaskUrl
        return false
      }
    }
    
    return true
  }

  static async switchToMobileOptimizedChain(chainId: number) {
    if (!window.ethereum) return false
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      })
      return true
    } catch (error) {
      console.error('Failed to switch chain:', error)
      return false
    }
  }
}

// Network speed detection
export function useNetworkSpeed() {
  const [speed, setSpeed] = useState<'fast' | 'slow' | 'offline'>('fast')

  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

    if (connection) {
      const updateSpeed = () => {
        const effectiveType = connection.effectiveType
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          setSpeed('slow')
        } else {
          setSpeed('fast')
        }
      }

      updateSpeed()
      connection.addEventListener('change', updateSpeed)
      
      return () => connection.removeEventListener('change', updateSpeed)
    }

    // Fallback: online/offline detection
    const handleOnline = () => setSpeed('fast')
    const handleOffline = () => setSpeed('offline')

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return speed
}

// Mobile-optimized loading states
export const MobileLoadingStates = {
  skeleton: 'animate-pulse bg-gray-200 rounded',
  shimmer: 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
  spinner: 'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600'
}