// White-Label Provider Component
// Context provider for white-label theming and branding

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { ThemeConfig, themeEngine } from '../../lib/theme-engine'
import { CustomDomain, domainManager } from '../../lib/domain-manager'

// Context Types
interface WhiteLabelContextType {
  theme: ThemeConfig | null
  domain: CustomDomain | null
  organizationId: string | null
  isLoading: boolean
  error: string | null
  refreshTheme: () => Promise<void>
  updateTheme: (updates: Partial<ThemeConfig>) => Promise<void>
}

interface WhiteLabelProviderProps {
  children: ReactNode
  organizationId?: string
  domainOverride?: string
}

// Create Context
const WhiteLabelContext = createContext<WhiteLabelContextType | undefined>(undefined)

// Hook to use white-label context
export function useWhiteLabel(): WhiteLabelContextType {
  const context = useContext(WhiteLabelContext)
  if (context === undefined) {
    throw new Error('useWhiteLabel must be used within a WhiteLabelProvider')
  }
  return context
}

// Provider Component
export function WhiteLabelProvider({ 
  children, 
  organizationId,
  domainOverride 
}: WhiteLabelProviderProps): React.JSX.Element {
  const [theme, setTheme] = useState<ThemeConfig | null>(null)
  const [domain, setDomain] = useState<CustomDomain | null>(null)
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(organizationId || null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize theme and domain based on current domain or organization
  useEffect(() => {
    initializeWhiteLabel()
  }, [organizationId, domainOverride])

  const initializeWhiteLabel = async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      let resolvedOrgId = organizationId
      let resolvedDomain: CustomDomain | null = null

      // If domain override is provided, find the domain and get org ID
      if (domainOverride) {
        resolvedDomain = await domainManager.findDomainByName(domainOverride)
        if (resolvedDomain) {
          resolvedOrgId = resolvedDomain.organizationId
        }
      } else {
        // Try to determine domain from current location
        if (typeof window !== 'undefined') {
          const currentDomain = window.location.hostname
          resolvedDomain = await domainManager.findDomainByName(currentDomain)
          if (resolvedDomain) {
            resolvedOrgId = resolvedDomain.organizationId
          }
        }
      }

      setCurrentOrgId(resolvedOrgId || null)
      setDomain(resolvedDomain)

      // Load theme for the organization
      if (resolvedOrgId) {
        const activeTheme = await themeEngine.getActiveTheme(resolvedOrgId)
        setTheme(activeTheme)

        // Apply theme to document
        if (activeTheme) {
          applyThemeToDocument(activeTheme)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load white-label configuration')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshTheme = async (): Promise<void> => {
    if (currentOrgId) {
      try {
        const activeTheme = await themeEngine.getActiveTheme(currentOrgId)
        setTheme(activeTheme)
        
        if (activeTheme) {
          applyThemeToDocument(activeTheme)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to refresh theme')
      }
    }
  }

  const updateTheme = async (updates: Partial<ThemeConfig>): Promise<void> => {
    if (!theme) {
      throw new Error('No active theme to update')
    }

    try {
      const updatedTheme = await themeEngine.updateTheme(theme.id, updates)
      setTheme(updatedTheme)
      applyThemeToDocument(updatedTheme)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update theme')
      throw err
    }
  }

  const applyThemeToDocument = (themeConfig: ThemeConfig): void => {
    if (typeof document === 'undefined') return

    // Generate and inject CSS
    const css = themeEngine.generateCSS(themeConfig)
    const fontImports = themeEngine.generateFontImports(themeConfig)

    // Remove existing theme styles
    const existingStyle = document.getElementById('white-label-theme')
    if (existingStyle) {
      existingStyle.remove()
    }

    const existingFonts = document.getElementById('white-label-fonts')
    if (existingFonts) {
      existingFonts.remove()
    }

    // Inject font imports
    if (fontImports) {
      const fontStyle = document.createElement('style')
      fontStyle.id = 'white-label-fonts'
      fontStyle.textContent = fontImports
      document.head.appendChild(fontStyle)
    }

    // Inject theme CSS
    const themeStyle = document.createElement('style')
    themeStyle.id = 'white-label-theme'
    themeStyle.textContent = css
    document.head.appendChild(themeStyle)

    // Update favicon
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
    if (favicon && themeConfig.brand.logo.favicon) {
      favicon.href = themeConfig.brand.logo.favicon
    }

    // Update document title if brand name is available
    if (themeConfig.brand.name && themeConfig.brand.name !== 'KudoBit') {
      const currentTitle = document.title
      if (currentTitle.includes('KudoBit')) {
        document.title = currentTitle.replace('KudoBit', themeConfig.brand.name)
      }
    }

    // Update meta tags
    updateMetaTags(themeConfig)
  }

  const updateMetaTags = (themeConfig: ThemeConfig): void => {
    // Update description meta tag
    if (themeConfig.brand.description) {
      let descriptionMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement
      if (!descriptionMeta) {
        descriptionMeta = document.createElement('meta')
        descriptionMeta.name = 'description'
        document.head.appendChild(descriptionMeta)
      }
      descriptionMeta.content = themeConfig.brand.description
    }

    // Update Open Graph tags
    const ogTags = [
      { property: 'og:site_name', content: themeConfig.brand.name },
      { property: 'og:description', content: themeConfig.brand.description },
      { property: 'og:image', content: themeConfig.brand.logo.socialCard }
    ]

    ogTags.forEach(({ property, content }) => {
      if (content) {
        let metaTag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement
        if (!metaTag) {
          metaTag = document.createElement('meta')
          metaTag.setAttribute('property', property)
          document.head.appendChild(metaTag)
        }
        metaTag.content = content
      }
    })

    // Update Twitter Card tags
    const twitterTags = [
      { name: 'twitter:site', content: themeConfig.brand.socialLinks?.twitter },
      { name: 'twitter:description', content: themeConfig.brand.description },
      { name: 'twitter:image', content: themeConfig.brand.logo.socialCard }
    ]

    twitterTags.forEach(({ name, content }) => {
      if (content) {
        let metaTag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement
        if (!metaTag) {
          metaTag = document.createElement('meta')
          metaTag.name = name
          document.head.appendChild(metaTag)
        }
        metaTag.content = content
      }
    })
  }

  const contextValue: WhiteLabelContextType = {
    theme,
    domain,
    organizationId: currentOrgId,
    isLoading,
    error,
    refreshTheme,
    updateTheme
  }

  return (
    <WhiteLabelContext.Provider value={contextValue}>
      {children}
    </WhiteLabelContext.Provider>
  )
}

// HOC for white-label aware components
export function withWhiteLabel<T extends object>(
  Component: React.ComponentType<T>
) {
  return function WhiteLabelWrappedComponent(props: T) {
    return (
      <WhiteLabelProvider>
        <Component {...props} />
      </WhiteLabelProvider>
    )
  }
}

// Component for theme preview
export function ThemePreview({ 
  theme, 
  children 
}: { 
  theme: ThemeConfig
  children: ReactNode 
}): React.JSX.Element {
  useEffect(() => {
    // Apply theme in preview mode without affecting the global document
    const previewContainer = document.getElementById('theme-preview-container')
    if (previewContainer) {
      const css = themeEngine.generateCSS(theme)
      const styleElement = document.createElement('style')
      styleElement.textContent = css
      previewContainer.appendChild(styleElement)

      return () => {
        if (styleElement.parentNode) {
          styleElement.parentNode.removeChild(styleElement)
        }
      }
    }
  }, [theme])

  return (
    <div id="theme-preview-container" className="theme-preview">
      {children}
    </div>
  )
}

// Helper component for brand logo
export function BrandLogo({ 
  variant = 'light',
  className = '',
  alt 
}: {
  variant?: 'light' | 'dark'
  className?: string
  alt?: string
}): React.JSX.Element {
  const { theme } = useWhiteLabel()

  if (!theme) {
    return (
      <img 
        src="/assets/logo-light.svg" 
        alt={alt || "Logo"} 
        className={className}
      />
    )
  }

  const logoSrc = variant === 'dark' ? theme.brand.logo.dark : theme.brand.logo.light
  const logoAlt = alt || theme.brand.name

  return (
    <img 
      src={logoSrc} 
      alt={logoAlt} 
      className={className}
    />
  )
}

// Component for brand-aware page title
export function BrandTitle({ 
  children,
  suffix = true 
}: { 
  children: ReactNode
  suffix?: boolean 
}): React.JSX.Element {
  const { theme } = useWhiteLabel()

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const brandName = theme?.brand.name || 'KudoBit'
      const title = typeof children === 'string' ? children : ''
      
      document.title = suffix && title 
        ? `${title} | ${brandName}`
        : title || brandName
    }
  }, [children, theme, suffix])

  return <></>
}

export default WhiteLabelProvider