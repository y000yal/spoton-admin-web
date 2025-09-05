import { useState, useCallback, useEffect } from 'react';
import { parseValidationErrors, type ValidationErrors } from '../utils/validationErrorHandler';

/**
 * Custom hook for handling form validation errors
 * Provides utilities for managing both client-side and server-side validation errors
 */
export function useFormValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Debug: Monitor validationErrors changes
  useEffect(() => {
    console.log('validationErrors changed:', validationErrors);
  }, [validationErrors]);

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
    console.error('API Error:', error);
    console.log('Error type:', typeof error);
    console.log('Error constructor:', error?.constructor?.name);
    
    // Check if it's a 422 validation error
    if (error && typeof error === 'object') {
      // Handle different error structures
      let response: any = null;
      
      // Check for direct response property
      if ('response' in error) {
        response = (error as any).response;
      }
      // Check for nested error (React Query sometimes wraps errors)
      else if ('error' in error && (error as any).error && 'response' in (error as any).error) {
        response = (error as any).error.response;
      }
      // Check if error itself has the response structure
      else if ('status' in error && 'data' in error) {
        response = error;
      }
      
      console.log('Extracted response:', response);
      
      if (response && response.status === 422) {
        console.log('Found 422 error, response data:', response.data);
        const parsedErrors = parseValidationErrors({ response });
        console.log('Parsed validation errors:', parsedErrors);
        setValidationErrors(parsedErrors);
        console.log('setValidationErrors called with:', parsedErrors);
        
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
    const result = clientError || validationError;
    console.log(`getFieldError('${field}'): clientError=${clientError}, validationError=${validationError}, result=${result}`);
    return result;
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
