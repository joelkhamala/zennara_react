import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import styles from './Header.module.css'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`} id="siteHeader">
        <Link to="/" className={styles.brand}>
          <img src="/assets/logos/zennara_logo.png" alt="ZENNARA" className={styles.logo} />
        </Link>

        <nav className={styles.desktopNav}>
          <div 
            className={styles.navDropdown}
            onMouseEnter={() => setServicesDropdownOpen(true)}
            onMouseLeave={() => setServicesDropdownOpen(false)}
          >
            <button className={styles.navDropdownBtn}>
              Services
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <div className={`${styles.navDropdownMenu} ${servicesDropdownOpen ? styles.open : ''}`}>
              <NavLink to="/property-management">Property Management</NavLink>
              <NavLink to="/facility-management">Facility Management</NavLink>
            </div>
          </div>
          <NavLink to="/securerent" className={({ isActive }) => isActive ? styles.active : ''}>
            SecureRent
          </NavLink>
          <NavLink to="/properties" className={({ isActive }) => isActive ? styles.active : ''}>
            Managed Properties
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? styles.active : ''}>
            About
          </NavLink>
          <NavLink to="/journal" className={({ isActive }) => isActive ? styles.active : ''}>
            Insights
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? styles.active : ''}>
            Contact
          </NavLink>
          <NavLink to="/portal" className={({ isActive }) => isActive ? styles.active : ''}>
            Portals
          </NavLink>
        </nav>

        <div className={styles.headerActions}>
          <Link to="/contact" className={styles.ctaBtn}>
            Request Proposal
          </Link>
          <button 
            className={`${styles.menuToggle} ${mobileMenuOpen ? styles.open : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ''}`}>
        <div className={styles.mobileMenuSection}>
          <div className={styles.mobileMenuLabel}>Services</div>
          <NavLink to="/property-management" onClick={closeMobileMenu}>Property Management</NavLink>
          <NavLink to="/facility-management" onClick={closeMobileMenu}>Facility Management</NavLink>
        </div>
        <NavLink to="/securerent" onClick={closeMobileMenu}>SecureRent</NavLink>
        <NavLink to="/properties" onClick={closeMobileMenu}>Managed Properties</NavLink>
        <NavLink to="/about" onClick={closeMobileMenu}>About</NavLink>
        <NavLink to="/journal" onClick={closeMobileMenu}>Insights</NavLink>
        <NavLink to="/contact" onClick={closeMobileMenu}>Contact</NavLink>
        <NavLink to="/portal" onClick={closeMobileMenu}>Portals</NavLink>
        <Link to="/contact" className={styles.mobileCtaBtn} onClick={closeMobileMenu}>
          Request Proposal
        </Link>
      </div>
    </>
  )
}
