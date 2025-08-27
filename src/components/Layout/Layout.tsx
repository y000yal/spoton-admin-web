import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  // Check if we're on desktop
  useEffect(() => {
    const checkIsDesktop = () => {
      const wasDesktop = isDesktop;
      const newIsDesktop = window.innerWidth >= 1024;
      setIsDesktop(newIsDesktop);
      
      // If switching from mobile to desktop, close the mobile sidebar
      if (!wasDesktop && newIsDesktop && sidebarOpen) {
        console.log('Switching to desktop, closing mobile sidebar');
        setSidebarOpen(false);
      }
    };
    
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, [isDesktop, sidebarOpen]);

  const toggleSidebar = () => {
    console.log('Toggle sidebar called, current state:', sidebarOpen);
    setSidebarOpen(!sidebarOpen);
  };

  const toggleCollapse = () => {
    console.log('Toggle collapse called, current state:', sidebarCollapsed);
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Sidebar behavior:
  // - On mobile: starts completely hidden (closed)
  // - On desktop: starts visible but collapsed (narrow width)
  const effectiveSidebarOpen = isDesktop ? true : sidebarOpen;

  // Debug sidebar state
  console.log('Layout render - sidebarOpen:', sidebarOpen, 'sidebarCollapsed:', sidebarCollapsed, 'effectiveSidebarOpen:', effectiveSidebarOpen, 'isDesktop:', isDesktop);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Fixed at top */}
      <Header 
        onMenuToggle={toggleSidebar} 
      />
      
      {/* Main content area with sidebar */}
      <div className="flex pt-16"> {/* Fixed top padding: 12 (top nav) + 16 (main header) = 28 */}
        {/* Sidebar */}
        <Sidebar 
          isOpen={effectiveSidebarOpen} 
          isCollapsed={sidebarCollapsed}
          onToggle={toggleSidebar} 
          onCollapseToggle={toggleCollapse}
          isDesktop={isDesktop}
        />
        
        {/* Main content */}
        <div className="flex-1 transition-all duration-500 ease-out">
          <main className="py-6 px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="mx-auto max-w-7xl 2xl:max-w-8xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
