import { useState, useRef, useEffect } from 'react'
import styles from './LazyImage.module.css'

/**
 * LazyImage — IntersectionObserver-based lazy loading with blur-up effect.
 *
 * Props:
 *   src        – full-resolution image URL
 *   alt        – alt text (required for accessibility)
 *   className  – optional extra class for the <img>
 *   wrapClass  – optional extra class for the wrapper <div>
 *   aspectRatio – e.g. "16/9", "4/3" — keeps layout stable before load
 */
export default function LazyImage({ src, alt, className = '', wrapClass = '', aspectRatio }) {
  const [isLoaded, setIsLoaded]     = useState(false)
  const [isVisible, setIsVisible]   = useState(false)
  const [hasError, setHasError]     = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    const el = imgRef.current
    if (!el) return

    // If already in viewport (e.g. top of page), load immediately
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }   // start loading 200 px before entering viewport
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const wrapStyle = aspectRatio ? { aspectRatio } : undefined

  return (
    <div
      ref={imgRef}
      className={`${styles.wrap} ${!isLoaded ? styles.skeleton : ''} ${wrapClass}`}
      style={wrapStyle}
    >
      {isVisible && !hasError && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`${styles.img} ${isLoaded ? styles.loaded : ''} ${className}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}
      {hasError && (
        <div className={styles.fallback} aria-label="Image unavailable">
          <span aria-hidden="true">🏠</span>
        </div>
      )}
    </div>
  )
}
