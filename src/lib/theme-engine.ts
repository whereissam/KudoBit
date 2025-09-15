// White-Label Theme Engine
// Complete theming system for enterprise clients

import { z } from 'zod'

// Theme Types
export interface ThemeConfig {
  id: string
  name: string
  organizationId: string
  isActive: boolean
  brand: BrandConfig
  colors: ColorPalette
  typography: TypographyConfig
  layout: LayoutConfig
  components: ComponentThemes
  assets: AssetConfig
  customCSS?: string
  createdAt: string
  updatedAt: string
}

export interface BrandConfig {
  name: string
  logo: {
    light: string
    dark: string
    favicon: string
    socialCard?: string
  }
  tagline?: string
  description?: string
  website?: string
  supportEmail?: string
  socialLinks?: {
    twitter?: string
    discord?: string
    instagram?: string
    youtube?: string
  }
}

export interface ColorPalette {
  primary: ColorShades
  secondary: ColorShades
  accent: ColorShades
  neutral: ColorShades
  semantic: SemanticColors
  background: BackgroundColors
  text: TextColors
  border: BorderColors
}

export interface ColorShades {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
}

export interface SemanticColors {
  success: ColorShades
  warning: ColorShades
  error: ColorShades
  info: ColorShades
}

export interface BackgroundColors {
  primary: string
  secondary: string
  tertiary: string
  surface: string
  overlay: string
}

export interface TextColors {
  primary: string
  secondary: string
  tertiary: string
  inverse: string
  muted: string
}

export interface BorderColors {
  light: string
  medium: string
  heavy: string
  focus: string
}

export interface TypographyConfig {
  fonts: {
    heading: FontConfig
    body: FontConfig
    mono: FontConfig
  }
  scales: {
    headings: Record<string, FontSize>
    body: Record<string, FontSize>
  }
  weights: Record<string, number>
  lineHeights: Record<string, number>
}

export interface FontConfig {
  family: string
  url?: string
  fallback: string[]
}

export interface FontSize {
  size: string
  lineHeight: string
  letterSpacing?: string
}

export interface LayoutConfig {
  maxWidth: string
  breakpoints: Record<string, string>
  spacing: Record<string, string>
  borderRadius: Record<string, string>
  shadows: Record<string, string>
  animations: {
    duration: Record<string, string>
    easing: Record<string, string>
  }
}

export interface ComponentThemes {
  button: ButtonTheme
  card: CardTheme
  form: FormTheme
  navigation: NavigationTheme
  footer: FooterTheme
  hero: HeroTheme
  pricing: PricingTheme
  creator: CreatorTheme
}

export interface ButtonTheme {
  variants: Record<string, ButtonVariant>
  sizes: Record<string, ButtonSize>
}

export interface ButtonVariant {
  background: string
  color: string
  border: string
  hover: {
    background: string
    color: string
    border: string
  }
}

export interface ButtonSize {
  padding: string
  fontSize: string
  borderRadius: string
}

export interface CardTheme {
  background: string
  border: string
  borderRadius: string
  shadow: string
  padding: string
}

export interface FormTheme {
  input: {
    background: string
    border: string
    borderRadius: string
    focus: {
      border: string
      shadow: string
    }
  }
  label: {
    color: string
    fontSize: string
    fontWeight: number
  }
}

export interface NavigationTheme {
  background: string
  border: string
  logo: {
    height: string
    width: string
  }
  menu: {
    color: string
    hover: {
      color: string
      background: string
    }
    active: {
      color: string
      background: string
    }
  }
}

export interface FooterTheme {
  background: string
  color: string
  border: string
  links: {
    color: string
    hover: {
      color: string
    }
  }
}

export interface HeroTheme {
  background: string
  overlay?: string
  title: {
    color: string
    fontSize: string
    fontWeight: number
  }
  subtitle: {
    color: string
    fontSize: string
  }
}

export interface PricingTheme {
  card: {
    background: string
    border: string
    featured: {
      background: string
      border: string
    }
  }
  price: {
    color: string
    fontSize: string
    fontWeight: number
  }
}

