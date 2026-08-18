import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard/PropertyCard'
import SearchForm from '../components/SearchForm/SearchForm'
import Button from '../components/Button/Button'
import { properties } from '../data/properties'
import styles from './Listings.module.css'

export default function Listings() {
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    search: searchParams.get('location') || '',
    location: searchParams.get('location') || 'all',
    propertyType: searchParams.get('propertyType') || 'all',
    priceRange: searchParams.get('priceRange') || 'all',
    beds: searchParams.get('beds') || 'all'
  })
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  // Initialize filters from URL params on mount
  useEffect(() => {
    const urlFilters = {
      search: searchParams.get('location') || searchParams.get('search') || '',
      location: searchParams.get('location') || 'all',
      propertyType: searchParams.get('propertyType') || 'all',
      priceRange: searchParams.get('priceRange') || 'all',
      beds: searchParams.get('beds') || 'all'
    }
    setFilters(urlFilters)
  }, [searchParams])

  // Filter properties
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      // Search filter
      if (filters.search && !property.title.toLowerCase().includes(filters.search.toLowerCase()) &&
          !property.location.toLowerCase().includes(filters.search.toLowerCase()) &&
          !property.city.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }

      // Location filter
      if (filters.location !== 'all' && property.city !== filters.location) {
        return false
      }

      // Property type filter
      if (filters.propertyType !== 'all' && property.type !== filters.propertyType) {
        return false
      }

      // Price range filter
      if (filters.priceRange !== 'all') {
        const priceNum = parseInt(property.price.replace(/[^0-9]/g, ''))
        if (filters.priceRange === '0-50m' && priceNum >= 50) return false
        if (filters.priceRange === '50m-100m' && (priceNum < 50 || priceNum >= 100)) return false
        if (filters.priceRange === '100m-150m' && (priceNum < 100 || priceNum >= 150)) return false
        if (filters.priceRange === '150m+' && priceNum < 150) return false
      }

      // Bedrooms filter
      if (filters.beds !== 'all') {
        const bedsNum = parseInt(filters.beds)
        if (!property.beds || property.beds < bedsNum) {
          return false
        }
      }

      return true
    })
  }, [filters])

  // Sort properties
  const sortedProperties = useMemo(() => {
    const sorted = [...filteredProperties]

    switch (sortBy) {
      case 'newest':
        return sorted.reverse() // Assuming higher IDs are newer
      case 'price-low':
        return sorted.sort((a, b) => {
          const priceA = parseInt(a.price.replace(/[^0-9]/g, ''))
          const priceB = parseInt(b.price.replace(/[^0-9]/g, ''))
          return priceA - priceB
        })
      case 'price-high':
        return sorted.sort((a, b) => {
          const priceA = parseInt(a.price.replace(/[^0-9]/g, ''))
          const priceB = parseInt(b.price.replace(/[^0-9]/g, ''))
          return priceB - priceA
        })
      case 'beds':
        return sorted.sort((a, b) => (b.beds || 0) - (a.beds || 0))
      default:
        return sorted
    }
  }, [filteredProperties, sortBy])

  // Pagination
  const totalPages = Math.ceil(sortedProperties.length / itemsPerPage)
  const paginatedProperties = sortedProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page on filter change
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={styles.listings}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <img 
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1920&q=80" 
            alt="ZENNARA Managed Properties"
          />
        </div>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <p className="eyebrow">ZENNARA Managed Portfolio</p>
            <h1>Properties under <em>professional management.</em></h1>
            <p>
              Explore residential and commercial properties professionally managed by ZENNARA 
              across East Africa. Each property receives comprehensive property and facility 
              management oversight.
            </p>
          </div>
          <div className={styles.heroStat}>
            <strong>{properties.length}</strong>
            <span>Managed Properties</span>
          </div>
        </div>
      </section>

      {/* Listings Section */}
      <section className={styles.listingsSection}>
        {/* Search Form */}
        <SearchForm variant="inline" />

        {/* Results Bar */}
        <div className={styles.resultsBar}>
          <div className={styles.resultsCount}>
            Showing <strong>{paginatedProperties.length}</strong> of <strong>{sortedProperties.length}</strong> results
            {sortedProperties.length !== properties.length && (
              <span className={styles.filtered}> (filtered from {properties.length} total)</span>
            )}
          </div>

          <div className={styles.sortDropdown}>
            <label htmlFor="sort">Sort by:</label>
            <select 
              id="sort" 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="beds">Most Bedrooms</option>
            </select>
          </div>
        </div>

        {/* Property Grid */}
        {paginatedProperties.length > 0 ? (
          <>
            <div className={styles.propertyGrid}>
              {paginatedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  ←
                </button>
                
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1
                  // Show first, last, current, and adjacent pages
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={currentPage === page ? styles.active : ''}
                      >
                        {page}
                      </button>
                    )
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className={styles.ellipsis}>...</span>
                  }
                  return null
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <h3>No listings found</h3>
            <p>Try adjusting your search or filters to see more results</p>
            <Button variant="outline" onClick={() => handleFilterChange({
              search: '',
              location: 'all',
              propertyType: 'all',
              priceRange: 'all',
              beds: 'all'
            })}>
              Clear All Filters
            </Button>
          </div>
        )}
      </section>

      {/* Market Insights Section */}
      <section className={styles.insights}>
        <div className={styles.insightsContent}>
          <p className={`eyebrow ${styles.eyebrow}`}>Market Intelligence</p>
          <h2>Understanding the market</h2>
          <p>
            Our listings are updated in real-time to reflect current market conditions. 
            Get insights on pricing trends, neighborhood comparisons, and investment opportunities.
          </p>
          <div className={styles.insightsActions}>
            <Button to="/advisory" variant="gold">
              Market Analysis
            </Button>
            <Button to="/journal" variant="outline" theme="dark">
              Read Market Reports
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
