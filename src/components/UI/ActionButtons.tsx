import React from 'react';
import { MoreVertical } from 'lucide-react';
import DropdownMenu from './DropdownMenu';
import PermissionGate from '../PermissionGate';

export interface ActionButton {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
  permission?: string;
}

interface ActionButtonsProps {
  primaryActions: ActionButton[];
  additionalActions?: ActionButton[];
  permissions: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  className?: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  primaryActions,
  additionalActions = [],
  permissions,
  requireAll = false,
  fallback = <div className="w-8 h-8"></div>,
  className = ''
}) => {
  const allActions = [...primaryActions, ...additionalActions];

  return (
    <div className={`flex justify-start items-center w-full ${className}`}>
      <PermissionGate 
        permissions={permissions}
        requireAll={requireAll}
        fallback={fallback}
      >
        {/* Desktop view - show primary actions directly */}
        <div className="hidden md:flex items-center space-x-1">
          {primaryActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${action.className || ''}`}
              title={action.label}
              aria-label={action.label}
            >
              {action.icon}
            </button>
          ))}
          
          {/* Show dropdown for additional actions if any */}
          {additionalActions.length > 0 && (
            <DropdownMenu
              items={additionalActions.map(action => ({
                label: action.label,
                icon: action.icon,
                onClick: action.onClick,
                className: action.className
              }))}
              trigger={<MoreVertical className="h-4 w-4" />}
              className="overflow-visible"
            />
          )}
        </div>

        {/* Mobile view - show all actions in dropdown */}
        <div className="md:hidden">
          <DropdownMenu
            items={allActions.map(action => ({
              label: action.label,
              icon: action.icon,
              onClick: action.onClick,
              className: action.className
            }))}
            trigger={<MoreVertical className="h-4 w-4" />}
            className="overflow-visible"
          />
        </div>
      </PermissionGate>
    </div>
  );
};

export default ActionButtons;