export interface CreatorTheme {
  card: {
    background: string
    border: string
    hover: {
      background: string
      transform: string
    }
  }
  avatar: {
    size: string
    borderRadius: string
    border: string
  }
}

export interface AssetConfig {
  domain?: string
  cdnUrl?: string
  images: {
    hero?: string
    background?: string
    pattern?: string
  }
  icons: {
    style: 'outlined' | 'filled' | 'rounded'
    library: 'heroicons' | 'lucide' | 'phosphor' | 'custom'
  }
}

// Theme Validation Schema
const themeConfigSchema = z.object({
  name: z.string().min(1),
  organizationId: z.string(),
  brand: z.object({
    name: z.string().min(1),
    logo: z.object({
      light: z.string().url(),
      dark: z.string().url(),
      favicon: z.string().url(),
      socialCard: z.string().url().optional()
    }),
    tagline: z.string().optional(),
    description: z.string().optional(),
    website: z.string().url().optional(),
    supportEmail: z.string().email().optional(),
    socialLinks: z.object({
      twitter: z.string().url().optional(),
      discord: z.string().url().optional(),
      instagram: z.string().url().optional(),
      youtube: z.string().url().optional()
    }).optional()
  }),
  colors: z.record(z.any()).optional(),
  customCSS: z.string().optional()
})

// Theme Engine Class
export class ThemeEngine {
  private themes: Map<string, ThemeConfig> = new Map()
  private activeThemes: Map<string, string> = new Map() // organizationId -> themeId

  constructor() {
    this.initializeDefaultThemes()
  }

  // Theme Management
  async createTheme(data: Partial<ThemeConfig>): Promise<ThemeConfig> {
    const validated = themeConfigSchema.parse(data)
    
    const theme: ThemeConfig = {
      id: `theme_${crypto.randomUUID()}`,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...validated,
      colors: (validated.colors as ColorPalette) || this.getDefaultColors(),
      typography: this.getDefaultTypography(),
      layout: this.getDefaultLayout(),
      components: this.getDefaultComponents(),
      assets: this.getDefaultAssets()
    }

    this.themes.set(theme.id, theme)
    return theme
  }

