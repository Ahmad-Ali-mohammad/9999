import React, { useState, useEffect } from 'react';
import SubNavbar from '../components/SubNavbar';
import { tagService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

interface Tag {
  id: number;
  name: string;
  color: string;
  userId: number;
  createdAt: string;
}

const Tags: React.FC = () => {
  const { t } = useLanguage();

  const orgTabs = [
    { path: '/organization/categories', labelKey: 'categories', icon: '📁' },
    { path: '/organization/budget-categories', labelKey: 'budgetCategories', icon: '📊' },
    { path: '/organization/tags', labelKey: 'tags', icon: '🏷️' },
    { path: '/organization/projects', labelKey: 'projects', icon: '🏗️' },
  ];

  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#76bc3c'
  });

  const colorOptions = [
    { name: 'Money Green', value: '#76bc3c' },
    { name: 'Navy Blue', value: '#002b5b' },
    { name: 'Bright Blue', value: '#3B82F6' },
    { name: 'Danger Red', value: '#EF4444' },
    { name: 'Warning Gold', value: '#F59E0B' },
    { name: 'Royal Purple', value: '#8B5CF6' },
    { name: 'Vibrant Pink', value: '#EC4899' },
    { name: 'Sky Cyan', value: '#06B6D4' },
    { name: 'Deep Orange', value: '#F97316' },
    { name: 'Pure White', value: '#FFFFFF' },
  ];

  const fetchTags = async () => {
    try {
      setLoading(true);
      const data = await tagService.getAll();
      setTags(data as Tag[]);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTag) {
        await tagService.update(editingTag.id.toString(), formData);
      } else {
        await tagService.create(formData);
      }

      fetchTags();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving tag:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;

    try {
      await tagService.delete(id.toString());
      fetchTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#76bc3c'
    });
    setEditingTag(null);
  };

  const openEditModal = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color
    });
    setShowModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <SubNavbar tabs={orgTabs} />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{t('tags')}</h1>
          <p className="text-gray-400">{t('organizeTags')}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          {t('newTag')}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
          <p className="text-gray-400 mt-4">{t('loadingTags')}</p>
        </div>
      ) : tags.length === 0 ? (
        <div className="card-glass p-12 text-center border border-white/10">
          <div className="text-6xl mb-4">🏷️</div>
          <h3 className="text-2xl font-bold text-white mb-2">{t('noTagsYet')}</h3>
          <p className="text-gray-400 mb-6">{t('createTagsMessage')}</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            {t('createFirstTag')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="card-glass p-6 hover:scale-105 transition-all duration-300 group border border-white/5"
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-20 h-20 rounded-2xl mb-4 flex items-center justify-center text-4xl shadow-xl transition-transform group-hover:rotate-6"
                  style={{
                    backgroundColor: tag.color + '20',
                    border: `2px solid ${tag.color}`,
                    color: tag.color
                  }}
                >
                  #
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{tag.name}</h3>
                <div
                  className="w-16 h-1 rounded-full mb-6"
                  style={{ backgroundColor: tag.color }}
                ></div>

                <div className="flex gap-2 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(tag)}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg text-xs font-bold transition-all border border-white/10"
                  >
                    {t('edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-all border border-red-500/10"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="card-glass p-8 max-w-md w-full border border-white/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white">
                {editingTag ? t('updateTag') : t('createTag')}
              </h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 px-1">{t('tagName')}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-4 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green font-bold text-lg"
                  placeholder="مثال: عمل، شخصي، مهم..."
                  required
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-gray-400 px-1">{t('color')}</label>
                <div className="grid grid-cols-5 gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-full aspect-square rounded-xl transition-all ${formData.color === color.value
                        ? 'ring-4 ring-white shadow-lg scale-110 z-10'
                        : 'hover:scale-105'
                        }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex-1 text-sm text-gray-400">لون مخصص:</div>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl font-bold transition-all"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-gradient-to-r from-brand-navy to-brand-green text-white rounded-xl font-bold shadow-lg shadow-brand-green/20 hover:shadow-brand-green/30 transform hover:scale-[1.02] transition-all"
                >
                  {editingTag ? t('updateTag') : t('createTag')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tags;
