import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  Shield, 
  Key, 
  LogOut, 
  Home
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isCollapsed, onToggle }) => {
  const { logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Roles', href: '/roles', icon: Shield },
    { name: 'Permissions', href: '/permissions', icon: Key },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Hovering Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white shadow-xl border-r border-gray-200
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}>
        {/* Header section */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-white">S</span>
          </div>
          {!isCollapsed && (
            <span className="ml-3 text-xl font-semibold text-gray-900">SpotOn</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${isCollapsed ? 'justify-center' : ''}
                    ${isActive
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon
                    className={`
                      h-5 w-5 flex-shrink-0 transition-colors duration-200
                      ${isCollapsed ? 'mr-0' : 'mr-3'}
                      ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                  />
                  {!isCollapsed && (
                    <span className="whitespace-nowrap">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all duration-200
              ${isCollapsed ? 'justify-center px-2' : 'px-3 py-2'}
            `}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? 'mr-0' : 'mr-3'}`} />
            {!isCollapsed && (
              <span className="whitespace-nowrap">Logout</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