  async updateTheme(themeId: string, updates: Partial<ThemeConfig>): Promise<ThemeConfig> {
    const theme = this.themes.get(themeId)
    if (!theme) {
      throw new Error(`Theme ${themeId} not found`)
    }

    const updated = {
      ...theme,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.themes.set(themeId, updated)
    return updated
  }

  async deleteTheme(themeId: string): Promise<void> {
    const theme = this.themes.get(themeId)
    if (!theme) {
      throw new Error(`Theme ${themeId} not found`)
    }

    // Don't allow deletion of active themes
    if (theme.isActive) {
      throw new Error('Cannot delete active theme')
    }

    this.themes.delete(themeId)
  }

  async getTheme(themeId: string): Promise<ThemeConfig | null> {
    return this.themes.get(themeId) || null
  }

  async listThemes(organizationId?: string): Promise<ThemeConfig[]> {
    const themes = Array.from(this.themes.values())
    
    if (organizationId) {
      return themes.filter(theme => theme.organizationId === organizationId)
    }
    
    return themes
  }

  // Theme Activation
  async activateTheme(organizationId: string, themeId: string): Promise<void> {
    const theme = this.themes.get(themeId)
    if (!theme || theme.organizationId !== organizationId) {
      throw new Error('Theme not found or access denied')
    }

    // Deactivate current theme
    const currentThemeId = this.activeThemes.get(organizationId)
    if (currentThemeId) {
      const currentTheme = this.themes.get(currentThemeId)
      if (currentTheme) {
        currentTheme.isActive = false
      }
    }

    // Activate new theme
    theme.isActive = true
    this.activeThemes.set(organizationId, themeId)
  }

  async getActiveTheme(organizationId: string): Promise<ThemeConfig | null> {
    const themeId = this.activeThemes.get(organizationId)
    if (!themeId) {
      return this.getDefaultTheme()
    }

    return this.themes.get(themeId) || this.getDefaultTheme()
  }

  // CSS Generation
  generateCSS(theme: ThemeConfig): string {
    const css = `
/* Generated Theme: ${theme.name} */
:root {
  /* Colors */
  ${this.generateColorVariables(theme.colors)}
  
  /* Typography */
  ${this.generateTypographyVariables(theme.typography)}
  
  /* Layout */
  ${this.generateLayoutVariables(theme.layout)}
}

/* Component Styles */
${this.generateComponentStyles(theme.components)}

/* Custom CSS */
${theme.customCSS || ''}
`

    return this.minifyCSS(css)
  }

  private generateColorVariables(colors: ColorPalette): string {
    let css = ''
    
    // Primary colors
    for (const [shade, value] of Object.entries(colors.primary)) {
      css += `--color-primary-${shade}: ${value};\n  `
    }
    
    // Secondary colors
    for (const [shade, value] of Object.entries(colors.secondary)) {
      css += `--color-secondary-${shade}: ${value};\n  `
    }
    
    // Background colors
    for (const [key, value] of Object.entries(colors.background)) {
      css += `--color-bg-${key}: ${value};\n  `
    }
    
    // Text colors
    for (const [key, value] of Object.entries(colors.text)) {
      css += `--color-text-${key}: ${value};\n  `
    }
    
    return css
  }

  private generateTypographyVariables(typography: TypographyConfig): string {
    let css = ''
    
    // Font families
    css += `--font-heading: ${typography.fonts.heading.family}, ${typography.fonts.heading.fallback.join(', ')};\n  `
    css += `--font-body: ${typography.fonts.body.family}, ${typography.fonts.body.fallback.join(', ')};\n  `
    css += `--font-mono: ${typography.fonts.mono.family}, ${typography.fonts.mono.fallback.join(', ')};\n  `
    
    // Font sizes
    for (const [key, size] of Object.entries(typography.scales.headings)) {
      css += `--text-${key}: ${size.size};\n  `
      css += `--text-${key}-lh: ${size.lineHeight};\n  `
    }
    
    return css
  }

  private generateLayoutVariables(layout: LayoutConfig): string {
    let css = ''
    
    css += `--max-width: ${layout.maxWidth};\n  `
    
    // Spacing
    for (const [key, value] of Object.entries(layout.spacing)) {
      css += `--spacing-${key}: ${value};\n  `
    }
    
    // Border radius
    for (const [key, value] of Object.entries(layout.borderRadius)) {
      css += `--radius-${key}: ${value};\n  `
    }
    
    return css
  }

  private generateComponentStyles(components: ComponentThemes): string {
    return `
/* Button Styles */
.btn {
  font-family: var(--font-body);
  border-radius: var(--radius-md);
  transition: all 150ms ease;
}

.btn-primary {
  background-color: var(--color-primary-500);
  color: white;
  border: 1px solid var(--color-primary-500);
}

.btn-primary:hover {
  background-color: var(--color-primary-600);
  border-color: var(--color-primary-600);
}

/* Card Styles */
.card {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
}

/* Form Styles */
.form-input {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  padding: var(--spacing-3);
  font-family: var(--font-body);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}
`
  }

  private minifyCSS(css: string): string {
    return css
      .replace(/\s+/g, ' ')
      .replace(/;\s*}/g, '}')
      .replace(/{\s*/g, '{')
      .trim()
  }

  // Font Loading
  generateFontImports(theme: ThemeConfig): string {
    const imports: string[] = []
    
    if (theme.typography.fonts.heading.url) {
      imports.push(`@import url('${theme.typography.fonts.heading.url}');`)
    }
    
    if (theme.typography.fonts.body.url) {
      imports.push(`@import url('${theme.typography.fonts.body.url}');`)
    }
    
    if (theme.typography.fonts.mono.url) {
      imports.push(`@import url('${theme.typography.fonts.mono.url}');`)
    }
    
    return imports.join('\n')
  }

  // Theme Presets
  private initializeDefaultThemes(): void {
    const defaultTheme = this.createDefaultTheme()
    this.themes.set(defaultTheme.id, defaultTheme)
  }

  private createDefaultTheme(): ThemeConfig {
    return {
      id: 'theme_default',
      name: 'KudoBit Default',
      organizationId: 'default',
      isActive: true,
      brand: {
        name: 'KudoBit',
        logo: {
          light: '/assets/logo-light.svg',
          dark: '/assets/logo-dark.svg',
          favicon: '/assets/favicon.ico'
        },
        tagline: 'Empowering Creator Economy',
        description: 'Digital perks and creator monetization platform'
      },
      colors: this.getDefaultColors(),
      typography: this.getDefaultTypography(),
      layout: this.getDefaultLayout(),
      components: this.getDefaultComponents(),
      assets: this.getDefaultAssets(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  private getDefaultTheme(): ThemeConfig {
    return this.themes.get('theme_default')!
  }

  private getDefaultColors(): ColorPalette {
    return {
      primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e'
      },
      secondary: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a'
      },
      accent: {
        50: '#fdf4ff',
        100: '#fae8ff',
        200: '#f5d0fe',
        300: '#f0abfc',
        400: '#e879f9',
        500: '#d946ef',
        600: '#c026d3',
        700: '#a21caf',
        800: '#86198f',
        900: '#701a75'
      },
      neutral: {
        50: '#fafafa',
        100: '#f4f4f5',
        200: '#e4e4e7',
        300: '#d4d4d8',
        400: '#a1a1aa',
        500: '#71717a',
        600: '#52525b',
        700: '#3f3f46',
        800: '#27272a',
        900: '#18181b'
      },
      semantic: {
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d'
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f'
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d'
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a'
        }
      },
      background: {
        primary: '#ffffff',
        secondary: '#f8fafc',
        tertiary: '#f1f5f9',
        surface: '#ffffff',
        overlay: 'rgba(0, 0, 0, 0.5)'
      },
      text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        inverse: '#ffffff',
        muted: '#94a3b8'
      },
      border: {
        light: '#e2e8f0',
        medium: '#cbd5e1',
        heavy: '#94a3b8',
        focus: '#0ea5e9'
      }
    }
  }

