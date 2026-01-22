import React, { useState, useEffect } from 'react';
import SubNavbar from '../components/SubNavbar';
import { budgetCategoryService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

interface BudgetCategory {
  id: number;
  name: string;
  type: 'expense' | 'income';
  parentId?: number | null;
  parent?: BudgetCategory;
  children?: BudgetCategory[];
  _count?: {
    transactions: number;
    budgets: number;
  };
  createdAt: string;
}

const BudgetCategories: React.FC = () => {
  const { t } = useLanguage();

  const orgTabs = [
    { path: '/organization/categories', labelKey: 'categories', icon: '📁' },
    { path: '/organization/budget-categories', labelKey: 'budgetCategories', icon: '📊' },
    { path: '/organization/tags', labelKey: 'tags', icon: '🏷️' },
    { path: '/organization/projects', labelKey: 'projects', icon: '🏗️' },
  ];

  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'expense' | 'income',
    parentId: null as number | null,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await budgetCategoryService.getAll();
      setCategories(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await budgetCategoryService.update(editingCategory.id.toString(), formData);
      } else {
        await budgetCategoryService.create(formData);
      }
      fetchCategories();
      closeModal();
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
      console.error('Error saving category:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }
    try {
      await budgetCategoryService.delete(id.toString());
      fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
      console.error('Error deleting category:', err);
    }
  };

  const openModal = (category?: BudgetCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        type: category.type,
        parentId: category.parentId || null,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        type: 'expense',
        parentId: null,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      type: 'expense',
      parentId: null,
    });
  };

  const expenseCategories = categories.filter(cat => cat.type === 'expense' && !cat.parentId);
  const incomeCategories = categories.filter(cat => cat.type === 'income' && !cat.parentId);

  return (
    <div className="max-w-7xl mx-auto">
      <SubNavbar tabs={orgTabs} />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{t('budgetCategories')}</h1>
          <p className="text-gray-400">{t('manageBudgetCategories') || 'إدارة فئات الميزانية الخاصة بك'}</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          {t('addCategory')}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
          <p className="text-gray-400 mt-4">جاري تحميل الفئات...</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Expense Categories */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-red-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">{t('expenseCategories')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {expenseCategories.map(category => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={openModal}
                  onDelete={handleDelete}
                  t={t}
                />
              ))}
              {expenseCategories.length === 0 && (
                <div className="col-span-full card-glass p-8 text-center text-gray-500 border border-white/5">
                  {t('noCategoriesYet')}
                </div>
              )}
            </div>
          </section>

          {/* Income Categories */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-brand-green rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">{t('incomeCategories')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {incomeCategories.map(category => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={openModal}
                  onDelete={handleDelete}
                  t={t}
                />
              ))}
              {incomeCategories.length === 0 && (
                <div className="col-span-full card-glass p-8 text-center text-gray-500 border border-white/5">
                  {t('noCategoriesYet')}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="card-glass p-8 max-w-md w-full border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">
                {editingCategory ? t('updateCategory') : t('createCategory')}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors"
              >✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 px-1">{t('categoryName')}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green font-bold"
                  placeholder="مثال: الطعام والمطاعم"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 px-1">{t('categoryType')}</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'expense' | 'income' })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green appearance-none cursor-pointer"
                >
                  <option value="expense" className="bg-brand-navy">{t('expense')}</option>
                  <option value="income" className="bg-brand-navy">{t('income')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 px-1">{t('parentCategory')} ({t('none')})</label>
                <select
                  value={formData.parentId || ''}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green appearance-none cursor-pointer"
                >
                  <option value="" className="bg-brand-navy">{t('none')}</option>
                  {categories
                    .filter(cat => cat.type === formData.type && !cat.parentId && cat.id !== editingCategory?.id)
                    .map(cat => (
                      <option key={cat.id} value={cat.id} className="bg-brand-navy">
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl font-bold transition-all"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3 bg-gradient-to-r from-brand-navy to-brand-green text-white rounded-xl font-bold shadow-lg shadow-brand-green/20 hover:shadow-brand-green/30 transform hover:scale-[1.02] transition-all"
                >
                  {editingCategory ? t('updateCategory') : t('createCategory')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface CategoryCardProps {
  category: BudgetCategory;
  onEdit: (category: BudgetCategory) => void;
  onDelete: (id: number) => void;
  t: (key: string) => string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onEdit, onDelete, t }) => {
  return (
    <div className="card-glass p-6 hover:scale-[1.02] transition-all duration-300 border border-white/5 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-brand-green transition-colors">{category.name}</h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border ${category.type === 'expense'
              ? 'bg-red-500/10 text-red-400 border-red-500/20'
              : 'bg-brand-green/10 text-brand-green border-brand-green/20'
            }`}>
            {category.type === 'expense' ? 'Expense' : 'Income'}
          </span>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(category)} className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-all shadow-md">✏️</button>
          <button onClick={() => onDelete(category.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all shadow-md">🗑️</button>
        </div>
      </div>

      {category.parent && (
        <div className="mb-4 flex items-center gap-2 text-xs text-gray-500">
          <span>فرعية من:</span>
          <span className="text-white bg-white/5 px-2 py-0.5 rounded">{category.parent.name}</span>
        </div>
      )}

      {category._count && (
        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/5">
          <div className="text-center">
            <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">العمليات</div>
            <div className="text-lg font-black text-white">{category._count.transactions}</div>
          </div>
          <div className="text-center border-l border-white/5">
            <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">الميزانيات</div>
            <div className="text-lg font-black text-white">{category._count.budgets}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetCategories;
