import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={styles.brand}>
          <img 
            src="/assets/logos/zennara_logo_white.png" 
            alt="ZENNARA" 
            className={styles.logo}
          />
          <p className={styles.tagline}>Property & Facility Management.<br />East Africa.</p>
        </div>

        <div className={styles.footerSection}>
          <h4>Services</h4>
          <div className={styles.footerLinks}>
            <Link to="/property-management">Property Management</Link>
            <Link to="/facility-management">Facility Management</Link>
            <Link to="/securerent">SecureRent</Link>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h4>Company</h4>
          <div className={styles.footerLinks}>
            <Link to="/properties">Managed Portfolio</Link>
            <Link to="/about">About</Link>
            <Link to="/journal">Insights</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h4>Client Access</h4>
          <div className={styles.footerLinks}>
            <Link to="/portal">Client Portal</Link>
            <Link to="/contact">Request Proposal</Link>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h4>East Africa</h4>
          <div className={styles.footerLinks}>
            <span className={styles.footerText}>Kenya</span>
            <span className={styles.footerText}>Uganda</span>
            <span className={styles.footerText}>Tanzania</span>
            <span className={styles.footerText}>Rwanda</span>
          </div>
        </div>

        <div className={styles.footerSocial}>
          <h4>Connect</h4>
          <a href="https://wa.me/254789115737" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a href="mailto:info@zennarafp.com">Email</a>
          <a href="tel:+254789115737">Phone</a>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <span>© {currentYear} ZENNARA LTD. All rights reserved.</span>
        <span><a href="#privacy" style={{textDecoration: 'none', color: 'inherit'}}>Privacy</a> · <a href="#terms" style={{textDecoration: 'none', color: 'inherit'}}>Terms</a></span>
        <span>info@zennarafp.com · +254 789 115737</span>
      </div>
    </footer>
  )
}
