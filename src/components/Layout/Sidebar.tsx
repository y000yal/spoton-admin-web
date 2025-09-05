import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  Shield, 
  Key, 
  LogOut, 
  Home,
  Trophy,
  Globe,
  Camera
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getFilteredNavigationItems } from '../../utils/permissions';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  onCollapseToggle?: () => void;
  isDesktop: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isCollapsed, onToggle, onCollapseToggle, isDesktop }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Determine if backdrop should be shown
  // On mobile: show when sidebar is open
  // On desktop: show when sidebar is expanded (not collapsed)
  const shouldShowBackdrop = isOpen && (isDesktop ? !isCollapsed : true);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      // Only handle clicks when backdrop should be shown
      if (!shouldShowBackdrop) return;
      
      const target = event.target as Node;
      
      // Check if click is outside the sidebar
      if (sidebarRef.current && !sidebarRef.current.contains(target)) {
      
        
        // On mobile: always close when clicking outside
        // On desktop: only close if expanded (collapse it)
        if (isDesktop) {
          // On desktop, collapse the sidebar instead of closing it
          // We need to call the collapse toggle instead of the mobile toggle
          // This will be handled by the backdrop click
        } else {
          onToggle();
        }
      }
    };

    // Add listener when backdrop should be shown
    if (shouldShowBackdrop) {
      document.body.addEventListener('click', handleDocumentClick);
    }

    return () => {
      document.body.removeEventListener('click', handleDocumentClick);
    };
  }, [shouldShowBackdrop, isDesktop, isCollapsed, onToggle]);

  // Get filtered navigation items based on user permissions
  const filteredNavigationItems = getFilteredNavigationItems(user);
  
  // Map navigation items to include icons
  const iconMap = {
    'Dashboard': Home,
    'Users': Users,
    'Roles': Shield,
    'Permissions': Key,
    'Sports': Trophy,
    'Countries': Globe,
    'Media': Camera,
  };
  
  const navigation = filteredNavigationItems.map(item => ({
    ...item,
    icon: iconMap[item.name as keyof typeof iconMap] || Home,
  }));

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      
      {/* Full screen backdrop - show when sidebar is open on mobile OR expanded on desktop */}
      {shouldShowBackdrop && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-30"
          style={{ 
            zIndex: 30,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            width: '100vw',
            height: '100vh'
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (isDesktop && onCollapseToggle) {
              // On desktop, collapse the sidebar
              onCollapseToggle();
            } else {
              // On mobile, close the sidebar
              onToggle();
            }
          }}
        />
      )}

      {/* Hovering Sidebar */}
      <div 
        ref={sidebarRef}
        className={`
          fixed inset-y-0 left-0 z-40 bg-white shadow-2xl border-r border-gray-200
          transition-all duration-500 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-16' : 'w-64'}
          lg:shadow-2xl
        `}
        style={{ zIndex: 40 }}
      >
        {/* Header section */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200 overflow-hidden">
          <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-white">S</span>
          </div>
          <div className={`
            transition-all duration-500 ease-out overflow-hidden
            ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-3'}
            lg:block
          `}>
            <span className="text-xl font-semibold text-gray-900 whitespace-nowrap">SpotOn</span>
          </div>
        </div>

        {/* Desktop toggle button - positioned at right edge of sidebar like a flag */}
        {isDesktop && (
          <div className="absolute top-20" style={{ right: '-24px', zIndex: 9999 }}> 
            <button
              onClick={onCollapseToggle}
              className={`
                flex items-center justify-center w-6 h-8 
                bg-white hover:shadow-xl transition-all duration-300 ease-out transform hover:scale-105
                sidebar-toggle-flag
              `}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <div className="relative w-4 h-4">
                {isCollapsed ? (
                  // Right arrow when collapsed (to expand)
                  <svg 
                    className="h-4 w-4 text-gray-600 absolute inset-0 transition-all duration-300 ease-out transform" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    style={{
                      opacity: isCollapsed ? 1 : 0,
                      transform: isCollapsed ? 'rotate(0deg)' : 'rotate(-90deg)'
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                ) : (
                  // Left arrow when expanded (to collapse)
                  <svg 
                    className="h-4 w-4 text-gray-600 absolute inset-0 transition-all duration-300 ease-out transform" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    style={{
                      opacity: isCollapsed ? 0 : 1,
                      transform: isCollapsed ? 'rotate(90deg)' : 'rotate(0deg)'
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                )}
              </div>
            </button>
          </div>
        )}

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
                    group flex items-center px-3 py-3 text-sm font-medium rounded-lg 
                    transition-all duration-300 ease-out transform hover:scale-105
                    ${isCollapsed ? 'justify-center' : ''}
                    ${isActive
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                    }
                    lg:hover:bg-gray-50
                  `}
                  title={isCollapsed ? item.name : undefined}
                  onClick={() => {
                    // Close mobile sidebar when clicking on navigation items
                    if (window.innerWidth < 1024 && isOpen) {
                      onToggle();
                    }
                  }}
                >
                  <item.icon
                    className={`
                      h-5 w-5 flex-shrink-0 transition-all duration-300 ease-out
                      ${isCollapsed ? 'mr-0' : 'mr-3'}
                      ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                  />
                  <div className={`
                    transition-all duration-500 ease-out overflow-hidden
                    ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-0'}
                    lg:block
                  `}>
                    <span className="whitespace-nowrap">{item.name}</span>
                  </div>
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
              w-full flex items-center text-sm font-medium text-gray-600 
              hover:bg-gray-50 hover:text-gray-900 rounded-lg 
              transition-all duration-300 ease-out transform hover:scale-105
              ${isCollapsed ? 'justify-center px-2' : 'px-3 py-2'}
              lg:hover:bg-gray-50
            `}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className={`h-5 w-5 flex-shrink-0 transition-all duration-300 ease-out ${isCollapsed ? 'mr-0' : 'mr-3'}`} />
            <div className={`
              transition-all duration-500 ease-out overflow-hidden
              ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-0'}
              lg:block
            `}>
              <span className="whitespace-nowrap">Logout</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
