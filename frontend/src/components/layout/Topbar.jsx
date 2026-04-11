import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Moon, Sun } from 'lucide-react';
import { useUI } from '../../context/UIContext';

const Topbar = () => {
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();
  const { pageTitle } = useUI();

  // Basic breadcrumb generation
  const pathnames = location.pathname.split('/').filter((x) => x);
  
  // Use dynamic title if available, otherwise fall back to path-based name
  let breadcrumbStr = pageTitle;
  
  if (!breadcrumbStr) {
    breadcrumbStr = pathnames.length > 1 
      ? pathnames[pathnames.length - 1].replace('-', ' ') 
      : 'Overview';
    
    // Capitalize fallback
    breadcrumbStr = breadcrumbStr.charAt(0).toUpperCase() + breadcrumbStr.slice(1);
  }

  // Toggle Theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0 sticky top-0 z-40 transition-colors">
      
      {/* Breadcrumb / Title */}
      <div className="flex items-center gap-2 text-sm font-semibold text-textMain">
        <span className="text-textMuted hidden sm:inline-block">Dashboard</span>
        {pathnames.length > 1 && <span className="text-textMuted hidden sm:inline-block">/</span>}
        <span className="capitalize">{breadcrumbStr}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-textMuted">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Search platform..."
            className="w-64 pl-9 pr-3 py-1.5 bg-background border border-border rounded-lg text-sm text-textMain focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1 border-l border-border pl-4">
          <button 
            className="btn btn-icon btn-ghost"
            onClick={() => setIsDark(!isDark)}
            title="Toggle Theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <button className="btn btn-icon btn-ghost relative" title="Notifications">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border border-surface rounded-full"></span>
          </button>
        </div>
      </div>

    </header>
  );
};

export default Topbar;
