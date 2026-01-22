import React, { useState, useEffect } from 'react';
import SubNavbar from '../components/SubNavbar';
import { accountService, transactionService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

interface Account {
  id: number;
  name: string;
  type: string;
  balance: number;
  currency: string;
  meta?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AccountFormData {
  name: string;
  type: string;
  balance: number;
  currency: string;
  institutionName?: string;
}

const Accounts: React.FC = () => {
  const { t } = useLanguage();

  const financeTabs = [
    { path: '/finance/transactions', labelKey: 'transactions', icon: '💳' },
    { path: '/finance/accounts', labelKey: 'accounts', icon: '🏦' },
    { path: '/finance/receipts', labelKey: 'receipts', icon: '🧾' },
  ];
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<AccountFormData>({
    name: '',
    type: 'checking',
    balance: 0,
    currency: 'USD',
    institutionName: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const [accountsData, transactionsData] = await Promise.all([
        accountService.getAll(),
        transactionService.getAll({ limit: 5 })
      ]);
      setAccounts(accountsData);
      setRecentTransactions(transactionsData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch accounts');
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        await accountService.update(editingAccount.id.toString(), formData);
      } else {
        await accountService.create(formData);
      }
      await fetchAccounts();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to save account');
      console.error('Error saving account:', err);
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    const meta = account.meta ? JSON.parse(account.meta) : {};
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance,
      currency: account.currency,
      institutionName: meta.institutionName || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;

    try {
      await accountService.delete(id.toString());
      await fetchAccounts();
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
      console.error('Error deleting account:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'checking',
      balance: 0,
      currency: 'USD',
      institutionName: '',
    });
    setEditingAccount(null);
    setShowForm(false);
    setError(null);
  };

  const getAccountIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      checking: '💳',
      savings: '🏦',
      credit: '💎',
      investment: '📈',
      cash: '💵',
    };
    return icons[type] || '💰';
  };

  const getAccountColor = (type: string) => {
    const colors: { [key: string]: string } = {
      checking: 'from-brand-navy to-blue-600',
      savings: 'from-brand-green to-emerald-600',
      credit: 'from-red-600 to-orange-600',
      investment: 'from-brand-navy to-brand-green',
      cash: 'from-yellow-500 to-amber-600',
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="max-w-7xl mx-auto">
      <SubNavbar tabs={financeTabs} />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{t('accounts')}</h1>
          <p className="text-gray-400">{t('manageAccounts')}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          {t('addAccount')}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card-glass p-8 mb-8 border border-white/20 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {editingAccount ? 'تعديل الحساب' : 'إضافة حساب جديد'}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-white">✕</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 px-1">اسم الحساب *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green"
                  placeholder="مثال: حساب الراتب"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 px-1">نوع الحساب *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green appearance-none cursor-pointer"
                  required
                >
                  <option value="checking" className="bg-brand-navy">جاري</option>
                  <option value="savings" className="bg-brand-navy">توفير</option>
                  <option value="credit" className="bg-brand-navy">بطاقة ائتمان</option>
                  <option value="investment" className="bg-brand-navy">استثمار</option>
                  <option value="cash" className="bg-brand-navy">نقدي</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 px-1">الرصيد الافتتاحي *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) })}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 px-1">العملة *</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green appearance-none cursor-pointer"
                  required
                >
                  <option value="USD" className="bg-brand-navy">USD - دولار أمريكي</option>
                  <option value="EUR" className="bg-brand-navy">EUR - يورو</option>
                  <option value="SAR" className="bg-brand-navy">SAR - ريال سعودي</option>
                  <option value="TRY" className="bg-brand-navy">TRY - ليرة تركية</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-gray-400 px-1">اسم المؤسسة المالية</label>
                <input
                  type="text"
                  value={formData.institutionName}
                  onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green"
                  placeholder="اسم البنك أو التطبيق..."
                />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl font-bold transition-all"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-[2] py-3 bg-gradient-to-r from-brand-navy to-brand-green text-white rounded-xl font-bold shadow-lg shadow-brand-green/20 hover:shadow-brand-green/30 transform hover:scale-[1.02] transition-all"
              >
                {editingAccount ? 'تحديث الحساب' : 'إضافة الحساب'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Total Balance Card */}
      <div className="card-glass p-8 mb-8 text-center border border-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/10 to-brand-green/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <p className="text-gray-400 mb-2 relative z-10">{t('totalNetWorth')}</p>
        <p className="text-5xl font-bold text-white mb-2 relative z-10">
          ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-green/20 text-brand-green rounded-full text-sm relative z-10">
          <span className="animate-pulse">●</span>
          <span>{accounts.length} {t('accounts')}</span>
        </div>
      </div>

      {/* Accounts Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
          <p className="text-gray-400 mt-4">جاري تحميل الحسابات...</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="card-glass p-12 text-center border border-white/10">
          <div className="text-6xl mb-4">🏦</div>
          <h3 className="text-2xl font-bold text-white mb-2">لا توجد حسابات بعد</h3>
          <p className="text-gray-400 mb-6">ابدأ بالقر على "إضافة حساب" لتتبع أموالك</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            {t('addFirstAccount')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {accounts.map((account) => {
            const icon = getAccountIcon(account.type);
            const color = getAccountColor(account.type);

            return (
              <div key={account.id} className="card-glass p-6 hover:scale-[1.02] transition-all duration-300 border border-white/5 group">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center text-3xl shadow-lg transform group-hover:rotate-6 transition-transform`}>
                      {icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{account.name}</h3>
                      <p className="text-gray-400 text-sm">
                        {account.type === 'checking' ? 'حساب جاري' :
                          account.type === 'savings' ? 'حساب توفير' :
                            account.type === 'credit' ? 'بطاقة ائتمان' :
                              account.type === 'investment' ? 'حساب استثماري' : 'نقدي'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(account)}
                      className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-all shadow-md"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all shadow-md"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{t('currentBalance')}</p>
                    <p className={`text-4xl font-bold ${account.balance < 0 ? 'text-red-400' : 'text-white'}`}>
                      {account.balance < 0 ? '-' : ''}${Math.abs(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-green w-1/3 opacity-30"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Activity */}
      <div className="card-glass p-6 border border-white/5">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span>🕒</span>
          {t('recentActivity')}
        </h3>
        <div className="space-y-4">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction, index) => (
              <div key={transaction.id || index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {transaction.type === 'income' ? '↑' : '↓'}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{transaction.notes || (transaction.type === 'expense' ? 'مصروف' : 'دخل')}</p>
                    <p className="text-gray-400 text-sm">
                      {transaction.account?.name || 'حساب'} • {new Date(transaction.occurredAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className={`text-xl font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                  {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white/5 rounded-xl">
              <p className="text-gray-400">{t('noRecentActivity') || 'لا توجد عمليات مؤخراً'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Accounts;
