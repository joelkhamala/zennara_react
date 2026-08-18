import { Link } from 'react-router-dom'
import { useState } from 'react'
import LazyImage from '../LazyImage/LazyImage'
import styles from './PropertyCard.module.css'

export default function PropertyCard({ property }) {
  const [isSaved, setIsSaved] = useState(false)

  const handleSaveClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsSaved(!isSaved)
  }

  return (
    <Link to={`/property/${property.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <LazyImage
          src={property.img}
          alt={property.title}
        />
        <div className={styles.badges}>
          {property.tag && (
            <span className={styles.tag}>{property.tag}</span>
          )}
          <span className={styles.managedBadge}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 12l2 2 4-4"></path>
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            ZENNARA Managed
          </span>
        </div>
        <button 
          className={`${styles.saveBtn} ${isSaved ? styles.saved : ''}`}
          onClick={handleSaveClick}
          aria-label={isSaved ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isSaved ? '♥' : '♡'}
        </button>
      </div>
      <div className={styles.body}>
        <div className={styles.location}>
          {property.location} · {property.city.charAt(0).toUpperCase() + property.city.slice(1)}
        </div>
        <h3>{property.title}</h3>
        {property.description && (
          <p className={styles.description}>{property.description}</p>
        )}
        <div className={styles.price}>{property.price}</div>
        {property.beds && (
          <div className={styles.features}>
            <span>{property.beds} Beds</span>
            <span>·</span>
            <span>{property.baths} Baths</span>
            <span>·</span>
            <span>{property.area}</span>
          </div>
        )}
        {/* <div className={styles.management}>
          <span className={styles.managementItem}>Property Management</span>
          <span className={styles.managementItem}>Facility Management</span>
        </div> */}
      </div>
    </Link>
  )
}
