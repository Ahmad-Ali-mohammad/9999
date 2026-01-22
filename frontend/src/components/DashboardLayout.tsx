import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import LanguageSelector from './LanguageSelector';
import {
  LayoutDashboard,
  BarChart3,
  CreditCard,
  Target,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Folders
} from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const { t, direction } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { path: '/finance/transactions', icon: CreditCard, label: t('financeHub') },
    { path: '/organization/categories', icon: Folders, label: t('organization') },
    { path: '/planning/budgets', icon: Target, label: t('planning') },
    { path: '/analytics/reports', icon: BarChart3, label: t('analytics') },
    { path: '/settings/profile', icon: User, label: t('profile') },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen bg-[#001a38] text-white ${direction === 'rtl' ? 'rtl' : 'ltr'}`}>
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-green/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-navy/20 blur-[120px] rounded-full"></div>
      </div>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/10 backdrop-blur-xl border-b border-white/20 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors hidden lg:block"
            >
              {direction === 'rtl' ? (
                sidebarOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />
              ) : (
                sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors lg:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-lg border border-white/20">
                <img src="/assets/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Money <span className="text-brand-green">Way</span>
              </span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <LanguageSelector />

            <div className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-navy to-brand-green rounded-full flex items-center justify-center text-sm font-bold text-white">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium hidden sm:block">{user?.name}</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title={t('logout')}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 ${direction === 'rtl' ? 'right-0' : 'left-0'} bottom-0 bg-white/5 backdrop-blur-xl border-${direction === 'rtl' ? 'l' : 'r'} border-white/20 transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-20'
          } hidden lg:block`}
      >
        <div className="h-full overflow-y-auto py-4">
          <nav className="space-y-2 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = (path: string) => {
                if (path === '/dashboard') return location.pathname === '/dashboard';
                const base = path.split('/')[1];
                return location.pathname.startsWith(`/${base}`);
              };
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${active
                    ? 'bg-gradient-to-r from-brand-navy to-brand-green text-white shadow-lg shadow-brand-green/20'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  title={!sidebarOpen ? item.label : ''}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className={`absolute top-16 ${direction === 'rtl' ? 'right-0' : 'left-0'} bottom-0 w-64 bg-gray-900/95 backdrop-blur-xl border-${direction === 'rtl' ? 'l' : 'r'} border-white/20`}>
            <div className="h-full overflow-y-auto py-4">
              <nav className="space-y-2 px-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = (path: string) => {
                    if (path === '/dashboard') return location.pathname === '/dashboard';
                    const base = path.split('/')[1];
                    return location.pathname.startsWith(`/${base}`);
                  };
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${active
                        ? 'bg-gradient-to-r from-brand-navy to-brand-green text-white shadow-lg shadow-brand-green/20'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 ${sidebarOpen ? (direction === 'rtl' ? 'lg:pr-64' : 'lg:pl-64') : (direction === 'rtl' ? 'lg:pr-20' : 'lg:pl-20')
          }`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
