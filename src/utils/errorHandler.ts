import type { AxiosError } from 'axios';

export interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
  error?: string;
}

export const extractErrorMessage = (error: unknown): string => {
  console.log('extractErrorMessage called with:', error, 'Type:', typeof error);
  
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const responseData = axiosError.response?.data;
    
    console.log('Axios error response data:', responseData);
    
    if (responseData) {
      // Check for validation errors (422 status) - this is the main format from the API
      if (responseData.errors && typeof responseData.errors === 'object') {
        const validationErrors = Object.entries(responseData.errors)
          .map(([field, messages]) => {
            if (Array.isArray(messages)) {
              return `${field}: ${messages.join(', ')}`;
            }
            return `${field}: ${messages}`;
          })
          .filter(Boolean)
          .join(' ');
        
        console.log('Validation errors processed:', validationErrors);
        
        if (validationErrors) {
          return validationErrors;
        }
      }
      
      // Check for message field - handle both string and object cases
      if (responseData.message) {
        console.log('Message field found:', responseData.message, 'Type:', typeof responseData.message);
        
        if (typeof responseData.message === 'string') {
          return responseData.message;
        } else if (typeof responseData.message === 'object' && responseData.message !== null) {
          // Check if message contains validation errors (like the API response you showed)
          const messageObj = responseData.message as Record<string, unknown>;
          
          // Check if it looks like validation errors (has field names as keys)
          if (Object.keys(messageObj).length > 0 && 
              Object.values(messageObj).some(val => Array.isArray(val))) {
            
            const validationErrors = Object.entries(messageObj)
              .map(([field, messages]) => {
                if (Array.isArray(messages)) {
                  return `${field}: ${messages.join(', ')}`;
                }
                return `${field}: ${messages}`;
              })
              .filter(Boolean)
              .join(' ');
            
            console.log('Validation errors from message field:', validationErrors);
            
            if (validationErrors) {
              return validationErrors;
            }
          }
          
          // If message is an object but not validation errors, stringify it
          try {
            const messageStr = JSON.stringify(responseData.message);
            console.log('Stringified message object:', messageStr);
            return messageStr;
          } catch {
            return 'An error occurred';
          }
        }
      }
      
      // Check for error field
      if (responseData.error) {
        console.log('Using error field:', responseData.error);
        return String(responseData.error);
      }
    }
    
    // Check for HTTP status message
    if (axiosError.response?.statusText) {
      const statusMessage = `${axiosError.response.status}: ${axiosError.response.statusText}`;
      console.log('Using HTTP status message:', statusMessage);
      return statusMessage;
    }
  }
  
  // Fallback error messages
  if (error instanceof Error) {
    console.log('Using Error.message:', error.message);
    return error.message;
  }
  
  if (typeof error === 'string') {
    console.log('Using string error:', error);
    return error;
  }
  
  // If it's an object, try to stringify it safely
  if (typeof error === 'object' && error !== null) {
    try {
      const stringified = JSON.stringify(error);
      console.log('Stringified object error:', stringified);
      return stringified;
    } catch {
      console.log('Failed to stringify object, using fallback');
      return 'An error occurred';
    }
  }
  
  console.log('Using fallback error message');
  return 'An unexpected error occurred';
};

export const isValidationError = (error: unknown): boolean => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    return axiosError.response?.status === 422;
  }
  return false;
};

export const getValidationErrors = (error: unknown): Record<string, string[]> => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const responseData = axiosError.response?.data;
    
    if (responseData?.errors && typeof responseData.errors === 'object') {
      return responseData.errors;
    }
  }
  return {};
};

export const getFieldError = (error: unknown, fieldName: string): string | null => {
  const validationErrors = getValidationErrors(error);
  const fieldErrors = validationErrors[fieldName];
  
  if (fieldErrors && Array.isArray(fieldErrors) && fieldErrors.length > 0) {
    return fieldErrors[0]; // Return the first error for the field
  }
  
  return null;
};
