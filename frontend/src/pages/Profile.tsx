import React, { useState, useEffect } from 'react';
import SubNavbar from '../components/SubNavbar';
import { authService, accountService, transactionService, budgetService, goalService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

interface ProfileStats {
  totalAccounts: number;
  totalTransactions: number;
  totalBudgets: number;
  totalGoals: number;
  accountsBalance: number;
}

const Profile: React.FC = () => {
  const { t } = useLanguage();

  const settingsTabs = [
    { path: '/settings/profile', labelKey: 'profile', icon: '👤' },
  ];

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    totalAccounts: 0,
    totalTransactions: 0,
    totalBudgets: 0,
    totalGoals: 0,
    accountsBalance: 0,
  });

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    currency: 'USD',
    incomePattern: 'salary',
    createdAt: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswordSection, setShowPasswordSection] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await authService.getProfile();
      setProfileData({
        name: (data as any).name || '',
        email: (data as any).email || '',
        currency: (data as any).currency || 'USD',
        incomePattern: (data as any).incomePattern || 'salary',
        createdAt: (data as any).createdAt || '',
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [accounts, transactions, budgets, goals] = await Promise.all([
        accountService.getAll(),
        transactionService.getAll(),
        budgetService.getAll(),
        goalService.getAll(),
      ]);

      const totalBalance = (accounts as any[]).reduce((sum: number, acc: any) => sum + (acc.balance || 0), 0);

      setStats({
        totalAccounts: (accounts as any[]).length,
        totalTransactions: (transactions as any[]).length,
        totalBudgets: (budgets as any[]).length,
        totalGoals: (goals as any[]).length,
        accountsBalance: totalBalance,
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await authService.updateProfile({
        name: profileData.name,
        email: profileData.email,
        currency: profileData.currency,
        incomePattern: profileData.incomePattern,
      });

      setSuccess(t('profileUpdated'));
      await fetchProfile();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await authService.updateProfile({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setSuccess(t('passwordChanged'));
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordSection(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <SubNavbar tabs={settingsTabs} />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">{t('myProfile')}</h1>
          <p className="text-gray-400">{t('editProfile') || 'خصص إعدادات حسابك ومعلوماتك الشخصية'}</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-brand-green/10 border border-brand-green/30 rounded-xl text-brand-green font-bold animate-in fade-in slide-in-from-top-2">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-bold animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
          <p className="text-gray-400 mt-4">جاري تحميل بيانات الملف الشخصي...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Hero Profile Card */}
          <div className="card-glass p-10 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-green/10 to-transparent rounded-bl-full pointer-events-none"></div>

            <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
              <div className="relative">
                <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-brand-navy to-brand-green flex items-center justify-center text-white text-5xl font-black shadow-2xl transform group-hover:rotate-6 transition-transform">
                  {profileData.name.charAt(0).toUpperCase() || '👤'}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-green rounded-full border-4 border-brand-navy flex items-center justify-center text-white shadow-lg">✓</div>
              </div>

              <div className="flex-1 text-center md:text-right">
                <h2 className="text-4xl font-black text-white mb-2">{profileData.name}</h2>
                <p className="text-gray-400 text-lg mb-4">{profileData.email}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <span className="px-4 py-1.5 bg-white/5 rounded-full text-xs font-bold text-gray-400 border border-white/5">
                    🗓️ عضو منذ: {formatDate(profileData.createdAt)}
                  </span>
                  <span className="px-4 py-1.5 bg-brand-green/10 rounded-full text-xs font-bold text-brand-green border border-brand-green/10 capitalize">
                    💼 {t(profileData.incomePattern)}
                  </span>
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-3xl border border-white/5 min-w-[200px]">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">الرصيد الإجمالي</p>
                <p className="text-3xl font-black text-white font-sans">${stats.accountsBalance.toLocaleString()}</p>
                <p className="text-[10px] text-gray-500 font-bold mt-2">({profileData.currency})</p>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: t('accounts'), value: stats.totalAccounts, icon: '🏦' },
              { label: t('transactions'), value: stats.totalTransactions, icon: '💳' },
              { label: t('budgets'), value: stats.totalBudgets, icon: '💰' },
              { label: t('goals'), value: stats.totalGoals, icon: '🎯' }
            ].map((stat, i) => (
              <div key={i} className="card-glass p-6 border border-white/5 text-center group hover:scale-105 transition-all">
                <div className="text-3xl mb-3 group-hover:scale-125 transition-transform">{stat.icon}</div>
                <p className="text-xs font-black text-gray-500 uppercase tracking-tighter mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Personal Info Form */}
            <div className="lg:col-span-2 card-glass p-10 border border-white/5">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-brand-green rounded-full"></div>
                <h3 className="text-xl font-black text-white">{t('personalInformation')}</h3>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase px-2">{t('fullName')} *</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-brand-green font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase px-2">{t('emailAddress')} *</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-brand-green font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase px-2">{t('preferredCurrency')}</label>
                    <select
                      value={profileData.currency}
                      onChange={(e) => setProfileData({ ...profileData, currency: e.target.value })}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-brand-green appearance-none cursor-pointer font-bold"
                    >
                      <option value="USD">💵 USD - US Dollar</option>
                      <option value="EUR">💶 EUR - Euro</option>
                      <option value="AED">🇦🇪 AED - UAE Dirham</option>
                      <option value="SAR">🇸🇦 SAR - Saudi Riyal</option>
                      <option value="EGP">🇪🇬 EGP - Egyptian Pound</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase px-2">{t('incomePattern')}</label>
                    <select
                      value={profileData.incomePattern}
                      onChange={(e) => setProfileData({ ...profileData, incomePattern: e.target.value })}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-brand-green appearance-none cursor-pointer font-bold"
                    >
                      <option value="salary">💼 {t('salary')}</option>
                      <option value="freelancer">🎨 {t('freelancer')}</option>
                      <option value="business">🏢 {t('business')}</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-10 py-4 bg-gradient-to-r from-brand-navy to-brand-green text-white font-black rounded-2xl transition-all shadow-xl shadow-brand-green/20 hover:shadow-brand-green/40 transform hover:scale-[1.02] disabled:opacity-50"
                  >
                    {saving ? 'جاري الحفظ...' : t('saveChanges')}
                  </button>
                </div>
              </form>
            </div>

            {/* Security Section */}
            <div className="card-glass p-8 border border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
                <h3 className="text-xl font-black text-white">{t('changePassword')}</h3>
              </div>

              <p className="text-gray-500 text-sm mb-8 leading-relaxed">لمزيد من الأمان، ننصح بتغيير كلمة المرور بشكل دوري واستخدام كلمات مرور قوية.</p>

              {!showPasswordSection ? (
                <button
                  onClick={() => setShowPasswordSection(true)}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl transition-all border border-white/5"
                >
                  🔒 تغيير كلمة المرور
                </button>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <input
                    type="password"
                    placeholder={t('currentPassword')}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500"
                    required
                  />
                  <input
                    type="password"
                    placeholder={t('newPassword')}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500"
                    required
                  />
                  <input
                    type="password"
                    placeholder={t('confirmNewPassword')}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500"
                    required
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-3 bg-red-500 text-white font-black rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">تحديث</button>
                    <button type="button" onClick={() => setShowPasswordSection(false)} className="px-4 py-3 bg-white/10 text-white rounded-xl">✕</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
