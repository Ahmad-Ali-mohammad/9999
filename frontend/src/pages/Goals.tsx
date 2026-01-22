import React, { useState, useEffect } from 'react';
import SubNavbar from '../components/SubNavbar';
import { goalService, goalTransactionService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon?: string;
  category?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

const Goals: React.FC = () => {
  const { t } = useLanguage();

  const planningTabs = [
    { path: '/planning/budgets', labelKey: 'budgets', icon: '💰' },
    { path: '/planning/goals', labelKey: 'goals', icon: '🎯' },
  ];

  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    deadline: '',
    icon: '🎯',
    category: ''
  });

  // Goal transaction UI state
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txForm, setTxForm] = useState({ amount: '', description: '', occurredAt: '' });
  const [editingTx, setEditingTx] = useState<any | null>(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const data = await goalService.getAll();
      setGoals(data as Goal[]);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        await goalService.update(editingGoal.id.toString(), {
          ...formData,
          targetAmount: parseFloat(formData.targetAmount),
          currentAmount: parseFloat(formData.currentAmount)
        });
      } else {
        await goalService.create({
          ...formData,
          targetAmount: parseFloat(formData.targetAmount),
          currentAmount: parseFloat(formData.currentAmount)
        });
      }

      fetchGoals();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      await goalService.delete(id.toString());
      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleAddFunds = async (goalId: number, amount: number) => {
    try {
      await goalService.addFunds(goalId.toString(), amount);
      fetchGoals();
    } catch (error) {
      console.error('Error adding funds:', error);
    }
  };

  const fetchGoalTransactions = async (goalId: number) => {
    try {
      setTxLoading(true);
      const data = await goalTransactionService.getAll(goalId);
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching goal transactions:', error);
    } finally {
      setTxLoading(false);
    }
  };

  const handleSaveTransaction = async () => {
    if (!selectedGoal) return;
    try {
      if (editingTx) {
        await goalTransactionService.update(editingTx.id.toString(), {
          amount: parseFloat(txForm.amount),
          description: txForm.description,
          occurredAt: txForm.occurredAt || undefined,
        });
      } else {
        await goalTransactionService.create({
          goalId: selectedGoal.id,
          amount: parseFloat(txForm.amount),
          description: txForm.description,
          occurredAt: txForm.occurredAt || undefined,
        });
      }

      setTxForm({ amount: '', description: '', occurredAt: '' });
      setEditingTx(null);
      fetchGoalTransactions(selectedGoal.id);
      fetchGoals();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!confirm('Delete this transaction?')) return;
    if (!selectedGoal) return;
    try {
      await goalTransactionService.delete(id.toString());
      fetchGoalTransactions(selectedGoal.id);
      fetchGoals();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const closeTransactionsModal = () => {
    setShowTransactionsModal(false);
    setSelectedGoal(null);
    setTransactions([]);
    setTxForm({ amount: '', description: '', occurredAt: '' });
    setEditingTx(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '0',
      deadline: '',
      icon: '🎯',
      category: ''
    });
    setEditingGoal(null);
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline.split('T')[0],
      icon: goal.icon || '🎯',
      category: goal.category || ''
    });
    setShowModal(true);
  };

  const getPercentage = (current: number, target: number) => (current / target) * 100;

  const getDaysRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <SubNavbar tabs={planningTabs} />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{t('goals')}</h1>
          <p className="text-gray-400">{t('trackGoals') || 'حدد أهدافك المالية وتابع تقدمك نحو تحقيق أحلامك'}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          {t('newGoal')}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
          <p className="text-gray-400 mt-4">جاري تحميل الأهداف...</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="card-glass p-16 text-center border border-white/10">
          <div className="text-7xl mb-6">🎯</div>
          <h3 className="text-2xl font-bold text-white mb-2">لا توجد أهداف مالية</h3>
          <p className="text-gray-400 mb-8 max-w-sm mx-auto">ابدأ بتحديد أهدافك المالية لنقوم بمساعدتك في توفير المبالغ المطلوبة</p>
          <button onClick={() => setShowModal(true)} className="btn-primary px-8">
            حدد أول هدف مالي
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {goals.map((goal) => {
            const percentage = getPercentage(goal.currentAmount, goal.targetAmount);
            const daysRemaining = getDaysRemaining(goal.deadline);
            const isComplete = percentage >= 100;

            return (
              <div key={goal.id} className="card-glass p-8 hover:scale-[1.03] transition-all duration-500 group border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>

                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className={`w-20 h-20 ${isComplete ? 'bg-gradient-to-br from-green-500 to-brand-green' : 'bg-gradient-to-br from-brand-navy to-brand-green'} rounded-3xl flex items-center justify-center text-4xl shadow-xl transform group-hover:rotate-6 transition-transform`}>
                      {goal.icon || '🎯'}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white group-hover:text-brand-green transition-colors">{goal.name}</h3>
                      <p className={`text-sm font-bold mt-1 ${daysRemaining > 0 ? 'text-gray-400' : 'text-red-400'}`}>
                        {daysRemaining > 0 ? `متبقي ${daysRemaining} يوم` : 'انتهى الموعد النهائي'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {isComplete && (
                      <span className="px-3 py-1 bg-brand-green/20 text-brand-green rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-brand-green/10">
                        مكتمل ✓
                      </span>
                    )}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => openEditModal(goal)} className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-colors shadow-md">✏️</button>
                      <button onClick={() => handleDelete(goal.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors shadow-md">🗑️</button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">المبلغ الموفر</p>
                      <p className="text-3xl font-black text-white">${goal.currentAmount.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">المبلغ المطلوب</p>
                      <p className="text-xl font-bold text-gray-300">${goal.targetAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="relative h-5 w-full bg-white/5 rounded-full overflow-hidden shadow-inner border border-white/5 p-1">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 relative ${isComplete ? 'bg-gradient-to-r from-green-500 to-brand-green shadow-lg shadow-green-500/20' : 'bg-gradient-to-r from-brand-navy to-brand-green shadow-lg shadow-brand-green/20'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    >
                      {!isComplete && <div className="absolute inset-0 bg-white/10 animate-pulse"></div>}
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="text-center flex-1">
                      <span className="text-[10px] text-gray-500 font-bold uppercase block">نسبة الإنجاز</span>
                      <span className={`text-xl font-black ${isComplete ? 'text-brand-green' : 'text-white'}`}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-px h-8 bg-white/5"></div>
                    <div className="text-center flex-1">
                      <span className="text-[10px] text-gray-500 font-bold uppercase block">المتبقي</span>
                      <span className="text-xl font-black text-white">
                        ${Math.max(0, goal.targetAmount - goal.currentAmount).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => {
                        setSelectedGoal(goal);
                        fetchGoalTransactions(goal.id);
                        setShowTransactionsModal(true);
                      }}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl font-bold transition-all border border-white/5"
                    >
                      📜 السجل
                    </button>
                    <button
                      onClick={() => {
                        const amount = prompt('أدخل المبلغ المراد إضافته لإدخارك:');
                        if (amount) handleAddFunds(goal.id, parseFloat(amount));
                      }}
                      className="flex-[2] py-3 bg-gradient-to-r from-brand-navy to-brand-green text-white rounded-xl font-black shadow-lg shadow-brand-green/20 hover:shadow-brand-green/40 transform hover:scale-[1.02] transition-all"
                    >
                      💰 أضف مبلغاً
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans">
          <div className="card-glass p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-white">
                {editingGoal ? 'تعديل الهدف' : 'إنشاء هدف جديد'}
              </h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-white transition-colors">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 px-1">اسم الهدف *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green font-bold text-lg"
                  placeholder="مثال: شراء منزل، صندوق طوارئ..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400 px-1">المبلغ المستهدف ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green font-bold"
                    placeholder="25000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400 px-1">المبلغ الحالي الموفر ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green font-bold"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400 px-1">الموعد النهائي *</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400 px-1">الأيقونة (ايموجي)</label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green text-center text-2xl"
                      placeholder="🎯"
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-50 text-xs">اختر رمزاً</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 px-1">الفئة (اختياري)</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green"
                  placeholder="مثال: توفير طويل الأمد، استثمار..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl font-bold transition-all"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-gradient-to-r from-brand-navy to-brand-green text-white rounded-xl font-black shadow-lg shadow-brand-green/20 hover:shadow-brand-green/30 transform hover:scale-[1.02] transition-all"
                >
                  {t('save') || 'حفظ الهدف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transactions Modal */}
      {showTransactionsModal && selectedGoal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50 p-4 font-sans">
          <div className="card-glass p-8 max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-white/20 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="text-4xl bg-white/5 p-3 rounded-2xl shadow-inner">{selectedGoal.icon || '🎯'}</div>
                <h3 className="text-2xl font-black text-white">سجل إدخارات هدف: {selectedGoal.name}</h3>
              </div>
              <button
                onClick={closeTransactionsModal}
                className="w-10 h-10 flex items-center justify-center bg-white/5 text-gray-400 rounded-full hover:bg-white/10 hover:text-white transition-colors"
              >✕</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
              {/* Add New Transaction Entry */}
              <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                <p className="text-xs font-black text-gray-500 uppercase mb-4 tracking-wider">{editingTx ? 'تعديل عملية' : 'إضافة عملية جديدة'}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                    <input type="number" step="0.01" placeholder="المبلغ" className="w-full pl-10 pr-4 py-3 bg-brand-navy border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-green font-bold" value={txForm.amount} onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })} />
                  </div>
                  <input type="text" placeholder="الوصف (مثال: جزء من الراتب)" className="w-full px-4 py-3 bg-brand-navy border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-green" value={txForm.description} onChange={(e) => setTxForm({ ...txForm, description: e.target.value })} />
                  <input type="date" className="w-full px-4 py-3 bg-brand-navy border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-green" value={txForm.occurredAt} onChange={(e) => setTxForm({ ...txForm, occurredAt: e.target.value })} />
                </div>
                <div className="flex justify-end gap-3">
                  {editingTx && (
                    <button onClick={() => { setEditingTx(null); setTxForm({ amount: '', description: '', occurredAt: '' }); }} className="px-6 py-2 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 transition-colors">إلغاء</button>
                  )}
                  <button
                    onClick={handleSaveTransaction}
                    className="px-8 py-2 bg-gradient-to-r from-brand-navy to-brand-green text-white rounded-xl font-black shadow-lg shadow-brand-green/20 hover:shadow-brand-green/40 transform hover:scale-[1.02] transition-all"
                  >
                    {editingTx ? 'تحديث' : 'تأكيد الإضافة'}
                  </button>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-4">
                <p className="text-xs font-black text-gray-500 uppercase tracking-wider">العمليات السابقة</p>
                {txLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
                    <p className="text-gray-500 text-sm mt-3">جاري تحميل السجل...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.length === 0 && (
                      <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <p className="text-gray-500 font-bold">لا توجد عمليات مسجلة لهذا الهدف</p>
                      </div>
                    )}
                    {transactions.map(tx => (
                      <div key={tx.id} className="group flex items-center justify-between p-5 bg-white/5 hover:bg-white/[0.08] rounded-2xl border border-white/5 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-brand-green/20 text-brand-green flex items-center justify-center text-xl font-black shadow-inner">
                            +
                          </div>
                          <div>
                            <div className="font-black text-white text-lg">${Number(tx.amount).toLocaleString()}</div>
                            <div className="text-gray-400 text-sm font-medium">{tx.description || 'بدون وصف'} • {new Date(tx.occurredAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => { setEditingTx(tx); setTxForm({ amount: tx.amount.toString(), description: tx.description || '', occurredAt: tx.occurredAt.split('T')[0] }); }} className="p-2 bg-white/10 text-blue-400 rounded-lg hover:bg-white/20 transition-colors shadow-md">✏️</button>
                          <button onClick={() => handleDeleteTransaction(tx.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors shadow-md">🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
