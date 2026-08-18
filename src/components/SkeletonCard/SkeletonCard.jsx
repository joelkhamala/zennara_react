import styles from './SkeletonCard.module.css'

/**
 * Generic skeleton card — use variant="property" (default) or variant="project"
 */
export default function SkeletonCard({ variant = 'property' }) {
  return (
    <div
      className={`${styles.card} ${variant === 'project' ? styles.project : ''}`}
      aria-hidden="true"
    >
      <div className={styles.image} />
      <div className={styles.body}>
        <div className={`${styles.line} ${styles.short}`} />
        <div className={`${styles.line} ${styles.title}`} />
        {variant === 'property' && (
          <>
            <div className={`${styles.line} ${styles.medium}`} />
            <div className={`${styles.line} ${styles.price}`} />
            <div className={styles.features}>
              <div className={`${styles.chip}`} />
              <div className={`${styles.chip}`} />
              <div className={`${styles.chip}`} />
            </div>
          </>
        )}
        {variant === 'project' && (
          <>
            <div className={`${styles.line} ${styles.medium}`} />
            <div className={`${styles.line} ${styles.medium}`} />
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Renders a grid of skeleton cards
 */
export function SkeletonGrid({ count = 6, variant = 'property' }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} variant={variant} />
      ))}
    </>
  )
}
