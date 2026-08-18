import styles from './PageLoader.module.css'

export default function PageLoader() {
  return (
    <div className={styles.wrapper} aria-label="Loading page" role="status">
      <div className={styles.spinner}>
        <div className={styles.ring}></div>
        <div className={styles.logo}>Z</div>
      </div>
    </div>
  )
}
