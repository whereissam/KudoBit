import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  style?: React.CSSProperties
  placeholder?: React.ReactNode
  fallback?: string
  onLoad?: () => void
  onError?: () => void
}

export function LazyImage({
  src,
  alt,
  className,
  style,
  placeholder,
  fallback = '/placeholder-image.png',
  onLoad,
  onError
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  return (
    <div 
      ref={imgRef}
      className={cn("relative overflow-hidden", className)}
      style={style}
    >
      {/* Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          {placeholder || (
            <div className="w-8 h-8 bg-muted-foreground/20 rounded animate-pulse" />
          )}
        </div>
      )}

      {/* Actual image - only load when in view */}
      {isInView && (
        <img
          src={hasError ? fallback : src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
        />
      )}
    </div>
  )
}

// Optimized avatar component
export function LazyAvatar({
  src,
  alt,
  size = 40,
  className
}: {
  src?: string
  alt: string
  size?: number
  className?: string
}) {
  return (
    <LazyImage
      src={src || `https://api.dicebear.com/7.x/avataaars/svg?seed=${alt}`}
      alt={alt}
      className={cn("rounded-full", className)}
      style={{ width: size, height: size }}
      placeholder={
        <div 
          className="bg-gradient-to-br from-morph-green-100 to-morph-purple-100 rounded-full"
          style={{ width: size, height: size }}
        />
      }
    />
  )
}