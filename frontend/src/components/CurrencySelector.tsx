import React, { useState, useEffect } from 'react';
import { currencyService } from '../services/api';

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isBase: boolean;
}

interface CurrencySelectorProps {
  selectedCurrency?: string;
  onCurrencyChange: (currencyCode: string) => void;
  className?: string;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCurrency = 'USD',
  onCurrencyChange,
  className = ''
}) => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const data = await currencyService.getAll();
      setCurrencies(data);
    } catch (error) {
      console.error('Error fetching currencies:', error);
      // Fallback to common currencies
      setCurrencies([
        { id: 1, code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 1, isBase: true },
        { id: 2, code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 0.85, isBase: false },
        { id: 3, code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: 0.73, isBase: false },
        { id: 4, code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', exchangeRate: 3.75, isBase: false },
        { id: 5, code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', exchangeRate: 3.67, isBase: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency);
  const currencyFlag = (code: string) => {
    const flags: { [key: string]: string } = {
      'USD': '🇺🇸',
      'EUR': '🇪🇺',
      'GBP': '🇬🇧',
      'SAR': '🇸🇦',
      'AED': '🇦🇪',
      'JPY': '🇯🇵',
      'CNY': '🇨🇳',
      'CAD': '🇨🇦',
      'AUD': '🇦🇺',
      'CHF': '🇨🇭',
    };
    return flags[code] || '💱';
  };

  if (loading) {
    return <div className="text-gray-400 text-sm">Loading currencies...</div>;
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white flex items-center justify-between hover:bg-white/20 transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{currencyFlag(selectedCurrency)}</span>
          <div className="text-left">
            <p className="font-semibold">{selectedCurrency}</p>
            {selectedCurrencyData && (
              <p className="text-xs text-gray-400">{selectedCurrencyData.name}</p>
            )}
          </div>
        </div>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          ></div>
          <div className="absolute z-20 mt-2 w-full bg-gray-800 border border-white/20 rounded-lg shadow-xl max-h-64 overflow-y-auto">
            {currencies.map((currency) => (
              <button
                key={currency.id}
                type="button"
                onClick={() => {
                  onCurrencyChange(currency.code);
                  setShowDropdown(false);
                }}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-all ${
                  currency.code === selectedCurrency ? 'bg-purple-500/20' : ''
                }`}
              >
                <span className="text-2xl">{currencyFlag(currency.code)}</span>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-white">{currency.code}</p>
                  <p className="text-xs text-gray-400">{currency.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-300">{currency.symbol}</p>
                  {!currency.isBase && (
                    <p className="text-xs text-gray-500">{currency.exchangeRate.toFixed(4)}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CurrencySelector;
