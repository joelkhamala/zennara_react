import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button/Button'
import LazyImage from '../components/LazyImage/LazyImage'
import { journalPosts, journalCategories } from '../data/properties'
import styles from './Journal.module.css'

export default function Journal() {
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'All') {
      return journalPosts
    }
    return journalPosts.filter(post => post.category === selectedCategory)
  }, [selectedCategory])

  const featuredPost = journalPosts[0]
  const regularPosts = filteredPosts.slice(selectedCategory === 'All' ? 1 : 0)

  return (
    <div className={styles.journal}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className="eyebrow">The Journal</p>
          <h1>Ideas worth <em>knowing.</em></h1>
          <p>
            Insights, market intelligence and perspectives on luxury real estate, 
            design and investment across East Africa.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className={styles.categoriesSection}>
        <div className={styles.categories}>
          {journalCategories.map((category) => (
            <button
              key={category}
              className={`${styles.categoryBtn} ${selectedCategory === category ? styles.active : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Post */}
      {selectedCategory === 'All' && (
        <section className={styles.featuredSection}>
          <Link to={`/journal/${featuredPost.id}`} className={styles.featuredPost}>
            <div className={styles.featuredImage}>
              <LazyImage src={featuredPost.img} alt={featuredPost.title} />
              <span className={styles.categoryBadge}>{featuredPost.category}</span>
            </div>
            <div className={styles.featuredContent}>
              <div className={styles.postMeta}>
                <span>{featuredPost.date}</span>
                <span>·</span>
                <span>{featuredPost.readTime}</span>
                <span>·</span>
                <span>{featuredPost.author}</span>
              </div>
              <h2>{featuredPost.title}</h2>
              <p>{featuredPost.excerpt}</p>
              <span className={styles.readMore}>Read Article →</span>
            </div>
          </Link>
        </section>
      )}

      {/* Posts Grid */}
      <section className={styles.postsSection}>
        <div className={styles.postsGrid}>
          {regularPosts.map((post) => (
            <Link key={post.id} to={`/journal/${post.id}`} className={styles.postCard}>
              <div className={styles.postImage}>
                <LazyImage src={post.img} alt={post.title} />
                <span className={styles.categoryBadge}>{post.category}</span>
              </div>
              <div className={styles.postContent}>
                <div className={styles.postMeta}>
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <div className={styles.postAuthor}>
                  <span>By {post.author}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {regularPosts.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📝</div>
            <h3>No articles found</h3>
            <p>Try selecting a different category</p>
            <Button variant="outline" onClick={() => setSelectedCategory('All')}>
              View All Articles
            </Button>
          </div>
        )}
      </section>

      {/* Newsletter CTA */}
      <section className={styles.newsletter}>
        <div className={styles.newsletterContent}>
          <p className="eyebrow">Stay Informed</p>
          <h2>Subscribe to our newsletter</h2>
          <p>
            Get the latest insights, market reports, and exclusive property 
            listings delivered to your inbox every month.
          </p>
          <form className={styles.newsletterForm}>
            <input
              type="email"
              placeholder="Enter your email address"
              required
            />
            <Button type="submit" variant="gold">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}
