import Button from '../components/Button/Button'
import AnimatedNumber from '../components/AnimatedNumber/AnimatedNumber'
import LazyImage from '../components/LazyImage/LazyImage'
import { advisoryTeam, testimonials, advisoryProcess } from '../data/properties'
import styles from './Advisory.module.css'

export default function Advisory() {
  return (
    <div className={styles.advisory}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <img 
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80" 
            alt="Private advisory"
            loading="eager"
            fetchpriority="high"
          />
        </div>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <p className="eyebrow">Private Advisory</p>
            <h1>Guidance that makes <em>all the difference.</em></h1>
            <p>
              From first-time buyers to seasoned investors, our advisory team provides 
              expert guidance through every step of your real estate journey across East Africa.
            </p>
          </div>
          <div className={styles.heroStats}>
            <div>
              <strong><AnimatedNumber value={250} suffix="+" /></strong>
              <span>Tenants & Owners Served</span>
            </div>
            <div>
              <strong><AnimatedNumber value={95} suffix="%" /></strong>
              <span>Satisfaction Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className={styles.processSection}>
        <div className={styles.sectionHead}>
          <p className="eyebrow">Our Process</p>
          <h2>How we <em>work together.</em></h2>
          <p>
            A proven methodology refined over years of successful tenant and partner relationships. 
            We combine market expertise with personalized service to deliver exceptional results.
          </p>
        </div>

        <div className={styles.processGrid}>
          {advisoryProcess.map((step, index) => (
            <div key={index} className={styles.processCard}>
              <div className={styles.stepNumber}>{step.step}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.teamSection}>
        <div className={styles.sectionHead}>
          <div>
            <p className="eyebrow">Our Team</p>
            <h2>Meet your <em>advisors.</em></h2>
          </div>
          <Button to="/contact" variant="outline">
            Schedule a Consultation
          </Button>
        </div>

        <div className={styles.teamGrid}>
          {advisoryTeam.map((member) => (
            <div key={member.id} className={styles.teamCard}>
              <div className={styles.teamCardImg}>
                <LazyImage src={member.img} alt={member.name} />
              </div>
              <div className={styles.teamCardBody}>
                <h3>{member.name}</h3>
                <span className={styles.role}>{member.role}</span>
                <p>{member.bio}</p>
                <a href={`mailto:${member.name.toLowerCase().replace(' ', '.')}@zennara.com`} className={styles.contactLink}>
                  Get in Touch →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonialsSection}>
        <div className={styles.sectionHead}>
          <p className="eyebrow">Tenant Stories</p>
          <h2>What our tenants <em>say.</em></h2>
          <p>
            Trusted by discerning residents, tenants, and property owners across East Africa. 
            Read what our tenants and partners have to say about working with ZENNARA.
          </p>
        </div>

        <div className={styles.testimonialsGrid}>
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className={styles.testimonialCard}>
              <blockquote>{testimonial.quote}</blockquote>
              <div className={styles.tenant}>
                <div className={styles.avatar}>{testimonial.avatar}</div>
                <div>
                  <div className={styles.name}>{testimonial.name}</div>
                  <div className={styles.title}>{testimonial.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaBackground}></div>
        <div className={styles.ctaContent}>
          <p className="eyebrow">Ready to Start?</p>
          <h2>Let's find your <em>next property.</em></h2>
          <p>
            Whether you're buying your first home, expanding your portfolio, or seeking 
            investment opportunities, our team is ready to guide you every step of the way.
          </p>
          <div className={styles.ctaActions}>
            <Button to="/contact" variant="gold">
              Schedule Consultation
            </Button>
            <Button to="/properties" variant="outline">
              Browse Properties
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
