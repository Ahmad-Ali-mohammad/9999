import React, { useState, useEffect } from 'react';
import SubNavbar from '../components/SubNavbar';
import { alertService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

interface Alert {
  id: number;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  isRead: boolean;
  metadata?: any;
  userId: number;
  createdAt: string;
}

const Alerts: React.FC = () => {
  const { t } = useLanguage();

  const analyticsTabs = [
    { path: '/analytics/reports', labelKey: 'reports', icon: '📊' },
    { path: '/analytics/alerts', labelKey: 'alerts', icon: '🔔' },
  ];

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await alertService.getAll();
      if (filter === 'unread') {
        setAlerts((data as Alert[]).filter(a => !a.isRead));
      } else {
        setAlerts(data as Alert[]);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const markAsRead = async (id: number) => {
    try {
      await alertService.markAsRead(id.toString());
      fetchAlerts();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await alertService.markAllAsRead();
      fetchAlerts();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteAlert = async (id: number) => {
    try {
      if (!confirm('هل أنت متأكد من حذف هذا التنبيه؟')) return;
      await alertService.delete(id.toString());
      fetchAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const checkBudgetAlerts = async () => {
    try {
      await alertService.checkBudgets();
      fetchAlerts();
    } catch (error) {
      console.error('Error checking budget alerts:', error);
    }
  };

  const checkGoalAlerts = async () => {
    try {
      await alertService.checkGoals();
      fetchAlerts();
    } catch (error) {
      console.error('Error checking goal alerts:', error);
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-500/50 bg-red-500/5 text-red-500';
      case 'medium': return 'border-yellow-500/50 bg-yellow-500/5 text-yellow-500';
      case 'low': return 'border-blue-500/50 bg-blue-500/5 text-blue-500';
      default: return 'border-gray-500/50 bg-gray-500/5 text-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      case 'low': return 'ℹ️';
      default: return '📢';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'budget_exceeded': return '💸';
      case 'goal_milestone': return '🎯';
      case 'unusual_spending': return '🔍';
      case 'income_received': return '💰';
      case 'bill_due': return '📅';
      default: return '📢';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} أيام`;
    return date.toLocaleDateString('ar-EG');
  };

  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <div className="max-w-4xl mx-auto">
      <SubNavbar tabs={analyticsTabs} />

      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">
            {t('alerts')} {unreadCount > 0 && (
              <span className="text-xl text-red-400 font-sans ml-2">({unreadCount})</span>
            )}
          </h1>
          <p className="text-gray-400">{t('stayInformed') || 'ابق على اطلاع دائم بوضعك المالي وتنبيهات ميزانيتك'}</p>
        </div>

        <div className="flex gap-4">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-6 py-2.5 bg-white/5 border border-white/5 hover:bg-white/10 rounded-2xl text-xs font-black text-gray-400 hover:text-white transition-all capitalize"
            >
              {t('markAllRead')}
            </button>
          )}
          <div className="hover-trigger relative">
            <button className="btn-primary flex items-center gap-2">
              <span className="text-xl">⚙️</span>
              فحص التنبيهات
            </button>
            <div className="absolute top-full right-0 mt-2 w-48 bg-brand-navy border border-white/10 rounded-2xl shadow-2xl p-2 opacity-0 invisible hover-target transition-all z-20">
              <button onClick={checkBudgetAlerts} className="w-full text-right px-4 py-2 hover:bg-white/5 rounded-xl text-sm text-gray-400 hover:text-white transition-all mb-1">فحص الميزانية</button>
              <button onClick={checkGoalAlerts} className="w-full text-right px-4 py-2 hover:bg-white/5 rounded-xl text-sm text-gray-400 hover:text-white transition-all">فحص الأهداف</button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 mb-8 bg-white/5 w-fit p-1.5 rounded-2xl border border-white/5">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'all'
              ? 'bg-gradient-to-br from-brand-navy to-brand-green text-white shadow-lg'
              : 'text-gray-500 hover:text-white'
            }`}
        >
          الكل
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'unread'
              ? 'bg-gradient-to-br from-brand-navy to-brand-green text-white shadow-lg'
              : 'text-gray-500 hover:text-white'
            }`}
        >
          غير المقروءة ({unreadCount})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
          <p className="text-gray-400 mt-4">جاري تحميل التنبيهات...</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="card-glass p-20 text-center border border-white/10">
          <div className="text-7xl mb-6 grayscale opacity-30">🔔</div>
          <h3 className="text-2xl font-black text-white mb-2">{t('noAlertsYet') || 'لا توجد تنبيهات'}</h3>
          <p className="text-gray-500 mb-6">{t('allCaughtUp') || 'أنت مطلع على كل شيء حالياً'}</p>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`card-glass border-l-4 p-6 transition-all hover:scale-[1.01] flex items-start gap-6 relative group overflow-hidden ${getSeverityStyle(alert.severity)
                } ${!alert.isRead ? 'border-opacity-100 ring-1 ring-white/10' : 'border-opacity-20 opacity-70'}`}
            >
              {!alert.isRead && (
                <div className="absolute top-0 right-0 w-2 h-full bg-brand-green"></div>
              )}

              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                {getTypeIcon(alert.type)}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-tighter text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                        {alert.type.replace('_', ' ')}
                      </span>
                      <span className="text-xl">{getSeverityIcon(alert.severity)}</span>
                    </div>
                    <p className="text-xl font-black text-white leading-tight">{alert.message}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-xs font-bold">{formatDate(alert.createdAt)}</span>
                    {!alert.isRead && (
                      <span className="px-3 py-1 bg-brand-green text-white text-[10px] font-black rounded-full shadow-lg shadow-brand-green/20">
                        NEW
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                  {!alert.isRead && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="px-5 py-2 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green text-xs font-black rounded-xl transition-all border border-brand-green/20"
                    >
                      {t('markAsRead')}
                    </button>
                  )}
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="px-5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-black rounded-xl transition-all border border-red-500/20"
                  >
                    {t('delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CSS for hover trigger */}
      <style>{`
        .hover-trigger:hover .hover-target {
          opacity: 1;
          vertical-align: visible;
          visibility: visible;
        }
      `}</style>
    </div>
  );
};

export default Alerts;
