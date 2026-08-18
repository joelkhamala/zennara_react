import { Link } from 'react-router-dom'
import styles from './Button.module.css'

export default function Button({ 
  children, 
  variant = 'gold', 
  size = 'medium',
  theme,
  href,
  to,
  onClick,
  type = 'button',
  className = '',
  ...props 
}) {
  const buttonClass = `${styles.button} ${styles[variant]} ${styles[size]} ${className}`
  const dataTheme = theme ? { 'data-theme': theme } : {}

  // External link
  if (href) {
    return (
      <a href={href} className={buttonClass} {...dataTheme} {...props}>
        {children}
      </a>
    )
  }

  // Internal link (React Router)
  if (to) {
    return (
      <Link to={to} className={buttonClass} {...dataTheme} {...props}>
        {children}
      </Link>
    )
  }

  // Regular button
  return (
    <button 
      type={type}
      className={buttonClass}
      {...dataTheme}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}
