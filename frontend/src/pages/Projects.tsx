import React, { useState, useEffect } from 'react';
import SubNavbar from '../components/SubNavbar';
import { projectService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

interface Project {
  id: number;
  name: string;
  description?: string;
  initialInvestment: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  startDate?: string;
  endDate?: string;
  userId: number;
  createdAt: string;
}

const Projects: React.FC = () => {
  const { t } = useLanguage();

  const orgTabs = [
    { path: '/organization/categories', labelKey: 'categories', icon: '📁' },
    { path: '/organization/budget-categories', labelKey: 'budgetCategories', icon: '📊' },
    { path: '/organization/tags', labelKey: 'tags', icon: '🏷️' },
    { path: '/organization/projects', labelKey: 'projects', icon: '🏗️' },
  ];

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    initialInvestment: '',
    monthlyRevenue: '',
    monthlyExpenses: '',
    status: 'planning',
    startDate: '',
    endDate: ''
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAll();
      setProjects(data as Project[]);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        initialInvestment: parseFloat(formData.initialInvestment) || 0,
        monthlyRevenue: parseFloat(formData.monthlyRevenue) || 0,
        monthlyExpenses: parseFloat(formData.monthlyExpenses) || 0
      };

      if (editingProject) {
        await projectService.update(editingProject.id.toString(), payload as any);
      } else {
        await projectService.create(payload as any);
      }

      fetchProjects();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await projectService.delete(id.toString());
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      initialInvestment: '',
      monthlyRevenue: '',
      monthlyExpenses: '',
      status: 'planning',
      startDate: '',
      endDate: ''
    });
    setEditingProject(null);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      initialInvestment: project.initialInvestment.toString(),
      monthlyRevenue: project.monthlyRevenue.toString(),
      monthlyExpenses: project.monthlyExpenses.toString(),
      status: project.status,
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      endDate: project.endDate ? project.endDate.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'from-blue-500/20 to-blue-400/20 text-blue-400 border-blue-400/30';
      case 'active': return 'from-brand-green/20 to-emerald-400/20 text-brand-green border-brand-green/30';
      case 'completed': return 'from-purple-500/20 to-indigo-400/20 text-purple-400 border-purple-400/30';
      case 'cancelled': return 'from-red-500/20 to-pink-400/20 text-red-400 border-red-400/30';
      default: return 'from-gray-500/20 to-gray-400/20 text-gray-400 border-gray-400/30';
    }
  };

  const calculateROI = (project: Project) => {
    const monthlyProfit = project.monthlyRevenue - project.monthlyExpenses;
    const breakEvenMonths = monthlyProfit > 0 ? project.initialInvestment / monthlyProfit : Infinity;
    const yearlyROI = project.initialInvestment > 0 ? ((monthlyProfit * 12) / project.initialInvestment * 100) : 0;

    return {
      monthlyProfit,
      breakEvenMonths: breakEvenMonths === Infinity ? 'N/A' : Math.ceil(breakEvenMonths),
      yearlyROI: yearlyROI.toFixed(1)
    };
  };

  return (
    <div className="max-w-7xl mx-auto">
      <SubNavbar tabs={orgTabs} />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{t('projects')}</h1>
          <p className="text-gray-400">إدارة مشاريعك التجارية واستثماراتك</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          {t('newProject')}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
          <p className="text-gray-400 mt-4">جاري تحميل المشاريع...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="card-glass p-12 text-center border border-white/10">
          <div className="text-6xl mb-4">🏗️</div>
          <h3 className="text-2xl font-bold text-white mb-2">لا توجد مشاريع بعد</h3>
          <p className="text-gray-400 mb-6">ابدأ بتتبع مشاريعك التجارية واستثماراتك هنا</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            إنشاء أول مشروع
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {projects.map((project) => {
            const roi = calculateROI(project);
            const statusStyle = getStatusColor(project.status);

            return (
              <div key={project.id} className="card-glass p-8 hover:scale-[1.01] transition-all duration-300 group border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-green/5 to-transparent rounded-bl-full pointer-events-none"></div>

                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-brand-green transition-colors">{project.name}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2 max-w-sm">{project.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border bg-gradient-to-br ${statusStyle}`}>
                      {project.status}
                    </span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(project)} className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-all shadow-md">✏️</button>
                      <button onClick={() => handleDelete(project.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all shadow-md">🗑️</button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-tighter">الاستثمار</p>
                    <p className="text-2xl font-black text-white">${project.initialInvestment.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-tighter">الإيرادات/شهرياً</p>
                    <p className="text-2xl font-black text-brand-green">${project.monthlyRevenue.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-tighter">المصاريف/شهرياً</p>
                    <p className="text-2xl font-black text-red-400">${project.monthlyExpenses.toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-brand-navy to-brand-green/20 rounded-2xl p-6 border border-brand-green/20 shadow-inner">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-gray-300 text-xs font-bold mb-1">الربح الشهري</p>
                      <p className="text-xl font-black text-white">${roi.monthlyProfit.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-300 text-xs font-bold mb-1">نقطة التعادل</p>
                      <p className="text-xl font-black text-white">{roi.breakEvenMonths} شهر</p>
                    </div>
                    <div>
                      <p className="text-gray-300 text-xs font-bold mb-1">العائد السنوي</p>
                      <p className="text-xl font-black text-brand-green">{roi.yearlyROI}%</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="card-glass p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white">
                {editingProject ? 'تعديل المشروع' : 'إنشاء مشروع جديد'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-gray-400 hover:text-white transition-colors"
              >✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 px-1">اسم المشروع *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green font-bold text-lg"
                  placeholder="مثال: متجر الكتروني، عقار استثماري..."
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 px-1">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green min-h-[100px]"
                  placeholder="وصف مختصر لأهداف المشروع..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400 px-1">الاستثمار الأولي *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.initialInvestment}
                    onChange={(e) => setFormData({ ...formData, initialInvestment: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400 px-1">الإيراد الشهري المتوقع *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.monthlyRevenue}
                    onChange={(e) => setFormData({ ...formData, monthlyRevenue: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400 px-1">المصاريف الشهرية المتوقعة *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.monthlyExpenses}
                    onChange={(e) => setFormData({ ...formData, monthlyExpenses: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400 px-1">الحالة *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green appearance-none cursor-pointer"
                  >
                    <option value="planning" className="bg-brand-navy">تخطيط</option>
                    <option value="active" className="bg-brand-navy">نشط</option>
                    <option value="completed" className="bg-brand-navy">مكتمل</option>
                    <option value="cancelled" className="bg-brand-navy">ملغي</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400 px-1">تاريخ البدء</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400 px-1">التاريخ المتوقع للاكتمال</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green"
                  />
                </div>
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
                  className="flex-[2] py-4 bg-gradient-to-r from-brand-navy to-brand-green text-white rounded-xl font-bold shadow-lg shadow-brand-green/20 hover:shadow-brand-green/30 transform hover:scale-[1.02] transition-all"
                >
                  {editingProject ? 'تحديث المشروع' : 'إنشاء المشروع'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
