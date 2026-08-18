import { useState, useCallback, useEffect } from 'react'
import { validateField, debouncedValidate } from '../utils/formValidation'

/**
 * useForm — hook for managing form state, validation, and submission
 *
 * @param {object} options
 * @param {object} options.initialValues - initial form values
 * @param {object} options.validations - field validation rules
 * @param {function} options.onSubmit - submission handler
 * @param {boolean} options.validateOnChange - validate on each change
 * @param {boolean} options.validateOnBlur - validate on blur
 * @param {number} options.debounceMs - debounce for async validation (0 = none)
 * @returns {object} - form state and helpers
 */
export function useForm({
  initialValues = {},
  validations = {},
  onSubmit,
  validateOnChange = true,
  validateOnBlur = true,
  debounceMs = 0,
} = {}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validate a single field
  const validate = useCallback(async (fieldName, value) => {
    const rules = validations[fieldName]
    if (!rules) return null

    if (debounceMs > 0) {
      const debounced = debouncedValidate(() => validateField(value, rules), debounceMs)
      return await debounced()
    }
    return validateField(value, rules)
  }, [validations, debounceMs])

  // Validate all fields
  const validateAll = useCallback(async () => {
    const newErrors = {}
    for (const field in validations) {
      const error = await validate(field, values[field] || '')
      if (error) newErrors[field] = error
    }
    setErrors(newErrors)
    return newErrors
  }, [validations, values, validate])

  // Handle field change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    const finalValue = type === 'checkbox' ? checked : value

    setValues(prev => ({ ...prev, [name]: finalValue }))

    // Immediate validation if enabled
    if (validateOnChange && validations[name]) {
      validate(name, finalValue).then(error => {
        setErrors(prev => ({ ...prev, [name]: error }))
      })
    }
  }, [validate, validateOnChange, validations])

  // Handle field blur
  const handleBlur = useCallback((e) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))

    // Validate on blur if enabled
    if (validateOnBlur && validations[name]) {
      validate(name, values[name] || '').then(error => {
        setErrors(prev => ({ ...prev, [name]: error }))
      })
    }
  }, [validate, validateOnBlur, validations, values])

  // Form submission
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault()

    setIsSubmitting(true)
    setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}))

    const validationErrors = await validateAll()

    if (Object.keys(validationErrors).length === 0 && onSubmit) {
      try {
        await onSubmit(values, { resetForm })
      } catch (error) {
        console.error('[Form submission error]', error)
      }
    }

    setIsSubmitting(false)
  }, [values, validateAll, onSubmit])

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  // Re‑validate when validations change
  useEffect(() => {
    if (validateOnChange) {
      Object.keys(values).forEach(field => {
        if (validations[field]) {
          validate(field, values[field] || '').then(error => {
            setErrors(prev => ({ ...prev, [field]: error }))
          })
        }
      })
    }
  }, [validations, validateOnChange])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
    setErrors,
    validate: validateAll,
    hasErrors: Object.keys(errors).length > 0,
    isValid: Object.keys(errors).length === 0 && Object.keys(touched).length > 0,
  }
}

/**
 * Quick field props generator for useForm
 */
export function fieldProps(form, fieldName) {
  return {
    name: fieldName,
    value: form.values[fieldName] || '',
    onChange: form.handleChange,
    onBlur: form.handleBlur,
    error: form.touched[fieldName] && form.errors[fieldName],
    helperText: form.touched[fieldName] && form.errors[fieldName],
  }
}
