import React, { useState } from 'react';
import { Button, Card } from '../components/UI';
import { FormField } from '../components/FormField';
import { useFormValidation } from '../hooks/useFormValidation';

/**
 * Example component demonstrating how to use the validation error handling system
 * This shows how to handle 422 validation errors from the API
 */
export const ValidationExample: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    status: 'active',
  });

  const {
    errors,
    clearFieldError,
    setClientErrors,
    handleApiError,
    getFieldError,
    hasFieldError,
  } = useFormValidation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    clearFieldError(name);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    
    setClientErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Simulate API call that might return 422 validation errors
      const response = await fetch('/api/example', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw { response: { status: response.status, data: errorData } };
      }
      
      // Success
      console.log('Form submitted successfully');
    } catch (error: unknown) {
      handleApiError(error);
    }
  };

  const simulate422Error = () => {
    // Simulate a 422 validation error response
    const mockError = {
      response: {
        status: 422,
        data: {
          errors: {
            name: ['The name has already been taken.'],
            email: ['The email must be a valid email address.', 'The email has already been taken.'],
            description: ['The description field is required when status is active.'],
          }
        }
      }
    };
    
    handleApiError(mockError);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Form Validation Example
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
              required
              validationErrors={errors}
            />
            
            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
              validationErrors={errors}
            />
            
            <FormField
              label="Description"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter description"
              rows={3}
              validationErrors={errors}
            />
            
            <FormField
              label="Status"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleInputChange}
              required
              validationErrors={errors}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
            
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
            
            <div className="flex space-x-4">
              <Button type="submit">
                Submit Form
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={simulate422Error}
              >
                Simulate 422 Error
              </Button>
            </div>
          </form>
          
          <div className="mt-8 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              How it works:
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Client-side validation runs on form submit</li>
              <li>• 422 API errors are automatically parsed and displayed</li>
              <li>• Errors are cleared when user starts typing</li>
              <li>• Click "Simulate 422 Error" to see server validation errors</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
