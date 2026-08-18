import { useEffect, useRef } from 'react'

/**
 * useScrollReveal — custom hook for revealing elements on scroll via IntersectionObserver
 *
 * @param {object} options
 * @param {number} options.threshold - 0..1 (default 0.1)
 * @param {string} options.rootMargin - e.g. '0px 0px -100px 0px' (default '0px')
 * @param {string} options.activeClass - CSS class to add when intersecting (default 'revealed')
 * @param {boolean} options.once - only reveal once (default true)
 * @returns {React.Ref} - ref to attach to element
 */
export function useScrollReveal({
  threshold = 0.1,
  rootMargin = '0px',
  activeClass = 'revealed',
  once = true,
} = {}) {
  const elementRef = useRef(null)
  const observerRef = useRef(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add(activeClass)
          if (once) observer.disconnect()
        } else {
          if (!once) element.classList.remove(activeClass)
        }
      },
      { threshold, rootMargin }
    )

    observerRef.current = observer
    observer.observe(element)

    return () => {
      observer?.disconnect()
    }
  }, [threshold, rootMargin, activeClass, once])

  return elementRef
}

/**
 * useStaggerReveal — reveal children with staggered delay
 */
export function useStaggerReveal({
  childSelector = ':scope > *',
  staggerMs = 100,
  threshold = 0.05,
} = {}) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const children = Array.from(container.querySelectorAll(childSelector))
    const observers = []

    children.forEach((child, index) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              child.classList.add('stagger-revealed')
            }, index * staggerMs)
            observer.disconnect()
          }
        },
        { threshold }
      )
      observer.observe(child)
      observers.push(observer)
    })

    return () => observers.forEach(o => o.disconnect())
  }, [childSelector, staggerMs, threshold])

  return containerRef
}
