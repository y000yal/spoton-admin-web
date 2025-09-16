const fs = require('fs');
const path = require('path');

// Files to update
const files = [
  'src/pages/areas/AreaDetailPage.tsx',
  'src/pages/areas/AreasPage.tsx',
  'src/pages/centers/CenterDetailPage.tsx',
  'src/pages/centers/CentersPage.tsx',
  'src/pages/media/MediaPage.tsx',
  'src/pages/permissions/PermissionDetailPage.tsx',
  'src/pages/permissions/PermissionsPage.tsx',
  'src/pages/roles/RoleDetailPage.tsx',
  'src/pages/roles/RolesPage.tsx',
  'src/pages/sports/SportDetailPage.tsx',
  'src/pages/sports/SportsPage.tsx'
];

// Permission mappings
const permissionMappings = {
  // Remove import
  "import { PERMISSIONS } from '../../utils/permissions';": "",
  "import { PERMISSIONS } from \"../../utils/permissions\";": "",
  "import { PERMISSIONS } from '../utils/permissions';": "",
  "import { PERMISSIONS } from \"../utils/permissions\";": "",
  
  // User permissions
  'PERMISSIONS.USERS_VIEW': "'user-index'",
  'PERMISSIONS.USERS_CREATE': "'user-store'",
  'PERMISSIONS.USERS_EDIT': "'user-update'",
  'PERMISSIONS.USERS_DELETE': "'user-destroy'",
  'PERMISSIONS.USERS_SHOW': "'user-show'",
  'PERMISSIONS.USERS_VIEW_ROUTE': "'user-view'",
  
  // Role permissions
  'PERMISSIONS.ROLES_VIEW': "'role-index'",
  'PERMISSIONS.ROLES_CREATE': "'role-store'",
  'PERMISSIONS.ROLES_EDIT': "'role-update'",
  'PERMISSIONS.ROLES_DELETE': "'role-destroy'",
  'PERMISSIONS.ROLES_SHOW': "'role-show'",
  'PERMISSIONS.ROLES_VIEW_ROUTE': "'role-view'",
  'PERMISSIONS.ROLES_GET_PERMISSIONS': "'role-getpermissions'",
  'PERMISSIONS.ROLES_SYNC_PERMISSIONS': "'role-syncpermissions'",
  
  // Permission permissions
  'PERMISSIONS.PERMISSIONS_VIEW': "'permission-index'",
  'PERMISSIONS.PERMISSIONS_CREATE': "'permission-store'",
  'PERMISSIONS.PERMISSIONS_EDIT': "'permission-update'",
  'PERMISSIONS.PERMISSIONS_DELETE': "'permission-destroy'",
  'PERMISSIONS.PERMISSIONS_SHOW': "'permission-show'",
  'PERMISSIONS.PERMISSIONS_VIEW_ROUTE': "'permission-view'",
  
  // Sport permissions
  'PERMISSIONS.SPORTS_VIEW': "'sport-index'",
  'PERMISSIONS.SPORTS_CREATE': "'sport-store'",
  'PERMISSIONS.SPORTS_EDIT': "'sport-update'",
  'PERMISSIONS.SPORTS_DELETE': "'sport-destroy'",
  'PERMISSIONS.SPORTS_SHOW': "'sport-show'",
  'PERMISSIONS.SPORTS_VIEW_ROUTE': "'sport-view'",
  
  // Center permissions
  'PERMISSIONS.CENTERS_VIEW': "'center-index'",
  'PERMISSIONS.CENTERS_CREATE': "'center-store'",
  'PERMISSIONS.CENTERS_EDIT': "'center-update'",
  'PERMISSIONS.CENTERS_DELETE': "'center-destroy'",
  'PERMISSIONS.CENTERS_SHOW': "'center-show'",
  'PERMISSIONS.CENTERS_VIEW_ROUTE': "'center-view'",
  
  // Area permissions
  'PERMISSIONS.AREAS_VIEW': "'area-index'",
  'PERMISSIONS.AREAS_CREATE': "'area-store'",
  'PERMISSIONS.AREAS_EDIT': "'area-update'",
  'PERMISSIONS.AREAS_DELETE': "'area-destroy'",
  'PERMISSIONS.AREAS_SHOW': "'area-show'",
  'PERMISSIONS.AREAS_VIEW_ROUTE': "'area-view'",
  
  // Media permissions
  'PERMISSIONS.MEDIA_VIEW': "'media-index'",
  'PERMISSIONS.MEDIA_CREATE': "'media-store'",
  'PERMISSIONS.MEDIA_EDIT': "'media-update'",
  'PERMISSIONS.MEDIA_DELETE': "'media-destroy'",
  'PERMISSIONS.MEDIA_SHOW': "'media-show'",
  'PERMISSIONS.MEDIA_VIEW_ROUTE': "'media-view'",
  
  // Dashboard permissions
  'PERMISSIONS.DASHBOARD_VIEW': "'dashboard-index'",
  'PERMISSIONS.DASHBOARD_VIEW_ROUTE': "'dashboard-view'"
};

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Apply all mappings
    Object.entries(permissionMappings).forEach(([oldValue, newValue]) => {
      if (content.includes(oldValue)) {
        content = content.replace(new RegExp(oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newValue);
        changed = true;
      }
    });
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    } else {
      console.log(`No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
});

console.log('Done!');
