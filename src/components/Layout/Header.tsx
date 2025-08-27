import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, User, ChevronRight, Settings, LogOut } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    return paths.map((path, index) => ({
      name: path.charAt(0).toUpperCase() + path.slice(1),
      path: `/${paths.slice(0, index + 1).join('/')}`,
      isLast: index === paths.length - 1
    }));
  };
  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="fixed top-0 left-0 right-0 z-20 bg-white shadow-sm border-b border-gray-200 header-total">
      {/* Main header with search and actions - Fixed height */}
      <div className="flex items-center justify-between header-main px-4 sm:px-6 lg:px-8 transition-all duration-500 ease-out ml-16 pl-4 sm:pl-6 lg:pl-8">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button - only on mobile */}
          <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200">
            <Menu className="h-6 w-6" />
          </button>
          
          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center space-x-2">
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 text-sm">Home</Link>
            {breadcrumbs.map((breadcrumb) => (
              <div key={breadcrumb.path} className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 text-gray-400" />
                {breadcrumb.isLast ? (
                  <span className="text-gray-900 font-medium text-sm">{breadcrumb.name}</span>
                ) : (
                  <Link to={breadcrumb.path} className="text-gray-500 hover:text-gray-700 text-sm">{breadcrumb.name}</Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Right side - Search and user actions */}
        <div className="flex items-center space-x-4">
          {/* Search bar */}
          <div className="hidden sm:flex max-w-lg">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
            <Bell className="h-6 w-6" />
          </button>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <User className="h-6 w-6" />
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {user?.full_name || user?.username || 'Admin'}
              </span>
            </button>

            {/* User dropdown menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-3" />
                  My Profile
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Settings
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => {
                    logout();
                    setIsUserMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
