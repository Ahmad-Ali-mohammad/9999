import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const LandingPage: React.FC = () => {
  const { t, language, setLanguage, direction } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <div className={`min-h-screen flex flex-col bg-[#001a38] text-white overflow-x-hidden ${direction === 'rtl' ? 'rtl' : 'ltr'}`} dir={direction}>
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-green/20 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-navy/30 blur-[150px] rounded-full animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-grid-white/[0.03] z-0"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-white/5 border-b border-white/10 sticky top-0">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-300">
            <img src="/assets/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="text-2xl font-black tracking-tight">
            Money <span className="text-brand-green">Way</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 border border-white/10 transition-all font-medium text-sm"
          >
            {language === 'ar' ? 'English' : 'العربية'}
          </button>
          <Link to="/login" className="hidden sm:block px-4 py-2 hover:text-brand-green transition-colors font-semibold">
            {t('login')}
          </Link>
          <Link to="/register" className="btn-primary">
            {t('register')}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-24">
        <div className="flex flex-col items-center text-center max-w-5xl">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green font-bold text-sm tracking-wider uppercase animate-bounce">
            🚀 {t('appTagline')}
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight tracking-tighter">
            {language === 'ar' ? (
              <>تحكم في <span className="bg-gradient-to-r from-brand-green to-emerald-400 bg-clip-text text-transparent italic">مستقبلك المالي</span> بكل سهولة</>
            ) : (
              <>Control Your <span className="bg-gradient-to-r from-brand-green to-emerald-400 bg-clip-text text-transparent italic">Financial Destiny</span></>
            )}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl leading-relaxed">
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center w-full sm:w-auto">
            <Link to="/register" className="px-10 py-5 bg-gradient-to-br from-brand-navy to-brand-green rounded-2xl text-xl font-bold shadow-2xl shadow-brand-green/30 hover:scale-105 hover:shadow-brand-green/40 transition-all duration-300">
              {t('getStarted')} — It's Free
            </Link>
            <button className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-xl font-bold hover:bg-white/20 transition-all">
              {t('watchDemo')}
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-6 py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              {t('featuresTitle')}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              {t('featuresSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { id: 'expenseTracking', icon: '📊', color: 'from-brand-navy to-brand-green' },
              { id: 'smartBudgeting', icon: '💰', color: 'from-yellow-400 to-orange-500' },
              { id: 'savingsGoals', icon: '🎯', color: 'from-blue-400 to-cyan-500' },
              { id: 'detailedReports', icon: '📉', color: 'from-red-400 to-pink-500' },
              { id: 'multiCurrency', icon: '💱', color: 'from-purple-400 to-indigo-500' },
              { id: 'bankSecurity', icon: '🛡️', color: 'from-emerald-400 to-green-600' }
            ].map((feature, idx) => (
              <div key={feature.id} className="group card-glass p-8 rounded-3xl border border-white/10 hover:border-brand-green/50 transition-all duration-500 hover:-translate-y-2">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-xl group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{t(feature.id)}</h3>
                <p className="text-gray-400 leading-relaxed">{t(feature.id + 'Desc')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 px-6 py-24 text-center">
        <div className="max-w-4xl mx-auto card-glass p-12 rounded-[3rem] border border-brand-green/30 bg-gradient-to-br from-brand-navy/50 to-brand-green/10">
          <h2 className="text-4xl md:text-5xl font-black mb-6">{t('startJourney')}</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            {language === 'ar' ? 'انضم إلى آلاف المستخدمين الذين يثقون في Money Way لإدارة أموالهم.' : 'Join thousands of users who trust Money Way to manage their finances.'}
          </p>
          <Link to="/register" className="inline-block px-12 py-5 bg-white text-brand-navy font-black text-xl rounded-2xl hover:bg-brand-green hover:text-white transition-all shadow-2xl">
            {t('signUp')} Now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/assets/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold">Money <span className="text-brand-green">Way</span></span>
          </div>
          <div className="flex gap-8 text-gray-400 font-medium">
            <a href="#" className="hover:text-white transition-all">About</a>
            <a href="#" className="hover:text-white transition-all">Privacy</a>
            <a href="#" className="hover:text-white transition-all">Terms</a>
            <a href="#" className="hover:text-white transition-all">Contact</a>
          </div>
          <p className="text-gray-500 text-sm italic">&copy; 2024 Money Way. {t('appTagline')}</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

