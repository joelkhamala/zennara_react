// SecureRent.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './SecureRent.module.css';

export default function SecureRent() {
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const testimonials = [
    {
      quote: "SecureRent has transformed how I manage my rental properties. No more chasing tenants for payments.",
      author: "Margaret Wanjiru",
      role: "Property Owner, Nairobi",
      properties: 8
    },
    {
      quote: "The guaranteed payment by the 15th gives me peace of mind to focus on growing my portfolio.",
      author: "James Omondi",
      role: "Real Estate Investor",
      properties: 12
    },
    {
      quote: "Professional, reliable, and transparent. ZENNARA has exceeded all my expectations.",
      author: "Sarah Kimani",
      role: "Commercial Property Owner",
      properties: 5
    }
  ];

  const faqs = [
    {
      question: 'How does the payment guarantee work?',
      answer: 'Under SecureRent, ZENNARA guarantees your rental income every month by the 15th, regardless of whether the tenant has paid. We front the payment to you and handle tenant recovery separately, so you never experience a missed payment.'
    },
    {
      question: 'What happens if a tenant doesn\'t pay?',
      answer: 'If a tenant fails to pay by the due date, ZENNARA still pays you in full by the 15th of the month. We then recover the outstanding rent directly from the tenant, plus applicable late fees. This is our responsibility, not yours.'
    },
    {
      question: 'What properties are eligible for SecureRent?',
      answer: 'SecureRent is available for residential and commercial properties across Kenya, Uganda, Tanzania, and Rwanda. Properties must meet our quality standards and be suitable for professional management. Contact our team for an eligibility assessment.'
    },
    {
      question: 'What are the management fees?',
      answer: 'Our property management fee typically ranges from 8-10% of the gross monthly rent (GMR), depending on property type, location, and services required. SecureRent enrollment may have additional service charges. Request a detailed proposal for your specific property.'
    },
    {
      question: 'Can I enroll multiple properties?',
      answer: 'Yes, many of our landlords enroll multiple properties under SecureRent. Portfolio landlords and owners benefit from consolidated reporting and streamlined management across all their assets.'
    },
    {
      question: 'How do I get started?',
      answer: 'Contact our advisory team to schedule a property assessment. We\'ll review your property, discuss your requirements, prepare a management proposal, and guide you through the enrollment process. Most properties can be onboarded within 2-3 weeks.'
    }
  ];

  const handleTestimonialChange = (index) => {
    setActiveTestimonial(index);
  };

  return (
    <div className={styles.secureRent}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <img 
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80" 
            alt="SecureRent Programme"
          />
        </div>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>Flagship Programme</p>
            <h1>
              Guaranteed rent, <em>every month.</em>
            </h1>
            <p>
              Under SecureRent, enrolled landlords receive their rental income by the 15th 
              of every month — whether or not the tenant has paid. ZENNARA fronts the payment 
              and handles all tenant recovery.
            </p>
          </div>
          <div className={styles.heroStat}>
            <strong>100%</strong>
            <span>Guaranteed</span>
          </div>
        </div>
      </section>

      {/* VALUE SPLIT */}
      <section className={styles.valueSection}>
        <div className={styles.valueSplit}>
          <div className={styles.valueLeft}>
            <span className={styles.valueTag}>The Guarantee</span>
            <h2 className={styles.valueTitle}>
              Payment <br />by the <em>15th</em>
            </h2>
          </div>
          <div className={styles.valueRight}>
            <div className={styles.valueItem}>
              <span className={styles.valueNumber}>01</span>
              <div>
                <h3>Tenant rent due</h3>
                <p>Your tenant's monthly rent becomes due on the 1st according to their lease agreement.</p>
              </div>
            </div>
            <div className={styles.valueItem}>
              <span className={styles.valueNumber}>02</span>
              <div>
                <h3>ZENNARA pays you</h3>
                <p>By the 15th, you receive full payment from us — regardless of tenant status.</p>
              </div>
            </div>
            <div className={styles.valueItem}>
              <span className={styles.valueNumber}>03</span>
              <div>
                <h3>We handle recovery</h3>
                <p>We manage all tenant follow-ups, recovery, and late fees on your behalf.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className={styles.benefits}>
        <div className={styles.benefitsHeader}>
          <span className={styles.sectionLabel}>Benefits</span>
          <h2>Why property owners <br />choose SecureRent</h2>
        </div>
        <div className={styles.benefitsGrid}>
          {[
            {
              icon: 'shield',
              title: 'Guaranteed Income',
              desc: 'Receive your rent by the 15th every month — guaranteed, regardless of tenant payment status.'
            },
            {
              icon: 'chart',
              title: 'Transparent Reporting',
              desc: 'Detailed monthly statements, maintenance logs, and performance metrics through your secure portal.'
            },
            {
              icon: 'heart',
              title: 'Proactive Maintenance',
              desc: 'Preventive maintenance schedules protect your asset value with 24/7 emergency response.'
            },
            {
              icon: 'legal',
              title: 'Legal Compliance',
              desc: 'All tenant agreements and dispute resolution handled professionally in accordance with local law.'
            },
            {
              icon: 'globe',
              title: 'Regional Coverage',
              desc: 'Consistent service standards across Kenya, Uganda, Tanzania, and Rwanda from a single platform.'
            },
            {
              icon: 'user',
              title: 'Tenant Screening',
              desc: 'Rigorous vetting including credit checks, employment verification, and reference validation.'
            }
          ].map((benefit, index) => (
            <motion.div 
              key={index}
              className={styles.benefitCard}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className={styles.benefitIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  {benefit.icon === 'shield' && <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" />}
                  {benefit.icon === 'chart' && <path d="M18 20V10M12 20V4M6 20V14" />}
                  {benefit.icon === 'heart' && <path d="M14.7 6.3C15.4 7.6 15.4 9.2 14.7 10.5L12 15.2L8.3 9.5C7.6 8.2 7.6 6.6 8.3 5.3C9 4 10.3 3.3 11.6 3.3C12.9 3.3 14.2 4 14.7 6.3Z" />}
                  {benefit.icon === 'legal' && <path d="M12 2L20 7L12 12L4 7L12 2Z" />}
                  {benefit.icon === 'globe' && <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />}
                  {benefit.icon === 'user' && <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" />}
                </svg>
              </div>
              <h3>{benefit.title}</h3>
              <p>{benefit.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className={styles.testimonials}>
        <div className={styles.testimonialsInner}>
          <span className={styles.sectionLabel}>Testimonials</span>
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTestimonial}
              className={styles.testimonialCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <p className={styles.testimonialQuote}>
                {testimonials[activeTestimonial].quote}
              </p>
              <div className={styles.testimonialAuthor}>
                <div>
                  <div className={styles.authorName}>
                    {testimonials[activeTestimonial].author}
                  </div>
                  <div className={styles.authorRole}>
                    {testimonials[activeTestimonial].role}
                  </div>
                </div>
                <div className={styles.authorStats}>
                  <span className={styles.propertiesCount}>
                    {testimonials[activeTestimonial].properties}
                  </span>
                  <span className={styles.propertiesLabel}>Properties</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className={styles.testimonialNav}>
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`${styles.testimonialDot} ${index === activeTestimonial ? styles.active : ''}`}
                onClick={() => handleTestimonialChange(index)}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.faq} id="how-it-works">
        <div className={styles.faqInner}>
          <div className={styles.faqHeader}>
            <span className={styles.sectionLabel}>FAQ</span>
            <h2>Common questions</h2>
          </div>
          <div className={styles.faqList}>
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`${styles.faqItem} ${openFaq === index ? styles.open : ''}`}
              >
                <button 
                  className={styles.faqQuestion}
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openFaq === index}
                >
                  <span className={styles.faqText}>{faq.question}</span>
                  <span className={styles.faqIcon}>
                    {openFaq === index ? '−' : '+'}
                  </span>
                </button>
                <div className={styles.faqAnswer}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaContent}>
            <h2>Start receiving <br />guaranteed rent</h2>
            <p>Join property owners across East Africa who never worry about late payments.</p>
          </div>
          <div className={styles.ctaActions}>
            <a href="#" className={`${styles.btn} ${styles.btnGold}`}>
              Request Proposal
            </a>
            <div className={styles.ctaContact}>
              <span>Or call us directly</span>
              <a href="tel:+254789115737">+254 789 115737</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}