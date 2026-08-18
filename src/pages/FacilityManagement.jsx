import { useState } from 'react'
import Button from '../components/Button/Button'
import AnimatedNumber from '../components/AnimatedNumber/AnimatedNumber'
import SEO from '../components/SEO/SEO'
import { useScrollReveal } from '../hooks/useScrollReveal'
import styles from './FacilityManagement.module.css'

export default function FacilityManagement() {
  const [activeTab, setActiveTab] = useState('hard')
  
  const heroRef = useScrollReveal({ threshold: 0.1 })
  const servicesRef = useScrollReveal({ threshold: 0.1 })
  const statsRef = useScrollReveal({ threshold: 0.1 })

  const hardFMServices = [
    {
      title: 'Building Systems',
      icon: '⚙️',
      description: 'Management and maintenance of core building infrastructure including electrical, mechanical, HVAC, and plumbing systems.',
      items: [
        'Electrical systems management',
        'HVAC operations and maintenance',
        'Plumbing and water systems',
        'Fire safety systems',
        'Security systems',
        'Backup power systems'
      ]
    },
    {
      title: 'Preventive Maintenance',
      icon: '🔧',
      description: 'Scheduled maintenance programmes designed to prevent breakdowns, extend asset life, and maintain optimal performance.',
      items: [
        'Routine inspections',
        'Equipment servicing',
        'System testing and calibration',
        'Component replacement',
        'Performance optimization',
        'Maintenance scheduling'
      ]
    },
    {
      title: 'Asset Management',
      icon: '📊',
      description: 'Strategic management of building assets to maximize performance, minimize lifecycle costs, and preserve property value.',
      items: [
        'Asset tracking and documentation',
        'Lifecycle planning',
        'Replacement scheduling',
        'Performance monitoring',
        'Warranty management',
        'Capital planning support'
      ]
    }
  ]

  const softFMServices = [
    {
      title: 'Cleaning Services',
      icon: '✨',
      description: 'Professional cleaning and hygiene management for common areas, offices, and facility spaces.',
      items: [
        'Daily cleaning operations',
        'Deep cleaning programmes',
        'Washroom maintenance',
        'Floor care and polishing',
        'Window cleaning',
        'Waste management'
      ]
    },
    {
      title: 'Grounds & Landscaping',
      icon: '🌿',
      description: 'Maintenance and care of outdoor spaces, landscaping, and grounds to maintain aesthetic appeal and functionality.',
      items: [
        'Landscape maintenance',
        'Lawn care and irrigation',
        'Tree and plant care',
        'Pest control',
        'Outdoor lighting',
        'Parking area maintenance'
      ]
    },
    {
      title: 'General Services',
      icon: '🛠️',
      description: 'Day-to-day operational support services that keep facilities running smoothly and professionally.',
      items: [
        'Reception and concierge',
        'Mail and package handling',
        'Minor repairs coordination',
        'Vendor management',
        'Consumables management',
        'Signage maintenance'
      ]
    }
  ]

  const benefits = [
    {
      title: 'Asset Preservation',
      description: 'Proactive maintenance and care extends asset life, preserves property value, and prevents costly emergency repairs.',
      icon: '🏢'
    },
    {
      title: 'Operational Efficiency',
      description: 'Optimized building systems reduce energy consumption, lower operating costs, and improve overall facility performance.',
      icon: '⚡'
    },
    {
      title: 'Sustainability',
      description: 'Environmental responsibility through energy management, waste reduction, water conservation, and sustainable practices.',
      icon: '🌱'
    },
    {
      title: 'Safety & Compliance',
      description: 'Regulatory compliance, health and safety standards, and risk mitigation through professional facility management.',
      icon: '🛡️'
    },
    {
      title: 'Occupant Experience',
      description: 'Well-maintained, clean, and comfortable facilities enhance tenant satisfaction and property reputation.',
      icon: '⭐'
    },
    {
      title: 'Predictable Operations',
      description: 'Scheduled maintenance, transparent reporting, and professional oversight deliver consistent facility performance.',
      icon: '📈'
    }
  ]

  const processSteps = [
    {
      number: '01',
      title: 'Facility Assessment',
      description: 'Comprehensive evaluation of building systems, current maintenance practices, asset conditions, and operational requirements.',
      icon: '🔍'
    },
    {
      number: '02',
      title: 'Programme Development',
      description: 'Creation of customized maintenance schedules, service protocols, and operational procedures aligned with your facility needs.',
      icon: '📋'
    },
    {
      number: '03',
      title: 'Service Delivery',
      description: 'Professional execution of hard and soft FM services with trained teams, quality standards, and responsive coordination.',
      icon: '⚙️'
    },
    {
      number: '04',
      title: 'Monitoring & Reporting',
      description: 'Continuous performance tracking, maintenance documentation, and regular reporting on facility operations and KPIs.',
      icon: '📊'
    }
  ]

  return (
    <div className={styles.facilityManagement}>
      <SEO
        title="Facility Management Services | East Africa"
        description="Professional facility management services across East Africa. ZENNARA provides hard and soft FM including building systems, maintenance, cleaning, and operational services."
        canonical="/facility-management"
      />

      {/* Hero Section */}
      <section className={styles.hero} ref={heroRef}>
        <div className={styles.heroBackground}>
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80" 
            alt="Facility Management"
            loading="eager"
          />
        </div>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <p className="eyebrow">Facility Management</p>
          <h1>Buildings that <em>perform.</em></h1>
          <p className={styles.heroSubtitle}>
            ZENNARA provides comprehensive hard and soft facility management services 
            to protect your asset, optimize operations, and deliver exceptional facility performance.
          </p>
          <div className={styles.heroActions}>
            <Button to="/contact" variant="gold" size="large">
              Discuss Facility Management
            </Button>
            <Button to="/property-management" variant="outline" theme="dark" size="large">
              Property Management
            </Button>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className={styles.overviewSection}>
        <div className={styles.overviewContent}>
          <div className={styles.overviewText}>
            <p className="eyebrow">Facility Operations</p>
            <h2>Professional facility <em>oversight.</em></h2>
            <p>
              Facility management goes beyond basic maintenance. ZENNARA manages the complete 
              physical and operational environment of your buildings—from core infrastructure 
              and mechanical systems to cleaning, grounds care, and day-to-day facility services.
            </p>
            <p>
              Our integrated approach combines hard FM (technical building systems) and soft FM 
              (operational services) to deliver efficient, sustainable, and well-maintained facilities 
              across residential, commercial, and mixed-use properties.
            </p>
          </div>
          <div className={styles.overviewStats}>
            <div className={styles.overviewStat}>
              <div className={styles.overviewStatNumber}>
                <AnimatedNumber value={24} suffix="/7" />
              </div>
              <div className={styles.overviewStatLabel}>Facility Operations</div>
            </div>
            <div className={styles.overviewStat}>
              <div className={styles.overviewStatNumber}>
                <AnimatedNumber value={99} suffix="%" />
              </div>
              <div className={styles.overviewStatLabel}>Uptime Performance</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Tabs Section */}
      <section className={styles.servicesSection} ref={servicesRef}>
        <div className={styles.sectionHeader}>
          <p className="eyebrow">Services</p>
          <h2>Hard & Soft <em>Facility Management.</em></h2>
          <p className={styles.sectionSubtitle}>
            Comprehensive facility services covering technical building systems and operational support.
          </p>
        </div>

        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'hard' ? styles.active : ''}`}
              onClick={() => setActiveTab('hard')}
            >
              <span className={styles.tabIcon}>⚙️</span>
              <span className={styles.tabLabel}>Hard FM</span>
              <span className={styles.tabSubtitle}>Building Systems & Infrastructure</span>
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'soft' ? styles.active : ''}`}
              onClick={() => setActiveTab('soft')}
            >
              <span className={styles.tabIcon}>✨</span>
              <span className={styles.tabLabel}>Soft FM</span>
              <span className={styles.tabSubtitle}>Operational Services & Support</span>
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'hard' && (
              <div className={styles.servicesGrid}>
                {hardFMServices.map((service, index) => (
                  <div key={index} className={styles.serviceCard}>
                    <div className={styles.serviceIcon}>{service.icon}</div>
                    <h3>{service.title}</h3>
                    <p className={styles.serviceDescription}>{service.description}</p>
                    <ul className={styles.serviceList}>
                      {service.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'soft' && (
              <div className={styles.servicesGrid}>
                {softFMServices.map((service, index) => (
                  <div key={index} className={styles.serviceCard}>
                    <div className={styles.serviceIcon}>{service.icon}</div>
                    <h3>{service.title}</h3>
                    <p className={styles.serviceDescription}>{service.description}</p>
                    <ul className={styles.serviceList}>
                      {service.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className={styles.processSection}>
        <div className={styles.sectionHeader}>
          <p className="eyebrow">Our Approach</p>
          <h2>How we manage <em>your facilities.</em></h2>
        </div>

        <div className={styles.processGrid}>
          {processSteps.map((step, index) => (
            <div key={index} className={styles.processCard}>
              <div className={styles.processHeader}>
                <div className={styles.processNumber}>{step.number}</div>
                <div className={styles.processIcon}>{step.icon}</div>
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefitsSection}>
        <div className={styles.sectionHeader}>
          <p className="eyebrow">Facility Benefits</p>
          <h2>Why professional FM <em>matters.</em></h2>
        </div>

        <div className={styles.benefitsGrid}>
          {benefits.map((benefit, index) => (
            <div key={index} className={styles.benefitCard}>
              <div className={styles.benefitIcon}>{benefit.icon}</div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection} ref={statsRef}>
        <div className={styles.statsContent}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>
              <AnimatedNumber value={180} suffix="+" />
            </div>
            <div className={styles.statLabel}>Facilities Managed</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>
              <AnimatedNumber value={30} suffix="%" />
            </div>
            <div className={styles.statLabel}>Energy Cost Reduction</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>
              <AnimatedNumber value={99} suffix="%" />
            </div>
            <div className={styles.statLabel}>Scheduled Maintenance Completion</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>
              <AnimatedNumber value={4} />
            </div>
            <div className={styles.statLabel}>East African Countries</div>
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className={styles.sustainabilitySection}>
        <div className={styles.sustainabilityContent}>
          <div className={styles.sustainabilityText}>
            <p className="eyebrow">Sustainability</p>
            <h2>Facilities that care for <em>the environment.</em></h2>
            <p>
              ZENNARA integrates sustainable practices into facility management operations. 
              From energy-efficient building systems and water conservation to waste reduction 
              and environmentally responsible maintenance practices.
            </p>
            <ul className={styles.sustainabilityList}>
              <li>Energy management and optimization</li>
              <li>Water conservation programmes</li>
              <li>Waste reduction and recycling</li>
              <li>Green cleaning products</li>
              <li>Sustainable procurement</li>
              <li>Environmental compliance</li>
            </ul>
          </div>
          <div className={styles.sustainabilityImage}>
            <img 
              src="https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&q=80" 
              alt="Sustainability"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <p className="eyebrow">Get Started</p>
          <h2>Ready to optimize <em>your facility?</em></h2>
          <p>
            Contact ZENNARA to discuss how professional facility management can improve 
            performance, reduce costs, and deliver a better building experience.
          </p>
          <div className={styles.ctaActions}>
            <Button to="/contact" variant="gold" size="large">
              Discuss Facility Management
            </Button>
            <Button to="/properties" variant="outline" size="large">
              View Managed Portfolio
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
