import React, { useState, useEffect } from 'react';
import { accountService, categoryService, transactionService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

interface TransactionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: any;
}

interface Account {
  id: number;
  name: string;
  type: string;
  balance: number;
}

interface Category {
  id: number;
  name: string;
  type: string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSuccess, onCancel, initialData }) => {
  const { t, isRTL } = useLanguage();
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    accountId: initialData?.accountId || '',
    toAccountId: initialData?.toAccountId || '',
    amount: initialData?.amount || '',
    type: initialData?.type || 'expense',
    categoryId: initialData?.categoryId || '',
    notes: initialData?.notes || '',
    tags: initialData?.tags?.map((t: any) => t.tag.name).join(', ') || '',
    occurredAt: initialData?.occurredAt
      ? new Date(initialData.occurredAt).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
  });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [formData.type]);

  const fetchData = async () => {
    try {
      const [accountsData, categoriesData] = await Promise.all([
        accountService.getAll(),
        categoryService.getAll()
      ]);
      setAccounts(accountsData);
      setCategories(categoriesData.filter((c: Category) =>
        c.type === formData.type
      ));
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(t('failedToLoadData'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const amount = Number.parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error(t('amountPositive'));
      }

      if (!formData.accountId) {
        throw new Error(t('selectAccountRequired'));
      }

      if (formData.type === 'transfer') {
        if (!formData.toAccountId) {
          throw new Error(t('targetAccountRequired'));
        }
        if (formData.accountId.toString() === formData.toAccountId.toString()) {
          throw new Error(t('transferSameAccount'));
        }
      }

      const tagsArray = formData.tags
        ? formData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag !== '')
        : [];

      const submitData = {
        accountId: Number(formData.accountId),
        toAccountId: formData.type === 'transfer' ? Number(formData.toAccountId) : undefined,
        amount: amount,
        type: formData.type,
        categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
        notes: formData.notes || undefined,
        tags: tagsArray,
        occurredAt: new Date(formData.occurredAt).toISOString(),
        currency: user?.currency || 'USD',
      };

      if (initialData?.id) {
        await transactionService.update(initialData.id.toString(), submitData);
        addNotification({
          type: 'success',
          title: t('success'),
          message: t('transactionSaved'),
        });
      } else {
        await transactionService.create(submitData);
        addNotification({
          type: 'success',
          title: t('success'),
          message: t('transactionSaved'),
        });
      }

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || t('failedToSaveTransaction'));
      addNotification({
        type: 'error',
        title: t('error'),
        message: err.message || t('failedToSaveTransaction'),
      });
      console.error('Error saving transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (type: string) => {
    return type === 'income' ? '📥' : type === 'expense' ? '📤' : '↔️';
  };

  return (
    <div className={`p-6 ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{getCategoryIcon(formData.type)}</span>
        <h2 className="text-2xl font-bold text-white">
          {initialData ? t('editTransaction') : t('newTransaction')}
        </h2>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transaction Type */}
        <div>
          <label className="block text-gray-400 mb-2">{t('transactionType')} *</label>
          <div className="grid grid-cols-3 gap-3">
            {['expense', 'income', 'transfer'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, type, categoryId: '' })}
                className={`px-4 py-2 rounded-lg capitalize transition-all ${formData.type === type
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
              >
                {t(type)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-gray-400 mb-2">{t('amount')} *</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="0.00"
              required
            />
          </div>

          {/* Account */}
          <div>
            <label htmlFor="accountId" className="block text-gray-400 mb-2">
              {formData.type === 'transfer' ? t('fromAccount') : t('account')} *
            </label>
            <select
              id="accountId"
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
              required
              title={t('selectAccount')}
            >
              <option value="">{t('selectAccount')}</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.balance.toLocaleString()} {account.type})
                </option>
              ))}
            </select>
          </div>

          {/* To Account (only for transfers) */}
          {formData.type === 'transfer' && (
            <div>
              <label htmlFor="toAccountId" className="block text-gray-400 mb-2">{t('toAccount')} *</label>
              <select
                id="toAccountId"
                value={formData.toAccountId}
                onChange={(e) => setFormData({ ...formData, toAccountId: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                required
                title={t('selectAccount')}
              >
                <option value="">{t('selectAccount')}</option>
                {accounts
                  .filter(a => a.id.toString() !== formData.accountId.toString())
                  .map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.balance.toLocaleString()} {account.type})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Category (not for transfers) */}
          {formData.type !== 'transfer' && (
            <div>
              <label htmlFor="categoryId" className="block text-gray-400 mb-2">{t('category')}</label>
              <select
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                title={t('category')}
              >
                <option value="">{t('noCategory')}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date & Time */}
          <div>
            <label htmlFor="occurredAt" className="block text-gray-400 mb-2">{t('dateTime')} *</label>
            <input
              id="occurredAt"
              type="datetime-local"
              value={formData.occurredAt}
              onChange={(e) => setFormData({ ...formData, occurredAt: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-gray-400 mb-2">{t('tags')}</label>
            <input
              id="tags"
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
              placeholder={t('tagsPlaceholder')}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-gray-400 mb-2">{t('notes')}</label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none transition-colors"
            rows={2}
            placeholder={t('notesPlaceholder')}
          />
        </div>

        {/* Action Buttons */}
        <div className={`flex gap-3 pt-4 ${isRTL ? 'justify-start mr-auto' : 'justify-end'}`}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all focus:ring-2 focus:ring-white/20"
              disabled={loading}
            >
              {t('cancel')}
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded-lg text-white transition-all shadow-lg ${loading
              ? 'bg-purple-500/50 cursor-not-allowed'
              : 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/20 active:scale-95'
              }`}
          >
            {loading ? t('saving') : initialData ? t('updateTransaction') : t('createTransaction')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
