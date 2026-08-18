import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'
import PageLoader from './components/PageLoader/PageLoader'

// Lazy-load all pages for code splitting
const Home                = lazy(() => import('./pages/Home'))
const About               = lazy(() => import('./pages/About'))
const Listings            = lazy(() => import('./pages/Listings'))
const Projects            = lazy(() => import('./pages/Projects'))
const PropertyManagement  = lazy(() => import('./pages/PropertyManagement'))
const FacilityManagement  = lazy(() => import('./pages/FacilityManagement'))
const SecureRent          = lazy(() => import('./pages/SecureRent'))
const Advisory            = lazy(() => import('./pages/Advisory'))
const Portal              = lazy(() => import('./pages/Portal'))
const Journal             = lazy(() => import('./pages/Journal'))
const Contact             = lazy(() => import('./pages/Contact'))
const PropertyDetails     = lazy(() => import('./pages/PropertyDetails'))
const NotFound            = lazy(() => import('./pages/NotFound'))

function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"                       element={<Home />} />
            <Route path="/about"                  element={<About />} />
            <Route path="/properties"             element={<Listings />} />
            <Route path="/projects"               element={<Projects />} />
            <Route path="/property-management"    element={<PropertyManagement />} />
            <Route path="/facility-management"    element={<FacilityManagement />} />
            <Route path="/securerent"             element={<SecureRent />} />
            <Route path="/advisory"               element={<Advisory />} />
            <Route path="/portal"                 element={<Portal />} />
            <Route path="/journal"                element={<Journal />} />
            <Route path="/contact"                element={<Contact />} />
            <Route path="/property/:id"           element={<PropertyDetails />} />
            <Route path="*"                       element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </ErrorBoundary>
  )
}

export default App
