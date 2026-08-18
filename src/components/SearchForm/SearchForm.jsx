import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../Button/Button'
import styles from './SearchForm.module.css'

export default function SearchForm({ variant = 'floating' }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    location: '',
    propertyType: 'any',
    priceRange: 'any',
    beds: 'any'
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Navigate to properties page with search params
    const params = new URLSearchParams()
    Object.entries(formData).forEach(([key, value]) => {
      if (value && value !== 'any') {
        params.append(key, value)
      }
    })
    navigate(`/properties?${params.toString()}`)
  }

  return (
    <form 
      className={`${styles.searchForm} ${variant === 'inline' ? styles.inline : styles.floating}`}
      onSubmit={handleSubmit}
    >
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            placeholder="City or neighbourhood"
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="propertyType">Property Type</label>
          <select
            id="propertyType"
            name="propertyType"
            value={formData.propertyType}
            onChange={handleChange}
          >
            <option value="any">Any Type</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="penthouse">Penthouse</option>
            <option value="land">Land</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="priceRange">Price Range</label>
          <select
            id="priceRange"
            name="priceRange"
            value={formData.priceRange}
            onChange={handleChange}
          >
            <option value="any">Any Price</option>
            <option value="0-50m">Under KES 50M</option>
            <option value="50m-100m">KES 50M - 100M</option>
            <option value="100m-150m">KES 100M - 150M</option>
            <option value="150m+">KES 150M+</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="beds">Bedrooms</label>
          <select
            id="beds"
            name="beds"
            value={formData.beds}
            onChange={handleChange}
          >
            <option value="any">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </div>
      </div>

      <div className={styles.formActions}>
        <Button type="submit" variant="gold" size="large">
          Search Properties
        </Button>
      </div>
    </form>
  )
}
