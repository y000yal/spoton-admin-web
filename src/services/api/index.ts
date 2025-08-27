// Export all services
export { authService } from './auth';
export { userService } from './users';
export { roleService } from './roles';
export { permissionService } from './permissions';

// Export service classes for advanced usage
export { AuthService } from './auth';
export { UserService } from './users';
export { RoleService } from './roles';
export { PermissionService } from './permissions';

// Export types
export type {
  UserQueryParams,
  CreateUserData,
  UpdateUserData
} from './users';

export type {
  RoleQueryParams,
  CreateRoleData,
  UpdateRoleData
} from './roles';

export type {
  PermissionQueryParams,
  CreatePermissionData,
  UpdatePermissionData
} from './permissions';

// Legacy export for backward compatibility
import { authService } from './auth';
import { userService } from './users';
import { roleService } from './roles';
import { permissionService } from './permissions';

// Create a legacy apiService object that maintains the old interface
export const apiService = {
  // Auth methods
  login: authService.login.bind(authService),
  refreshToken: authService.refreshToken.bind(authService),
  getCurrentUser: authService.getCurrentUser.bind(authService),
  logout: authService.logout.bind(authService),

  // User methods
  getUsers: userService.getUsers.bind(userService),
  getUser: userService.getUser.bind(userService),
  createUser: userService.createUser.bind(userService),
  updateUser: userService.updateUser.bind(userService),
  deleteUser: userService.deleteUser.bind(userService),

  // Role methods
  getRoles: roleService.getRoles.bind(roleService),
  getRole: roleService.getRole.bind(roleService),
  createRole: roleService.createRole.bind(roleService),
  updateRole: roleService.updateRole.bind(roleService),
  deleteRole: roleService.deleteRole.bind(roleService),
  assignPermissions: roleService.assignPermissions.bind(roleService),
  getRolePermissions: roleService.getRolePermissions.bind(roleService),

  // Permission methods
  getPermissions: permissionService.getPermissions.bind(permissionService),
  getPermission: permissionService.getPermission.bind(permissionService),
  createPermission: permissionService.createPermission.bind(permissionService),
  updatePermission: permissionService.updatePermission.bind(permissionService),
  deletePermission: permissionService.deletePermission.bind(permissionService),
};

// Default export for backward compatibility
export default apiService;
