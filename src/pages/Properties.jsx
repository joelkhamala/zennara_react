import { useState, useMemo } from 'react'
import PropertyCard from '../components/PropertyCard/PropertyCard'
import FilterBar from '../components/FilterBar/FilterBar'
import Button from '../components/Button/Button'
import { properties } from '../data/properties'
import styles from './Properties.module.css'

export default function Properties() {
  const [filters, setFilters] = useState({
    search: '',
    location: 'all',
    propertyType: 'all',
    priceRange: 'all',
    beds: 'all'
  })
  const [sortBy, setSortBy] = useState('featured')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  // Filter properties
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      // Search filter - improved to search across multiple fields
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const matchesTitle = property.title.toLowerCase().includes(searchTerm)
        const matchesLocation = property.location.toLowerCase().includes(searchTerm)
        const matchesDescription = property.description.toLowerCase().includes(searchTerm)
        const matchesCity = property.city.toLowerCase().includes(searchTerm)
        
        if (!matchesTitle && !matchesLocation && !matchesDescription && !matchesCity) {
          return false
        }
      }

      // Location filter
      if (filters.location !== 'all' && property.city !== filters.location) {
        return false
      }

      // Property type filter
      if (filters.propertyType !== 'all' && property.type !== filters.propertyType) {
        return false
      }

      // Price range filter - updated for rental prices (in thousands)
      if (filters.priceRange !== 'all') {
        const priceNum = parseInt(property.price.replace(/[^0-9]/g, '')) / 1000 // Convert to thousands
        if (filters.priceRange === '0-150k' && priceNum >= 150) return false
        if (filters.priceRange === '150k-300k' && (priceNum < 150 || priceNum >= 300)) return false
        if (filters.priceRange === '300k-500k' && (priceNum < 300 || priceNum >= 500)) return false
        if (filters.priceRange === '500k+' && priceNum < 500) return false
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
      case 'area':
        return sorted.sort((a, b) => {
          const areaA = parseInt(a.area.replace(/[^0-9]/g, ''))
          const areaB = parseInt(b.area.replace(/[^0-9]/g, ''))
          return areaB - areaA
        })
      case 'featured':
      default:
        return sorted
    }
  }, [filteredProperties, sortBy])

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  return (
    <div className={styles.properties}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <img 
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80" 
            alt="Luxury properties"
          />
        </div>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>FEATURED COLLECTION</p>
            <h1>
              Discover your next <em>exceptional</em> home.
            </h1>
            <p>
              A curated selection of the finest properties across East Africa's most 
              prestigious addresses. Each home has been chosen for its exceptional design, 
              location, and lifestyle offering.
            </p>
          </div>
          <div className={styles.heroStat}>
            <strong>{properties.length}</strong>
            <span>CURATED PROPERTIES</span>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className={styles.propertiesSection}>
        {/* Filters */}
        <FilterBar onFilterChange={handleFilterChange} initialFilters={filters} />

        {/* Results Bar */}
        <div className={styles.resultsBar}>
          <div className={styles.resultsCount}>
            Showing <strong>{sortedProperties.length}</strong> of <strong>{properties.length}</strong> properties
          </div>

          <div className={styles.resultsControls}>
            <div className={styles.sortDropdown}>
              <label htmlFor="sort">Sort by:</label>
              <select 
                id="sort" 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="beds">Most Bedrooms</option>
                <option value="area">Largest Area</option>
              </select>
            </div>

            <div className={styles.viewToggle}>
              <button 
                className={viewMode === 'grid' ? styles.active : ''}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                ⊞
              </button>
              <button 
                className={viewMode === 'list' ? styles.active : ''}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        {/* Property Grid */}
        {sortedProperties.length > 0 ? (
          <div className={`${styles.propertyGrid} ${viewMode === 'list' ? styles.listView : ''}`}>
            {sortedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏠</div>
            <h3>No properties match your search</h3>
            <p>
              {filters.search && `No results for "${filters.search}"`}
              {!filters.search && filters.location !== 'all' && `No properties in ${filters.location}`}
              {!filters.search && filters.location === 'all' && 'Try adjusting your filters to see more results'}
            </p>
            <div className={styles.emptyActions}>
              <Button variant="outline" onClick={() => handleFilterChange({
                search: '',
                location: 'all',
                propertyType: 'all',
                priceRange: 'all',
                beds: 'all'
              })}>
                Clear All Filters
              </Button>
              <Button variant="text" to="/advisory">
                Contact Our Advisors
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <p className="eyebrow">CAN'T FIND WHAT YOU'RE LOOKING FOR?</p>
          <h2>We have more</h2>
          <p>
            Many of our finest properties are available exclusively to registered tenants and partners. 
            Get in touch to access our full portfolio including off-market opportunities.
          </p>
          <div className={styles.ctaActions}>
            <Button to="/contact" variant="gold">
              Contact Us
            </Button>
            <Button to="/advisory" variant="outline" theme="dark">
              Advisory Services
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
