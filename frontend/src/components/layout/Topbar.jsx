import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Moon, Sun } from 'lucide-react';

const Topbar = () => {
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();

  // Basic breadcrumb generation
  const pathnames = location.pathname.split('/').filter((x) => x);
  let breadcrumbStr = pathnames.length > 1 
    ? pathnames[pathnames.length - 1].replace('-', ' ') 
    : 'Overview';

  // Capitalize
  breadcrumbStr = breadcrumbStr.charAt(0).toUpperCase() + breadcrumbStr.slice(1);

  // Toggle Theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <header className="h-16 bg-white dark:bg-surface border-b border-primary-200 dark:border-primary-800 flex items-center justify-between px-6 shrink-0 sticky top-0 z-40 transition-colors">
      
      {/* Breadcrumb / Title */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-primary-500 font-medium hidden sm:inline-block">Dashboard</span>
        {pathnames.length > 1 && <span className="text-primary-300 hidden sm:inline-block">/</span>}
        <span className="capitalize font-semibold text-primary-900 dark:text-primary-50">{breadcrumbStr}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-primary-400">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Search platform..."
            className="w-64 pl-9 pr-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg text-sm text-textMain focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-primary-400"
          />
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1 border-l border-primary-200 dark:border-primary-800 pl-4">
          <button 
            className="p-2 rounded-lg text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/40 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            onClick={() => setIsDark(!isDark)}
            title="Toggle Theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <button className="p-2 rounded-lg text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/40 hover:text-primary-700 dark:hover:text-primary-300 transition-colors relative" title="Notifications">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 border-2 border-white dark:border-surface rounded-full"></span>
          </button>
        </div>
      </div>

    </header>
  );
};

export default Topbar;
