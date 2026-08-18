import { Link } from 'react-router-dom'
import LazyImage from '../components/LazyImage/LazyImage'
import styles from './BlogCard.module.scss'

const BlogCard = ({ 
  id,
  image,
  tag,
  title,
  author,
  authorAvatar,
  date,
  category,
  featured = false,
  className = '',
  ...props 
}) => {
  return (
    <Link to={`/blog/${id}`} className={`${styles.blogCard} ${featured ? styles.featured : ''} ${className}`} {...props}>
      <div className={styles.cardImage}>
        <LazyImage 
          src={image} 
          alt={title}
          width={featured ? 800 : 400}
          height={featured ? 600 : 300}
        />
        
        {/* Category Badge */}
        {category && (
          <span className={styles.categoryBadge}>
            {category}
          </span>
        )}
      </div>
      
      <div className={styles.cardContent}>
        {/* Tag */}
        {tag && (
          <span className={styles.tag}>
            {tag}
          </span>
        )}
        
        {/* Title */}
        <h3 className={styles.title}>
          {title}
        </h3>
        
        {/* Meta Info */}
        <div className={styles.meta}>
          <div className={styles.author}>
            <div className={styles.authorAvatar}>
              <LazyImage 
                src={authorAvatar} 
                alt={author}
                width={32}
                height={32}
              />
            </div>
            <span className={styles.authorName}>{author}</span>
          </div>
          
          <div className={styles.date}>
            <span>{date}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default BlogCard