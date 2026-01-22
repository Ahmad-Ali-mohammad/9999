import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationCenter from './NotificationCenter';
import { useLanguage } from '../contexts/LanguageContext';

const Navbar: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800/30 backdrop-blur-xl border-b border-white/10 px-8 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            className="input-glass w-96"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <NotificationCenter />

          {/* User Profile */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-navy to-brand-green flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-white text-sm">{user?.name || 'User'}</span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
          >
            {t('logout')}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
