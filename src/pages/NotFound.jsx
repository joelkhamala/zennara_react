import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import Button from '../components/Button/Button'
import styles from './NotFound.module.css'

const QUICK_LINKS = [
  { to: '/properties', label: 'Browse Properties', icon: '🏡' },
  { to: '/listings',   label: 'View Listings',     icon: '📋' },
  { to: '/projects',   label: 'Explore Projects',  icon: '🏗️' },
  { to: '/contact',    label: 'Contact Us',         icon: '✉️' },
]

export default function NotFound() {
  useEffect(() => {
    document.title = '404 – Page Not Found | ZENNARA'
  }, [])

  return (
    <main className={styles.wrapper}>
      <div className={styles.inner}>
        {/* Decorative number */}
        <div className={styles.bigNumber} aria-hidden="true">404</div>

        <p className="eyebrow">Page Not Found</p>
        <h1 className={styles.heading}>
          We couldn't find <em>that page.</em>
        </h1>
        <p className={styles.subtext}>
          The page may have moved, been removed, or the URL might be mistyped.
          Here are some places to get you back on track.
        </p>

        {/* Quick links */}
        <nav className={styles.links} aria-label="Helpful links">
          {QUICK_LINKS.map(link => (
            <Link key={link.to} to={link.to} className={styles.linkCard}>
              <span className={styles.linkIcon} aria-hidden="true">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <Button to="/" variant="gold" size="large">
          Return Home
        </Button>
      </div>
    </main>
  )
}
