import { useState, useCallback } from 'react';
import { parseValidationErrors, type ValidationErrors } from '../utils/validationErrorHandler';

/**
 * Custom hook for handling form validation errors
 * Provides utilities for managing both client-side and server-side validation errors
 */
export function useFormValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});


  /**
   * Clear a specific field error
   */
  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    
    setValidationErrors(prev => {
      const newValidationErrors = { ...prev };
      delete newValidationErrors[field];
      return newValidationErrors;
    });
  }, []);

  /**
   * Clear all errors
   */
  const clearAllErrors = useCallback(() => {
    setErrors({});
    setValidationErrors({});
  }, []);

  /**
   * Set client-side errors
   */
  const setClientErrors = useCallback((newErrors: Record<string, string>) => {
    setErrors(newErrors);
  }, []);

  /**
   * Handle API error response
   * Automatically parses 422 validation errors and sets appropriate error state
   */
  const handleApiError = useCallback((error: unknown) => {
    // Check if it's a 422 validation error
    if (error && typeof error === 'object') {
      // Handle different error structures
      let response: unknown = null;
      
      // Check for direct response property
      if ('response' in error) {
        response = (error as { response: unknown }).response;
      }
      // Check for nested error (React Query sometimes wraps errors)
      else if ('error' in error && (error as { error: unknown }).error && 'response' in (error as { error: { response: unknown } }).error) {
        response = (error as { error: { response: unknown } }).error.response;
      }
      // Check if error itself has the response structure
      else if ('status' in error && 'data' in error) {
        response = error;
      }
      
      if (response && typeof response === 'object' && 'status' in response && response.status === 422) {
        const parsedErrors = parseValidationErrors({ response });
        setValidationErrors(parsedErrors);
        
        // Clear any existing client-side errors
        setErrors({});
        return;
      }
    }
    
    // Handle other errors - only show general error message
    setErrors({ submit: 'An error occurred. Please try again.' });
    setValidationErrors({});
  }, []);

  /**
   * Get error for a specific field
   * Returns client-side error first, then validation error
   */
  const getFieldError = useCallback((field: string): string | undefined => {
    const clientError = errors[field];
    const validationError = validationErrors[field];
    return clientError || validationError;
  }, [errors, validationErrors]);

  /**
   * Check if a field has an error
   */
  const hasFieldError = useCallback((field: string): boolean => {
    return !!(errors[field] || validationErrors[field]);
  }, [errors, validationErrors]);

  /**
   * Check if there are any errors
   */
  const hasErrors = useCallback((): boolean => {
    return Object.keys(errors).length > 0 || Object.keys(validationErrors).length > 0;
  }, [errors, validationErrors]);

  return {
    errors,
    validationErrors,
    clearFieldError,
    clearAllErrors,
    setClientErrors,
    handleApiError,
    getFieldError,
    hasFieldError,
    hasErrors,
  };
}
