import { useState } from 'react'
import Button from '../components/Button/Button'
import SEO from '../components/SEO/SEO'
import styles from './Contact.module.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/backend'

export default function Contact() {
  const [isSuccess, setIsSuccess] = useState(false)
  const [otpStep, setOtpStep] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpMethod, setOtpMethod] = useState('email')
  const [otpError, setOtpError] = useState('')
  const [otpSessionId, setOtpSessionId] = useState('')
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: 'property-management',
    message: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Validate form
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format'
    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) newErrors.phone = 'Invalid phone format'
    if (!formData.message.trim()) newErrors.message = 'Message is required'
    if (formData.message.trim().length < 10) newErrors.message = 'Message must be at least 10 characters'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSendingOtp(true)
    setSubmitError('')
    
    try {
      const method = formData.phone ? 'both' : 'email'
      
      const response = await fetch(`${API_URL}/submit.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'send_otp',
          email: formData.email,
          phone: formData.phone || null,
          method: method
        })
      })

      const data = await response.json()

      if (data.success) {
        setOtpMethod(data.data?.method || method)
        setOtpSessionId(data.data.session_id)
        setOtpSent(true)
        setOtpStep(true)
        console.log('✅ OTP sent successfully')
      } else {
        setSubmitError(data.error || 'Failed to send OTP. Please try again.')
      }
    } catch (error) {
      console.error('Error sending OTP:', error)
      setSubmitError('Network error. Please check your connection and try again.')
    } finally {
      setIsSendingOtp(false)
    }
  }

  // Verify OTP & Submit Form in 1 instant call
  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    
    if (otpCode.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP')
      return
    }

    setIsVerifyingOtp(true)
    setOtpError('')
    
    try {
      const response = await fetch(`${API_URL}/submit.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'verify_and_submit',
          session_id: otpSessionId,
          otp_code: otpCode,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          interest: formData.interest,
          message: formData.message
        })
      })

      const data = await response.json()

      if (data.success) {
        console.log('✅ Form verified & submitted successfully')
        setSuccessMessage('Your message has been received! We will contact you within 24 hours.')
        setIsSuccess(true)
        setOtpStep(false)
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setFormData({
            name: '',
            email: '',
            phone: '',
            interest: 'property-management',
            message: ''
          })
          setOtpCode('')
          setOtpError('')
          setIsSuccess(false)
          setSuccessMessage('')
          setOtpSessionId('')
        }, 3000)
      } else {
        setOtpError(data.error || 'Invalid OTP. Please try again.')
      }
    } catch (error) {
      console.error('Error verifying OTP:', error)
      setOtpError('Network error. Please try again.')
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  // Submit form with verified OTP
  const handleFormSubmitWithOTP = async (sessionId) => {
    setIsSubmitting(true)
    setSubmitError('')
    
    try {
      const response = await fetch(`${API_URL}/submit.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'submit_form',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          interest: formData.interest,
          message: formData.message,
          session_id: sessionId
        })
      })

      const data = await response.json()

      if (data.success) {
        console.log('✅ Form submitted successfully')
        setSuccessMessage('Your message has been received! We will contact you within 24 hours.')
        setIsSuccess(true)
        setOtpStep(false)
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setFormData({
            name: '',
            email: '',
            phone: '',
            interest: 'property-management',
            message: ''
          })
          setOtpCode('')
          setOtpError('')
          setIsSuccess(false)
          setSuccessMessage('')
          setOtpSessionId('')
        }, 3000)
      } else {
        setSubmitError(data.error || 'Failed to submit form. Please try again.')
        setOtpStep(true)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitError('Network error. Please try again.')
      setOtpStep(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.contact}>
      <SEO
        title="Contact ZENNARA | Property Management"
        description="Get in touch with ZENNARA to discuss property management, facility management, or SecureRent. Our team is ready to help property owners across East Africa."
        canonical="/contact"
      />
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <img 
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1920&q=80" 
            alt="Contact us"
            loading="eager"
            fetchpriority="high"
          />
        </div>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <p className="eyebrow">Get in Touch</p>
          <h1>Let's discuss your <em>property.</em></h1>
          <p>
            Whether you need property management, facility management, or want to learn about 
            SecureRent, our team is ready to help.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className={styles.contactSection}>
        <div className={styles.contactGrid}>
          {/* Contact Info */}
          <div className={styles.contactInfo}>
            <h2>Speak with <em>ZENNARA.</em></h2>
            <p>
              Our team is available to discuss property management services, facility operations, 
              SecureRent enrollment, or any questions about managing your property professionally.
            </p>

            <div className={styles.contactDetails}>
              <div className={styles.item}>
                <div className={styles.icon}>📍</div>
                <div>
                  <h4>Visit Us</h4>
                  <p>Nairobi, Kenya · East Africa</p>
                </div>
              </div>

              <div className={styles.item}>
                <div className={styles.icon}>📧</div>
                <div>
                  <h4>Email</h4>
                  <p>info@zennarafp.com</p>
                </div>
              </div>

              <div className={styles.item}>
                <div className={styles.icon}>📱</div>
                <div>
                  <h4>Phone / WhatsApp</h4>
                  <p>+254 789 115737</p>
                </div>
              </div>

              <div className={styles.item}>
                <div className={styles.icon}>⏰</div>
                <div>
                  <h4>Hours</h4>
                  <p>Mon–Fri: 9am–6pm EAT<br />Sat: 10am–4pm<br />Sun: Closed</p>
                </div>
              </div>
            </div>

            <div className={styles.socialLinks}>
              <h4>Follow Us</h4>
              <div className={styles.socialIcons}>
                <a href="#" aria-label="Instagram">Instagram</a>
                <a href="#" aria-label="LinkedIn">LinkedIn</a>
                <a href="#" aria-label="WhatsApp">WhatsApp</a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className={styles.formWrap}>
            <h3>Send us a message</h3>
            
            {isSuccess ? (
              <div className={styles.successMessage}>
                <div className={styles.successIcon}>✓</div>
                <h4>Message sent successfully!</h4>
                <p>{successMessage}</p>
              </div>
            ) : otpStep ? (
              <form className={styles.otpForm} onSubmit={handleOtpSubmit}>
                <div className={styles.otpHeader}>
                  <h4>
                    {otpMethod === 'both'
                      ? 'Verify your contact details'
                      : otpMethod === 'sms'
                        ? 'Verify your phone number'
                        : 'Verify your email'}
                  </h4>
                  <p>
                    {otpMethod === 'both' ? (
                      <>We've sent a 6-digit verification code to <strong>{formData.email}</strong> and <strong>{formData.phone}</strong></>
                    ) : otpMethod === 'sms' ? (
                      <>We've sent a 6-digit verification code to <strong>{formData.phone}</strong></>
                    ) : (
                      <>We've sent a 6-digit verification code to <strong>{formData.email}</strong></>
                    )}
                  </p>
                </div>

                <div className={styles.otpInputGroup}>
                  <input
                    type="text"
                    maxLength="6"
                    inputMode="numeric"
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '')
                      setOtpCode(value)
                      setOtpError('')
                    }}
                    className={styles.otpInput}
                    disabled={isVerifyingOtp || isSubmitting}
                    autoFocus
                  />
                  {otpError && (
                    <div className={styles.errorAlert} role="alert">{otpError}</div>
                  )}
                </div>

                <div className={styles.otpActions}>
                  <Button 
                    type="submit" 
                    variant="gold" 
                    size="large"
                    disabled={isVerifyingOtp || isSubmitting || otpCode.length !== 6}
                  >
                    {isVerifyingOtp || isSubmitting ? (
                      <>
                        <span className={styles.spinner}></span>
                        {isVerifyingOtp ? 'Verifying OTP...' : 'Submitting...'}
                      </>
                    ) : (
                      'Verify & Submit'
                    )}
                  </Button>
                </div>

                <div className={styles.otpOptions}>
                  <button 
                    type="button" 
                    className={styles.resendBtn}
                    onClick={() => {
                      setOtpSent(true)
                      setTimeout(() => setOtpSent(false), 30000)
                    }}
                    disabled={otpSent || isSendingOtp}
                  >
                    {otpSent ? '✓ Code sent' : 'Resend Code'}
                  </button>
                </div>

                <button 
                  type="button"
                  className={styles.backBtn}
                  onClick={() => {
                    setOtpStep(false)
                    setOtpCode('')
                    setOtpError('')
                  }}
                  disabled={isVerifyingOtp || isSubmitting}
                >
                  ← Back to Form
                </button>
              </form>
            ) : (
              <form className={styles.form} onSubmit={handleSendOTP}>
                {submitError && (
                  <div className={styles.errorAlert} role="alert">{submitError}</div>
                )}

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name *"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isSendingOtp}
                      aria-invalid={!!errors.name}
                    />
                    {errors.name && (
                      <span className={styles.error} role="alert">{errors.name}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address *"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isSendingOtp}
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && (
                      <span className={styles.error} role="alert">{errors.email}</span>
                    )}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number (optional)"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={isSendingOtp}
                      aria-invalid={!!errors.phone}
                    />
                    {errors.phone && (
                      <span className={styles.error} role="alert">{errors.phone}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <select
                      name="interest"
                      value={formData.interest}
                      onChange={handleInputChange}
                      disabled={isSendingOtp}
                    >
                      <option value="property-management">Property Management</option>
                      <option value="facility-management">Facility Management</option>
                      <option value="securerent">SecureRent Programme</option>
                      <option value="portfolio">Property Portfolio Management</option>
                      <option value="general">General Enquiry</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <textarea
                    name="message"
                    placeholder="Tell us about your property and management needs... *"
                    value={formData.message}
                    onChange={handleInputChange}
                    disabled={isSendingOtp}
                    aria-invalid={!!errors.message}
                  ></textarea>
                  {errors.message && (
                    <span className={styles.error} role="alert">{errors.message}</span>
                  )}
                </div>

                <Button 
                  type="submit" 
                  variant="gold" 
                  size="large"
                  disabled={isSendingOtp}
                >
                  {isSendingOtp ? (
                    <>
                      <span className={styles.spinner}></span>
                      Sending OTP...
                    </>
                  ) : (
                    'Request Proposal'
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className={styles.mapSection}>
        <div className={styles.mapContainer}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.823000308987!2d36.777!3d-1.2864!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1172d84d49a5%3A0xf7cf0254147f189c!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2s!4v1234567890123"
            width="100%"
            height="500"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="ZENNARA Office Location - Nairobi, Kenya"
          ></iframe>
        </div>
      </section>
    </div>
  )
}