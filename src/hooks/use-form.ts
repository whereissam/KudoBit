import { useState, useCallback, ChangeEvent } from 'react'

export function useForm<T extends Record<string, any>>(initialState: T) {
  const [values, setValues] = useState<T>(initialState)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setValues(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name as keyof T]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }, [errors])

  const setValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }, [])

  const setError = useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }))
  }, [])

  const clearError = useCallback((name: keyof T) => {
    setErrors(prev => ({ ...prev, [name]: undefined }))
  }, [])

  const reset = useCallback(() => {
    setValues(initialState)
    setErrors({})
  }, [initialState])

  const validate = useCallback((validators: Partial<Record<keyof T, (value: any) => string | undefined>>) => {
    const newErrors: Partial<Record<keyof T, string>> = {}
    
    Object.keys(validators).forEach(key => {
      const validator = validators[key as keyof T]
      if (validator) {
        const error = validator(values[key as keyof T])
        if (error) {
          newErrors[key as keyof T] = error
        }
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [values])

  return {
    values,
    errors,
    handleChange,
    setValue,
    setError,
    clearError,
    reset,
    validate,
    hasErrors: Object.keys(errors).length > 0
  }
}

// Common validators
export const validators = {
  required: (value: any) => !value ? 'This field is required' : undefined,
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return !emailRegex.test(value) ? 'Invalid email address' : undefined
  },
  minLength: (min: number) => (value: string) => 
    value.length < min ? `Must be at least ${min} characters` : undefined,
  maxLength: (max: number) => (value: string) => 
    value.length > max ? `Must be no more than ${max} characters` : undefined,
  url: (value: string) => {
    try {
      new URL(value)
      return undefined
    } catch {
      return 'Invalid URL'
    }
  }
}