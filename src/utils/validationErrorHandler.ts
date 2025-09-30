/**
 * Utility for handling 422 validation errors from the API
 * Converts Laravel-style validation errors into a format suitable for form fields
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationErrors {
  [field: string]: string;
}

/**
 * Parses a 422 validation error response and converts it to field-specific errors
 * @param error - The error object from axios or API response
 * @returns Object with field names as keys and error messages as values
 */
export function parseValidationErrors(error: unknown): ValidationErrors {
  const validationErrors: ValidationErrors = {};
  
  // Type guard to check if error has response property
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response: unknown }).response;
    
    if (response && typeof response === 'object' && 'data' in response) {
      const data = (response as { data: unknown }).data;
      
      if (data && typeof data === 'object') {
        // Check if error has response data with validation errors
        if ('errors' in data) {
          const errors = (data as { errors: unknown }).errors;
          
          // Handle Laravel-style validation errors
          // Format: { "field_name": ["Error message 1", "Error message 2"] }
          if (errors && typeof errors === 'object') {
            Object.entries(errors).forEach(([field, messages]) => {
              if (Array.isArray(messages) && messages.length > 0) {
                // Take the first error message for each field
                validationErrors[field] = messages[0];
              } else if (typeof messages === 'string') {
                validationErrors[field] = messages;
              }
            });
          }
        }
        
        // Check if errors are under 'message' (your API structure)
        else if ('message' in data) {
          const messageData = (data as { message: unknown }).message;
          
          // Handle if message contains field-specific errors
          if (typeof messageData === 'object' && messageData !== null) {
            Object.entries(messageData).forEach(([field, messages]) => {
              if (Array.isArray(messages) && messages.length > 0) {
                // Map 'image' field to 'sport_image' for consistency with form field names
                const fieldName = field === 'image' ? 'sport_image' : field;
                validationErrors[fieldName] = messages[0];
              } else if (typeof messages === 'string') {
                const fieldName = field === 'image' ? 'sport_image' : field;
                validationErrors[fieldName] = messages;
              }
            });
          } else if (typeof messageData === 'string') {
            // Handle single error message
            validationErrors.general = messageData;
          }
        }
        
        // Check if errors are in a different location
        else if ('general' in data) {
          const generalData = (data as { general: unknown }).general;
          // Handle if errors are nested under 'general'
          if (typeof generalData === 'object' && generalData !== null) {
            Object.entries(generalData).forEach(([field, messages]) => {
              if (Array.isArray(messages) && messages.length > 0) {
                validationErrors[field] = messages[0];
              } else if (typeof messages === 'string') {
                validationErrors[field] = messages;
              }
            });
          }
        }
      }
    }
  }
  
  // Check for error message in different locations
  else if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string') {
      validationErrors.general = message;
    }
  }

  return validationErrors;
}

/**
 * Extracts a specific field error from validation errors
 * @param errors - Validation errors object
 * @param field - Field name to get error for
 * @returns Error message for the field or undefined
 */
export function getFieldError(errors: ValidationErrors, field: string): string | undefined {
  return errors[field];
}

/**
 * Checks if there are any validation errors
 * @param errors - Validation errors object
 * @returns True if there are errors, false otherwise
 */
export function hasValidationErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Clears validation errors for a specific field
 * @param errors - Current validation errors object
 * @param field - Field to clear errors for
 * @returns New validation errors object with the field cleared
 */
export function clearFieldError(errors: ValidationErrors, field: string): ValidationErrors {
  const newErrors = { ...errors };
  delete newErrors[field];
  return newErrors;
}

/**
 * Clears all validation errors
 * @returns Empty validation errors object
 */
export function clearAllValidationErrors(): ValidationErrors {
  return {};
}

/**
 * Merges new validation errors with existing ones
 * @param existing - Existing validation errors
 * @param newErrors - New validation errors to merge
 * @returns Merged validation errors object
 */
export function mergeValidationErrors(existing: ValidationErrors, newErrors: ValidationErrors): ValidationErrors {
  return { ...existing, ...newErrors };
}
