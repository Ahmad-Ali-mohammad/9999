import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import GoogleButton from '../components/GoogleButton';
import { authService } from '../services/api';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, setUser } = useAuth();
  const { t, language, setLanguage, direction } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.errors && Array.isArray(err.errors)) {
        setError(err.errors.map((e: any) => e.message).join(', '));
      } else {
        setError(err.message || 'Registration failed');
      }
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (googleData: any) => {
    setError('');
    setLoading(true);
    try {
      const data = await authService.googleLogin(googleData);
      if (data.token) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        }
        navigate('/dashboard');
      } else {
        throw new Error('No authentication token received');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google');
      console.error('Google auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-[#001a38] p-4 overflow-hidden ${direction === 'rtl' ? 'rtl' : 'ltr'}`} dir={direction}>
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-green/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-navy/20 blur-[150px] rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-grid-white/[0.03] z-0"></div>
      </div>

      {/* Language Toggle */}
      <button
        onClick={toggleLanguage}
        className="absolute top-6 right-6 z-20 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-white border border-white/10 hover:bg-white/20 transition-all font-medium"
      >
        {language === 'ar' ? 'English' : 'العربية'}
      </button>

      <Link to="/" className="absolute top-6 left-6 z-20 px-4 py-2 text-gray-400 hover:text-white transition-all flex items-center gap-2 font-medium">
        ← {language === 'ar' ? 'الرئيسية' : 'Home'}
      </Link>

      <div className="relative z-10 w-full max-w-md my-8">
        <div className="card-glass p-10 rounded-[2.5rem] shadow-2xl border border-white/10 backdrop-blur-3xl">
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-2xl mb-4 hover:scale-110 transition-transform duration-300">
              <img src="/assets/logo.jpg" alt="Money Way Logo" className="w-full h-full object-cover" />
            </Link>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Money <span className="text-brand-green">Way</span>
            </h2>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">{t('createAccount')}</h3>
            <p className="text-gray-400">{t('startJourney')}</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 text-center text-sm font-medium animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="name" className="block text-sm font-bold text-gray-300 ml-1">{t('name')}</label>
              <input
                type="text"
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green/50 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-bold text-gray-300 ml-1">{t('email')}</label>
              <input
                type="email"
                id="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green/50 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-bold text-gray-300 ml-1">{t('password')}</label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green/50 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-300 ml-1">{t('confirmPassword')}</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green/50 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-brand-navy to-brand-green text-white font-black text-lg rounded-2xl shadow-xl shadow-brand-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 !mt-8"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('loading')}
                </span>
              ) : (
                t('signUp')
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                <span className="px-4 bg-[#01254d] text-gray-500">{t('orContinueWith')}</span>
              </div>
            </div>

            <div className="mt-6">
              <GoogleButton
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google authentication failed')}
                text={t('signUpWithGoogle')}
              />
            </div>
          </div>

          <p className="text-center text-gray-400 mt-10 font-medium">
            {t('haveAccount')} <Link to="/login" className="text-brand-green font-bold hover:text-emerald-400 transition-colors">{t('signIn')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

