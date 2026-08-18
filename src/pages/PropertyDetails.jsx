import { useParams, Link, Navigate } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { properties } from '../data/properties'
import Button from '../components/Button/Button'
import LazyImage from '../components/LazyImage/LazyImage'
import SEO from '../components/SEO/SEO'
import { useForm } from '../hooks/useForm'
import { formValidations } from '../utils/formValidation'
import { propertyService } from '../services/api'
import { useFavorites } from '../hooks/useFavorites'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './PropertyDetails.module.css'

export default function PropertyDetails() {
  const { id } = useParams()
  const [activeImage, setActiveImage] = useState(0)
  const [isInquiryOpen, setIsInquiryOpen] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isViewingScheduled, setIsViewingScheduled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [property, setProperty] = useState(null)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const modalRef = useRef(null)
  const openBtnRef = useRef(null)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(max-width: 1024px)')
  const { isSaved, toggleSave } = useFavorites()

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      setIsLoading(true)
      try {
        const data = properties.find(p => p.id === parseInt(id))
        setProperty(data)
      } catch (error) {
        console.error('Error fetching property:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProperty()
  }, [id])

  // Inquiry form with modern validation
  const inquiryForm = useForm({
    initialValues: { 
      name: '', 
      email: '', 
      phone: '', 
      message: '',
      preferredContact: 'email',
      preferredTime: 'any'
    },
    validations: formValidations.inquiry,
    onSubmit: async (values, { resetForm }) => {
      try {
        await propertyService.submitInquiry({ 
          ...values, 
          propertyId: property?.id,
          propertyTitle: property?.title
        })
        setIsSubmitted(true)
        setTimeout(() => {
          setIsInquiryOpen(false)
          setIsSubmitted(false)
          resetForm()
          openBtnRef.current?.focus()
        }, 3000)
      } catch (error) {
        console.error('Inquiry submission error:', error)
      }
    },
  })

  // Smooth scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  // Enhanced focus trap
  useEffect(() => {
    if (!isInquiryOpen) return
    
    const modal = modalRef.current
    if (!modal) return
    
    const focusable = modal.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    
    setTimeout(() => first?.focus(), 50)

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsInquiryOpen(false)
        openBtnRef.current?.focus()
      }
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === first || document.activeElement === modal) {
            e.preventDefault()
            last?.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first?.focus()
          }
        }
      }
    }
    
    modal.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    
    return () => {
      modal.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isInquiryOpen])

  // Memoized data
  const images = useMemo(() => {
    if (!property) return []
    return [
      property.img,
      ...(property.additionalImages || [
        property.img.replace('?w=800', '?w=800&auto=format&fit=crop&crop=entropy'),
        property.img.replace('?w=800', '?w=800&auto=format&fit=crop&crop=edges'),
        property.img.replace('?w=800', '?w=800&auto=format&fit=crop&crop=faces')
      ])
    ].filter(Boolean)
  }, [property])

  const features = useMemo(() => {
    if (!property) return []
    return [
      { icon: '🏠', label: 'Fully Furnished', category: 'Interior' },
      { icon: '🏊', label: 'Swimming Pool', category: 'Exterior' },
      { icon: '🌿', label: 'Garden', category: 'Exterior' },
      { icon: '🚗', label: 'Parking (4 cars)', category: 'Exterior' },
      { icon: '🔒', label: 'Security System', category: 'Safety' },
      { icon: '⚡', label: 'Backup Generator', category: 'Utility' },
      { icon: '💧', label: 'Borehole', category: 'Utility' },
      { icon: '👥', label: 'Staff Quarters', category: 'Exterior' },
      { icon: '💼', label: 'Home Office', category: 'Interior' },
      { icon: '💪', label: 'Gym', category: 'Interior' },
      { icon: '🎯', label: 'Entertainment Area', category: 'Interior' },
      { icon: '☀️', label: 'Solar Panels', category: 'Utility' }
    ]
  }, [property])

  const similarProperties = useMemo(() => {
    if (!property) return []
    return properties
      .filter(p => p.id !== property.id && p.city === property.city)
      .slice(0, 4)
  }, [property])

  // Handlers - ALL DEFINED HERE
  const handleImageChange = useCallback((index) => {
    setActiveImage(index)
  }, [])

  const handleShare = useCallback(async () => {
    const shareData = {
      title: property?.title,
      text: `✨ Discover this stunning property: ${property?.title}`,
      url: window.location.href
    }
    
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Share error:', error)
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        // Show toast notification
        alert('Link copied to clipboard!')
      } catch (error) {
        console.error('Copy error:', error)
      }
    }
  }, [property])

  // FIX: Define handleViewingSchedule before it's used
  const handleViewingSchedule = useCallback(() => {
    setIsViewingScheduled(true)
    // In production: API call to schedule viewing
    setTimeout(() => {
      setIsViewingScheduled(false)
      // Show success message
      alert('Viewing scheduled successfully!')
    }, 3000)
  }, [])

  const handleSaveToggle = useCallback(() => {
    toggleSave(property?.id)
  }, [property?.id, toggleSave])

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonHero}></div>
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonTitle}></div>
            <div className={styles.skeletonStats}>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <div className={styles.skeletonText}></div>
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return <Navigate to="/404" replace />
  }

  return (
    <div className={styles.propertyDetails}>
      <SEO
        title={`${property.title} | Zennara Estate`}
        description={property.description.substring(0, 160)}
        canonical={`/property/${property.id}`}
        ogImage={property.img}
        ogTitle={`${property.title} - ${property.price}`}
        keywords={`${property.type}, ${property.city}, luxury real estate`}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: property.title,
          description: property.description,
          image: property.img,
          offers: {
            '@type': 'Offer',
            price: property.price,
            priceCurrency: 'KES',
            availability: 'https://schema.org/InStock'
          }
        }}
      />

      {/* Modern Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <div className={styles.container}>
          <Link to="/" className={styles.breadcrumbLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Home
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link to="/properties" className={styles.breadcrumbLink}>Properties</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{property.title}</span>
        </div>
      </nav>

      {/* Hero Gallery - Modern Full-width */}
      <section className={styles.hero} aria-label="Property gallery">
        <div className={styles.galleryWrapper}>
          <div className={styles.mainImageContainer}>
            <motion.div
              key={activeImage}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className={styles.mainImage}
            >
              <LazyImage 
                src={images[activeImage]} 
                alt={`${property.title} - main view`}
                loading="eager"
                width={1200}
                height={800}
                className={styles.mainImageContent}
              />
            </motion.div>
            
            {/* Badge */}
            {property.tag && (
              <motion.span 
                className={styles.tag}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {property.tag}
              </motion.span>
            )}
            
            {/* Floating Action Buttons */}
            <div className={styles.floatingActions}>
              <motion.button 
                className={`${styles.actionBtn} ${isSaved(property.id) ? styles.saved : ''}`}
                onClick={handleSaveToggle}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={isSaved(property.id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                <svg viewBox="0 0 24 24" fill={isSaved(property.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </motion.button>
              <motion.button 
                className={styles.actionBtn}
                onClick={handleShare}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Share property"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </motion.button>
            </div>

            {/* Image Counter */}
            <div className={styles.imageCounter}>
              <span>{activeImage + 1}</span>
              <span className={styles.counterDivider}>/</span>
              <span>{images.length}</span>
            </div>
          </div>

          {/* Thumbnail Strip - Modern Carousel */}
          <div className={styles.thumbnailStrip}>
            <button 
              className={styles.thumbScrollBtn}
              onClick={() => handleImageChange(Math.max(0, activeImage - 1))}
              disabled={activeImage === 0}
              aria-label="Previous image"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <div className={styles.thumbnails} role="tablist">
              {images.map((img, index) => (
                <motion.button
                  key={index}
                  role="tab"
                  aria-selected={activeImage === index}
                  className={`${styles.thumbnail} ${activeImage === index ? styles.active : ''}`}
                  onClick={() => handleImageChange(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LazyImage 
                    src={img} 
                    alt={`Thumbnail ${index + 1}`}
                    width={120}
                    height={80}
                    className={styles.thumbnailImage}
                  />
                  {activeImage === index && (
                    <motion.div 
                      className={styles.thumbnailOverlay}
                      layoutId="thumbnailOverlay"
                    />
                  )}
                </motion.button>
              ))}
            </div>
            <button 
              className={styles.thumbScrollBtn}
              onClick={() => handleImageChange(Math.min(images.length - 1, activeImage + 1))}
              disabled={activeImage === images.length - 1}
              aria-label="Next image"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content - Modern Grid Layout */}
      <div className={styles.container}>
        <div className={styles.contentGrid}>
          {/* Left Column - Property Info */}
          <main className={styles.mainContent}>
            {/* Header with Price */}
            <div className={styles.propertyHeader}>
              <div>
                <h1 className={styles.propertyTitle}>{property.title}</h1>
                <div className={styles.propertyLocation}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>{property.location}, {property.city}</span>
                </div>
              </div>
              <div className={styles.priceSection}>
                <div className={styles.price}>{property.price}</div>
                <div className={styles.priceSubtext}>Rent per Month</div>
              </div>
            </div>

            {/* Key Metrics - Modern Cards */}
            <div className={styles.metrics}>
              <div className={styles.metric}>
                <div className={styles.metricIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <div>
                  <div className={styles.metricValue}>{property.beds}</div>
                  <div className={styles.metricLabel}>Bedrooms</div>
                </div>
              </div>
              <div className={styles.metric}>
                <div className={styles.metricIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 6h11M12 12h8M15 18h5M5 6v12"/>
                    <circle cx="7" cy="9" r="2"/>
                  </svg>
                </div>
                <div>
                  <div className={styles.metricValue}>{property.baths}</div>
                  <div className={styles.metricLabel}>Bathrooms</div>
                </div>
              </div>
              <div className={styles.metric}>
                <div className={styles.metricIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M9 3v18M3 9h6M3 15h6"/>
                  </svg>
                </div>
                <div>
                  <div className={styles.metricValue}>{property.area}</div>
                  <div className={styles.metricLabel}>Total Area</div>
                </div>
              </div>
              <div className={styles.metric}>
                <div className={styles.metricIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M12 2l4 4M12 2L8 6"/>
                  </svg>
                </div>
                <div>
                  <div className={styles.metricValue}>{property.yearBuilt || 2023}</div>
                  <div className={styles.metricLabel}>Year Built</div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className={styles.tabs}>
              <button 
                className={`${styles.tab} ${activeTab === 'details' ? styles.active : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Details
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'features' ? styles.active : ''}`}
                onClick={() => setActiveTab('features')}
              >
                Features
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'location' ? styles.active : ''}`}
                onClick={() => setActiveTab('location')}
              >
                Location
              </button>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={styles.tabContent}
                >
                  <div className={styles.description}>
                    <p>{property.description}</p>
                    {property.description.length > 200 && (
                      <>
                        {isDescriptionExpanded && (
                          <p className={styles.extendedDescription}>
                            This exceptional property represents the pinnacle of luxury living in {property.location}. 
                            Meticulously designed and crafted with the finest materials, every detail has been considered 
                            to create an unparalleled residential experience. The home seamlessly blends contemporary 
                            architecture with timeless elegance, offering spacious interiors, abundant natural light, 
                            and thoughtful amenities throughout.
                          </p>
                        )}
                        <button 
                          className={styles.readMoreBtn}
                          onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        >
                          {isDescriptionExpanded ? 'Read Less →' : 'Read More →'}
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'features' && (
                <motion.div
                  key="features"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={styles.tabContent}
                >
                  <div className={styles.featuresGrid}>
                    {features.map((feature, index) => (
                      <motion.div 
                        key={index} 
                        className={styles.featureItem}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <span className={styles.featureIcon}>{feature.icon}</span>
                        <span className={styles.featureLabel}>{feature.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'location' && (
                <motion.div
                  key="location"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={styles.tabContent}
                >
                  <div className={styles.mapContainer}>
                    <div className={styles.map}>
                      <iframe
                        src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.823!2d36.777!3d-1.286389!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${encodeURIComponent(property.location + ' ' + property.city)}!5e0!3m2!1sen!2s!4v1234567890`}
                        width="100%"
                        height="400"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Property location map"
                      />
                    </div>
                    <div className={styles.locationInfo}>
                      <div className={styles.locationDetail}>
                        <strong>📍 Neighborhood</strong>
                        <p>{property.neighborhood || property.location}</p>
                      </div>
                      <div className={styles.locationDetail}>
                        <strong>🏫 Nearby Schools</strong>
                        <p>{property.schools || 'Various international schools within 5km'}</p>
                      </div>
                      <div className={styles.locationDetail}>
                        <strong>🛍️ Shopping</strong>
                        <p>{property.shopping || 'Premium shopping centers nearby'}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Right Column - Sticky Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.stickySidebar}>
              {/* Quick Action Card */}
              <motion.div 
                className={styles.actionCard}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className={styles.actionHeader}>
                  <h3 className={styles.actionTitle}>Interested?</h3>
                  <p className={styles.actionSubtitle}>Let's make it yours</p>
                </div>
                
                <div className={styles.actionButtons}>
                  <Button 
                    variant="primary" 
                    fullWidth 
                    onClick={() => setIsInquiryOpen(true)}
                    ref={openBtnRef}
                    className={styles.primaryBtn}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Request Info
                  </Button>
                  <Button 
                    variant="secondary" 
                    fullWidth
                    onClick={handleViewingSchedule}
                    disabled={isViewingScheduled}
                    className={styles.secondaryBtn}
                  >
                    {isViewingScheduled ? (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Scheduled!
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Schedule Viewing
                      </>
                    )}
                  </Button>
                </div>

                <div className={styles.quickContact}>
                  <div className={styles.contactItem}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <a href="tel:+254789115737">+254 789 115737</a>
                  </div>
                  <div className={styles.contactItem}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <a href="mailto:info@zennara.com">info@zennara.com</a>
                  </div>
                </div>
              </motion.div>

              {/* Agent Card - Modern */}
              <motion.div 
                className={styles.agentCard}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className={styles.agentHeader}>
                  <div className={styles.agentAvatar}>
                    <span>{property.agent?.name?.charAt(0) || 'SM'}</span>
                  </div>
                  <div className={styles.agentInfo}>
                    <h4 className={styles.agentName}>{property.agent?.name || 'Sarah Mwangi'}</h4>
                    <p className={styles.agentRole}>{property.agent?.role || 'Senior Property Consultant'}</p>
                  </div>
                </div>
                
                <div className={styles.agentBio}>
                  {property.agent?.bio || 'Specializing in luxury properties across Nairobi with 15+ years of experience.'}
                </div>
                
                <div className={styles.agentStats}>
                  <div className={styles.agentStat}>
                    <span className={styles.statNumber}>128</span>
                    <span className={styles.statLabel}>Reviews</span>
                  </div>
                  <div className={styles.agentStat}>
                    <span className={styles.statNumber}>4.9</span>
                    <span className={styles.statLabel}>Rating ⭐</span>
                  </div>
                  <div className={styles.agentStat}>
                    <span className={styles.statNumber}>15</span>
                    <span className={styles.statLabel}>Years</span>
                  </div>
                </div>
                
                <Button variant="secondary" fullWidth className={styles.agentBtn}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  Contact Agent
                </Button>
              </motion.div>
            </div>
          </aside>
        </div>

        {/* Similar Properties - Modern Grid */}
        {similarProperties.length > 0 && (
          <section className={styles.similarSection}>
            <div className={styles.similarHeader}>
              <h2 className={styles.similarTitle}>
                <span>Similar Properties</span>
                <span className={styles.similarCount}>{similarProperties.length} available</span>
              </h2>
              <Link to="/properties" className={styles.viewAllLink}>
                View All
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            </div>
            
            <div className={styles.similarGrid}>
              {similarProperties.map((prop, index) => (
                <motion.div
                  key={prop.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/property/${prop.id}`} className={styles.similarCard}>
                    <div className={styles.similarImage}>
                      <LazyImage 
                        src={prop.img} 
                        alt={prop.title}
                        width={400}
                        height={300}
                      />
                      {prop.tag && <span className={styles.similarTag}>{prop.tag}</span>}
                      <div className={styles.similarPriceTag}>{prop.price}</div>
                    </div>
                    <div className={styles.similarContent}>
                      <h3 className={styles.similarCardTitle}>{prop.title}</h3>
                      <p className={styles.similarCardLocation}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        {prop.location}, {prop.city}
                      </p>
                      <div className={styles.similarMeta}>
                        <span>🛏 {prop.beds}</span>
                        <span>🛁 {prop.baths}</span>
                        <span>📐 {prop.area}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Modern Inquiry Modal */}
      <AnimatePresence>
        {isInquiryOpen && (
          <motion.div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="inquiry-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsInquiryOpen(false)
                openBtnRef.current?.focus()
              }
            }}
          >
            <motion.div
              ref={modalRef}
              className={styles.modalContent}
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={e => e.stopPropagation()}
            >
              <button 
                className={styles.modalClose} 
                onClick={() => { 
                  setIsInquiryOpen(false)
                  openBtnRef.current?.focus()
                }}
                aria-label="Close inquiry form"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              
              {!isSubmitted ? (
                <>
                  <div className={styles.modalHeader}>
                    <h3 id="inquiry-title" className={styles.modalTitle}>Request Information</h3>
                    <p className={styles.modalSubtext}>
                      Fill out the form below and we'll get back to you within 24 hours.
                    </p>
                  </div>
                  
                  <form onSubmit={inquiryForm.handleSubmit} className={styles.inquiryForm} noValidate>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label htmlFor="name">Full Name *</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={inquiryForm.values.name}
                          onChange={inquiryForm.handleChange}
                          onBlur={inquiryForm.handleBlur}
                          className={inquiryForm.touched.name && inquiryForm.errors.name ? styles.error : ''}
                          placeholder="e.g., John Doe"
                          required
                        />
                        {inquiryForm.touched.name && inquiryForm.errors.name && (
                          <motion.span 
                            className={styles.errorMessage}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {inquiryForm.errors.name}
                          </motion.span>
                        )}
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="email">Email Address *</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={inquiryForm.values.email}
                          onChange={inquiryForm.handleChange}
                          onBlur={inquiryForm.handleBlur}
                          className={inquiryForm.touched.email && inquiryForm.errors.email ? styles.error : ''}
                          placeholder="e.g., john@example.com"
                          required
                        />
                        {inquiryForm.touched.email && inquiryForm.errors.email && (
                          <motion.span 
                            className={styles.errorMessage}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {inquiryForm.errors.email}
                          </motion.span>
                        )}
                      </div>
                    </div>
                    
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label htmlFor="phone">Phone Number</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={inquiryForm.values.phone}
                          onChange={inquiryForm.handleChange}
                          onBlur={inquiryForm.handleBlur}
                          className={inquiryForm.touched.phone && inquiryForm.errors.phone ? styles.error : ''}
                          placeholder="e.g., +254 700 000 000"
                        />
                        {inquiryForm.touched.phone && inquiryForm.errors.phone && (
                          <motion.span 
                            className={styles.errorMessage}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {inquiryForm.errors.phone}
                          </motion.span>
                        )}
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="preferredContact">Preferred Contact Method</label>
                        <div className={styles.contactOptions}>
                          <label className={styles.contactOption}>
                            <input
                              type="radio"
                              name="preferredContact"
                              value="email"
                              checked={inquiryForm.values.preferredContact === 'email'}
                              onChange={inquiryForm.handleChange}
                            />
                            <span>📧 Email</span>
                          </label>
                          <label className={styles.contactOption}>
                            <input
                              type="radio"
                              name="preferredContact"
                              value="phone"
                              checked={inquiryForm.values.preferredContact === 'phone'}
                              onChange={inquiryForm.handleChange}
                            />
                            <span>📱 Phone</span>
                          </label>
                          <label className={styles.contactOption}>
                            <input
                              type="radio"
                              name="preferredContact"
                              value="whatsapp"
                              checked={inquiryForm.values.preferredContact === 'whatsapp'}
                              onChange={inquiryForm.handleChange}
                            />
                            <span>💬 WhatsApp</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="message">Message</label>
                      <textarea
                        id="message"
                        name="message"
                        rows="4"
                        value={inquiryForm.values.message}
                        onChange={inquiryForm.handleChange}
                        onBlur={inquiryForm.handleBlur}
                        className={inquiryForm.touched.message && inquiryForm.errors.message ? styles.error : ''}
                        placeholder="I'm interested in this property... Would like to schedule a viewing."
                      ></textarea>
                      {inquiryForm.touched.message && inquiryForm.errors.message && (
                        <motion.span 
                          className={styles.errorMessage}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {inquiryForm.errors.message}
                        </motion.span>
                      )}
                    </div>
                    
                    <div className={styles.formFooter}>
                      <Button 
                        type="submit" 
                        variant="primary" 
                        fullWidth 
                        disabled={inquiryForm.isSubmitting}
                        className={styles.submitBtn}
                      >
                        {inquiryForm.isSubmitting ? (
                          <>
                            <span className={styles.spinner}></span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                              <line x1="22" y1="2" x2="11" y2="13"/>
                              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                            </svg>
                            Send Inquiry
                          </>
                        )}
                      </Button>
                      <p className={styles.privacyNote}>
                        🔒 Your information is secure and will only be used for this inquiry.
                      </p>
                    </div>
                  </form>
                </>
              ) : (
                <motion.div 
                  className={styles.successMessage}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 20 }}
                >
                  <div className={styles.successIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <h3 className={styles.successTitle}>Thank You!</h3>
                  <p className={styles.successText}>Your inquiry has been sent successfully.</p>
                  <p className={styles.successSubtext}>We'll contact you within 24 hours.</p>
                  <Button 
                    variant="primary" 
                    onClick={() => setIsInquiryOpen(false)}
                    className={styles.successBtn}
                  >
                    Close
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}