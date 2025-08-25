# SpotOn Admin Panel - Developer Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Project Structure](#project-structure)
3. [Getting Started](#getting-started)
4. [Component Architecture](#component-architecture)
5. [State Management (Redux)](#state-management-redux)
6. [Routing](#routing)
7. [API Integration](#api-integration)
8. [UI Components](#ui-components)
9. [Creating New Components](#creating-new-components)
10. [Best Practices](#best-practices)
11. [Common Patterns](#common-patterns)
12. [Troubleshooting](#troubleshooting)

## Project Overview

**SpotOn** is a location-based service platform for booking sports slots (futsal grounds, table tennis boards, etc.). This repository contains the React-based admin panel for managing the platform.

### Key Features
- **Authentication System**: JWT-based login with automatic token refresh
- **User Management**: CRUD operations for users, roles, and permissions
- **Responsive Design**: Modern admin interface built with Tailwind CSS
- **Modular Architecture**: Reusable components and clean code structure
- **Type Safety**: Full TypeScript implementation

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite (with hot reload)
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **UI Components**: Headless UI + Lucide React Icons

## Project Structure

```
spoton-admin-web/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── UI/              # Core UI components (Button, Card, Modal, etc.)
│   │   ├── Layout/          # Layout components (Sidebar, Header)
│   │   └── index.ts         # Component exports
│   ├── pages/               # Page components
│   ├── store/               # Redux store and slices
│   │   ├── slices/          # Redux slices for different features
│   │   ├── index.ts         # Store configuration
│   │   └── hooks.ts         # Typed Redux hooks
│   ├── services/            # API services
│   ├── types/               # TypeScript type definitions
│   ├── hooks/               # Custom React hooks
│   ├── contexts/            # React contexts
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
├── public/                  # Static assets
├── tailwind.config.ts       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── package.json             # Dependencies and scripts
└── README.md                # Project documentation
```

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd spoton-admin-web

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## Component Architecture

### Component Hierarchy
```
App
├── AuthProvider (Context)
├── Router
│   ├── LoginPage (unprotected)
│   └── Protected Routes
│       ├── Layout
│       │   ├── Sidebar
│       │   ├── Header
│       │   └── Main Content
│       └── Pages
│           ├── Dashboard
│           ├── UsersPage
│           ├── RolesPage
│           └── PermissionsPage
```

### Component Categories

#### 1. Layout Components (`src/components/Layout/`)
- **Sidebar**: Navigation menu with collapsible sections
- **Header**: Top navigation bar with user menu and notifications

#### 2. UI Components (`src/components/UI/`)
- **Button**: Versatile button with multiple variants and states
- **Card**: Container component with flexible styling options
- **Modal**: Overlay dialogs with different sizes
- **DataTable**: Advanced table with sorting, pagination, and search
- **Form Components**: Input fields, selects, textareas with validation

#### 3. Page Components (`src/pages/`)
- **LoginPage**: Authentication interface
- **UsersPage**: User management with CRUD operations
- **Dashboard**: Overview and statistics

## State Management (Redux)

### Store Structure
```typescript
{
  auth: {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
  },
  users: {
    users: PaginatedResponse<User>;
    currentUser: User | null;
    filters: FilterState;
    isLoading: boolean;
    error: string | null;
  },
  roles: { /* Role management state */ },
  permissions: { /* Permission management state */ },
  ui: {
    sidebarOpen: boolean;
    notifications: Notification[];
    modals: Record<string, boolean>;
  }
}
```

### Using Redux in Components

#### 1. Accessing State
```typescript
import { useAppSelector } from '../store/hooks';

const MyComponent = () => {
  const users = useAppSelector(state => state.users.users);
  const isLoading = useAppSelector(state => state.users.isLoading);
  
  return (
    <div>
      {isLoading ? 'Loading...' : `Found ${users?.total || 0} users`}
    </div>
  );
};
```

#### 2. Dispatching Actions
```typescript
import { useAppDispatch } from '../store/hooks';
import { fetchUsers, createUser } from '../store/slices/userSlice';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  
  const handleFetchUsers = () => {
    dispatch(fetchUsers({ page: 1, limit: 10 }));
  };
  
  const handleCreateUser = (userData) => {
    dispatch(createUser(userData));
  };
  
  return (
    <div>
      <button onClick={handleFetchUsers}>Fetch Users</button>
    </div>
  );
};
```

#### 3. Async Actions (Thunks)
```typescript
// In a slice
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiService.getUsers(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// In a component
const { isLoading, error } = useAppSelector(state => state.users);
useEffect(() => {
  dispatch(fetchUsers({ page: 1, limit: 10 }));
}, [dispatch]);
```

## Routing

### Route Configuration
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="permissions" element={<PermissionsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
```

### Protected Routes
```typescript
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAppSelector(state => state.auth);
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return <Outlet />;
};
```

### Navigation
```typescript
import { useNavigate, useLocation } from 'react-router-dom';

const MyComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleNavigation = () => {
    navigate('/users');
  };
  
  return (
    <div>
      <p>Current path: {location.pathname}</p>
      <button onClick={handleNavigation}>Go to Users</button>
    </div>
  );
};
```

## API Integration

### API Service Structure
```typescript
// src/services/api.ts
class ApiService {
  private baseURL = 'https://spoton.me/api';
  private axiosInstance: AxiosInstance;
  
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
    });
    
    this.setupInterceptors();
  }
  
  // Authentication methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> { /* ... */ }
  async refreshToken(token: string): Promise<AuthResponse> { /* ... */ }
  
  // User management methods
  async getUsers(params: PaginationParams): Promise<PaginatedResponse<User>> { /* ... */ }
  async createUser(userData: CreateUserRequest): Promise<User> { /* ... */ }
  async updateUser(userId: number, userData: UpdateUserRequest): Promise<User> { /* ... */ }
  async deleteUser(userId: number): Promise<void> { /* ... */ }
}
```

### Using API Service
```typescript
import apiService from '../services/api';

const MyComponent = () => {
  const [users, setUsers] = useState([]);
  
  const fetchUsers = async () => {
    try {
      const response = await apiService.getUsers({ page: 1, limit: 10 });
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  return <div>{/* Render users */}</div>;
};
```

## UI Components

### Button Component
```typescript
import { Button } from '../components/UI';

// Basic usage
<Button onClick={handleClick}>Click me</Button>

// With variants
<Button variant="primary" size="lg" onClick={handleClick}>
  Primary Button
</Button>

<Button variant="danger" size="sm" onClick={handleDelete}>
  Delete
</Button>

// With icons
<Button leftIcon={<Plus className="h-4 w-4" />}>
  Add New
</Button>

// Loading state
<Button isLoading onClick={handleSubmit}>
  Submit
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `isLoading`: boolean
- `leftIcon`: ReactNode
- `rightIcon`: ReactNode
- `disabled`: boolean

### Card Component
```typescript
import { Card, CardHeader, CardContent, CardFooter } from '../components/UI';

<Card padding="lg" shadow="md" hover>
  <CardHeader 
    title="Card Title" 
    subtitle="Card subtitle"
    action={<Button>Action</Button>}
  />
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button variant="secondary">Cancel</Button>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

**Props:**
- `padding`: 'none' | 'sm' | 'md' | 'lg'
- `shadow`: 'none' | 'sm' | 'md' | 'lg'
- `border`: boolean
- `hover`: boolean

### Modal Component
```typescript
import { Modal } from '../components/UI';

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="lg"
  showCloseButton
  closeOnOverlayClick
>
  <div>Modal content goes here</div>
</Modal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string (optional)
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `showCloseButton`: boolean
- `closeOnOverlayClick`: boolean

### DataTable Component
```typescript
import { DataTable } from '../components/UI';

const columns = [
  {
    key: 'id',
    header: 'ID',
    width: 'w-16',
  },
  {
    key: 'name',
    header: 'Name',
    render: (value, item) => (
      <div className="font-medium">{value}</div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (value) => (
      <span className={`px-2 py-1 rounded-full ${
        value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {value}
      </span>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (_, item) => (
      <div className="flex space-x-2">
        <Button size="sm" onClick={() => handleEdit(item)}>Edit</Button>
        <Button size="sm" variant="danger" onClick={() => handleDelete(item)}>Delete</Button>
      </div>
    ),
  },
];

<DataTable
  data={users}
  columns={columns}
  isLoading={isLoading}
  onPageChange={handlePageChange}
  onSearch={handleSearch}
  searchPlaceholder="Search users..."
  showSearch
  showPagination
/>
```

**Props:**
- `data`: PaginatedResponse<T> | T[]
- `columns`: Column<T>[]
- `isLoading`: boolean
- `onPageChange`: (page: number) => void
- `onSort`: (field: string, direction: 'asc' | 'desc') => void
- `onSearch`: (query: string) => void
- `searchPlaceholder`: string
- `showSearch`: boolean
- `showPagination`: boolean

### Form Components
```typescript
import { 
  InputField, 
  SelectField, 
  TextareaField,
  FormRow,
  FormSection,
  FormActions 
} from '../components/UI';

<FormSection title="User Information" description="Enter user details">
  <FormRow>
    <InputField
      label="First Name"
      name="firstName"
      value={form.firstName}
      onChange={(e) => setForm(prev => ({ ...prev, firstName: e.target.value }))}
      required
      error={errors.firstName}
    />
    <InputField
      label="Last Name"
      name="lastName"
      value={form.lastName}
      onChange={(e) => setForm(prev => ({ ...prev, lastName: e.target.value }))}
      required
      error={errors.lastName}
    />
  </FormRow>
  
  <SelectField
    label="Role"
    name="roleId"
    value={form.roleId}
    onChange={(e) => setForm(prev => ({ ...prev, roleId: Number(e.target.value) }))}
    options={roleOptions}
    required
  />
  
  <TextareaField
    label="Description"
    name="description"
    value={form.description}
    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
    rows={4}
  />
</FormSection>

<FormActions>
  <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
  <Button onClick={handleSubmit} isLoading={isSubmitting}>Save</Button>
</FormActions>
```

## Creating New Components

### 1. Component Structure
```typescript
// src/components/MyComponent/MyComponent.tsx
import React from 'react';
import type { MyComponentProps } from './types';

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`my-component ${className}`} {...props}>
      {title && <h2 className="my-component__title">{title}</h2>}
      <div className="my-component__content">
        {children}
      </div>
    </div>
  );
};

export default MyComponent;
```

### 2. Types File
```typescript
// src/components/MyComponent/types.ts
export interface MyComponentProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}
```

### 3. Index File
```typescript
// src/components/MyComponent/index.ts
export { default as MyComponent } from './MyComponent';
export type { MyComponentProps } from './types';
```

### 4. Component Usage
```typescript
import { MyComponent } from '../components/MyComponent';

const MyPage = () => {
  return (
    <MyComponent title="My Title" onClick={() => console.log('clicked')}>
      <p>Component content</p>
    </MyComponent>
  );
};
```

### 5. Adding to UI Index
```typescript
// src/components/UI/index.ts
export { default as MyComponent } from '../MyComponent';
```

## Best Practices

### 1. Component Design
- **Single Responsibility**: Each component should have one clear purpose
- **Props Interface**: Always define TypeScript interfaces for props
- **Default Props**: Provide sensible defaults for optional props
- **Composition**: Use composition over inheritance

### 2. State Management
- **Local State**: Use `useState` for component-specific state
- **Global State**: Use Redux for shared state across components
- **Async Operations**: Use Redux thunks for API calls
- **Error Handling**: Always handle loading and error states

### 3. Performance
- **Memoization**: Use `useMemo` and `useCallback` for expensive operations
- **Lazy Loading**: Implement code splitting for large components
- **Virtual Scrolling**: Use for large lists (consider react-window)

### 4. Accessibility
- **Semantic HTML**: Use proper HTML elements
- **ARIA Labels**: Provide descriptive labels for screen readers
- **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
- **Color Contrast**: Maintain sufficient color contrast ratios

### 5. Code Organization
- **File Naming**: Use PascalCase for components, camelCase for utilities
- **Import Order**: Group imports by type (React, third-party, local)
- **Export Pattern**: Use named exports for components, default exports for main components
- **Folder Structure**: Organize by feature, not by type

## Common Patterns

### 1. Form Handling
```typescript
const [form, setForm] = useState(initialForm);
const [errors, setErrors] = useState({});

const handleInputChange = (field: string, value: any) => {
  setForm(prev => ({ ...prev, [field]: value }));
  // Clear error when user starts typing
  if (errors[field]) {
    setErrors(prev => ({ ...prev, [field]: '' }));
  }
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    await dispatch(createUser(form)).unwrap();
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

### 2. API Data Fetching
```typescript
const { data, isLoading, error } = useAppSelector(state => state.users);
const dispatch = useAppDispatch();

useEffect(() => {
  dispatch(fetchUsers({ page: 1, limit: 10 }));
}, [dispatch]);

// Handle loading state
if (isLoading) return <div>Loading...</div>;

// Handle error state
if (error) return <div>Error: {error}</div>;

// Render data
return <div>{/* Render data */}</div>;
```

### 3. Modal Management
```typescript
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);

const openModal = (item) => {
  setSelectedItem(item);
  setIsModalOpen(true);
};

const closeModal = () => {
  setIsModalOpen(false);
  setSelectedItem(null);
};

return (
  <>
    <button onClick={() => openModal(item)}>Open Modal</button>
    
    <Modal isOpen={isModalOpen} onClose={closeModal}>
      {/* Modal content */}
    </Modal>
  </>
);
```

### 4. Conditional Rendering
```typescript
// Using ternary operators
{isLoading ? <Spinner /> : <DataTable data={data} />}

// Using logical AND
{isAuthenticated && <UserMenu />}

// Using switch statements for complex conditions
const renderContent = () => {
  switch (status) {
    case 'loading':
      return <Spinner />;
    case 'error':
      return <ErrorMessage error={error} />;
    case 'success':
      return <DataTable data={data} />;
    default:
      return <EmptyState />;
  }
};
```

## Troubleshooting

### Common Issues

#### 1. TypeScript Errors
```bash
# Check for type errors
npm run type-check

# Fix import issues
import type { ComponentProps } from './types';
```

#### 2. Redux State Issues
```typescript
// Debug Redux state
import { useSelector } from 'react-redux';
const debugState = useSelector(state => state);
console.log('Redux State:', debugState);
```

#### 3. Component Not Rendering
- Check if component is properly exported
- Verify import path is correct
- Check for runtime errors in console
- Ensure component is included in routing

#### 4. Styling Issues
```bash
# Rebuild Tailwind CSS
npm run build:css

# Check Tailwind configuration
tailwind.config.ts
```

#### 5. API Calls Failing
- Verify API endpoint URLs
- Check authentication tokens
- Review network tab for errors
- Validate request/response formats

### Debug Tools
- **React DevTools**: Component inspection and state debugging
- **Redux DevTools**: State management debugging
- **Browser DevTools**: Network, console, and performance analysis
- **TypeScript**: Compile-time error checking

## Contributing

### Development Workflow
1. Create a feature branch from `main`
2. Implement your changes following the established patterns
3. Add tests for new functionality
4. Update documentation as needed
5. Submit a pull request with clear description

### Code Review Checklist
- [ ] Component follows established patterns
- [ ] TypeScript types are properly defined
- [ ] Component is accessible
- [ ] Performance considerations are addressed
- [ ] Documentation is updated
- [ ] Tests are included

---

## Need Help?

- **Documentation**: Check this guide and inline code comments
- **Issues**: Search existing issues or create new ones
- **Code Examples**: Review existing components for patterns
- **Team**: Reach out to the development team

Happy coding! 🚀
