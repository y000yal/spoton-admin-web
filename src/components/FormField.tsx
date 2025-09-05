import React from 'react';
import { getFieldError } from '../utils/validationErrorHandler';

interface FormFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  validationErrors?: Record<string, string>;
  className?: string;
  options?: Array<{ value: string | number; label: string }>;
  rows?: number;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  validationErrors,
  className = '',
  options = [],
  rows = 4,
}) => {
  const fieldError = getFieldError(validationErrors || {}, name);
  const hasError = !!fieldError;

  const inputClasses = `
    w-full px-3 py-2 border rounded-md shadow-sm 
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${hasError ? 'border-red-500' : 'border-gray-300'}
    ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
  `;

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={rows}
            className={inputClasses}
          />
        );
      
      case 'select':
        return (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className={inputClasses}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      default:
        return (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={inputClasses}
          />
        );
    }
  };

  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {fieldError && (
        <p className="mt-1 text-sm text-red-600">{fieldError}</p>
      )}
    </div>
  );
};
