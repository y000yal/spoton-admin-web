# API Services Structure

This directory contains a modular API service architecture that breaks down the monolithic `api.ts` file into organized, maintainable services.

## Structure

```
src/services/api/
├── base.ts          # Base API service with common functionality
├── auth.ts          # Authentication services
├── users.ts         # User management services
├── roles.ts         # Role management services
├── permissions.ts   # Permission management services
└── index.ts         # Main export file with backward compatibility
```

## Services

### BaseApiService (`base.ts`)
- Handles axios configuration and interceptors
- Manages authentication tokens
- Handles token refresh logic
- Provides common HTTP client functionality

### AuthService (`auth.ts`)
- User login/logout
- Token refresh
- Current user data retrieval
- JWT token decoding

### UserService (`users.ts`)
- CRUD operations for users
- User listing with pagination and filtering
- User profile management

### RoleService (`roles.ts`)
- CRUD operations for roles
- Role permissions management
- Role listing with pagination and filtering

### PermissionService (`permissions.ts`)
- CRUD operations for permissions
- Permission listing with pagination and filtering

## Usage

### Modern Approach (Recommended)
```typescript
import { userService, roleService, authService } from '../services/api';

// Use specific services
const users = await userService.getUsers();
const roles = await roleService.getRoles();
const currentUser = await authService.getCurrentUser();
```

### Legacy Approach (Backward Compatible)
```typescript
import apiService from '../services/api';

// Still works as before
const users = await apiService.getUsers();
const roles = await apiService.getRoles();
```

## Benefits

1. **Modularity**: Each service handles a specific domain
2. **Maintainability**: Easier to find and modify specific functionality
3. **Type Safety**: Better TypeScript support with specific interfaces
4. **Testability**: Individual services can be tested in isolation
5. **Scalability**: Easy to add new services or modify existing ones
6. **Backward Compatibility**: Existing code continues to work

## Adding New Services

1. Create a new service file (e.g., `notifications.ts`)
2. Extend `BaseApiService`
3. Implement your API methods
4. Export the service and add it to `index.ts`
5. Update the legacy `apiService` object if needed

## Migration Guide

### From Old `api.ts` to New Structure

**Before:**
```typescript
import apiService from '../services/api';
const users = await apiService.getUsers();
```

**After:**
```typescript
import { userService } from '../services/api';
const users = await userService.getUsers();
```

### Type Definitions

Each service exports its own interfaces for better type safety:

```typescript
import type { 
  UserQueryParams, 
  CreateUserData, 
  UpdateUserData 
} from '../services/api';
```

## Error Handling

All services inherit error handling from `BaseApiService`:
- Automatic token refresh on 401 responses
- Request/response interceptors
- Centralized logout handling

## Authentication

The base service automatically:
- Adds Authorization headers to requests
- Handles token refresh
- Manages failed request queues
- Redirects to login on authentication failure
