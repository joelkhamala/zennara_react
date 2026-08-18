import { useState } from 'react'
import { Link } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard/PropertyCard'
import SearchForm from '../components/SearchForm/SearchForm'
import AnimatedNumber from '../components/AnimatedNumber/AnimatedNumber'
import Button from '../components/Button/Button'
import LazyImage from '../components/LazyImage/LazyImage'
import SEO from '../components/SEO/SEO'
import { useScrollReveal, useStaggerReveal } from '../hooks/useScrollReveal'
import { properties, destinations, howItWorksSteps, stats } from '../data/properties'
import styles from './Home.module.css'

export default function Home() {
  const featuredProperties = properties.slice(0, 6)
  const [activeAccordion, setActiveAccordion] = useState(0)

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index)
  }

  const howItWorksRef  = useScrollReveal({ threshold: 0.1 })
  const propertiesRef  = useScrollReveal({ threshold: 0.05 })
  const statsRef       = useScrollReveal({ threshold: 0.2 })
  const destinationsRef = useScrollReveal({ threshold: 0.05 })
  const ctaRef         = useScrollReveal({ threshold: 0.2 })
  const propertyGridRef = useStaggerReveal({ staggerMs: 80 })

  return (
    <div className={styles.home}>
      <SEO
        title="Property & Facility Management | East Africa"
        description="ZENNARA provides professional property and facility management services across East Africa. From tenant management to preventive maintenance and SecureRent, we handle the complexity of property operations."
        canonical="/"
        ogImage="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80"
      />

      {/* Hero Section */}
      <section className={styles.hero} aria-label="Hero">
        <div className={styles.heroOverlay} aria-hidden="true"></div>
        <div className={styles.heroContent}>
          <p className="eyebrow">Property & Facility Management · East Africa</p>
          <h1>Property, managed with <em>certainty.</em></h1>
          <p className={styles.heroCopy}>
            ZENNARA helps property owners protect assets, simplify operations, 
            and achieve more predictable property performance across Kenya, Uganda, 
            Tanzania and Rwanda.
          </p>
          <div className={styles.heroActions}>
            <Button to="/contact" variant="gold" size="large">
              Request a Proposal
            </Button>
            <Button to="/securerent" variant="outline" theme="dark" size="large">
              Explore SecureRent
            </Button>
          </div>
        </div>
      </section>

      {/* SecureRent Feature Band */}
      <br></br><br></br>
      <section className={styles.secureRentBand} aria-labelledby="securerent-heading">
  <div className={styles.secureRentGlow}></div>
  <div className={styles.secureRentContent}>
    <div className={styles.secureRentText}>
      <div className={styles.secureRentBadge}>
        Flagship Programme
      </div>
      <h2 id="securerent-heading">
        Guaranteed rent.
        <br />
        <span className={styles.highlightText}>Every month.</span>
        <br />
        <em>On time.</em>
      </h2>
      <p>
        Under SecureRent, enrolled landlords receive their rental income by the 15th 
        of every month — whether or not the tenant has paid. ZENNARA fronts the payment 
        and handles all tenant recovery.
      </p>
      <div className={styles.secureRentFeatures}>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <span>Payment by the 15th, guaranteed</span>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <span>Full amount, every time</span>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <span>Zero collection hassle</span>
        </div>
      </div>
      <div className={styles.secureRentActions}>
        <Button to="/securerent" variant="gold" size="large">
          Learn About SecureRent
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" />
          </svg>
        </Button>
        <Button to="/contact" variant="outline" theme="dark" size="large">
          Enrol Your Property
        </Button>
      </div>
    </div>
    <div className={styles.secureRentVisual}>
      <div className={styles.visualContainer}>
        <div className={styles.visualBackground}>
          <div className={styles.orb}></div>
          <div className={styles.orb}></div>
          <div className={styles.orb}></div>
        </div>
        <div className={styles.accordionPreview}>
          <div className={styles.accordionHeader}>
            <span className={styles.accordionTag}>SECURE PROCESS</span>
            <span className={styles.accordionSteps}>3 STEPS</span>
          </div>
          
          <div className={`${styles.accordionItem} ${activeAccordion === 0 ? styles.active : ''}`}>
            <button 
              className={styles.accordionButton}
              onClick={() => toggleAccordion(0)}
              aria-expanded={activeAccordion === 0}
            >
              <div className={styles.accordionNumber}>01</div>
              <div className={styles.accordionTitle}>
                <h3>Tenant rent falls due</h3>
                <span>Collection begins</span>
              </div>
              <div className={styles.accordionIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" />
                </svg>
              </div>
            </button>
            {activeAccordion === 0 && (
              <div className={styles.accordionBody}>
                <p>At the start of each month, your tenant's rent becomes due as per their lease agreement.</p>
                <ul>
                  <li>✓ Automatic payment reminders sent</li>
                  <li>✓ Multiple payment channels available</li>
                  <li>✓ Dedicated collections team</li>
                </ul>
              </div>
            )}
          </div>

          <div className={`${styles.accordionItem} ${activeAccordion === 1 ? styles.active : ''}`}>
            <button 
              className={styles.accordionButton}
              onClick={() => toggleAccordion(1)}
              aria-expanded={activeAccordion === 1}
            >
              <div className={`${styles.accordionNumber} ${styles.gold}`}>02</div>
              <div className={styles.accordionTitle}>
                <h3>Landlord paid by the 15th</h3>
                <span>Guaranteed payment</span>
              </div>
              <div className={styles.accordionIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" />
                </svg>
              </div>
            </button>
            {activeAccordion === 1 && (
              <div className={styles.accordionBody}>
                <p>By the 15th of the month, you receive your full rental income from ZENNARA — guaranteed.</p>
                <ul>
                  <li>✓ Payment by the 15th, guaranteed</li>
                  <li>✓ Full amount, every time</li>
                  <li>✓ Zero collection hassle</li>
                </ul>
              </div>
            )}
          </div>

          <div className={`${styles.accordionItem} ${activeAccordion === 2 ? styles.active : ''}`}>
            <button 
              className={styles.accordionButton}
              onClick={() => toggleAccordion(2)}
              aria-expanded={activeAccordion === 2}
            >
              <div className={styles.accordionNumber}>03</div>
              <div className={styles.accordionTitle}>
                <h3>ZENNARA recovers from tenant</h3>
                <span>Recovery &amp; enforcement</span>
              </div>
              <div className={styles.accordionIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" />
                </svg>
              </div>
            </button>
            {activeAccordion === 2 && (
              <div className={styles.accordionBody}>
                <p>We recover any outstanding rent from the tenant, plus applicable late fees.</p>
                <ul>
                  <li>✓ Professional recovery process</li>
                  <li>✓ Late fees applied</li>
                  <li>✓ You focus on your investment</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* The ZENNARA Difference Section */}
      <section className={styles.differenceSection} aria-labelledby="difference-heading">
        <div className={styles.sectionHeader}>
          <p className="eyebrow">The ZENNARA Difference</p>
          <h2 id="difference-heading">Own the asset. <br/>Let ZENNARA manage <em>the complexity.</em></h2>
          <p className={styles.sectionSubtitle}>
            Property ownership shouldn't mean operational burden. ZENNARA takes care of 
            rent collection, tenant management, maintenance, inspections, reporting and facility 
            operations—so you can focus on what matters.
          </p>
        </div>

        <div className={styles.servicesGrid}>
          <div className={styles.serviceCard}>
            <div className={styles.serviceIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <h3>Property Management</h3>
            <p>
              Complete property administration, tenant management, rental operations, 
              inspections and performance monitoring—delivered with operational discipline.
            </p>
            <Button to="/property-management" variant="text">
              Explore Property Management →
            </Button>
          </div>

          <div className={styles.serviceCard}>
            <div className={styles.serviceIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <h3>Facility Management</h3>
            <p>
              Hard and soft facility management covering building systems, maintenance, 
              cleaning, grounds coordination and preventive maintenance programmes.
            </p>
            <Button to="/facility-management" variant="text">
              Explore Facility Management →
            </Button>
          </div>

          <div className={`${styles.serviceCard} ${styles.featured}`}>
            <div className={styles.serviceIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h3>SecureRent</h3>
            <p>
              Our flagship programme: Guaranteed rent. Every month. ZENNARA handles 
              collection while you receive predictable rental income by the 15th.
            </p>
            <Button to="/securerent" variant="text">
              Explore SecureRent →
            </Button>
          </div>

          <div className={styles.serviceCard}>
            <div className={styles.serviceIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3>Reporting & KPIs</h3>
            <p>
              Transparent reporting on property performance, maintenance, financials and 
              operational metrics. Full visibility into your property portfolio.
            </p>
            <Button to="/portal" variant="text">
              Client Portal →
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorks} ref={howItWorksRef} aria-labelledby="how-it-works-heading">
        <div className={styles.sectionHeader}>
          <p className="eyebrow">Process</p>
          <h2 id="how-it-works-heading">How we work with property owners</h2>
          <p className={styles.sectionSubtitle}>
            From initial assessment to ongoing management, our proven process ensures your property 
            receives the professional oversight and operational discipline it deserves.
          </p>
        </div>

        <div className={styles.stepsGrid}>
          <div className={styles.step}>
            <div className={styles.stepNumber} aria-hidden="true">
              <span>01</span>
            </div>
            <h3>Property Assessment</h3>
            <p>We evaluate your property, understand your goals, and develop a customized management strategy aligned with your objectives.</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber} aria-hidden="true">
              <span>02</span>
            </div>
            <h3>Onboarding & Setup</h3>
            <p>Complete property documentation, systems integration, and operational protocols to ensure seamless management from day one.</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber} aria-hidden="true">
              <span>03</span>
            </div>
            <h3>Active Management</h3>
            <p>Full property and facility operations including tenant management, maintenance coordination, inspections, and day-to-day oversight.</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber} aria-hidden="true">
              <span>04</span>
            </div>
            <h3>Reporting & Optimization</h3>
            <p>Regular performance reporting, financial statements, and continuous improvement recommendations to maximize property value.</p>
          </div>
        </div>
      </section>

      {/* Managed Portfolio Section */}
      <section className={styles.properties} ref={propertiesRef} aria-labelledby="portfolio-heading">
        <div className={styles.sectionHeader}>
          <p className="eyebrow">ZENNARA Managed Portfolio</p>
          <h2 id="portfolio-heading">Properties under management</h2>
          <p className={styles.sectionSubtitle}>
            A selection of residential and commercial properties professionally managed by ZENNARA 
            across East Africa's most desirable locations.
          </p>
        </div>

        <div className={styles.propertyGrid} ref={propertyGridRef}>
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div className={styles.sectionFooter}>
          <Button to="/properties" variant="outline">
            View Full Portfolio
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats} ref={statsRef} aria-label="Company statistics">
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statItem}>
              <div className={styles.statNumber}>
                <AnimatedNumber 
                  value={stat.number} 
                  prefix={stat.prefix || ''} 
                  suffix={stat.suffix || ''} 
                />
              </div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Destinations Section */}
      <section className={styles.destinations} ref={destinationsRef} aria-labelledby="destinations-heading">
        <div className={styles.sectionHeader}>
          <p className="eyebrow">East Africa</p>
          <h2 id="destinations-heading">Regional property management</h2>
          <p className={styles.sectionSubtitle}>
            ZENNARA operates across East Africa, providing professional property and facility management 
            services in Kenya, Uganda, Tanzania and Rwanda.
          </p>
        </div>

        <div className={styles.destinationsGrid}>
          {destinations.map((destination, index) => (
            <Link 
              key={index} 
              to={`/property?location=${destination.name.toLowerCase()}`}
              className={styles.destinationCard}
              aria-label={`Browse ${destination.properties} properties in ${destination.name}`}
            >
              <div className={styles.destinationImage}>
                <LazyImage src={destination.img} alt={destination.name} />
                <div className={styles.destinationOverlay} aria-hidden="true"></div>
              </div>
              <div className={styles.destinationInfo}>
                <h3>{destination.name}</h3>
                <p>{destination.properties} properties</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta} ref={ctaRef} aria-labelledby="cta-heading">
        <div className={styles.ctaContent}>
          <p className="eyebrow">Get Started</p>
          <h2 id="cta-heading">Ready to manage your property differently?</h2>
          <p className={styles.ctaCopy}>
            Whether you own residential apartments, commercial buildings, or a property portfolio, 
            ZENNARA provides the professional management and operational oversight you need.
          </p>
          <div className={styles.ctaActions}>
            <Button to="/contact" variant="gold">
              Request a Proposal
            </Button>
            <Button to="/securerent" variant="outline">
              Explore SecureRent
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
