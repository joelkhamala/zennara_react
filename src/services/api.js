/**
 * API service layer for ZENNARA backend integration
 * Uses environment variable VITE_API_URL (fallback to mock data)
 */

const API_URL = import.meta.env.VITE_API_URL || ''
const MOCK_DELAY = 500 // ms delay for mock requests

// Helper: handle fetch with timeout, JSON parsing, error handling
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('[API Error]', error)
    throw error
  }
}

// Mock data fallback functions
function mockResponse(data) {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), MOCK_DELAY)
  })
}

// Services
export const propertyService = {
  /**
   * Get all properties (paginated)
   * @param {object} params - page, limit, filters, sort
   */
  getAll: async (params = {}) => {
    if (!API_URL) {
      // Mock response
      const { properties } = await import('../data/properties')
      return mockResponse({
        data: properties,
        meta: { page: 1, limit: 20, total: properties.length },
      })
    }

    const query = new URLSearchParams(params).toString()
    return fetchAPI(`/properties?${query}`)
  },

  /**
   * Get single property by ID
   */
  getById: async (id) => {
    if (!API_URL) {
      const { properties } = await import('../data/properties')
      const property = properties.find(p => p.id === parseInt(id))
      return mockResponse({ data: property })
    }

    return fetchAPI(`/properties/${id}`)
  },

  /**
   * Submit inquiry about a property
   */
  submitInquiry: async (inquiry) => {
    if (!API_URL) {
      return mockResponse({
        success: true,
        message: 'Inquiry sent successfully',
        inquiryId: Date.now(),
      })
    }

    return fetchAPI('/inquiries', {
      method: 'POST',
      body: JSON.stringify(inquiry),
    })
  },
}

export const projectService = {
  /**
   * Get all development projects
   */
  getAll: async () => {
    if (!API_URL) {
      const { projects } = await import('../data/properties')
      return mockResponse({ data: projects })
    }

    return fetchAPI('/projects')
  },

  /**
   * Get project by ID
   */
  getById: async (id) => {
    if (!API_URL) {
      const { projects } = await import('../data/properties')
      const project = projects.find(p => p.id === parseInt(id))
      return mockResponse({ data: project })
    }

    return fetchAPI(`/projects/${id}`)
  },

  /**
   * Request investment info
   */
  requestInvestmentInfo: async (request) => {
    if (!API_URL) {
      return mockResponse({
        success: true,
        message: 'Investment info requested',
      })
    }

    return fetchAPI('/investments/request', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  },
}

export const advisoryService = {
  /**
   * Get advisory team members
   */
  getTeam: async () => {
    if (!API_URL) {
      const { advisoryTeam } = await import('../data/properties')
      return mockResponse({ data: advisoryTeam })
    }

    return fetchAPI('/team/advisory')
  },

  /**
   * Submit contact form
   */
  submitContact: async (contact) => {
    if (!API_URL) {
      return mockResponse({
        success: true,
        message: 'Thank you for your message',
      })
    }

    return fetchAPI('/contact', {
      method: 'POST',
      body: JSON.stringify(contact),
    })
  },

  /**
   * Schedule consultation
   */
  scheduleConsultation: async (schedule) => {
    if (!API_URL) {
      return mockResponse({
        success: true,
        message: 'Consultation scheduled',
        confirmationId: `CONF-${Date.now()}`,
      })
    }

    return fetchAPI('/consultations', {
      method: 'POST',
      body: JSON.stringify(schedule),
    })
  },
}

export const authService = {
  /**
   * Login user
   */
  login: async (credentials) => {
    if (!API_URL) {
      return mockResponse({
        token: 'mock-jwt-token',
        user: {
          id: 1,
          email: credentials.email,
          name: 'Demo User',
        },
      })
    }

    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  /**
   * Register new user
   */
  register: async (user) => {
    if (!API_URL) {
      return mockResponse({
        success: true,
        user: { id: Date.now(), ...user },
      })
    }

    return fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(user),
    })
  },
}

// Utilities
export const api = {
  get: (endpoint, params) => fetchAPI(endpoint + (params ? `?${new URLSearchParams(params)}` : '')),
  post: (endpoint, data) => fetchAPI(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => fetchAPI(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => fetchAPI(endpoint, { method: 'DELETE' }),
}

export default { propertyService, projectService, advisoryService, authService, api }
