import React, { useState, useEffect } from 'react';
import SubNavbar from '../components/SubNavbar';
import { transactionService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationContext';
import TransactionForm from '../components/TransactionForm';

interface Transaction {
  id: number;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category?: { id: number; name: string };
  account?: { id: number; name: string };
  toAccount?: { id: number; name: string };
  notes?: string;
  occurredAt: string;
  tags?: { tag: { name: string } }[];
}

const Transactions: React.FC = () => {
  const { t } = useLanguage();
  const { addNotification } = useNotifications();

  const financeTabs = [
    { path: '/finance/transactions', labelKey: 'transactions', icon: '💳' },
    { path: '/finance/accounts', labelKey: 'accounts', icon: '🏦' },
    { path: '/finance/receipts', labelKey: 'receipts', icon: '🧾' },
  ];

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [filterType, searchQuery, startDate, endDate]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (filterType !== 'all') filters.type = filterType;
      if (searchQuery) filters.search = searchQuery;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const data = await transactionService.getAll(filters);
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('confirmDelete'))) return;

    try {
      await transactionService.delete(id.toString());
      addNotification({
        type: 'success',
        title: t('success'),
        message: t('transactionDeleted'),
      });
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      addNotification({
        type: 'error',
        title: t('error'),
        message: t('errorDeleting'),
      });
    }
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingTransaction(null);
    setShowModal(true);
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netFlow = totalIncome - totalExpense;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SubNavbar tabs={financeTabs} />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{t('transactions')}</h1>
          <p className="text-gray-400">{t('trackTransactions')}</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-purple-600/20"
        >
          <span className="text-xl">+</span>
          {t('addTransaction')}
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card-glass p-6 border-l-4 border-green-500">
          <p className="text-gray-400 text-sm mb-1">{t('income')}</p>
          <p className="text-2xl font-bold text-green-400">+ ${totalIncome.toLocaleString()}</p>
        </div>
        <div className="card-glass p-6 border-l-4 border-red-500">
          <p className="text-gray-400 text-sm mb-1">{t('expenses')}</p>
          <p className="text-2xl font-bold text-red-400">- ${totalExpense.toLocaleString()}</p>
        </div>
        <div className="card-glass p-6 border-l-4 border-purple-500">
          <p className="text-gray-400 text-sm mb-1">{t('netFlow')}</p>
          <p className="text-2xl font-bold text-white">${netFlow.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card-glass p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'income', 'expense', 'transfer'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg capitalize transition-all ${filterType === type
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
              >
                {t(type)}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="startDate" className="text-gray-400 text-sm">{t('from')}</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="endDate" className="text-gray-400 text-sm">{t('to')}</label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card-glass overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">{t('loading')}</div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-6 py-4 text-gray-400 font-medium">{t('date')}</th>
                  <th className="px-6 py-4 text-gray-400 font-medium">{t('category')}</th>
                  <th className="px-6 py-4 text-gray-400 font-medium">{t('account')}</th>
                  <th className="px-6 py-4 text-gray-400 font-medium">{t('description')}</th>
                  <th className="px-6 py-4 text-right text-gray-400 font-medium">{t('amount')}</th>
                  <th className="px-6 py-4 text-right text-gray-400 font-medium">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(transaction.occurredAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {transaction.type === 'transfer' ? (
                        <span className="flex items-center gap-2 text-blue-400">
                          <span>↔️</span>
                          {t('transfer')}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-gray-300">
                          <span>📁</span>
                          {transaction.category?.name || t('noCategory')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      <div className="flex flex-col">
                        <span>{transaction.account?.name}</span>
                        {transaction.type === 'transfer' && transaction.toAccount && (
                          <span className="text-xs text-gray-500">→ {transaction.toAccount.name}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white">{transaction.notes || t('noNotes')}</span>
                        <div className="flex gap-1 mt-1">
                          {transaction.tags?.map((tagRel: any, idx) => (
                            <span key={idx} className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                              #{tagRel.tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${transaction.type === 'income' ? 'text-green-400' :
                      transaction.type === 'expense' ? 'text-red-400' : 'text-blue-400'
                      }`}>
                      {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                      ${transaction.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="p-2 hover:bg-white/10 rounded-lg text-blue-400 transition-all"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="p-2 hover:bg-white/10 rounded-lg text-red-400 transition-all"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400">
            {t('noTransactionsYet')}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          ></div>
          <div className="relative w-full max-w-2xl bg-brand-navy/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">
                {editingTransaction ? t('editTransaction') : t('newTransaction')}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <TransactionForm
              initialData={editingTransaction}
              onSuccess={() => {
                setShowModal(false);
                fetchTransactions();
                setEditingTransaction(null);
              }}
              onCancel={() => {
                setShowModal(false);
                setEditingTransaction(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
