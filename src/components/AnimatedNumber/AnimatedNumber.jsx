import { useEffect, useRef, useState } from 'react'
import styles from './AnimatedNumber.module.css'

export default function AnimatedNumber({ value, prefix = '', suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const elementRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true)
            animateValue()
          }
        })
      },
      { threshold: 0.5 }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current)
      }
    }
  }, [hasAnimated])

  const animateValue = () => {
    const startTime = Date.now()
    const endValue = parseFloat(value)
    
    const animate = () => {
      const currentTime = Date.now()
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3)
      const currentValue = eased * endValue
      
      setCount(currentValue)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(endValue)
      }
    }
    
    requestAnimationFrame(animate)
  }

  const formatNumber = (num) => {
    // Format based on the original value format
    if (value % 1 !== 0) {
      // Has decimals
      return num.toFixed(1)
    }
    return Math.round(num).toLocaleString()
  }

  return (
    <span ref={elementRef} className={styles.animatedNumber}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  )
}