  private getDefaultTypography(): TypographyConfig {
    return {
      fonts: {
        heading: {
          family: 'Inter',
          url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
          fallback: ['system-ui', '-apple-system', 'sans-serif']
        },
        body: {
          family: 'Inter',
          url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
          fallback: ['system-ui', '-apple-system', 'sans-serif']
        },
        mono: {
          family: 'JetBrains Mono',
          url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap',
          fallback: ['Consolas', 'Monaco', 'monospace']
        }
      },
      scales: {
        headings: {
          'xs': { size: '0.75rem', lineHeight: '1rem' },
          'sm': { size: '0.875rem', lineHeight: '1.25rem' },
          'base': { size: '1rem', lineHeight: '1.5rem' },
          'lg': { size: '1.125rem', lineHeight: '1.75rem' },
          'xl': { size: '1.25rem', lineHeight: '1.75rem' },
          '2xl': { size: '1.5rem', lineHeight: '2rem' },
          '3xl': { size: '1.875rem', lineHeight: '2.25rem' },
          '4xl': { size: '2.25rem', lineHeight: '2.5rem' },
          '5xl': { size: '3rem', lineHeight: '1' },
          '6xl': { size: '3.75rem', lineHeight: '1' }
        },
        body: {
          'xs': { size: '0.75rem', lineHeight: '1rem' },
          'sm': { size: '0.875rem', lineHeight: '1.25rem' },
          'base': { size: '1rem', lineHeight: '1.5rem' },
          'lg': { size: '1.125rem', lineHeight: '1.75rem' },
          'xl': { size: '1.25rem', lineHeight: '1.75rem' }
        }
      },
      weights: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeights: {
        none: 1,
        tight: 1.25,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2
      }
    }
  }

