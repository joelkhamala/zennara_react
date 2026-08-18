import { useState, useMemo } from 'react'
import ProjectCard from '../components/ProjectCard/ProjectCard'
import Button from '../components/Button/Button'
import AnimatedNumber from '../components/AnimatedNumber/AnimatedNumber'
import { projects } from '../data/properties'
import styles from './Projects.module.css'

export default function Projects() {
  const [filters, setFilters] = useState({
    search: '',
    location: 'all',
    status: 'all'
  })

  // Calculate total stats
  const totalUnits = projects.reduce((sum, project) => sum + project.units, 0)
  const avgROI = (projects.reduce((sum, project) => sum + parseInt(project.roi), 0) / projects.length).toFixed(0)

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Search filter
      if (filters.search && !project.title.toLowerCase().includes(filters.search.toLowerCase()) &&
          !project.location.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }

      // Location filter
      if (filters.location !== 'all' && project.city !== filters.location) {
        return false
      }

      // Status filter
      if (filters.status !== 'all' && project.status !== filters.status) {
        return false
      }

      return true
    })
  }, [filters])

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    })
  }

  const handleReset = () => {
    setFilters({
      search: '',
      location: 'all',
      status: 'all'
    })
  }

  return (
    <div className={styles.projects}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <img 
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80" 
            alt="Development projects"
            loading="eager"
            fetchpriority="high"
          />
        </div>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <p className="eyebrow">Development Projects</p>
            <h1>Invest in tomorrow's <em>landmarks.</em></h1>
            <p>
              From pre-launch opportunities to completed developments, explore our portfolio 
              of carefully selected projects across East Africa's most promising markets.
            </p>
          </div>
          <div className={styles.heroStat}>
            <strong>{projects.length}</strong>
            <span>Active Projects</span>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className={styles.projectsSection}>
        {/* Filters */}
        <div className={styles.filterBar}>
          <div className={styles.filterGrid}>
            <div className={styles.filterGroup}>
              <label htmlFor="search">Search Projects</label>
              <input
                type="text"
                id="search"
                name="search"
                placeholder="Project name or location"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="location">Location</label>
              <select
                id="location"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
              >
                <option value="all">All Locations</option>
                <option value="nairobi">Nairobi</option>
                <option value="mombasa">Mombasa</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="status">Project Status</label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="all">All Status</option>
                <option value="pre-launch">Pre-Launch</option>
                <option value="selling">Now Selling</option>
                <option value="investment">Investment</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className={styles.filterActions}>
              <Button variant="text" size="small" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Results Bar */}
        <div className={styles.resultsBar}>
          <div className={styles.resultsCount}>
            Showing <strong>{filteredProjects.length}</strong> of <strong>{projects.length}</strong> projects
          </div>
        </div>

        {/* Project Grid */}
        {filteredProjects.length > 0 ? (
          <div className={styles.projectGrid}>
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏗️</div>
            <h3>No projects found</h3>
            <p>Try adjusting your filters to see more results</p>
            <Button variant="outline" onClick={handleReset}>
              Clear All Filters
            </Button>
          </div>
        )}
      </section>

      {/* Investment Highlight */}
      <section className={styles.investmentHighlight}>
        <div className={styles.highlightContent}>
          <p className="eyebrow">Why Invest</p>
          <h2>Build wealth through <em>strategic development.</em></h2>
          <p>
            Our development projects offer exceptional returns through carefully vetted 
            opportunities in East Africa's fastest-growing markets. Partner with proven 
            developers and secure your position in tomorrow's premium addresses.
          </p>
          <Button to="/advisory" variant="gold">
            Investment Advisory
          </Button>
        </div>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>
              <AnimatedNumber value={totalUnits} />
            </div>
            <div className={styles.statLabel}>Total Units</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>
              <AnimatedNumber value={avgROI} suffix="%" />
            </div>
            <div className={styles.statLabel}>Average ROI</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <p className="eyebrow">Looking for Off-Market Deals?</p>
          <h2>Early access opportunities</h2>
          <p>
            Get exclusive access to pre-launch projects before they hit the market. 
            Our advisory team can connect you with developers and secure preferential pricing.
          </p>
          <div className={styles.ctaActions}>
            <Button to="/contact" variant="gold">
              Speak with an Advisor
            </Button>
            <Button to="/portal" variant="outline">
              Investor Portal
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
