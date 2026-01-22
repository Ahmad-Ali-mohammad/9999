import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { t, direction } = useLanguage();

  const isActive = (path: string) => {
    // Exact match for dashboard
    if (path === '/dashboard') return location.pathname === '/dashboard';
    // Prefix match for others (e.g., /finance matches /finance/transactions)
    const base = path.split('/')[1];
    return location.pathname.startsWith(`/${base}`);
  };

  const menuItems = [
    { path: '/dashboard', icon: '📊', labelKey: 'dashboard' },
    { path: '/finance/transactions', icon: '💳', labelKey: 'financeHub' },
    { path: '/organization/categories', icon: '📁', labelKey: 'organization' },
    { path: '/planning/budgets', icon: '💰', labelKey: 'planning' },
    { path: '/analytics/reports', icon: '📈', labelKey: 'analytics' },
    { path: '/settings/profile', icon: '👤', labelKey: 'profile' },
  ];

  return (
    <aside className="w-64 bg-gray-800/50 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col" dir={direction}>
      {/* Logo */}
      <Link to="/dashboard" className="flex items-center gap-3 mb-10 group">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-300">
          <img src="/assets/logo.jpg" alt="Money Way Logo" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Money <span className="text-green-500">Way</span>
          </h1>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{t('appTagline')}</p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive(item.path)
              ? 'bg-gradient-to-r from-brand-navy to-brand-green text-white shadow-lg shadow-brand-green/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
          >
            <span className={`text-2xl transition-transform ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
            <span className="font-semibold">{t(item.labelKey)}</span>
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="pt-6 border-t border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
            U
          </div>
          <div className="flex-1">
            <p className="text-white font-medium">User Name</p>
            <p className="text-xs text-gray-400">user@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
