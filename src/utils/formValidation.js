/**
 * Validation utilities for forms
 */

// Validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[0-9\s\-\(\)]{10,}$/,
  name: /^[a-zA-Z\s'-]{2,50}$/,
  url: /^(https?:\/\/)?([\w\-]+\.)+[\w\-]{2,63}(\/[^\s]*)?$/,
}

// Common error messages
export const messages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  name: 'Name must be 2-50 characters',
  minLength: (n) => `Must be at least ${n} characters`,
  maxLength: (n) => `Cannot exceed ${n} characters`,
}

/**
 * Validate a field based on rules
 * @param {string} value
 * @param {Array<Function>} validators
 * @returns {string|null} error message or null if valid
 */
export function validateField(value, validators) {
  if (!validators) return null
  for (const validator of validators) {
    const error = validator(value)
    if (error) return error
  }
  return null
}

/**
 * Factory functions for common validators
 */
export const validators = {
  required: (msg = messages.required) => (value) => {
    if (!value || value.trim() === '') return msg
    return null
  },

  minLength: (n, msg) => (value) => {
    if (value && value.length < n) return msg || messages.minLength(n)
    return null
  },

  maxLength: (n, msg) => (value) => {
    if (value && value.length > n) return msg || messages.maxLength(n)
    return null
  },

  pattern: (regex, msg) => (value) => {
    if (value && !regex.test(value)) return msg
    return null
  },

  email: (msg = messages.email) => (value) => {
    if (value && !patterns.email.test(value)) return msg
    return null
  },

  phone: (msg = messages.phone) => (value) => {
    if (value && !patterns.phone.test(value)) return msg
    return null
  },

  name: (msg = messages.name) => (value) => {
    if (value && !patterns.name.test(value)) return msg
    return null
  },
}

/**
 * Debounced validation hook simulation
 * @param {Function} validate
 * @param {number} delay
 * @returns {Function} debounced validator
 */
export function debouncedValidate(validate, delay = 500) {
  let timeout
  return function(...args) {
    clearTimeout(timeout)
    return new Promise(resolve => {
      timeout = setTimeout(() => {
        resolve(validate(...args))
      }, delay)
    })
  }
}

/**
 * Pre‑configured validators for common form types
 */
export const formValidations = {
  contact: {
    name: [
      validators.required(),
      validators.minLength(2),
      validators.maxLength(50),
    ],
    email: [
      validators.required(),
      validators.email(),
    ],
    phone: [
      // Phone is optional - only validate if provided
      (value) => {
        if (!value || value.trim() === '') return null // Allow empty
        return validators.phone()(value) // Validate if provided
      }
    ],
    message: [
      validators.required(),
      validators.minLength(10, 'Please provide more details'),
      validators.maxLength(1000),
    ],
  },

  login: {
    email: [
      validators.required(),
      validators.email(),
    ],
    password: [
      validators.required(),
      validators.minLength(8, 'Password must be at least 8 characters'),
    ],
  },

  inquiry: {
    name: [
      validators.required(),
      validators.name(),
    ],
    email: [
      validators.required(),
      validators.email(),
    ],
    phone: [
      // Phone is optional - only validate if provided
      (value) => {
        if (!value || value.trim() === '') return null // Allow empty
        return validators.phone()(value) // Validate if provided
      }
    ],
    message: [
      validators.maxLength(500),
    ],
  },
}
