# Form Validation Error Handling System

This system provides a comprehensive solution for handling 422 validation errors from Laravel APIs and displaying them properly in React forms.

## Features

- ✅ Automatic parsing of 422 validation errors
- ✅ Field-specific error display
- ✅ Client-side and server-side error handling
- ✅ Reusable form components
- ✅ TypeScript support
- ✅ Easy integration with existing forms

## Quick Start

### 1. Use the Form Validation Hook

```tsx
import { useFormValidation } from '../hooks/useFormValidation';

function MyForm() {
  const {
    errors,
    clearFieldError,
    setClientErrors,
    handleApiError,
    getFieldError,
    hasFieldError,
  } = useFormValidation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await apiCall(formData);
    } catch (error) {
      handleApiError(error); // Automatically handles 422 errors
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        className={hasFieldError('name') ? 'border-red-500' : 'border-gray-300'}
      />
      {getFieldError('name') && (
        <p className="text-red-600">{getFieldError('name')}</p>
      )}
    </form>
  );
}
```

### 2. Use the FormField Component

```tsx
import { FormField } from '../components/FormField';

function MyForm() {
  const { errors, handleApiError } = useFormValidation();

  return (
    <FormField
      label="Name"
      name="name"
      value={formData.name}
      onChange={handleInputChange}
      validationErrors={errors}
      required
    />
  );
}
```

## API Reference

### useFormValidation Hook

```tsx
const {
  errors,                    // Client-side errors
  validationErrors,         // Server-side validation errors
  clearFieldError,          // Clear error for specific field
  clearAllErrors,           // Clear all errors
  setClientErrors,          // Set client-side errors
  handleApiError,           // Handle API error responses
  getFieldError,            // Get error for specific field
  hasFieldError,            // Check if field has error
  hasErrors,                // Check if form has any errors
} = useFormValidation();
```

### parseValidationErrors Utility

```tsx
import { parseValidationErrors } from '../utils/validationErrorHandler';

// Parse 422 error response
const errors = parseValidationErrors(error);
// Returns: { name: "The name has already been taken." }
```

## Error Response Format

The system expects Laravel-style validation errors:

```json
{
  "errors": {
    "name": ["The name has already been taken."],
    "email": ["The email must be a valid email address."],
    "password": ["The password field is required."]
  }
}
```

## Form Components

### InputField

```tsx
<InputField
  label="Name"
  name="name"
  value={formData.name}
  onChange={handleChange}
  validationErrors={errors}
  required
/>
```

### SelectField

```tsx
<SelectField
  label="Status"
  name="status"
  value={formData.status}
  onChange={handleChange}
  options={[
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]}
  validationErrors={errors}
/>
```

### TextareaField

```tsx
<TextareaField
  label="Description"
  name="description"
  value={formData.description}
  onChange={handleChange}
  validationErrors={errors}
  rows={4}
/>
```

## Complete Example

See `src/examples/ValidationExample.tsx` for a complete working example.

## Migration Guide

### Before (Manual Error Handling)

```tsx
const [errors, setErrors] = useState({});

const handleSubmit = async (e) => {
  try {
    await apiCall(data);
  } catch (error) {
    if (error.response?.status === 422) {
      setErrors(error.response.data.errors);
    } else {
      setErrors({ submit: 'An error occurred' });
    }
  }
};
```

### After (Using the Hook)

```tsx
const { errors, handleApiError } = useFormValidation();

const handleSubmit = async (e) => {
  try {
    await apiCall(data);
  } catch (error) {
    handleApiError(error); // Handles everything automatically
  }
};
```

## Best Practices

1. **Always clear errors on input change**:
   ```tsx
   const handleInputChange = (e) => {
     setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
     clearFieldError(e.target.name);
   };
   ```

2. **Use the helper functions**:
   ```tsx
   // Instead of: errors.name || validationErrors.name
   getFieldError('name')
   
   // Instead of: !!(errors.name || validationErrors.name)
   hasFieldError('name')
   ```

3. **Handle both client and server validation**:
   ```tsx
   const validateForm = () => {
     const newErrors = {};
     if (!formData.name) newErrors.name = 'Name is required';
     setClientErrors(newErrors);
     return Object.keys(newErrors).length === 0;
   };
   ```

## Troubleshooting

### Errors not showing
- Make sure you're using `getFieldError()` or `hasFieldError()` instead of accessing errors directly
- Check that the error response has the correct format

### TypeScript errors
- Make sure to import the correct types
- Use `unknown` instead of `any` for error parameters

### Styling issues
- The system adds `border-red-500` class for error states
- Make sure your CSS includes the red border styles
