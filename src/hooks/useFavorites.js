import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook for managing favorite/saved properties
 * Persists favorites to localStorage and provides methods to check and toggle saved status
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    // Initialize from localStorage on mount
    try {
      const saved = localStorage.getItem('zennara_favorites')
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error)
      return []
    }
  })

  // Persist to localStorage whenever favorites change
  useEffect(() => {
    try {
      localStorage.setItem('zennara_favorites', JSON.stringify(favorites))
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error)
    }
  }, [favorites])

  /**
   * Check if a property is saved/favorited
   * @param {number|string} propertyId - The ID of the property to check
   * @returns {boolean} - True if the property is in favorites
   */
  const isSaved = useCallback(
    (propertyId) => {
      return favorites.includes(Number(propertyId))
    },
    [favorites]
  )

  /**
   * Toggle the saved status of a property
   * @param {number|string} propertyId - The ID of the property to toggle
   */
  const toggleSave = useCallback((propertyId) => {
    const id = Number(propertyId)
    setFavorites((prev) => {
      if (prev.includes(id)) {
        // Remove from favorites
        return prev.filter((favId) => favId !== id)
      } else {
        // Add to favorites
        return [...prev, id]
      }
    })
  }, [])

  /**
   * Add a property to favorites
   * @param {number|string} propertyId - The ID of the property to add
   */
  const addFavorite = useCallback((propertyId) => {
    const id = Number(propertyId)
    setFavorites((prev) => {
      if (!prev.includes(id)) {
        return [...prev, id]
      }
      return prev
    })
  }, [])

  /**
   * Remove a property from favorites
   * @param {number|string} propertyId - The ID of the property to remove
   */
  const removeFavorite = useCallback((propertyId) => {
    const id = Number(propertyId)
    setFavorites((prev) => prev.filter((favId) => favId !== id))
  }, [])

  /**
   * Clear all favorites
   */
  const clearFavorites = useCallback(() => {
    setFavorites([])
  }, [])

  /**
   * Get count of favorited properties
   * @returns {number} - Number of properties in favorites
   */
  const favoritesCount = favorites.length

  return {
    favorites,
    isSaved,
    toggleSave,
    addFavorite,
    removeFavorite,
    clearFavorites,
    favoritesCount
  }
}
