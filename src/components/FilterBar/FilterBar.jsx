import { useState, useEffect } from 'react'
import Button from '../Button/Button'
import styles from './FilterBar.module.css'

export default function FilterBar({ onFilterChange, initialFilters = {} }) {
  const [filters, setFilters] = useState({
    search: '',
    location: 'all',
    propertyType: 'all',
    priceRange: 'all',
    beds: 'all',
    ...initialFilters
  })
  const [searchActive, setSearchActive] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    const newFilters = {
      ...filters,
      [name]: value
    }
    setFilters(newFilters)
  }

  const handleSearchChange = (e) => {
    const { value } = e.target
    const newFilters = {
      ...filters,
      search: value
    }
    setFilters(newFilters)
  }

  const handleClearSearch = () => {
    const newFilters = {
      ...filters,
      search: ''
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleApply = () => {
    onFilterChange(filters)
  }

  const handleReset = () => {
    const resetFilters = {
      search: '',
      location: 'all',
      propertyType: 'all',
      priceRange: 'all',
      beds: 'all'
    }
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  // Auto-apply on change (optional)
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange(filters)
    }, 300) // Debounce search input
    return () => clearTimeout(timer)
  }, [filters])

  return (
    <div className={styles.filterBar}>
      <div className={styles.filterGrid}>
        <div className={`${styles.filterGroup} ${styles.searchGroup}`}>
          <label htmlFor="search">Search Properties</label>
          <div className={styles.searchInputWrapper}>
            <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              id="search"
              name="search"
              placeholder="Search by name, location, or keyword..."
              value={filters.search}
              onChange={handleSearchChange}
              onFocus={() => setSearchActive(true)}
              onBlur={() => setSearchActive(false)}
            />
            {filters.search && (
              <button 
                className={styles.clearSearch}
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="location">Location</label>
          <select
            id="location"
            name="location"
            value={filters.location}
            onChange={handleChange}
          >
            <option value="all">All Locations</option>
            <option value="nairobi">Nairobi</option>
            <option value="mombasa">Mombasa</option>
            <option value="nakuru">Nakuru</option>
            <option value="nanyuki">Nanyuki</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="propertyType">Property Type</label>
          <select
            id="propertyType"
            name="propertyType"
            value={filters.propertyType}
            onChange={handleChange}
          >
            <option value="all">All Types</option>
            <option value="house">House</option>
            <option value="villa">Villa</option>
            <option value="apartment">Apartment</option>
            <option value="penthouse">Penthouse</option>
            <option value="land">Land</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="priceRange">Monthly Rent</label>
          <select
            id="priceRange"
            name="priceRange"
            value={filters.priceRange}
            onChange={handleChange}
          >
            <option value="all">All Prices</option>
            <option value="0-150k">Under KES 150K</option>
            <option value="150k-300k">KES 150K - 300K</option>
            <option value="300k-500k">KES 300K - 500K</option>
            <option value="500k+">KES 500K+</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="beds">Bedrooms</label>
          <select
            id="beds"
            name="beds"
            value={filters.beds}
            onChange={handleChange}
          >
            <option value="all">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </div>
      </div>

      <div className={styles.filterActions}>
        <Button variant="text" size="small" onClick={handleReset}>
          Reset Filters
        </Button>
      </div>
    </div>
  )
}
