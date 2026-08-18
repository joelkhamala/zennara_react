import { useState, useEffect } from 'react'

/**
 * Custom hook for responsive media query matching
 * @param {string} query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns {boolean} - True if the media query matches
 */
export function useMediaQuery(query) {
  // Initialize state with current match status
  const [matches, setMatches] = useState(() => {
    // Check if window is available (SSR-safe)
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  })

  useEffect(() => {
    // Return early if window is not available (SSR)
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia(query)
    
    // Update state when media query match status changes
    const handleChange = (event) => {
      setMatches(event.matches)
    }

    // Set initial value
    setMatches(mediaQuery.matches)

    // Add event listener (modern browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)
    }

    // Cleanup listener on unmount
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [query])

  return matches
}

/**
 * Predefined breakpoint hooks for common screen sizes
 */

export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)')
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1025px)')
}

export function useIsSmallScreen() {
  return useMediaQuery('(max-width: 640px)')
}

export function useIsLargeScreen() {
  return useMediaQuery('(min-width: 1440px)')
}

export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

export function usePrefersDarkMode() {
  return useMediaQuery('(prefers-color-scheme: dark)')
}
