import { Link } from 'react-router-dom'
import { useState } from 'react'
import LazyImage from '../LazyImage/LazyImage'
import styles from './ProjectCard.module.css'

export default function ProjectCard({ project }) {
  const [isSaved, setIsSaved] = useState(false)

  const handleSaveClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsSaved(!isSaved)
  }

  const getStatusClass = () => {
    switch (project.status) {
      case 'pre-launch':
        return styles.preLaunch
      case 'selling':
        return styles.selling
      case 'investment':
        return styles.investment
      case 'completed':
        return styles.completed
      default:
        return ''
    }
  }

  return (
    <Link to={`/projects/${project.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <LazyImage
          src={project.img}
          alt={project.title}
        />
        <span className={`${styles.status} ${getStatusClass()}`}>
          {project.statusLabel}
        </span>
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
          {project.location} · {project.city.charAt(0).toUpperCase() + project.city.slice(1)}
        </div>
        <h3>{project.title}</h3>
        <p className={styles.description}>{project.description}</p>
        <div className={styles.meta}>
          <span>
            <strong>{project.units}</strong> Units
          </span>
          <span>
            <strong>{project.unitsAvailable}</strong> Available
          </span>
          <span>
            From <strong>{project.priceFrom}</strong>
          </span>
          <span>
            <strong>{project.roi}</strong> Projected ROI
          </span>
          <span>
            {project.completionDate}
          </span>
        </div>
      </div>
    </Link>
  )
}
