import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import clsx from 'clsx';

interface ErrorMessageProps {
  error: string | null;
  onClose?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  error, 
  onClose, 
  className = '' 
}) => {
  if (!error) return null;

  // Debug logging to help identify the issue
  console.log('ErrorMessage received error:', error, 'Type:', typeof error);

  // Ensure error is a string to prevent React child errors
  let displayError = '';
  if (typeof error === 'string') {
    displayError = error;
  } else if (typeof error === 'object' && error !== null) {
    // If it's an object, try to extract a meaningful message
    if ('message' in error && typeof error.message === 'string') {
      displayError = error.message;
    } else if ('errors' in error && typeof error.errors === 'object') {
      // Handle validation errors object
      const validationErrors = Object.entries(error.errors as Record<string, any>)
        .map(([field, messages]) => {
          if (Array.isArray(messages)) {
            return `${field}: ${messages.join(', ')}`;
          }
          return `${field}: ${messages}`;
        })
        .filter(Boolean)
        .join(' ');
      displayError = validationErrors || 'Validation error occurred';
    } else {
      displayError = 'An error occurred';
    }
  } else {
    displayError = String(error);
  }

  console.log('ErrorMessage displayError:', displayError);

  return (
    <div className={clsx(
      'bg-red-50 border border-red-200 rounded-md p-4',
      className
    )}>
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-800">{displayError}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
              onClick={onClose}
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
