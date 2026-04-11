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
      className={`${isCollapsed ? 'w-[64px]' : 'w-[260px]'} bg-primary-800 border-r border-primary-700 h-screen flex flex-col transition-all duration-300 relative shrink-0 scrollbar-thumb-primary-700 scrollbar-track-transparent`}
    >
      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-surface border border-border rounded-full p-1 text-textMuted hover:text-primary-600 hover:border-primary-400 z-10 transition-colors"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Brand Logo */}
      <div className="h-16 flex items-center px-4 border-b border-primary-700 shrink-0 overflow-hidden">
        <div className="flex items-center gap-3 w-full">
          <div className="w-8 h-8 rounded-lg bg-primary-400 flex items-center justify-center shrink-0">
            <span className="text-white font-bold tracking-tight">C</span>
          </div>
          {!isCollapsed && <span className="font-bold text-lg text-white tracking-tight whitespace-nowrap">CivicConnect</span>}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 flex flex-col gap-1.5 overflow-y-auto">
        {!isCollapsed && <span className="text-primary-300 uppercase text-xs tracking-widest px-3 mb-2 opacity-80">General</span>}
        {allowedNavs.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors overflow-hidden
              ${isActive 
                ? 'bg-primary-900 text-white border-l-4 border-primary-400 font-semibold' 
                : 'text-primary-100 hover:bg-primary-700 hover:text-white font-medium border-l-4 border-transparent'}
            `}
            title={isCollapsed ? item.label : undefined}
          >
            <div className={`shrink-0 ${isCollapsed ? 'ml-0.5' : ''}`}>{item.icon}</div>
            {!isCollapsed && <span className="whitespace-nowrap text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Card */}
      <div className="border-t border-primary-700 p-3 shrink-0">
        <div className={`flex items-center gap-3 p-2 rounded-xl bg-primary-700/50 hover:bg-primary-700 transition-colors ${isCollapsed ? 'justify-center' : 'justify-between'} overflow-hidden`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 font-bold uppercase text-xs border border-primary-500">
              {user?.name?.[0] || user?.email?.[0] || 'U'}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-white truncate">{user?.name || user?.email}</span>
                <span className="text-xs text-primary-300 capitalize truncate">{user?.role}</span>
              </div>
            )}
          </div>
          
          {!isCollapsed && (
            <button 
              onClick={logout}
              className="p-1.5 text-primary-300 hover:text-white hover:bg-primary-600 rounded-lg transition-colors shrink-0"
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
