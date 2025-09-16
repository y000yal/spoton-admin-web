// Export all services
export { authService } from './auth';
export { userService } from './users';
export { roleService } from './roles';
export { permissionService } from './permissions';
export { sportService } from './sports';
export { centerService } from './centers';
export { areaService } from './areas';
export { mediaService } from './media';
export { countryService } from './countries';

// Export service classes for advanced usage
export { AuthService } from './auth';
export { UserService } from './users';
export { RoleService } from './roles';
export { PermissionService } from './permissions';
export { SportService } from './sports';
export { CenterService } from './centers';
export { AreaService } from './areas';
export { MediaService } from './media';
export { CountryService } from './countries';

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

export type {
  SportQueryParams
} from './sports';

export type {
  CenterQueryParams
} from './centers';

export type {
  AreaQueryParams
} from './areas';

export type {
  CountryQueryParams
} from './countries';

// Media types are imported from types/index.ts

// Legacy export for backward compatibility
import { authService } from './auth';
import { userService } from './users';
import { roleService } from './roles';
import { permissionService } from './permissions';
import { sportService } from './sports';
import { centerService } from './centers';
import { areaService } from './areas';
import { mediaService } from './media';
import { countryService } from './countries';

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

  // Sport methods
  getSports: sportService.getSports.bind(sportService),
  getSport: sportService.getSport.bind(sportService),
  createSport: sportService.createSport.bind(sportService),
  updateSport: sportService.updateSport.bind(sportService),
  deleteSport: sportService.deleteSport.bind(sportService),

  // Center methods
  getCenters: centerService.getCenters.bind(centerService),
  getCenter: centerService.getCenter.bind(centerService),
  createCenter: centerService.createCenter.bind(centerService),
  updateCenter: centerService.updateCenter.bind(centerService),
  deleteCenter: centerService.deleteCenter.bind(centerService),

  // Area methods
  getAreas: areaService.getAreas.bind(areaService),
  getArea: areaService.getArea.bind(areaService),
  createArea: areaService.createArea.bind(areaService),
  updateArea: areaService.updateArea.bind(areaService),
  deleteArea: areaService.deleteArea.bind(areaService),

  // Media methods
  getMedia: mediaService.getMedia.bind(mediaService),
  getMediaById: mediaService.getMediaById.bind(mediaService),
  createMedia: mediaService.createMedia.bind(mediaService),
  updateMedia: mediaService.updateMedia.bind(mediaService),
  deleteMedia: mediaService.deleteMedia.bind(mediaService),
  deleteMultipleMedia: (mediaIds: number[], userId: number) => mediaService.deleteMultipleMedia(mediaIds, userId),
};

// Default export for backward compatibility
export default apiService;
