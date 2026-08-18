import { useState } from 'react'
import Button from '../components/Button/Button'
import AnimatedNumber from '../components/AnimatedNumber/AnimatedNumber'
import SEO from '../components/SEO/SEO'
import { useScrollReveal } from '../hooks/useScrollReveal'
import styles from './PropertyManagement.module.css'

export default function PropertyManagement() {
  const [activeService, setActiveService] = useState(0)
  
  const heroRef = useScrollReveal({ threshold: 0.1 })
  const servicesRef = useScrollReveal({ threshold: 0.1 })
  const processRef = useScrollReveal({ threshold: 0.1 })
  const statsRef = useScrollReveal({ threshold: 0.1 })

  const services = [
    {
      title: 'Tenant Management',
      icon: '👥',
      items: [
        'Tenant screening and selection',
        'Lease agreement administration',
        'Move-in/move-out coordination',
        'Tenant communication and support',
        'Conflict resolution',
        'Lease renewal management'
      ]
    },
    {
      title: 'Rental Operations',
      icon: '💰',
      items: [
        'Rent collection and processing',
        'Payment tracking and reconciliation',
        'Arrears management',
        'Financial record keeping',
        'Owner disbursements',
        'Late payment coordination'
      ]
    },
    {
      title: 'Property Inspections',
      icon: '🔍',
      items: [
        'Regular property inspections',
        'Condition assessments',
        'Compliance verification',
        'Maintenance identification',
        'Photographic documentation',
        'Detailed inspection reports'
      ]
    },
    {
      title: 'Maintenance Coordination',
      icon: '🔧',
      items: [
        'Maintenance request processing',
        'Contractor coordination',
        'Emergency response',
        'Preventive maintenance scheduling',
        'Work order management',
        'Quality assurance'
      ]
    },
    {
      title: 'Financial Reporting',
      icon: '📊',
      items: [
        'Monthly financial statements',
        'Income and expense tracking',
        'Budget preparation',
        'Cash flow reporting',
        'Tax documentation support',
        'Performance analytics'
      ]
    },
    {
      title: 'Property Performance',
      icon: '📈',
      items: [
        'Occupancy optimization',
        'Rental rate analysis',
        'Market positioning',
        'Performance benchmarking',
        'Improvement recommendations',
        'Asset value protection'
      ]
    }
  ]

  const processSteps = [
    {
      number: '01',
      title: 'Property Assessment',
      description: 'We conduct a comprehensive evaluation of your property, review current operations, understand your objectives, and identify opportunities for operational improvement.',
      icon: '🏢'
    },
    {
      number: '02',
      title: 'Onboarding & Documentation',
      description: 'Complete property documentation, lease review, tenant transition, systems integration, and establishment of management protocols and reporting frameworks.',
      icon: '📋'
    },
    {
      number: '03',
      title: 'Active Management',
      description: 'Full-service property management including tenant relations, rent collection, maintenance coordination, inspections, and day-to-day operational oversight.',
      icon: '⚙️'
    },
    {
      number: '04',
      title: 'Reporting & Optimization',
      description: 'Regular performance reporting, financial statements, occupancy analysis, and continuous improvement recommendations to maximize property value and returns.',
      icon: '📊'
    }
  ]

  const benefits = [
    {
      title: 'Owner Peace of Mind',
      description: 'Focus on your investment strategy while we handle daily operations, tenant issues, and property complexities.',
      icon: '✓'
    },
    {
      title: 'Operational Discipline',
      description: 'Structured processes, documented procedures, and professional standards applied consistently across your portfolio.',
      icon: '✓'
    },
    {
      title: 'Transparent Reporting',
      description: 'Complete financial visibility with detailed monthly reports, statements, and performance analytics.',
      icon: '✓'
    },
    {
      title: 'Property Performance',
      description: 'Proactive management focused on occupancy optimization, cost control, and long-term asset value preservation.',
      icon: '✓'
    },
    {
      title: 'Professional Standards',
      description: 'Licensed, trained property managers applying industry best practices and regulatory compliance.',
      icon: '✓'
    },
    {
      title: 'Regional Capability',
      description: 'Consistent management standards across East Africa with local market knowledge and operational presence.',
      icon: '✓'
    }
  ]

  return (
    <div className={styles.propertyManagement}>
      <SEO
        title="Property Management Services | East Africa"
        description="Professional property management services across East Africa. ZENNARA handles tenant management, rent collection, maintenance, inspections, and operational oversight for property owners."
        canonical="/property-management"
      />

      {/* Hero Section */}
      <section className={styles.hero} ref={heroRef}>
        <div className={styles.heroBackground}>
          <img 
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80" 
            alt="Property Management"
            loading="eager"
          />
        </div>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <p className="eyebrow">Property Management</p>
          <h1>Professional property <em>operations.</em></h1>
          <p className={styles.heroSubtitle}>
            ZENNARA provides comprehensive property management services for residential 
            and commercial property owners across East Africa. We handle the complexity 
            of property operations so you can focus on your investment.
          </p>
          <div className={styles.heroActions}>
            <Button to="/contact" variant="gold" size="large">
              Request Property Management Proposal
            </Button>
            <Button to="/securerent" variant="outline" theme="dark" size="large">
              Explore SecureRent
            </Button>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className={styles.problemSolution}>
        <div className={styles.problemSolutionGrid}>
          <div className={styles.problemCard}>
            <div className={styles.cardLabel}>The Challenge</div>
            <h2>Property ownership shouldn't mean operational burden.</h2>
            <p>
              Property owners face constant operational demands: rent collection, 
              tenant communication, maintenance coordination, contractor management, 
              inspections, reporting, financial tracking, compliance issues, and 
              day-to-day property problems.
            </p>
            <p>
              The complexity increases with multiple properties, tenant turnover, 
              maintenance emergencies, and the need for consistent financial visibility.
            </p>
          </div>
          <div className={styles.solutionCard}>
            <div className={styles.cardLabel}>The Solution</div>
            <h2>ZENNARA manages the entire operation.</h2>
            <p>
              We take complete operational responsibility for your property. From tenant 
              screening and lease management to rent collection, maintenance coordination, 
              inspections, and financial reporting.
            </p>
            <p>
              Our property management service gives you predictable operations, transparent 
              reporting, and professional oversight—allowing you to own the asset without 
              managing the complexity.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className={styles.servicesSection} ref={servicesRef}>
        <div className={styles.sectionHeader}>
          <p className="eyebrow">What We Manage</p>
          <h2>Complete property <em>administration.</em></h2>
          <p className={styles.sectionSubtitle}>
            ZENNARA provides end-to-end property management covering every aspect 
            of property operations and owner requirements.
          </p>
        </div>

        <div className={styles.servicesGrid}>
          {services.map((service, index) => (
            <div 
              key={index} 
              className={`${styles.serviceCard} ${activeService === index ? styles.active : ''}`}
              onClick={() => setActiveService(index)}
            >
              <div className={styles.serviceIcon}>{service.icon}</div>
              <h3>{service.title}</h3>
              <ul className={styles.serviceList}>
                {service.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className={styles.processSection} ref={processRef}>
        <div className={styles.sectionHeader}>
          <p className="eyebrow">Our Process</p>
          <h2>How we work with <em>property owners.</em></h2>
          <p className={styles.sectionSubtitle}>
            From initial assessment to ongoing management, our proven methodology 
            ensures your property receives professional oversight and operational discipline.
          </p>
        </div>

        <div className={styles.processGrid}>
          {processSteps.map((step, index) => (
            <div key={index} className={styles.processStep}>
              <div className={styles.processNumber}>{step.number}</div>
              <div className={styles.processIcon}>{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefitsSection}>
        <div className={styles.sectionHeader}>
          <p className="eyebrow">Owner Benefits</p>
          <h2>Why property owners <em>choose ZENNARA.</em></h2>
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
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>
              <AnimatedNumber value={180} suffix="+" />
            </div>
            <div className={styles.statLabel}>Properties Under Management</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>
              <AnimatedNumber value={4} />
            </div>
            <div className={styles.statLabel}>East African Countries</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>
              <AnimatedNumber value={95} suffix="%" />
            </div>
            <div className={styles.statLabel}>Owner Satisfaction Rate</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>
              <AnimatedNumber value={98} suffix="%" />
            </div>
            <div className={styles.statLabel}>On-Time Rent Collection</div>
          </div>
        </div>
      </section>

      {/* Property Types */}
      <section className={styles.propertyTypes}>
        <div className={styles.sectionHeader}>
          <p className="eyebrow">What We Manage</p>
          <h2>Property types we <em>specialize in.</em></h2>
        </div>

        <div className={styles.typesGrid}>
          <div className={styles.typeCard}>
            <h3>Residential Properties</h3>
            <ul>
              <li>Single-family homes</li>
              <li>Multi-family apartments</li>
              <li>Townhouses and villas</li>
              <li>Residential estates</li>
              <li>Gated communities</li>
            </ul>
          </div>
          <div className={styles.typeCard}>
            <h3>Commercial Properties</h3>
            <ul>
              <li>Office buildings</li>
              <li>Retail spaces</li>
              <li>Mixed-use developments</li>
              <li>Business parks</li>
              <li>Commercial complexes</li>
            </ul>
          </div>
          <div className={styles.typeCard}>
            <h3>Property Portfolios</h3>
            <ul>
              <li>Multi-property portfolios</li>
              <li>Institutional assets</li>
              <li>Investment properties</li>
              <li>Development projects</li>
              <li>Regional property holdings</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <p className="eyebrow">Get Started</p>
          <h2>Ready to professionally manage <em>your property?</em></h2>
          <p>
            Request a proposal and discover how ZENNARA can simplify your property 
            operations, improve performance, and give you complete peace of mind.
          </p>
          <div className={styles.ctaActions}>
            <Button to="/contact" variant="gold" size="large">
              Request a Proposal
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
