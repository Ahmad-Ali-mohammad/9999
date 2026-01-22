import { useLanguage } from '../contexts/LanguageContext';

function TestArabic() {
  const { t } = useLanguage();
  
  return (
    <div dir="rtl" className="p-8">
      <h1 className="text-2xl font-bold mb-4">{t('appName')}</h1>
      <p>{t('appTagline')}</p>
      <p>{t('dashboard')}</p>
      <p>{t('transactions')}</p>
      <p>{t('profile')}</p>
      <p>{t('totalBalance')}</p>
    </div>
  );
}

export default TestArabic;
