import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';
import { getFieldError } from '../../utils/validationErrorHandler';

// Input Field Component
export interface InputFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  validationErrors?: Record<string, string>;
  className?: string;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  validationErrors,
  disabled = false,
  className = '',
  icon,
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;
  const hasLeftIcon = leftIcon || icon;
  const hasRightIcon = rightIcon || showPasswordToggle;
  
  // Get field error from validation errors or use direct error prop
  const fieldError = error || (validationErrors ? getFieldError(validationErrors, name) : undefined);

  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {hasLeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon || icon}
          </div>
        )}
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            input-field
            ${hasLeftIcon ? 'pl-10' : ''}
            ${hasRightIcon ? 'pr-10' : ''}
            ${fieldError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
          `}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {rightIcon}
          </div>
        )}
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        )}
      </div>
      {fieldError && (
        <p className="mt-1 text-sm text-red-600">{fieldError}</p>
      )}
    </div>
  );
};

// Select Field Component
export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  validationErrors?: Record<string, string>;
  className?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  disabled = false,
  error,
  validationErrors,
  className = '',
}) => {
  // Get field error from validation errors or use direct error prop
  const fieldError = error || (validationErrors ? getFieldError(validationErrors, name) : undefined);
  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={clsx(
          'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
          'focus:outline-none focus:ring-primary-500 focus:border-primary-500',
          'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
          fieldError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : '',
          className
        )}
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
      {fieldError && <p className="mt-1 text-sm text-red-600">{fieldError}</p>}
    </div>
  );
};

// Textarea Field Component
interface TextareaFieldProps {
  label?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  validationErrors?: Record<string, string>;
  disabled?: boolean;
  rows?: number;
  className?: string;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  validationErrors,
  disabled = false,
  rows = 4,
  className = '',
}) => {
  // Get field error from validation errors or use direct error prop
  const fieldError = error || (validationErrors ? getFieldError(validationErrors, name) : undefined);
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`
          input-field
          resize-vertical
          ${fieldError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
        `}
      />
      {fieldError && (
        <p className="mt-1 text-sm text-red-600">{fieldError}</p>
      )}
    </div>
  );
};

// Form Row Component
interface FormRowProps {
  children: React.ReactNode;
  className?: string;
}

export const FormRow: React.FC<FormRowProps> = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      {children}
    </div>
  );
};

// Form Section Component
interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  description, 
  children, 
  className = '' 
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {(title || description) && (
        <div>
          {title && (
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

// Form Actions Component
interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
};
