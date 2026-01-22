import React, { useState, useEffect } from 'react';
import SubNavbar from '../components/SubNavbar';
import { budgetService, categoryService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

interface Budget {
  id: number;
  name: string;
  categoryId?: number;
  category?: { id: number; name: string };
  amount: number;
  spent: number;
  period: string;
  active: boolean;
  createdAt?: string;
}

interface Category {
  id: number;
  name: string;
  type: string;
}

interface BudgetFormData {
  name: string;
  categoryId?: number;
  amount: number;
  period: string;
}

const Budgets: React.FC = () => {
  const { t } = useLanguage();

  const planningTabs = [
    { path: '/planning/budgets', labelKey: 'budgets', icon: '💰' },
    { path: '/planning/goals', labelKey: 'goals', icon: '🎯' },
  ];

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState<BudgetFormData>({
    name: '',
    categoryId: undefined,
    amount: 0,
    period: 'monthly',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [budgetsData, categoriesData] = await Promise.all([
        budgetService.getAll(),
        categoryService.getAll()
      ]);
      setBudgets(budgetsData);
      setCategories(categoriesData.filter((c: Category) => c.type === 'expense'));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        categoryId: formData.categoryId || undefined,
      };

      if (editingBudget) {
        await budgetService.update(editingBudget.id.toString(), submitData);
      } else {
        await budgetService.create(submitData);
      }
      await fetchData();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to save budget');
      console.error('Error saving budget:', err);
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      name: budget.name,
      categoryId: budget.categoryId,
      amount: budget.amount,
      period: budget.period,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;

    try {
      await budgetService.delete(id.toString());
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete budget');
      console.error('Error deleting budget:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      categoryId: undefined,
      amount: 0,
      period: 'monthly',
    });
    setEditingBudget(null);
    setShowForm(false);
    setError(null);
  };

  const getPercentage = (spent: number, amount: number) => (spent / amount) * 100;

  const getColorClass = (percentage: number) => {
    if (percentage >= 95) return 'from-red-600 to-red-400';
    if (percentage >= 80) return 'from-orange-500 to-orange-400';
    return 'from-brand-green to-emerald-400';
  };

  const getCategoryIcon = (categoryName: string) => {
    const icons: { [key: string]: string } = {
      'Food': '🍔',
      'Transport': '🚗',
      'Entertainment': '🎮',
      'Shopping': '🛍️',
      'Utilities': '💡',
      'Healthcare': '🏥',
      'Education': '📚',
    };
    return icons[categoryName] || '💰';
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  return (
    <div className="max-w-7xl mx-auto">
      <SubNavbar tabs={planningTabs} />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{t('budgets')}</h1>
          <p className="text-gray-400">{t('manageBudgets') || 'خطط لمصاريفك بحكمة وحافظ على أهدافك المالية'}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          {t('createBudget')}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card-glass p-8 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-navy/10 rounded-bl-full group-hover:scale-110 transition-transform"></div>
          <p className="text-gray-400 mb-2 relative z-10">{t('totalBudgeted')}</p>
          <p className="text-4xl font-black text-white relative z-10">
            ${totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="card-glass p-8 border border-white/5 relative overflow-hidden group font-sans">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-bl-full group-hover:scale-110 transition-transform"></div>
          <p className="text-gray-400 mb-2 relative z-10">{t('spent')}</p>
          <p className="text-4xl font-black text-yellow-400 relative z-10">
            ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="card-glass p-8 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-green/5 rounded-bl-full group-hover:scale-110 transition-transform"></div>
          <p className="text-gray-400 mb-2 relative z-10">{t('remaining')}</p>
          <p className={`text-4xl font-black relative z-10 ${totalRemaining < 0 ? 'text-red-400' : 'text-brand-green'}`}>
            ${Math.abs(totalRemaining).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card-glass p-8 mb-8 border border-white/20 animate-in fade-in slide-in-from-top-4 duration-300 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">
              {editingBudget ? 'تعديل الميزانية' : 'إنشاء ميزانية جديدة'}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-white">✕</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 px-1">اسم الميزانية *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green"
                  placeholder="مثل: بقالة الشهر"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 px-1">الفئة (اختياري)</label>
                <select
                  value={formData.categoryId || ''}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green appearance-none cursor-pointer"
                >
                  <option value="" className="bg-brand-navy">بدون فئة</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-brand-navy">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 px-1">المبلغ *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number.parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 px-1">الفترة *</label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green appearance-none cursor-pointer"
                  required
                >
                  <option value="daily" className="bg-brand-navy">يومي</option>
                  <option value="weekly" className="bg-brand-navy">أسبوعي</option>
                  <option value="monthly" className="bg-brand-navy" selected>شهري</option>
                  <option value="yearly" className="bg-brand-navy">سنوي</option>
                </select>
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
                {editingBudget ? 'تعديل الميزانية' : 'إنشاء الميزانية'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Budgets Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
          <p className="text-gray-400 mt-4">جاري تحميل الميزانيات...</p>
        </div>
      ) : budgets.length === 0 ? (
        <div className="card-glass p-16 text-center border border-white/10">
          <div className="text-7xl mb-6">📉</div>
          <h3 className="text-2xl font-bold text-white mb-2">لا توجد ميزانيات بعد</h3>
          <p className="text-gray-400 mb-8 max-w-sm mx-auto">ابدأ بوضع حدود للإنفاق للتحكم في أموالك بشكل أفضل</p>
          <button onClick={() => setShowForm(true)} className="btn-primary px-8">
            حدد أول ميزانية
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {budgets.map((budget) => {
            const percentage = getPercentage(budget.spent, budget.amount);
            const icon = budget.category ? getCategoryIcon(budget.category.name) : '💰';
            const progressColor = getColorClass(percentage);

            return (
              <div key={budget.id} className="card-glass p-8 hover:scale-[1.03] transition-all duration-500 group border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>

                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                      {icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white group-hover:text-brand-green transition-colors">{budget.name}</h3>
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
                        {budget.period} {budget.category ? `• ${budget.category.name}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                    <button onClick={() => handleEdit(budget)} className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-all shadow-md">✏️</button>
                    <button onClick={() => handleDelete(budget.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all shadow-md">🗑️</button>
                  </div>
                </div>

                <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-end">
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-tighter">الاستهلاك</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-white">${budget.spent.toLocaleString()}</span>
                      <span className="text-gray-500 text-sm mx-1">/</span>
                      <span className="text-gray-500 text-sm">${budget.amount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="relative h-4 w-full bg-white/5 rounded-full overflow-hidden shadow-inner border border-white/5">
                    <div
                      className={`absolute inset-y-0 left-0 bg-gradient-to-r ${progressColor} transition-all duration-1000 rounded-full shadow-lg`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">نسبة التنفيذ</span>
                      <span className={`text-lg font-black ${percentage >= 90 ? 'text-red-400' : 'text-white'}`}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-right flex flex-col">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">المتبقي</span>
                      <span className={`text-lg font-black ${percentage >= 90 ? 'text-red-400' : 'text-brand-green'}`}>
                        ${(budget.amount - budget.spent).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Budgets;
