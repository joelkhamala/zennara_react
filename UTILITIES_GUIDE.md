# 🛠️ Utilities & Hooks Guide — ZENNARA React

Quick reference for all custom hooks, utilities, and services created in Phase 4.

---

## 📦 Hooks

### `useScrollReveal`
Reveal elements on scroll using IntersectionObserver.

```jsx
import { useScrollReveal } from '../hooks/useScrollReveal'

function MyComponent() {
  const sectionRef = useScrollReveal({ threshold: 0.1 })
  
  return <section ref={sectionRef}>Content fades in when scrolled into view</section>
}
```

**Options**:
- `threshold`: 0-1 (default 0.1) — percentage visible before triggering
- `rootMargin`: e.g. '0px' (default) — margin around viewport
- `activeClass`: CSS class added (default 'revealed')
- `once`: reveal only once (default true)

---

### `useStaggerReveal`
Stagger animation for grid children.

```jsx
import { useStaggerReveal } from '../hooks/useScrollReveal'

function PropertyGrid({ properties }) {
  const gridRef = useStaggerReveal({ staggerMs: 80 })
  
  return (
    <div ref={gridRef} className="property-grid">
      {properties.map(p => <PropertyCard key={p.id} property={p} />)}
    </div>
  )
}
```

**Options**:
- `childSelector`: CSS selector (default ':scope > *')
- `staggerMs`: delay between children (default 100ms)
- `threshold`: visibility threshold (default 0.05)

---

### `useForm`
Complete form state + validation hook.

```jsx
import { useForm } from '../hooks/useForm'
import { formValidations } from '../utils/formValidation'

function ContactForm() {
  const form = useForm({
    initialValues: { name: '', email: '', message: '' },
    validations: formValidations.contact,
    onSubmit: async (values, { resetForm }) => {
      await api.submitContact(values)
      resetForm()
    },
    validateOnChange: true,
    validateOnBlur: true,
  })

  return (
    <form onSubmit={form.handleSubmit}>
      <input
        name="email"
        value={form.values.email}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        aria-invalid={form.touched.email && form.errors.email ? 'true' : 'false'}
      />
      {form.touched.email && form.errors.email && (
        <span role="alert">{form.errors.email}</span>
      )}
      <button type="submit" disabled={form.isSubmitting}>Submit</button>
    </form>
  )
}
```

**Returned Values**:
- `values` — form field values
- `errors` — validation errors object
- `touched` — fields that have been blurred
- `isSubmitting` — submission state
- `handleChange` — onChange handler
- `handleBlur` — onBlur handler
- `handleSubmit` — form submit handler
- `resetForm` — reset to initial values
- `hasErrors` — true if any errors exist
- `isValid` — true if no errors and form touched

---

## ✅ Validation Utilities

### Pre-built Validators

```js
import { validators, formValidations } from '../utils/formValidation'

// Individual validators
const nameValidators = [
  validators.required('Name is required'),
  validators.minLength(2),
  validators.maxLength(50),
]

// Pre-configured form validations
const form = useForm({
  validations: formValidations.contact,  // name, email, phone, message
  // or
  validations: formValidations.login,    // email, password
  // or
  validations: formValidations.inquiry,  // name, email, phone, message
})
```

**Available Validators**:
- `validators.required(msg?)` — field cannot be empty
- `validators.email(msg?)` — valid email format
- `validators.phone(msg?)` — valid phone format
- `validators.name(msg?)` — 2-50 characters, letters/spaces/hyphens
- `validators.minLength(n, msg?)` — minimum length
- `validators.maxLength(n, msg?)` — maximum length
- `validators.pattern(regex, msg)` — custom regex

---

## 🌐 API Services

### Property Service

```js
import { propertyService } from '../services/api'

// Get all properties
const { data, meta } = await propertyService.getAll({ page: 1, limit: 20 })

// Get single property
const { data: property } = await propertyService.getById(id)

// Submit inquiry
await propertyService.submitInquiry({
  propertyId: 5,
  name: 'John Doe',
  email: 'john@example.com',
  message: 'Interested in viewing'
})
```

---

### Project Service

```js
import { projectService } from '../services/api'

// Get all projects
const { data: projects } = await projectService.getAll()

// Get single project
const { data: project } = await projectService.getById(id)

// Request investment info
await projectService.requestInvestmentInfo({
  projectId: 2,
  name: 'Jane Smith',
  email: 'jane@example.com',
  investmentAmount: '50M'
})
```

---

### Advisory Service

```js
import { advisoryService } from '../services/api'

// Get team members
const { data: team } = await advisoryService.getTeam()

// Submit contact form
await advisoryService.submitContact({
  name: 'Alex Johnson',
  email: 'alex@example.com',
  phone: '+254700000000',
  interest: 'buying',
  message: 'Looking for a 4BR in Karen'
})

// Schedule consultation
await advisoryService.scheduleConsultation({
  name: 'Sarah Lee',
  email: 'sarah@example.com',
  date: '2027-09-15',
  time: '14:00'
})
```

