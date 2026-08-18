import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../Header/Header'
import Footer from '../Footer/Footer'
import Toast from '../Toast/Toast'
import styles from './Layout.module.css'

export default function Layout({ children }) {
  const location = useLocation()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        {children}
      </main>
      <Footer />
      <Toast />
    </div>
  )
}
