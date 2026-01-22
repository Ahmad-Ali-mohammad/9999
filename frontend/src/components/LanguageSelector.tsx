import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSelector: React.FC = () => {
  const { language, dialect, setLanguage, setDialect } = useLanguage();

  return (
    <div className="flex items-center gap-3">
      {/* Language Toggle */}
      <div className="relative">
        <button
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300"
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium">
            {language === 'ar' ? 'عربي' : 'English'}
          </span>
        </button>
      </div>

      {/* Dialect Selector (only for Arabic) */}
      {language === 'ar' && (
        <div className="relative">
          <select
            value={dialect}
            onChange={(e) => setDialect(e.target.value as any)}
            className="px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white text-sm appearance-none cursor-pointer hover:bg-white/20 transition-all duration-300 pr-8"
          >
            <option value="msa" className="bg-gray-800">الفصحى</option>
            <option value="egyptian" className="bg-gray-800">مصري</option>
            <option value="gulf" className="bg-gray-800">خليجي</option>
            <option value="levantine" className="bg-gray-800">شامي</option>
            <option value="maghrebi" className="bg-gray-800">مغاربي</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
