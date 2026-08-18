import { useState, useEffect } from 'react'
import Button from '../components/Button/Button'
import styles from './Portal.module.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/backend'

export default function Portal() {
  const [activeTab, setActiveTab] = useState('client')
  const [isLogin, setIsLogin] = useState(true)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    company: ''
  })
  const [resetEmail, setResetEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authToken, setAuthToken] = useState('')
  const [userData, setUserData] = useState(null)
  
  // 2FA related state
  const [requires2FA, setRequires2FA] = useState(false)
  const [temp2FAToken, setTemp2FAToken] = useState('')
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [show2FAVerify, setShow2FAVerify] = useState(false)
  const [twoFACode, setTwoFACode] = useState('')
  const [qrCodeUri, setQrCodeUri] = useState('')
  const [backupCodes, setBackupCodes] = useState([])
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [backupCodesCount, setBackupCodesCount] = useState(0)

  // Check for existing session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      verifySession(savedToken)
    }
  }, [])

  // Check 2FA status when authenticated
  useEffect(() => {
    if (isAuthenticated && userData?.id) {
      check2FAStatus()
    }
  }, [isAuthenticated, userData?.id])

  // Verify session is still valid
  const verifySession = async (token) => {
    try {
      const response = await fetch(`${API_URL}/auth.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_session',
          token: token
        })
      })

      const data = await response.json()
      if (data.success) {
        setAuthToken(token)
        setUserData(data.user)
        setIsAuthenticated(true)
        setFormData(prev => ({
          ...prev,
          email: data.user.email,
          name: data.user.name,
          phone: data.user.phone || '',
          company: data.user.company || ''
        }))
      } else {
        localStorage.removeItem('auth_token')
      }
    } catch (error) {
      console.error('Session verification failed:', error)
      localStorage.removeItem('auth_token')
    }
  }

  const tabs = [
    { id: 'client', label: 'Client', icon: '👤' },
    { id: 'landlord', label: 'Landlord', icon: '🏢' },
    { id: 'admin', label: 'Admin', icon: '⚙️' }
  ]

  const getTabDescription = () => {
    const descriptions = {
      client: {
        login: 'Sign in to access your properties, favorites, and portfolio',
        signup: 'Create an account to start your real estate journey'
      },
      landlord: {
        login: 'Manage your properties and tenant relationships',
        signup: 'Register to list and manage your properties'
      },
      admin: {
        login: 'Access administrative dashboard and controls',
        signup: 'Admin registration requires verification'
      }
    }
    return descriptions[activeTab]
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email'
    if (!isLogin && !formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.password) newErrors.password = 'Password is required'
    if (!isLogin && formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setMessage('')
    
    try {
      const action = isLogin ? 'login' : 'register'
      const response = await fetch(`${API_URL}/auth.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action,
          email: formData.email,
          password: formData.password,
          name: formData.name,
          type: activeTab
        })
      })

      const responseData = await response.json()

      if (responseData.success) {
        if (isLogin) {
          // Check if 2FA is required
          if (responseData.requires_2fa) {
            // 2FA required: save temporary token and show 2FA verification
            setTemp2FAToken(responseData.temp_token)
            setRequires2FA(true)
            setShow2FAVerify(true)
            setFormData(prev => ({ ...prev, password: '' }))
            setMessage('2FA verification required')
          } else {
            // No 2FA: complete login
            localStorage.setItem('auth_token', responseData.token)
            setAuthToken(responseData.token)
            setUserData(responseData.user)
            setIsAuthenticated(true)
            setFormData(prev => ({ ...prev, password: '' }))
            setMessage('Login successful!')
          }
        } else {
          // Registration successful
          setIsLogin(true)
          setMessage('Account created! Please log in.')
          setFormData(prev => ({ ...prev, password: '' }))
          setTimeout(() => setMessage(''), 3000)
        }
      } else {
        setErrors({ submit: responseData.error || 'Authentication failed' })
      }
    } catch (error) {
      console.error('Auth error:', error)
      setErrors({ submit: 'Network error. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle 2FA verification during login
  const handle2FAVerification = async (e) => {
    e.preventDefault()
    if (!twoFACode.trim()) {
      setErrors({ twoFACode: '2FA code is required' })
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch(`${API_URL}/auth.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_2fa',
          temp_token: temp2FAToken,
          code: twoFACode
        })
      })

      const responseData = await response.json()

      if (responseData.success) {
        // Complete login with permanent token
        localStorage.setItem('auth_token', responseData.token)
        setAuthToken(responseData.token)
        setUserData(responseData.user)
        setIsAuthenticated(true)
        setTwoFACode('')
        setRequires2FA(false)
        setShow2FAVerify(false)
        setMessage('Login successful!')
      } else {
        setErrors({ twoFACode: responseData.error || '2FA verification failed' })
      }
    } catch (error) {
      console.error('2FA error:', error)
      setErrors({ twoFACode: 'Network error. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Setup 2FA (generate QR code and backup codes)
  const handleSetup2FA = async () => {
    if (!authToken) return

    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch(`${API_URL}/totp.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setup',
          user_id: userData?.id || formData.email
        })
      })

      const responseData = await response.json()

      if (responseData.success) {
        setQrCodeUri(responseData.qr_code_data_uri)
        setBackupCodes(responseData.backup_codes || [])
        setShow2FASetup(true)
      } else {
        setMessage(responseData.error || 'Failed to setup 2FA')
      }
    } catch (error) {
      console.error('2FA setup error:', error)
      setMessage('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Verify 2FA setup with code
  const handleVerify2FASetup = async (e) => {
    e.preventDefault()
    if (!twoFACode.trim()) {
      setErrors({ twoFACode: '2FA code is required' })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/totp.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_setup',
          user_id: userData?.id || formData.email,
          code: twoFACode
        })
      })

      const responseData = await response.json()

      if (responseData.success) {
        setIs2FAEnabled(true)
        setMessage('2FA enabled successfully!')
        setShow2FASetup(false)
        setTwoFACode('')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setErrors({ twoFACode: responseData.error || 'Invalid code' })
      }
    } catch (error) {
      console.error('2FA verification error:', error)
      setErrors({ twoFACode: 'Network error. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check 2FA status
  const check2FAStatus = async () => {
    if (!authToken || !userData?.id) return

    try {
      const response = await fetch(`${API_URL}/totp.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'status',
          user_id: userData.id
        })
      })

      const responseData = await response.json()

      if (responseData.success) {
        setIs2FAEnabled(responseData.is_enabled)
        setBackupCodesCount(responseData.backup_codes_count || 0)
      }
    } catch (error) {
      console.error('2FA status check error:', error)
    }
  }

  // Disable 2FA
  const handleDisable2FA = async () => {
    if (!authToken || !userData?.id) return

    if (!window.confirm('Are you sure you want to disable 2FA? This will reduce your account security.')) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/totp.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'disable',
          user_id: userData.id
        })
      })

      const responseData = await response.json()

      if (responseData.success) {
        setIs2FAEnabled(false)
        setBackupCodesCount(0)
        setMessage('2FA disabled successfully')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setErrors({ submit: responseData.error || 'Failed to disable 2FA' })
      }
    } catch (error) {
      console.error('Disable 2FA error:', error)
      setErrors({ submit: 'Network error. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Regenerate backup codes
  const handleRegenerateBackupCodes = async () => {
    if (!authToken || !userData?.id) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/totp.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'regenerate_backup',
          user_id: userData.id
        })
      })

      const responseData = await response.json()

      if (responseData.success) {
        setBackupCodes(responseData.backup_codes || [])
        setBackupCodesCount(responseData.backup_codes.length)
        setMessage('Backup codes regenerated. Save them in a safe place!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setErrors({ submit: responseData.error || 'Failed to regenerate backup codes' })
      }
    } catch (error) {
      console.error('Regenerate backup codes error:', error)
      setErrors({ submit: 'Network error. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Download backup codes
  const downloadBackupCodes = () => {
    if (!backupCodes || backupCodes.length === 0) return

    const content = [
      'ZENNARA Account Backup Codes',
      'Email: ' + userData?.email,
      'Generated: ' + new Date().toLocaleString(),
      '---',
      backupCodes.join('\n'),
      '---',
      'Keep these codes in a safe place. Each code can be used once if you lose access to your authenticator.'
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `zennara-backup-codes-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    if (!resetEmail) {
      setErrors({ resetEmail: 'Email is required' })
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch(`${API_URL}/auth.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_password_reset',
          email: resetEmail
        })
      })

      const data = await response.json()
      setMessage('If that email exists, a reset link has been sent.')
      setShowForgotPassword(false)
      setResetEmail('')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Reset error:', error)
      setErrors({ resetEmail: 'Failed to send reset email' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    if (!authToken) return

    setIsSubmitting(true)
    
    try {
      const response = await fetch(`${API_URL}/auth.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_profile',
          token: authToken,
          data: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            company: formData.company
          }
        })
      })

      const data = await response.json()
      if (data.success) {
        setUserData(data.user)
        setMessage('Profile updated successfully!')
        setTimeout(() => {
          setMessage('')
          setShowProfile(false)
        }, 2000)
      } else {
        setErrors({ submit: data.error })
      }
    } catch (error) {
      console.error('Update error:', error)
      setErrors({ submit: 'Failed to update profile' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'logout',
          token: authToken
        })
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('auth_token')
      setIsAuthenticated(false)
      setAuthToken('')
      setUserData(null)
      setFormData({
        email: '',
        password: '',
        name: '',
        phone: '',
        company: ''
      })
      setShowProfile(false)
    }
  }

  const description = getTabDescription()

  // Show 2FA verification screen during login
  if (requires2FA && show2FAVerify && temp2FAToken) {
    return (
      <div className={styles.portal}>
        <div className={styles.portalGrid}>
          <div className={styles.portalBrand}>
            <div className={styles.brandContent}>
              <h1>Two-Factor<br />Authentication</h1>
              <p className={styles.tagline}>
                Your account is protected with 2FA. Please verify your identity to continue.
              </p>
              <div className={styles.features}>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>🔐</span>
                  <div>
                    <h4>Extra Security</h4>
                    <p>Verify with your authenticator app</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>⏱️</span>
                  <div>
                    <h4>Time-Based</h4>
                    <p>Codes refresh every 30 seconds</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>💾</span>
                  <div>
                    <h4>Backup Codes</h4>
                    <p>Save backup codes in a safe place</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.portalForm}>
            <div className={styles.formContainer}>
              <div className={styles.formHeader}>
                <h2>Enter Verification Code</h2>
                <p>Open your authenticator app and enter the 6-digit code</p>
              </div>

              {message && <div className={styles.successMessage} style={{ marginBottom: '20px' }}>{message}</div>}
              {errors.twoFACode && <div className={styles.errorAlert} style={{ marginBottom: '20px' }}>{errors.twoFACode}</div>}

              <form className={styles.form} onSubmit={handle2FAVerification}>
                <div className={styles.formGroup}>
                  <label htmlFor="2fa-code">6-Digit Code</label>
                  <input
                    type="text"
                    id="2fa-code"
                    placeholder="000000"
                    value={twoFACode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setTwoFACode(val)
                      if (errors.twoFACode) setErrors({ ...errors, twoFACode: '' })
                    }}
                    maxLength="6"
                    pattern="\d{6}"
                    disabled={isSubmitting}
                    autoFocus
                    style={{ fontSize: '24px', letterSpacing: '8px', textAlign: 'center' }}
                  />
                  <small>or enter a backup code</small>
                  {errors.twoFACode && <span className={styles.error}>{errors.twoFACode}</span>}
                </div>

                <Button type="submit" variant="gold" size="large" disabled={isSubmitting || twoFACode.length !== 6}>
                  {isSubmitting ? (
                    <>
                      <span className={styles.spinner}></span>
                      Verifying...
                    </>
                  ) : (
                    'Verify'
                  )}
                </Button>
              </form>

              <div className={styles.formFooter}>
                <button 
                  type="button"
                  onClick={() => {
                    setShow2FAVerify(false)
                    setRequires2FA(false)
                    setTemp2FAToken('')
                    setTwoFACode('')
                    setErrors({})
                  }}
                  className={styles.toggleBtn}
                >
                  ← Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className={styles.portal}>
        <div className={styles.portalGrid}>
          <div className={styles.portalBrand}>
            <div className={styles.brandContent}>
              <h1>ZENNARA<br />Portal</h1>
              <p className={styles.tagline}>
                Welcome! You're now logged in to your {activeTab} dashboard.
              </p>
              <div className={styles.features}>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>📊</span>
                  <div>
                    <h4>Dashboard</h4>
                    <p>View your submissions and history</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>⚙️</span>
                  <div>
                    <h4>Settings</h4>
                    <p>Manage your account preferences</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>🔒</span>
                  <div>
                    <h4>Security</h4>
                    <p>Update your password and security</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.portalForm}>
            <div className={styles.formContainer}>
              <div className={styles.profileHeader}>
                <h2>👤 {userData?.name || 'User Profile'}</h2>
                <p className={styles.profileEmail}>{userData?.email}</p>
              </div>

              {message && <div className={styles.successMessage} style={{ marginBottom: '20px' }}>{message}</div>}

              <div className={styles.profileTabs}>
                <button 
                  className={`${styles.profileTab} ${!showProfile ? styles.active : ''}`}
                  onClick={() => setShowProfile(false)}
                >
                  📋 Dashboard
                </button>
                <button 
                  className={`${styles.profileTab} ${showProfile === 'edit' ? styles.active : ''}`}
                  onClick={() => setShowProfile('edit')}
                >
                  ⚙️ Edit Profile
                </button>
                <button 
                  className={`${styles.profileTab} ${showProfile === 'security' ? styles.active : ''}`}
                  onClick={() => {
                    setShowProfile('security')
                    check2FAStatus()
                  }}
                >
                  🔒 Security
                </button>
              </div>

              {!showProfile ? (
                <div className={styles.dashboard}>
                  <h3>Your {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Dashboard</h3>
                  <div className={styles.dashboardGrid}>
                    <div className={styles.dashCard}>
                      <div className={styles.dashIcon}>📧</div>
                      <div className={styles.dashContent}>
                        <h4>Email Verified</h4>
                        <p>✓ {userData?.email}</p>
                      </div>
                    </div>
                    <div className={styles.dashCard}>
                      <div className={styles.dashIcon}>🔐</div>
                      <div className={styles.dashContent}>
                        <h4>Account Status</h4>
                        <p>✓ Active</p>
                      </div>
                    </div>
                    <div className={styles.dashCard}>
                      <div className={styles.dashIcon}>📝</div>
                      <div className={styles.dashContent}>
                        <h4>Account Type</h4>
                        <p>✓ {userData?.type?.charAt(0).toUpperCase() + userData?.type?.slice(1)}</p>
                      </div>
                    </div>
                    <div className={styles.dashCard}>
                      <div className={styles.dashIcon}>🔑</div>
                      <div className={styles.dashContent}>
                        <h4>2FA Status</h4>
                        <p>{is2FAEnabled ? '✓ Enabled' : '✗ Disabled'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : showProfile === 'edit' ? (
                <form className={styles.profileEdit} onSubmit={handleProfileUpdate}>
                  <h3>Edit Profile</h3>
                  {errors.submit && <div className={styles.errorAlert} role="alert">{errors.submit}</div>}
                  
                  <div className={styles.formGroup}>
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your name"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone"
                      disabled={isSubmitting}
                    />
                  </div>
                  {activeTab === 'landlord' && (
                    <div className={styles.formGroup}>
                      <label>Company Name</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Enter your company name"
                        disabled={isSubmitting}
                      />
                    </div>
                  )}
                  <Button type="submit" variant="gold" size="large" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className={styles.spinner}></span>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </form>
              ) : showProfile === 'security' ? (
                <div className={styles.securitySection}>
                  <h3>Security Settings</h3>
                  {errors.submit && <div className={styles.errorAlert} role="alert">{errors.submit}</div>}
                  
                  {/* 2FA Management */}
                  <div className={styles.securityCard}>
                    <div className={styles.securityHeader}>
                      <div>
                        <h4>🔐 Two-Factor Authentication</h4>
                        <p>Protect your account with an extra layer of security</p>
                      </div>
                      <span className={styles.statusBadge} style={{ 
                        backgroundColor: is2FAEnabled ? '#4CAF50' : '#ccc',
                        color: 'white'
                      }}>
                        {is2FAEnabled ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>

                    {is2FAEnabled ? (
                      <>
                        <div className={styles.securityInfo}>
                          <p>✓ 2FA is currently enabled on your account</p>
                          <p>Backup codes remaining: <strong>{backupCodesCount}</strong></p>
                        </div>
                        <div className={styles.securityActions}>
                          <Button 
                            variant="secondary"
                            size="small"
                            onClick={handleRegenerateBackupCodes}
                            disabled={isSubmitting}
                          >
                            🔄 Regenerate Backup Codes
                          </Button>
                          <Button 
                            variant="danger"
                            size="small"
                            onClick={handleDisable2FA}
                            disabled={isSubmitting}
                          >
                            ❌ Disable 2FA
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={styles.securityInfo}>
                          <p>🔓 2FA is not enabled. Enable it to secure your account.</p>
                          <p>You'll use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator.</p>
                        </div>
                        <Button 
                          variant="gold"
                          size="large"
                          onClick={handleSetup2FA}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Setting up...' : '🔒 Enable 2FA'}
                        </Button>
                      </>
                    )}
                  </div>

                  {/* 2FA Setup Modal */}
                  {show2FASetup && (
                    <div className={styles.modal} style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.7)' }}>
                      <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
                        <div className={styles.modalHeader}>
                          <h3>Set Up 2FA</h3>
                          <button 
                            className={styles.closeBtn}
                            onClick={() => setShow2FASetup(false)}
                          >
                            ✕
                          </button>
                        </div>

                        <div className={styles.modalBody}>
                          <div className={styles.step}>
                            <h4>Step 1: Scan QR Code</h4>
                            <p>Use your authenticator app to scan this QR code:</p>
                            {qrCodeUri && (
                              <div style={{ textAlign: 'center', margin: '20px 0' }}>
                                <img src={qrCodeUri} alt="QR Code" style={{ width: '200px', height: '200px' }} />
                              </div>
                            )}
                          </div>

                          <div className={styles.step}>
                            <h4>Step 2: Enter Verification Code</h4>
                            <input
                              type="text"
                              placeholder="000000"
                              value={twoFACode}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                                setTwoFACode(val)
                                if (errors.twoFACode) setErrors({ ...errors, twoFACode: '' })
                              }}
                              maxLength="6"
                              pattern="\d{6}"
                              style={{ fontSize: '20px', letterSpacing: '6px', textAlign: 'center', marginTop: '10px' }}
                            />
                            {errors.twoFACode && <span className={styles.error}>{errors.twoFACode}</span>}
                          </div>

                          {backupCodes && backupCodes.length > 0 && (
                            <div className={styles.step}>
                              <h4>Step 3: Save Backup Codes</h4>
                              <p>Save these backup codes in a secure location:</p>
                              <div style={{ 
                                backgroundColor: '#f5f5f5', 
                                padding: '15px', 
                                borderRadius: '8px', 
                                margin: '10px 0',
                                fontFamily: 'monospace',
                                fontSize: '12px',
                                maxHeight: '150px',
                                overflowY: 'auto'
                              }}>
                                {backupCodes.map((code, idx) => (
                                  <div key={idx}>{code}</div>
                                ))}
                              </div>
                              <Button 
                                variant="secondary"
                                size="small"
                                onClick={downloadBackupCodes}
                              >
                                💾 Download Codes
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className={styles.modalFooter}>
                          <Button 
                            variant="secondary"
                            onClick={() => setShow2FASetup(false)}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </Button>
                          <Button 
                            variant="gold"
                            onClick={handleVerify2FASetup}
                            disabled={isSubmitting || twoFACode.length !== 6}
                          >
                            {isSubmitting ? 'Verifying...' : 'Confirm & Enable 2FA'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              <div className={styles.profileActions}>
                <button className={styles.logoutBtn} onClick={handleLogout} disabled={isSubmitting}>
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.portal}>
      <div className={styles.portalGrid}>
        <div className={styles.portalBrand}>
          <div className={styles.brandContent}>
            <h1>ZENNARA<br />Portal</h1>
            <p className={styles.tagline}>
              Your private gateway to exclusive listings, saved properties, 
              and personalized recommendations.
            </p>
            <div className={styles.features}>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>🔐</span>
                <div>
                  <h4>Secure Access</h4>
                  <p>Your data is encrypted and protected</p>
                </div>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>⭐</span>
                <div>
                  <h4>Saved Properties</h4>
                  <p>Keep track of your favorite listings</p>
                </div>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>📊</span>
                <div>
                  <h4>Market Insights</h4>
                  <p>Access exclusive reports and analytics</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.portalForm}>
          <div className={styles.formContainer}>
            <div className={styles.tabsContainer}>
              <div className={styles.tabs}>
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                  >
                    <span className={styles.tabIcon}>{tab.icon}</span>
                    <span className={styles.tabLabel}>{tab.label}</span>
                  </button>
                ))}
              </div>
              <div className={styles.tabIndicator} style={{
                left: `${(tabs.findIndex(t => t.id === activeTab) * (100/3))}%`,
                width: `${100/3}%`
              }}></div>
            </div>

            {showForgotPassword ? (
              <div>
                <div className={styles.formHeader}>
                  <h2>Reset Password</h2>
                  <p>Enter your email to receive a password reset link</p>
                </div>

                <form className={styles.form} onSubmit={handlePasswordReset}>
                  <div className={styles.formGroup}>
                    <label htmlFor="reset-email">Email Address</label>
                    <input
                      type="email"
                      id="reset-email"
                      placeholder="Enter your email"
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value)
                        if (errors.resetEmail) setErrors({ ...errors, resetEmail: '' })
                      }}
                    />
                    {errors.resetEmail && <span className={styles.error}>{errors.resetEmail}</span>}
                  </div>

                  <Button type="submit" variant="gold" size="large" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                  </Button>

                  <button 
                    type="button"
                    className={styles.toggleBtn}
                    onClick={() => setShowForgotPassword(false)}
                  >
                    ← Back to Login
                  </button>
                </form>
              </div>
            ) : (
              <>
                <div className={styles.formHeader}>
                  <h2>{isLogin ? `Welcome ${activeTab}` : `Create ${activeTab} account`}</h2>
                  <p>{isLogin ? description.login : description.signup}</p>
                </div>

                {message && <div className={styles.successMessage} style={{ marginBottom: '20px' }}>{message}</div>}

                <form className={styles.form} onSubmit={handleSubmit}>
                  {!isLogin && (
                    <div className={styles.formGroup}>
                      <label htmlFor="name">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                      {errors.name && <span className={styles.error}>{errors.name}</span>}
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                    {errors.email && <span className={styles.error}>{errors.email}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    {errors.password && <span className={styles.error}>{errors.password}</span>}
                  </div>

                  {isLogin && (
                    <div className={styles.formOptions}>
                      <label className={styles.checkbox}>
                        <input type="checkbox" />
                        <span>Remember me</span>
                      </label>
                      <button 
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className={styles.forgotLink}
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <Button type="submit" variant="gold" size="large" disabled={isSubmitting}>
                    {isSubmitting ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                  </Button>
                </form>

                <div className={styles.formFooter}>
                  <p>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin)
                        setErrors({})
                        setFormData({ email: '', password: '', name: '', phone: '', company: '' })
                      }}
                      className={styles.toggleBtn}
                    >
                      {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                  </p>
                </div>

                <div className={styles.divider}>
                  <span>or</span>
                </div>

                <div className={styles.socialAuth}>
                  <button className={styles.socialBtn}>
                    <span>Continue with Google</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
