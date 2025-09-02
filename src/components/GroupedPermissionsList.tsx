import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Check, X } from 'lucide-react';
import type { Permission } from '../types';
import { groupPermissionsByCategory, getActionName, getResourceName } from '../utils/permissionGrouper';

interface GroupedPermissionsListProps {
  permissions: Permission[];
  selectedPermissions: number[];
  onPermissionToggle: (permissionId: number) => void;
  onSelectAll: () => void;
  onRemoveAll: () => void;
  isLoading?: boolean;
  showSelectAllButtons?: boolean;
  className?: string;
}

const GroupedPermissionsList: React.FC<GroupedPermissionsListProps> = ({
  permissions,
  selectedPermissions,
  onPermissionToggle,
  onSelectAll,
  onRemoveAll,
  isLoading = false,
  showSelectAllButtons = true,
  className = '',
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const groupedPermissions = groupPermissionsByCategory(permissions);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const expandAllGroups = () => {
    setExpandedGroups(new Set(groupedPermissions.map(group => group.name)));
  };

  const collapseAllGroups = () => {
    setExpandedGroups(new Set());
  };

  const getGroupSelectionStatus = (group: any) => {
    const groupPermissionIds = group.permissions.map((p: Permission) => p.id);
    const selectedInGroup = groupPermissionIds.filter((id: number) => selectedPermissions.includes(id));
    
    if (selectedInGroup.length === 0) {
      return 'none';
    } else if (selectedInGroup.length === groupPermissionIds.length) {
      return 'all';
    } else {
      return 'partial';
    }
  };

  const toggleGroupSelection = (group: any) => {
    const groupPermissionIds = group.permissions.map((p: Permission) => p.id);
    const selectedInGroup = groupPermissionIds.filter((id: number) => selectedPermissions.includes(id));
    
    if (selectedInGroup.length === groupPermissionIds.length) {
      // All selected, deselect all
      groupPermissionIds.forEach((id: number) => {
        if (selectedPermissions.includes(id)) {
          onPermissionToggle(id);
        }
      });
    } else {
      // Not all selected, select all
      groupPermissionIds.forEach((id: number) => {
        if (!selectedPermissions.includes(id)) {
          onPermissionToggle(id);
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Loading permissions...</span>
      </div>
    );
  }

  if (!permissions || permissions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">🔒</div>
        <p>No permissions available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {permissions.length} permissions in {groupedPermissions.length} categories
          </span>
        </div>
        
        {showSelectAllButtons && (
          <div className="flex items-center space-x-2">
            <button
              onClick={expandAllGroups}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
            >
              Expand All
            </button>
            <button
              onClick={collapseAllGroups}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
            >
              Collapse All
            </button>
            <div className="w-px h-4 bg-gray-300"></div>
            <button
              onClick={onSelectAll}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
            >
              Select All
            </button>
            <button
              onClick={onRemoveAll}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
            >
              Remove All
            </button>
          </div>
        )}
      </div>

      {/* Permission Groups */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {groupedPermissions.map((group) => {
          const isExpanded = expandedGroups.has(group.name);
          const groupStatus = getGroupSelectionStatus(group);
          const selectedCount = group.permissions.filter(p => selectedPermissions.includes(p.id)).length;
          
          return (
            <div key={group.name} className="border border-gray-200 rounded-lg">
              {/* Group Header */}
              <div
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer rounded-t-lg"
                onClick={() => toggleGroup(group.name)}
              >
                <div className="flex items-center space-x-3">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="text-lg">{group.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-500">{group.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">
                    {selectedCount}/{group.permissions.length} selected
                  </span>
                  
                  {/* Group selection indicator */}
                  <div className="flex items-center space-x-1">
                    {groupStatus === 'all' && (
                      <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                    )}
                    {groupStatus === 'partial' && (
                      <div className="w-5 h-5 bg-yellow-100 rounded flex items-center justify-center">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                      </div>
                    )}
                    {groupStatus === 'none' && (
                      <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center">
                        <X className="h-3 w-3 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Group Permissions */}
              {isExpanded && (
                <div className="p-3 bg-white rounded-b-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Permissions in this category
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleGroupSelection(group);
                      }}
                      className="text-xs text-primary-600 hover:text-primary-700 px-2 py-1 rounded hover:bg-primary-50"
                    >
                      {groupStatus === 'all' ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {group.permissions.map((permission) => (
                      <label
                        key={permission.id}
                        className="flex items-center space-x-3 p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={() => onPermissionToggle(permission.id)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {permission.display_name || permission.name}
                            </span>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                              {getActionName(permission.slug as string)}
                            </span>
                          </div>
                          {permission.description && (
                            <div className="text-sm text-gray-500 mt-1">
                              {permission.description}
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            {getResourceName(permission.slug as string)} • {permission.slug}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GroupedPermissionsList;
