import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, 
  ClipboardList, 
  AlertTriangle, 
  Trees, 
  Store, 
  Settings, 
  Users, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useAuth();
  
  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['citizen', 'official', 'admin'] },
    { label: 'Surveys', path: '/dashboard/surveys', icon: <ClipboardList size={20} />, roles: ['citizen', 'official', 'admin'] },
    { label: 'Issues', path: '/dashboard/issues', icon: <AlertTriangle size={20} />, roles: ['citizen', 'official', 'admin'] },
    { label: 'Initiatives', path: '/dashboard/initiatives', icon: <Trees size={20} />, roles: ['citizen', 'official', 'admin'] },
    { label: 'Marketplace', path: '/dashboard/marketplace', icon: <Store size={20} />, roles: ['citizen', 'official', 'admin'] },
    
    // Admin only
    { label: 'Analytics', path: '/dashboard/analytics', icon: <BarChart3 size={20} />, roles: ['admin'] },
    { label: 'Users', path: '/dashboard/users', icon: <Users size={20} />, roles: ['admin'] },
    { label: 'Settings', path: '/dashboard/settings', icon: <Settings size={20} />, roles: ['admin'] },
  ];

  const allowedNavs = navItems.filter(nav => nav.roles.includes(user?.role || 'citizen'));

  return (
    <aside 
      className={`${isCollapsed ? 'w-[64px]' : 'w-[260px]'} bg-surface border-r border-border h-screen flex flex-col transition-all duration-300 relative shrink-0`}
    >
      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-surface border border-border rounded-full p-1 text-textMuted hover:text-primary-600 hover:border-primary-400 z-10 transition-colors"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Brand Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border shrink-0 overflow-hidden">
        <div className="flex items-center gap-3 w-full">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
            <span className="text-white font-bold tracking-tight">C</span>
          </div>
          {!isCollapsed && <span className="font-bold text-lg text-textMain tracking-tight whitespace-nowrap">CivicConnect</span>}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1.5 custom-scrollbar">
        {allowedNavs.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors overflow-hidden
              ${isActive 
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-semibold' 
                : 'text-textMuted hover:bg-surfaceHover hover:text-textMain font-medium'}
            `}
            title={isCollapsed ? item.label : undefined}
          >
            <div className="shrink-0">{item.icon}</div>
            {!isCollapsed && <span className="whitespace-nowrap text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Card */}
      <div className="border-t border-border p-3 shrink-0">
        <div className={`flex items-center gap-3 p-2 rounded-lg ${isCollapsed ? 'justify-center' : 'justify-between'} overflow-hidden`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 flex items-center justify-center shrink-0 font-bold uppercase text-xs">
              {user?.name?.[0] || user?.email?.[0] || 'U'}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-textMain truncate">{user?.name || user?.email}</span>
                <span className="text-xs text-textMuted capitalize truncate">{user?.role}</span>
              </div>
            )}
          </div>
          
          {!isCollapsed && (
            <button 
              onClick={logout}
              className="p-1.5 text-textMuted hover:text-red-500 rounded transition-colors shrink-0"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
