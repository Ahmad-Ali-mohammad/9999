import React, { useState, useEffect } from 'react';
import SubNavbar from '../components/SubNavbar';
import { categoryService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

interface Category {
  id: number;
  name: string;
  type: string;
  parentId?: number;
  parent?: { id: number; name: string };
  children?: Category[];
  userId?: number;
}

interface CategoryFormData {
  name: string;
  type: string;
  parentId?: number;
}

const Categories: React.FC = () => {
  const { t } = useLanguage();

  const orgTabs = [
    { path: '/organization/categories', labelKey: 'categories', icon: '📁' },
    { path: '/organization/budget-categories', labelKey: 'budgetCategories', icon: '📊' },
    { path: '/organization/tags', labelKey: 'tags', icon: '🏷️' },
    { path: '/organization/projects', labelKey: 'projects', icon: '🏗️' },
  ];

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    type: 'expense',
    parentId: undefined,
  });
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
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
      const submitData = {
        ...formData,
        parentId: formData.parentId || undefined,
      };

      if (editingCategory) {
        await categoryService.update(editingCategory.id.toString(), submitData);
      } else {
        await categoryService.create(submitData);
      }
      await fetchCategories();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
      console.error('Error saving category:', err);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      parentId: category.parentId,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category? This will also remove it from existing transactions.')) return;

    try {
      await categoryService.delete(id.toString());
      await fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
      console.error('Error deleting category:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'expense',
      parentId: undefined,
    });
    setEditingCategory(null);
    setShowForm(false);
    setError(null);
  };

  const getCategoryIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      expense: '📤',
      income: '📥',
      transfer: '↔️',
    };
    return icons[type] || '💰';
  };

  const getCategoryColor = (type: string) => {
    const colors: { [key: string]: string } = {
      expense: 'from-red-500 to-orange-500',
      income: 'from-brand-green to-emerald-600',
      transfer: 'from-brand-navy to-blue-600',
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const filteredCategories = categories.filter(cat => {
    if (filter === 'all') return true;
    if (filter === 'custom') return cat.userId != null;
    if (filter === 'system') return cat.userId == null;
    return cat.type === filter;
  });

  const userCategories = categories.filter(c => c.userId != null);
  const systemCategories = categories.filter(c => c.userId == null);

  return (
    <div className="max-w-7xl mx-auto">
      <SubNavbar tabs={orgTabs} />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{t('categories')}</h1>
          <p className="text-gray-400">{t('organizeCategories')}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          {t('addCategory')}
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
              {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-white">✕</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-gray-400 px-1">اسم الفئة *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green"
                  placeholder="مثال: البقالة، الراتب، الإيجار"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 px-1">النوع *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green appearance-none cursor-pointer"
                  required
                >
                  <option value="expense" className="bg-brand-navy">مصروف</option>
                  <option value="income" className="bg-brand-navy">دخل</option>
                  <option value="transfer" className="bg-brand-navy">تحويل</option>
                </select>
              </div>
              <div className="md:col-span-3 space-y-2">
                <label className="text-sm font-semibold text-gray-400 px-1">الفئة الأب (اختياري)</label>
                <select
                  value={formData.parentId || ''}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green appearance-none cursor-pointer"
                >
                  <option value="" className="bg-brand-navy">بدون - فئة رئيسية</option>
                  {categories
                    .filter(c => !c.parentId && c.type === formData.type && c.id !== editingCategory?.id)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-brand-navy">
                        {cat.name}
                      </option>
                    ))}
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
                {editingCategory ? 'تحديث الفئة' : 'إضافة الفئة'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
        {['all', 'expense', 'income', 'transfer', 'custom', 'system'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-6 py-2 rounded-full capitalize whitespace-nowrap transition-all duration-300 font-medium ${filter === tab
                ? 'bg-brand-green text-brand-navy shadow-lg shadow-brand-green/20'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
          >
            {t(tab) || tab}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card-glass p-6 border border-white/5">
          <p className="text-gray-400 text-sm mb-1">{t('totalCategories')}</p>
          <p className="text-3xl font-bold text-white">{categories.length}</p>
        </div>
        <div className="card-glass p-6 border border-white/5">
          <p className="text-gray-400 text-sm mb-1">{t('custom')}</p>
          <p className="text-3xl font-bold text-brand-green">{userCategories.length}</p>
        </div>
        <div className="card-glass p-6 border border-white/5">
          <p className="text-gray-400 text-sm mb-1">{t('system')}</p>
          <p className="text-3xl font-bold text-blue-400">{systemCategories.length}</p>
        </div>
        <div className="card-glass p-6 border border-white/5">
          <p className="text-gray-400 text-sm mb-1">{t('expenseTypes')}</p>
          <p className="text-3xl font-bold text-red-400">
            {categories.filter(c => c.type === 'expense').length}
          </p>
        </div>
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
          <p className="text-gray-400 mt-4">جاري تحميل الفئات...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="card-glass p-12 text-center border border-white/10">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-2xl font-bold text-white mb-2">لا توجد فئات</h3>
          <p className="text-gray-400 mb-6">انقر فوق "إضافة فئة" لإنشاء فئاتك الخاصة</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            {t('addFirstCategory')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div key={category.id} className="card-glass p-6 hover:scale-[1.02] transition-all duration-300 border border-white/5 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${getCategoryColor(category.type)} rounded-2xl flex items-center justify-center text-3xl shadow-lg transform group-hover:rotate-6 transition-transform`}>
                    {getCategoryIcon(category.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{category.name}</h3>
                    <p className="text-gray-400 text-xs capitalize">{category.type}</p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {category.userId != null && (
                    <>
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-all shadow-md"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all shadow-md"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                  {category.userId == null && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-[10px] rounded font-bold">
                      SYSTEM
                    </span>
                  )}
                </div>
              </div>

              {category.parent && (
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-sm text-gray-400">
                  <span>فرعية من:</span>
                  <span className="px-2 py-1 bg-white/5 rounded text-white text-xs">{category.parent.name}</span>
                </div>
              )}

              {category.children && category.children.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-xs text-gray-500 mb-2">{category.children.length} فئات فرعية</p>
                  <div className="flex flex-wrap gap-2">
                    {category.children.map(child => (
                      <span key={child.id} className="px-2 py-1 bg-white/5 rounded text-gray-400 text-[10px]">
                        {child.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
