import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Fixed at top */}
      <Header 
        onMenuToggle={toggleSidebar} 
        onCollapseToggle={toggleCollapse}
        isCollapsed={sidebarCollapsed}
      />
      
      {/* Main content area with sidebar */}
      <div className="flex pt-16"> {/* Fixed top padding: 12 (top nav) + 16 (main header) = 28 */}
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          isCollapsed={sidebarCollapsed}
          onToggle={toggleSidebar} 
        />
        
        {/* Main content */}
        <div className="flex-1">
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
