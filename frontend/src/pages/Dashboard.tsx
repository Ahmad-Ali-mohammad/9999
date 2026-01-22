import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { dashboardService, accountService, reportService, budgetService, transactionService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import TransactionForm from '../components/TransactionForm';

interface DashboardData {
  summary: {
    totalIncome: number;
    totalExpense: number;
    netCashflow: number;
    transactionCount: number;
    stabilityScore: number;
    monthsOfRunway: number;
  };
  recentTransactions: any[];
  goals: any[];
  insights: any[];
}

interface Budget {
  id: number;
  name: string;
  amount: number;
  spent: number;
  period: string;
  category?: {
    name: string;
  };
}

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeChartView, setActiveChartView] = useState<'pie' | 'bar'>('pie');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [monthlyTrendsData, setMonthlyTrendsData] = useState<any[]>([]);
  const [weeklySpendingData, setWeeklySpendingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuickActionModal, setShowQuickActionModal] = useState(false);
  const [quickActionType, setQuickActionType] = useState<'income' | 'expense' | 'transfer'>('expense');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());

      const [overview, accountsData, budgetsData, categoryBreakdown, monthlyTrends, transactions] = await Promise.all([
        dashboardService.getOverview(),
        accountService.getAll(),
        budgetService.getAll(),
        reportService.getCategoryBreakdown(
          startOfMonth.toISOString().split('T')[0],
          endOfMonth.toISOString().split('T')[0]
        ).catch(() => []),
        reportService.getMonthlyTrends(6).catch(() => ({ trends: [] })),
        transactionService.getAll().catch(() => [])
      ]);

      setDashboardData(overview);
      setAccounts(accountsData);
      setBudgets(budgetsData);

      // Process monthly trends
      if (monthlyTrends && monthlyTrends.trends && monthlyTrends.trends.length > 0) {
        const trends = monthlyTrends.trends.map((t: any) => {
          const date = new Date(t.month + '-01');
          return {
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            income: t.income || 0,
            expenses: t.expense || 0,
            savings: t.net || 0
          };
        });
        setMonthlyTrendsData(trends);
      } else {
        setMonthlyTrendsData(getSampleMonthlyTrends());
      }

      // Process weekly spending
      if (transactions && Array.isArray(transactions) && transactions.length > 0) {
        const weekStart = new Date(startOfWeek);
        const weeklyData: any = {};
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Initialize all days
        for (let i = 0; i < 7; i++) {
          const day = new Date(weekStart);
          day.setDate(weekStart.getDate() + i);
          weeklyData[days[day.getDay()]] = 0;
        }

        // Sum expenses for each day
        transactions.forEach((t: any) => {
          if (t.type === 'expense') {
            const tDate = new Date(t.occurredAt);
            if (tDate >= weekStart && tDate <= now) {
              const dayName = days[tDate.getDay()];
              weeklyData[dayName] += Math.abs(t.amount);
            }
          }
        });

        const weeklyArray = Object.keys(weeklyData).map(day => ({
          day,
          amount: weeklyData[day]
        }));

        setWeeklySpendingData(weeklyArray);
      } else {
        setWeeklySpendingData(getSampleWeeklySpending());
      }

      // Process category data for charts
      if (categoryBreakdown && Array.isArray(categoryBreakdown) && categoryBreakdown.length > 0) {
        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#95E1D3', '#F06292', '#64B5F6', '#FFB74D'];
        const expenseCategories = categoryBreakdown.filter((cat: any) => cat.type === 'expense');
        const total = expenseCategories.reduce((sum: number, cat: any) => sum + Math.abs(cat.total || 0), 0);

        const chartData = expenseCategories
          .map((cat: any, index: number) => ({
            name: cat.categoryName || 'Uncategorized',
            value: Math.abs(cat.total || 0),
            color: colors[index % colors.length],
            percentage: total > 0 ? Math.round((Math.abs(cat.total || 0) / total) * 100) : 0
          }))
          .filter((item: any) => item.value > 0)
          .sort((a: any, b: any) => b.value - a.value);

        setExpenseData(chartData.length > 0 ? chartData : getSampleExpenseData());
      } else {
        setExpenseData(getSampleExpenseData());
      }

      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
      setExpenseData(getSampleExpenseData());
    } finally {
      setLoading(false);
    }
  };

  const getSampleExpenseData = () => [
    { name: 'Food & Dining', value: 850, color: '#FF6B6B', percentage: 32 },
    { name: 'Transport', value: 420, color: '#4ECDC4', percentage: 16 },
    { name: 'Entertainment', value: 380, color: '#FFE66D', percentage: 14 },
    { name: 'Shopping', value: 650, color: '#A8E6CF', percentage: 24 },
    { name: 'Bills & Utilities', value: 370, color: '#95E1D3', percentage: 14 },
  ];

  const getSampleMonthlyTrends = () => [
    { month: 'Jan', income: 5200, expenses: 3100, savings: 2100 },
    { month: 'Feb', income: 5200, expenses: 3350, savings: 1850 },
    { month: 'Mar', income: 5500, expenses: 3200, savings: 2300 },
    { month: 'Apr', income: 5200, expenses: 3450, savings: 1750 },
    { month: 'May', income: 5800, expenses: 3800, savings: 2000 },
    { month: 'Jun', income: 5200, expenses: 3450, savings: 1750 },
  ];

  const getSampleWeeklySpending = () => [
    { day: 'Sun', amount: 95 },
    { day: 'Mon', amount: 125 },
    { day: 'Tue', amount: 85 },
    { day: 'Wed', amount: 145 },
    { day: 'Thu', amount: 92 },
    { day: 'Fri', amount: 180 },
    { day: 'Sat', amount: 220 },
  ];

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const getRelativeDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };





  // Chart colors are defined in Reports and other components; remove unused local COLORS

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 rounded-lg border border-brand-green/30">
          <p className="text-white font-semibold">{payload[0].name}</p>
          <p className="text-brand-green">${payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{t('welcomeBack')}! 👋</h1>
          <p className="text-gray-400">{t('happeningToday')}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`px-4 py-2 rounded-lg transition-all ${selectedPeriod === 'week'
              ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
          >
            {t('week')}
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-4 py-2 rounded-lg transition-all ${selectedPeriod === 'month'
              ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
          >
            {t('month')}
          </button>
          <button
            onClick={() => setSelectedPeriod('year')}
            className={`px-4 py-2 rounded-lg transition-all ${selectedPeriod === 'year'
              ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
          >
            {t('year')}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-12">{t('loadingDashboard')}</div>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card-glass p-6 hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400">{t('totalBalance')}</p>
                <span className="text-2xl">💰</span>
              </div>
              <p className="text-3xl font-bold text-white">
                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-green-400 mt-2">
                {accounts.length} {t('activeAccounts')}
              </p>
            </div>

            <div className="card-glass p-6 hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400">{t('income')}</p>
                <span className="text-2xl">📈</span>
              </div>
              <p className="text-3xl font-bold text-green-400">
                ${(dashboardData?.summary.totalIncome || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-400 mt-2">{t('totalEarned')}</p>
            </div>

            <div className="card-glass p-6 hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400">{t('expenses')}</p>
                <span className="text-2xl">📉</span>
              </div>
              <p className="text-3xl font-bold text-red-400">
                ${(dashboardData?.summary.totalExpense || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-400 mt-2">{t('totalSpent')}</p>
            </div>

            <div className="card-glass p-6 hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400">{t('netCashflow')}</p>
                <span className="text-2xl">🎯</span>
              </div>
              <p className={`text-3xl font-bold ${(dashboardData?.summary.netCashflow || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${Math.abs(dashboardData?.summary.netCashflow || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {dashboardData?.summary.transactionCount || 0} {t('transactions')}
              </p>
            </div>
          </div>

          {/* Financial Health & Accounts Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Financial Health */}
            <div className="card-glass p-6">
              <h2 className="text-2xl font-bold text-white mb-6">{t('financialHealth')}</h2>
              <div className="space-y-4">
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-brand-navy to-brand-green mb-4 shadow-xl shadow-brand-green/20 border-4 border-white/10">
                    <span className="text-5xl font-bold text-white">
                      {dashboardData?.summary.stabilityScore || 0}
                    </span>
                  </div>
                  <p className="text-xl font-semibold text-white mb-2">{t('stabilityScore')}</p>
                  <p className="text-gray-400">
                    {(dashboardData?.summary.stabilityScore || 0) >= 80 ? t('excellent') :
                      (dashboardData?.summary.stabilityScore || 0) >= 60 ? t('good') :
                        (dashboardData?.summary.stabilityScore || 0) >= 40 ? t('fair') : t('needsImprovement')}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-1">{t('runway')}</p>
                    <p className="text-2xl font-bold text-white">
                      {dashboardData?.summary.monthsOfRunway?.toFixed(1) || '0.0'}
                    </p>
                    <p className="text-gray-400 text-xs">{t('months')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-1">{t('transactions')}</p>
                    <p className="text-2xl font-bold text-white">
                      {dashboardData?.summary.transactionCount || 0}
                    </p>
                    <p className="text-gray-400 text-xs">{t('total')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Accounts Summary */}
            <div className="card-glass p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">{t('accounts')}</h2>
                <Link to="/finance/accounts" className="text-brand-green hover:text-brand-light transition-colors font-semibold">
                  {t('viewAll')} →
                </Link>
              </div>
              <div className="space-y-3">
                {accounts.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">{t('noAccountsYet')}</p>
                ) : (
                  accounts.slice(0, 4).map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                      <div>
                        <p className="text-white font-medium">{account.name}</p>
                        <p className="text-gray-400 text-sm capitalize">{account.type}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${account.balance < 0 ? 'text-red-400' : 'text-white'}`}>
                          ${Math.abs(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-gray-400 text-xs">{account.currency}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Budget Performance Section */}
          <div className="card-glass p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{t('budgetPerformance')} - {t('currentMonth')}</h2>
              <Link to="/planning/budgets" className="text-brand-green hover:text-brand-light transition-colors font-semibold">
                {t('manageBudgets')} →
              </Link>
            </div>

            {budgets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">{t('noBudgetsThisMonth')}</p>
                <Link
                  to="/planning/budgets"
                  className="btn-primary"
                >
                  {t('createFirstBudget')}
                </Link>
              </div>
            ) : (
              <>
                {/* Budget Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-gray-400 text-sm mb-2">{t('totalBudgeted')}</p>
                    <p className="text-2xl font-bold text-white">
                      ${budgets.reduce((sum, b) => sum + b.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-gray-400 text-sm mb-2">{t('totalSpent')}</p>
                    <p className="text-2xl font-bold text-red-400">
                      ${budgets.reduce((sum, b) => sum + b.spent, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-gray-400 text-sm mb-2">{t('remaining')}</p>
                    <p className={`text-2xl font-bold ${budgets.reduce((sum, b) => sum + (b.amount - b.spent), 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                      ${Math.abs(budgets.reduce((sum, b) => sum + (b.amount - b.spent), 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-gray-400 text-sm mb-2">{t('overallHealth')}</p>
                    <div className="flex items-center justify-center gap-2">
                      {(() => {
                        const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
                        const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
                        const healthPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

                        let healthStatus = '';
                        let healthColor = '';

                        if (healthPercentage <= 70) {
                          healthStatus = t('good');
                          healthColor = 'text-green-400';
                        } else if (healthPercentage <= 90) {
                          healthStatus = t('warning');
                          healthColor = 'text-yellow-400';
                        } else {
                          healthStatus = t('critical');
                          healthColor = 'text-red-400';
                        }

                        return (
                          <>
                            <span className="text-2xl">
                              {healthPercentage <= 70 ? '✅' : healthPercentage <= 90 ? '⚠️' : '🚨'}
                            </span>
                            <p className={`text-xl font-bold ${healthColor}`}>
                              {healthStatus}
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Individual Budget Progress */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-3">{t('budgetBreakdown')}</h3>
                  {budgets.slice(0, 5).map((budget) => {
                    const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
                    const remaining = budget.amount - budget.spent;
                    const isOverBudget = percentage > 100;
                    const isWarning = percentage > 80 && percentage <= 100;

                    return (
                      <div key={budget.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-white font-semibold">{budget.name}</h4>
                            {budget.category && (
                              <p className="text-gray-400 text-sm">{budget.category.name}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${isOverBudget ? 'text-red-400' : 'text-white'
                              }`}>
                              ${budget.spent.toLocaleString('en-US', { minimumFractionDigits: 2 })} / ${budget.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                            <p className={`text-sm ${remaining >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                              {remaining >= 0 ? `$${remaining.toFixed(2)} ${t('left')}` : `$${Math.abs(remaining).toFixed(2)} ${t('over')}`}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' :
                              isWarning ? 'bg-yellow-500' :
                                'bg-gradient-to-r from-green-500 to-emerald-500'
                              }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                          {isOverBudget && (
                            <div
                              className="absolute top-0 left-0 h-full bg-red-600/50"
                              style={{ width: '100%' }}
                            />
                          )}
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          <span className={`text-xs font-medium ${isOverBudget ? 'text-red-400' :
                            isWarning ? 'text-yellow-400' :
                              'text-gray-400'
                            }`}>
                            {percentage.toFixed(1)}% {t('used')}
                          </span>
                          {isOverBudget && (
                            <span className="text-xs text-red-400 font-medium">
                              ⚠️ {t('overBudget')}
                            </span>
                          )}
                          {isWarning && !isOverBudget && (
                            <span className="text-xs text-yellow-400 font-medium">
                              ⚠️ {t('closeToLimit')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {budgets.length > 5 && (
                    <div className="text-center pt-4">
                      <Link
                        to="/planning/budgets"
                        className="text-brand-green hover:text-brand-light transition-colors font-semibold"
                      >
                        View {budgets.length - 5} more budgets →
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Expense Breakdown Chart */}
            <div className="lg:col-span-2 card-glass p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">{t('expenseBreakdown')}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveChartView('pie')}
                    className={`px-3 py-1 rounded-lg text-sm transition-all ${activeChartView === 'pie'
                      ? 'bg-brand-green text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                  >
                    {t('pieChart')}
                  </button>
                  <button
                    onClick={() => setActiveChartView('bar')}
                    className={`px-3 py-1 rounded-lg text-sm transition-all ${activeChartView === 'bar'
                      ? 'bg-brand-green text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                  >
                    {t('barChart')}
                  </button>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-full md:w-1/2">
                  {activeChartView === 'pie' ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={expenseData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          animationBegin={0}
                          animationDuration={800}
                        >
                          {expenseData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={expenseData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" fill="#76bc3c" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="w-full md:w-1/2 space-y-4">
                  {expenseData.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-white font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">${category.value}</p>
                        <p className="text-gray-400 text-sm">{category.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Budget Overview */}
            <div className="card-glass p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">{t('budgets')}</h2>
                <Link to="/planning/budgets" className="text-purple-400 hover:text-purple-300 transition-colors">
                  {t('viewAll')} →
                </Link>
              </div>
              <div className="space-y-6">
                {budgets.length > 0 ? budgets.slice(0, 4).map((budget, index) => {
                  const spent = Number(budget.spent) || 0;
                  const total = Number(budget.amount) || 1;
                  const percentage = (spent / total) * 100;
                  const isOverBudget = percentage > 90;
                  const colors = ['bg-orange-500', 'bg-blue-500', 'bg-pink-500', 'bg-purple-500'];
                  const color = colors[index % colors.length];
                  return (
                    <div key={budget.id} className="hover:scale-105 transition-transform">
                      <div className="flex justify-between mb-2">
                        <span className="text-white font-medium">{budget.category?.name || budget.name || 'Budget'}</span>
                        <span className={`text-sm ${isOverBudget ? 'text-red-400' : 'text-gray-400'}`}>
                          ${spent.toFixed(0)} / ${total.toFixed(0)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full ${isOverBudget ? 'bg-red-500' : color} transition-all duration-500 relative`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        >
                          {isOverBudget && (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white">⚠️</span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(0)}% used</p>
                    </div>
                  );
                }) : (
                  <p className="text-gray-400 text-center py-8">{t('noBudgetsYet')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card-glass p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Monthly Trends</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="savings" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card-glass p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Weekly Spending</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklySpendingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" fill="#76bc3c" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Transactions & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Transactions */}
            <div className="lg:col-span-2 card-glass p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">{t('recentTransactions')}</h2>
                <Link to="/finance/transactions" className="text-purple-400 hover:text-purple-300 transition-colors">
                  {t('viewAll')} →
                </Link>
              </div>
              <div className="space-y-4">
                {dashboardData?.recentTransactions && dashboardData.recentTransactions.length > 0 ? (
                  dashboardData.recentTransactions.map((transaction: any) => {
                    const isExpense = transaction.type === 'expense';
                    const date = new Date(transaction.occurredAt);
                    const relativeDate = getRelativeDate(date);

                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isExpense ? 'bg-red-500/20' : 'bg-green-500/20'
                            }`}>
                            <span className="text-2xl">
                              {isExpense ? '📤' : '📥'}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {transaction.notes || (isExpense ? t('expense') : t('income'))}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {transaction.category?.name || t('uncategorized')} • {relativeDate}
                            </p>
                          </div>
                        </div>
                        <p className={`text-xl font-bold ${isExpense ? 'text-red-400' : 'text-green-400'}`}>
                          {isExpense ? '-' : '+'}${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-center py-8">{t('noTransactionsYet')}</p>
                )}
              </div>
            </div>

            {/* Goals Progress */}
            <div className="card-glass p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">{t('financialGoals')}</h2>
                <Link to="/planning/goals" className="text-brand-green hover:text-brand-light transition-colors font-semibold">
                  {t('viewAll')} →
                </Link>
              </div>
              {dashboardData?.goals && dashboardData.goals.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {dashboardData.goals.slice(0, 2).map((goal: any) => {
                    const percentage = (goal.currentAmount / goal.targetAmount) * 100;
                    return (
                      <div key={goal.id} className="p-4 bg-white/5 rounded-lg">
                        <div className="w-12 h-12 bg-gradient-to-br from-brand-navy to-brand-green rounded-xl flex items-center justify-center text-2xl mb-3 shadow-lg shadow-brand-green/10">
                          {goal.icon || '🎯'}
                        </div>
                        <p className="text-white font-semibold mb-2">{goal.name}</p>
                        <p className="text-gray-400 text-sm mb-2">
                          ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                        </p>
                        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-brand-navy to-brand-green transition-all duration-500 shadow-[0_0_8px_rgba(118,188,60,0.4)]"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">{t('noGoalsYet')}</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card-glass p-6">
            <h2 className="text-2xl font-bold text-white mb-6">{t('quickActions')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => { setQuickActionType('income'); setShowQuickActionModal(true); }}
                className="w-full p-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg text-white font-semibold transition-all flex items-center justify-between"
              >
                <span>{t('addIncome')}</span>
                <span className="text-xl">+</span>
              </button>
              <button
                onClick={() => { setQuickActionType('expense'); setShowQuickActionModal(true); }}
                className="w-full p-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-lg text-white font-semibold transition-all flex items-center justify-between"
              >
                <span>{t('addExpense')}</span>
                <span className="text-xl">-</span>
              </button>
              <button
                onClick={() => { setQuickActionType('transfer'); setShowQuickActionModal(true); }}
                className="w-full p-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg text-white font-semibold transition-all flex items-center justify-between"
              >
                <span>{t('transferMoney')}</span>
                <span className="text-xl">⇄</span>
              </button>
            </div>
          </div>

          {/* Quick Action Modal */}
          {showQuickActionModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowQuickActionModal(false)}
              ></div>
              <div className="relative w-full max-w-2xl bg-brand-navy/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <h3 className="text-xl font-bold text-white uppercase tracking-wider">{t('quickAction')}</h3>
                  <button
                    onClick={() => setShowQuickActionModal(false)}
                    className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <TransactionForm
                  initialData={{ type: quickActionType }}
                  onSuccess={() => {
                    setShowQuickActionModal(false);
                    fetchDashboardData();
                  }}
                  onCancel={() => setShowQuickActionModal(false)}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
