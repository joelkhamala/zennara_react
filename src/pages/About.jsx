import { useState } from 'react'
import Button from '../components/Button/Button'
import SEO from '../components/SEO/SEO'
import { useScrollReveal, useStaggerReveal } from '../hooks/useScrollReveal'
import styles from './About.module.css'

export default function About() {
  const teamMembers = [
    {
      name: 'James Kariuki',
      role: 'Founder & CEO',
      bio: 'Property management veteran with 15+ years of experience across East Africa. Passionate about transforming property operations through technology and professional discipline.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'
    },
    {
      name: 'Sarah Omondi',
      role: 'Chief Operations Officer',
      bio: 'Operations expert leading ZENNARA\'s execution excellence. Focused on delivering consistent, high-quality property management services across all markets.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80'
    },
    {
      name: 'David Kipchoge',
      role: 'Head of SecureRent',
      bio: 'FinTech pioneer designing ZENNARA\'s flagship rent guarantee program. Ensuring landlords receive predictable income through innovative risk management.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80'
    }
  ]

  const values = [
    {
      icon: 'shield',
      title: 'Reliability',
      description: 'We deliver on our commitments. When we guarantee payment, we mean it. When we commit to service levels, we exceed them.'
    },
    {
      icon: 'target',
      title: 'Clarity',
      description: 'No hidden fees, no surprises. Transparent reporting, honest conversations, and straightforward pricing. Our clients always know where they stand.'
    },
    {
      icon: 'users',
      title: 'Partnership',
      description: 'We succeed when our clients succeed. Your property\'s performance is our priority. Your goals shape our strategy.'
    },
    {
      icon: 'zap',
      title: 'Excellence',
      description: 'We don\'t do adequate. Every interaction, every maintenance cycle, every report reflects our commitment to professional excellence.'
    }
  ]

  const milestones = [
    { year: '2018', event: 'ZENNARA founded', description: 'First property under management in Nairobi' },
    { year: '2020', event: 'Regional expansion', description: 'Operations launched in Uganda, Tanzania, and Rwanda' },
    { year: '2022', event: 'SecureRent launched', description: 'Revolutionary rent guarantee program debuts' },
    { year: '2024', event: '100+ properties', description: 'Managing premium properties across East Africa' }
  ]

  const statsRef = useScrollReveal({ threshold: 0.2 })
  const valuesRef = useScrollReveal({ threshold: 0.1 })
  const milestonesRef = useScrollReveal({ threshold: 0.1 })

  return (
    <div className={styles.about}>
      <SEO
        title="About ZENNARA | Property Management East Africa"
        description="Learn about ZENNARA's mission, values, and leadership team. Professional property and facility management across Kenya, Uganda, Tanzania, and Rwanda."
        canonical="/about"
        ogImage="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80"
      />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <img 
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80" 
            alt="ZENNARA team"
          />
        </div>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>About ZENNARA</p>
            <h1>
              Professional property management, <em>built for East Africa.</em>
            </h1>
            <p>
              For over six years, ZENNARA has partnered with property owners across Kenya, Uganda, 
              Tanzania, and Rwanda to simplify operations, protect assets, and deliver predictable returns.
            </p>
          </div>
          <div className={styles.heroStat}>
            <strong>6+</strong>
            <span>Years Active</span>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className={styles.mission}>
        <div className={styles.missionContent}>
          <div className={styles.missionLeft}>
            <span className={styles.sectionLabel}>Mission</span>
            <h2>We transform property <em>management</em> into a competitive advantage.</h2>
          </div>
          <div className={styles.missionRight}>
            <p>
              Most property owners focus on building and acquiring assets. The complexity of day-to-day 
              operations — tenant management, maintenance coordination, compliance, reporting — falls to 
              them by default. We believe property ownership shouldn't mean operational burden.
            </p>
            <p>
              ZENNARA exists to handle that complexity. Our team manages the operations so property 
              owners can focus on their investments, their businesses, and their lives.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={styles.values} ref={valuesRef}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionLabel}>Core Values</p>
          <h2>How we work</h2>
          <p className={styles.sectionSubtitle}>
            Our values guide every decision we make and shape how we serve our clients.
          </p>
        </div>
        <div className={styles.valuesGrid}>
          {values.map((value, index) => (
            <div key={index} className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {value.icon === 'shield' && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />}
                  {value.icon === 'target' && (
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                    </>
                  )}
                  {value.icon === 'users' && (
                    <>
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </>
                  )}
                  {value.icon === 'zap' && <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />}
                </svg>
              </div>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats} ref={statsRef}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>100+</div>
            <div className={styles.statLabel}>Properties Under Management</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>4</div>
            <div className={styles.statLabel}>Countries Served</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>98%</div>
            <div className={styles.statLabel}>On-Time Payment Rate</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>24/7</div>
            <div className={styles.statLabel}>Client Support</div>
          </div>
        </div>
      </section>

      {/* Milestones Section */}
      <section className={styles.milestones} ref={milestonesRef}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionLabel}>Our Journey</p>
          <h2>Building trust through <em>consistency.</em></h2>
        </div>
        <div className={styles.milestonesContainer}>
          <div className={styles.timelineContainer}>
            {milestones.map((milestone, index) => (
              <div key={index} className={styles.timelineItem}>
                <div className={styles.timelineYear}>{milestone.year}</div>
                <div className={styles.timelineContent}>
                  <h3>{milestone.event}</h3>
                  <p>{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.milestonesImage}>
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80" 
              alt="ZENNARA growth and expansion"
            />
            <div className={styles.milestonesImageOverlay}></div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <p className={styles.eyebrow}>Partner With Us</p>
          <h2>Ready to experience professional <em>property management?</em></h2>
          <p>
            Let ZENNARA handle the complexity while you focus on what matters. 
            Request a free property assessment today.
          </p>
          <div className={styles.ctaActions}>
            <Button to="/contact" variant="gold" size="large">
              Request Assessment
            </Button>
            <Button to="/securerent" variant="outline" theme="dark" size="large">
              Learn About SecureRent
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
