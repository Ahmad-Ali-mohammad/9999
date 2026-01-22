import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { budgetCategoryService } from '../services/api';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  FolderOpen,
  Search
} from 'lucide-react';

interface BudgetCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  createdAt: string;
}

const BudgetCategoriesPage: React.FC = () => {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#8b5cf6'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await budgetCategoryService.getAll();
      setCategories(data as BudgetCategory[] || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await budgetCategoryService.update(editingId.toString(), formData);
      } else {
        await budgetCategoryService.create(formData);
      }
      await fetchCategories();
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (category: BudgetCategory) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '#8b5cf6'
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;
    
    try {
      await budgetCategoryService.delete(id.toString());
      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      icon: '',
      color: '#8b5cf6'
    });
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="spinner w-16 h-16"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t('budgetCategories')}
            </h1>
            <p className="text-gray-400 mt-2">{t('manageBudgetCategories')}</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            إضافة فئة جديدة
          </button>
        </div>

        {/* Search Bar */}
        <div className="card-glass p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث عن فئة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-glass pr-10"
            />
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card-glass p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {editingId ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
                </h2>
                <button
                  onClick={resetForm}
                  aria-label={t('close')}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">{t('categoryName')} *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-glass"
                    placeholder="مثال: طعام، مواصلات، ترفيه"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2">{t('description')}</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-glass resize-none"
                    rows={3}
                    placeholder="وصف اختياري للفئة"
                  />
                </div>

                <div>
                  <label htmlFor="color" className="block text-sm font-medium mb-2">{t('color')}</label>
                  <div className="flex items-center gap-3">
                    <input
                      id="color"
                      name="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-12 rounded-lg cursor-pointer"
                    />
                    <input
                      id="colorText"
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="input-glass flex-1"
                      placeholder="#8b5cf6"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="icon" className="block text-sm font-medium mb-2">{t('iconOptional')}</label>
                  <input
                    id="icon"
                    name="icon"
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="input-glass"
                    placeholder="🍔"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" />
                    حفظ
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary flex-1"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.length === 0 ? (
            <div className="col-span-full card-glass p-12 text-center">
              <FolderOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-400">
                {searchQuery ? 'لم يتم العثور على نتائج' : 'لا توجد فئات بعد'}
              </p>
            </div>
          ) : (
            filteredCategories.map((category) => {
              // eslint-disable-next-line
              return (
                <div
                  key={category.id}
                className="card-glass p-6 hover:bg-white/15 transition-all border-r-4"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {category.icon && (
                        <span className="text-3xl">{category.icon}</span>
                      )}
                      <div>
                        <h3 className="text-xl font-bold">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-gray-400 mt-1">{category.description}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                    <button
                      onClick={() => handleEdit(category)}
                      className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      حذف
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BudgetCategoriesPage;