  private getDefaultLayout(): LayoutConfig {
    return {
      maxWidth: '1200px',
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      },
      spacing: {
        '0': '0px',
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem'
      },
      borderRadius: {
        none: '0px',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
      },
      animations: {
        duration: {
          fast: '150ms',
          normal: '300ms',
          slow: '500ms'
        },
        easing: {
          ease: 'ease',
          'ease-in': 'ease-in',
          'ease-out': 'ease-out',
          'ease-in-out': 'ease-in-out'
        }
      }
    }
  }

  private getDefaultComponents(): ComponentThemes {
    return {
      button: {
        variants: {
          primary: {
            background: 'var(--color-primary-500)',
            color: 'white',
            border: 'var(--color-primary-500)',
            hover: {
              background: 'var(--color-primary-600)',
              color: 'white',
              border: 'var(--color-primary-600)'
            }
          },
          secondary: {
            background: 'transparent',
            color: 'var(--color-primary-500)',
            border: 'var(--color-primary-500)',
            hover: {
              background: 'var(--color-primary-50)',
              color: 'var(--color-primary-600)',
              border: 'var(--color-primary-600)'
            }
          }
        },
        sizes: {
          sm: {
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            borderRadius: 'var(--radius-md)'
          },
          md: {
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            borderRadius: 'var(--radius-md)'
          },
          lg: {
            padding: '1rem 2rem',
            fontSize: '1.125rem',
            borderRadius: 'var(--radius-lg)'
          }
        }
      },
      card: {
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-light)',
        borderRadius: 'var(--radius-lg)',
        shadow: 'var(--shadow-md)',
        padding: 'var(--spacing-6)'
      },
      form: {
        input: {
          background: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border-medium)',
          borderRadius: 'var(--radius-md)',
          focus: {
            border: 'var(--color-primary-500)',
            shadow: '0 0 0 3px var(--color-primary-100)'
          }
        },
        label: {
          color: 'var(--color-text-primary)',
          fontSize: '0.875rem',
          fontWeight: 500
        }
      },
      navigation: {
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-light)',
        logo: {
          height: '2rem',
          width: 'auto'
        },
        menu: {
          color: 'var(--color-text-secondary)',
          hover: {
            color: 'var(--color-text-primary)',
            background: 'var(--color-bg-secondary)'
          },
          active: {
            color: 'var(--color-primary-500)',
            background: 'var(--color-primary-50)'
          }
        }
      },
      footer: {
        background: 'var(--color-bg-secondary)',
        color: 'var(--color-text-secondary)',
        border: '1px solid var(--color-border-light)',
        links: {
          color: 'var(--color-text-secondary)',
          hover: {
            color: 'var(--color-primary-500)'
          }
        }
      },
      hero: {
        background: 'var(--color-bg-primary)',
        title: {
          color: 'var(--color-text-primary)',
          fontSize: '3rem',
          fontWeight: 700
        },
        subtitle: {
          color: 'var(--color-text-secondary)',
          fontSize: '1.25rem'
        }
      },
      pricing: {
        card: {
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-light)',
          featured: {
            background: 'var(--color-bg-surface)',
            border: '2px solid var(--color-primary-500)'
          }
        },
        price: {
          color: 'var(--color-text-primary)',
          fontSize: '2rem',
          fontWeight: 700
        }
      },
      creator: {
        card: {
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-light)',
          hover: {
            background: 'var(--color-bg-surface)',
            transform: 'translateY(-2px)'
          }
        },
        avatar: {
          size: '4rem',
          borderRadius: 'var(--radius-full)',
          border: '2px solid var(--color-border-light)'
        }
      }
    }
  }

  private getDefaultAssets(): AssetConfig {
    return {
      domain: 'kudobit.com',
      cdnUrl: 'https://cdn.kudobit.com',
      images: {
        hero: '/assets/hero-bg.jpg',
        background: '/assets/bg-pattern.svg'
      },
      icons: {
        style: 'outlined',
        library: 'heroicons'
      }
    }
  }
}

// Export singleton
export const themeEngine = new ThemeEngine()