---

### Auth Service

```js
import { authService } from '../services/api'

// Login
const { token, user } = await authService.login({
  email: 'user@example.com',
  password: 'password123'
})

// Register
const { success, user } = await authService.register({
  name: 'New User',
  email: 'new@example.com',
  password: 'securepass'
})
```

---

### Generic API Utility

```js
import { api } from '../services/api'

// GET request
const data = await api.get('/custom-endpoint', { param1: 'value' })

// POST request
await api.post('/custom-endpoint', { field: 'value' })

// PUT request
await api.put('/custom-endpoint/1', { field: 'updated' })

// DELETE request
await api.delete('/custom-endpoint/1')
```

---

## 🎨 Components

### SEO Component

```jsx
import SEO from '../components/SEO/SEO'

function MyPage() {
  return (
    <>
      <SEO
        title="Page Title"
        description="Page description for search engines and social media."
        canonical="/page-url"
        ogImage="https://example.com/image.jpg"
        ogTitle="Custom OG title (optional)"
        ogDescription="Custom OG description (optional)"
        keywords="real estate, luxury, nairobi"
      />
      <main>{/* page content */}</main>
    </>
  )
}
```

---

### LazyImage Component

```jsx
import LazyImage from '../components/LazyImage/LazyImage'

<LazyImage
  src="https://example.com/image.jpg"
  alt="Description"
  className={styles.customClass}
  wrapClass={styles.customWrap}
  aspectRatio="16/9"  // optional, prevents layout shift
/>
```

---

### SkeletonCard Component

```jsx
import SkeletonCard, { SkeletonGrid } from '../components/SkeletonCard/SkeletonCard'

// Single skeleton
<SkeletonCard variant="property" />
<SkeletonCard variant="project" />

// Grid of skeletons
<SkeletonGrid count={6} variant="property" />
```

---

## ♿ Accessibility Utilities

```js
import { 
  generateId, 
  keys, 
  AriaLive, 
  createFocusTrap, 
  skipLinkFocus 
} from '../utils/accessibility'

// Generate unique ID for ARIA
const id = generateId('field')  // e.g. "field-x7k9m2p"

// Keyboard constants
if (e.key === keys.ESCAPE) { /* close modal */ }

// Screen reader announcements
AriaLive.announce('Form submitted successfully', 'polite')
AriaLive.announce('Error: Invalid email', 'assertive')

// Focus trap for modals
const cleanup = createFocusTrap(modalElement)
// later: cleanup()

// Skip link focus management
skipLinkFocus()  // call once on app mount
```

---

## 🌍 Environment Variables

### Available Variables

`.env.local` (development):
```bash
VITE_API_URL=                     # Empty = use mock data
VITE_SITE_NAME=ZENNARA (Local)
VITE_SITE_DESCRIPTION=Luxury Real Estate...
VITE_SITE_URL=http://localhost:5173
```

`.env.production`:
```bash
VITE_API_URL=https://api.zennara.com/v1
VITE_SITE_NAME=ZENNARA
VITE_SITE_URL=https://zennara.com
```

### Access in Code

```js
const apiUrl = import.meta.env.VITE_API_URL
const siteName = import.meta.env.VITE_SITE_NAME
```

---

## 🎯 Quick Start Patterns

### Add SEO to a Page

```jsx
import SEO from '../components/SEO/SEO'

export default function MyPage() {
  return (
    <>
      <SEO title="My Page" description="..." canonical="/my-page" />
      {/* page content */}
    </>
  )
}
```

---

### Add Scroll Animation

```jsx
import { useScrollReveal } from '../hooks/useScrollReveal'

export default function MyPage() {
  const sectionRef = useScrollReveal()
  
  return <section ref={sectionRef}>{/* content fades in */}</section>
}
```

---

### Add Form Validation

```jsx
import { useForm } from '../hooks/useForm'
import { validators } from '../utils/formValidation'

export default function MyForm() {
  const form = useForm({
    initialValues: { email: '' },
    validations: {
      email: [validators.required(), validators.email()]
    },
    onSubmit: async (values) => {
      await api.post('/endpoint', values)
    }
  })

  return (
    <form onSubmit={form.handleSubmit}>
      <input
        name="email"
        value={form.values.email}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
      />
      {form.touched.email && form.errors.email && (
        <span>{form.errors.email}</span>
      )}
      <button type="submit">Submit</button>
    </form>
  )
}
```

---

### Fetch Data from API

```jsx
import { useEffect, useState } from 'react'
import { propertyService } from '../services/api'

export default function PropertiesList() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await propertyService.getAll()
        setProperties(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <SkeletonGrid count={6} />
  return <div>{/* render properties */}</div>
}
```

---

**Happy coding!** 🚀
