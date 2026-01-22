import React, { useState, useEffect } from 'react';
import SubNavbar from '../components/SubNavbar';
import { useLanguage } from '../contexts/LanguageContext';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { reportService, budgetService, accountService } from '../services/api';

interface Budget {
  id: number;
  name: string;
  amount: number;
  spent: number;
  category?: { name: string };
}

interface Account {
  id: number;
  name: string;
  balance: number;
  type: string;
}

const COLORS = ['#002b5b', '#76bc3c', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const Reports: React.FC = () => {
  const { t } = useLanguage();

  const analyticsTabs = [
    { path: '/analytics/reports', labelKey: 'reports', icon: '📊' },
    { path: '/analytics/alerts', labelKey: 'alerts', icon: '🔔' },
  ];

  const [timePeriod, setTimePeriod] = useState<'month' | 'lastMonth' | '3months' | 'year'>('month');
  const [summaryData, setSummaryData] = useState<any>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [timePeriod]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange(timePeriod);

      const [summary, categoryData, trendsData, budgetsData, accountsData] = await Promise.all([
        reportService.getFinancialSummary(startDate, endDate),
        reportService.getCategoryBreakdown(startDate, endDate, 'expense'),
        reportService.getMonthlyTrends(12),
        budgetService.getAll(),
        accountService.getAll(),
      ]);

      setSummaryData(summary);
      setCategoryBreakdown(categoryData.breakdown || []);
      setMonthlyTrends(trendsData.trends || []);
      setBudgets(Array.isArray(budgetsData) ? budgetsData : []);
      setAccounts(Array.isArray(accountsData) ? accountsData : []);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (period: string) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  };

  const stats = summaryData ? {
    income: summaryData.income || 0,
    expenses: summaryData.expense || 0,
    netSavings: summaryData.netBalance || 0,
    savingsRate: summaryData.income > 0 ? (summaryData.netBalance / summaryData.income) * 100 : 0,
  } : { income: 0, expenses: 0, netSavings: 0, savingsRate: 0 };

  const categoryData = categoryBreakdown.map(item => ({
    name: item.name,
    value: item.amount,
  }));

  const trendData = monthlyTrends.map(trend => ({
    month: trend.month.substring(5),
    income: trend.income,
    expense: trend.expense,
    net: trend.net,
  }));

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

  return (
    <div className="max-w-7xl mx-auto">
      <SubNavbar tabs={analyticsTabs} />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{t('reports')}</h1>
          <p className="text-gray-400">{t('financialReports') || 'تحليلات عميقة وتقارير مالية مفصلة لأدائك المالي'}</p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
          {[
            { id: 'month', label: t('thisMonth') },
            { id: 'lastMonth', label: t('lastMonth') },
            { id: '3months', label: '3 أشهر' },
            { id: 'year', label: t('thisYear') }
          ].map((period) => (
            <button
              key={period.id}
              onClick={() => setTimePeriod(period.id as any)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${timePeriod === period.id
                  ? 'bg-gradient-to-br from-brand-navy to-brand-green text-white shadow-lg shadow-brand-green/20 scale-105'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
          <p className="text-gray-400 mt-4">جاري تحليل البيانات...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card-glass p-8 border border-white/5 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-brand-green/5 rounded-bl-full group-hover:scale-110 transition-transform"></div>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">{t('totalIncome')}</p>
              <p className="text-3xl font-black text-brand-green font-sans">${stats.income.toLocaleString()}</p>
            </div>
            <div className="card-glass p-8 border border-white/5 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-bl-full group-hover:scale-110 transition-transform"></div>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">{t('totalExpenses')}</p>
              <p className="text-3xl font-black text-red-400 font-sans">${stats.expenses.toLocaleString()}</p>
            </div>
            <div className="card-glass p-8 border border-white/5 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-bl-full group-hover:scale-110 transition-transform"></div>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">{t('netSavings')}</p>
              <p className={`text-3xl font-black font-sans ${stats.netSavings >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                ${stats.netSavings.toLocaleString()}
              </p>
            </div>
            <div className="card-glass p-8 border border-white/5 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-brand-navy/10 rounded-bl-full group-hover:scale-110 transition-transform"></div>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">{t('savingsRate')}</p>
              <p className="text-3xl font-black text-white font-sans">{stats.savingsRate.toFixed(1)}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Trends Chart */}
            <div className="card-glass p-8 border border-white/5">
              <h3 className="text-xl font-black text-white mb-8">اتجاهات الدخل والمصاريف</h3>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#76bc3c" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#76bc3c" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="month" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#002b5b', border: '1px solid #ffffff10', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                      itemStyle={{ fontWeight: '900', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="income" stroke="#76bc3c" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" name="الدخل" />
                    <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" name="المصاريف" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="card-glass p-8 border border-white/5">
              <h3 className="text-xl font-black text-white mb-8">توزيع المصاريف حسب الفئة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {categoryData.slice(0, 5).map((item, index) => {
                    const total = categoryData.reduce((sum, c) => sum + c.value, 0);
                    const percentage = total > 0 ? (item.value / total) * 100 : 0;
                    return (
                      <div key={index} className="flex flex-col">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-gray-400 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            {item.name}
                          </span>
                          <span className="text-xs font-black text-white">{percentage.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: COLORS[index % COLORS.length] }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 card-glass p-8 border border-white/5">
              <h3 className="text-xl font-black text-white mb-8">أعلى 10 فئات إنفاقاً</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#002b5b', border: '1px solid #ffffff10', borderRadius: '16px' }}
                    />
                    <Bar dataKey="value" fill="#76bc3c" radius={[8, 8, 0, 0]} name="المبلغ" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-glass p-8 border border-white/5 flex flex-col justify-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-brand-navy to-brand-green rounded-3xl mx-auto flex items-center justify-center text-4xl mb-6 shadow-2xl shadow-brand-green/20">
                📉
              </div>
              <h3 className="text-2xl font-black text-white mb-2">تقرير السيولة</h3>
              <p className="text-gray-500 text-sm mb-6">إجمالي الرصيد المتاح في جميع حساباتك</p>
              <p className="text-5xl font-black text-white font-sans">${totalBalance.toLocaleString()}</p>
              <div className="mt-8 pt-8 border-t border-white/5">
                <div className="flex justify-between items-center mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                  <span>معدل الادخار المستهدف</span>
                  <span>20%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-navy to-brand-green rounded-full shadow-lg"
                    style={{ width: `${Math.min(stats.savingsRate * 5, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
